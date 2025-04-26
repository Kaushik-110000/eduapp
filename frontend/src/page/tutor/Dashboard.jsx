import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditProfile from './EditProfile';
import ScheduleSession from './ScheduleSession';

const TutorDashboard = () => {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const response = await axios.get('/tutor/current-tutor', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setTutor(response.data.data);
      } catch (error) {
        console.error('Error fetching tutor data:', error);
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          try {
            await refreshToken();
            // Retry the original request
            const retryResponse = await axios.get('/tutor/current-tutor', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            setTutor(retryResponse.data.data);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            handleLogout();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, []);

  useEffect(() => {
    if (tutor) {
      fetchSessions();
      fetchStudents();
    }
  }, [tutor]);

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/tutor/sessions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/tutor/students', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/tutor/refresh-token', { refreshToken });
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/tutor/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tutor Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`${
                  activeTab === 'sessions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Upcoming Sessions
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                My Students
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && tutor && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Tutor Profile</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and course information.</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tutor.tutorName}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Tutor ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tutor.tutorID}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tutor.email}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tutor.phone || 'Not provided'}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Subjects</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {tutor.subjects ? tutor.subjects.join(', ') : 'No subjects assigned'}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Experience</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tutor.experience || 'Not provided'}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">About</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tutor.bio || 'No bio provided'}</dd>
                  </div>
                </dl>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate('/edit-profile')}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Sessions</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Your scheduled tutoring sessions.</p>
              </div>
              <div className="border-t border-gray-200">
                {sessions.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {sessions.map((session) => (
                      <li key={session.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900">Student: {session.studentName}</p>
                            <p className="text-sm text-gray-500">Subject: {session.subject}</p>
                            <p className="text-sm text-gray-500">
                              Date: {new Date(session.sessionDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Time: {session.startTime} - {session.endTime}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                              onClick={() => navigate(`/session/${session.id}`)}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-5 text-center text-gray-500">
                    No upcoming sessions scheduled.
                  </div>
                )}
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => navigate('/schedule-session')}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Schedule New Session
                </button>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">My Students</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Students assigned to you for tutoring.</p>
              </div>
              <div className="border-t border-gray-200">
                {students.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <li key={student.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">Student ID: {student.studentID}</p>
                            <p className="text-sm text-gray-500">Email: {student.email}</p>
                            <p className="text-sm text-gray-500">
                              Subjects: {student.subjects ? student.subjects.join(', ') : 'None'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                              onClick={() => navigate(`/student/${student.id}`)}
                            >
                              View Profile
                            </button>
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                              onClick={() => navigate(`/schedule-session/${student.id}`)}
                            >
                              Schedule Session
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-5 text-center text-gray-500">
                    No students assigned to you yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <EditProfile/>
      <ScheduleSession/>
    </div>
    
  );
};

export default TutorDashboard;