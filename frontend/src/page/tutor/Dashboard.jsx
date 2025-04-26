import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader, LogOut, User, Calendar, Users, AlertCircle } from 'lucide-react';

// Create an axios instance with interceptors for token handling
const api = axios.create();

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/tutor/refresh-token', { refreshToken });
        
        // Store new tokens
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        
        // Update the authorization header and retry
        originalRequest.headers['Authorization'] = `Bearer ${response.data.data.accessToken}`;
        return api(originalRequest);
      } catch (error) {
        // If refresh fails, redirect to login
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// TabButton component for consistent tab styling
const TabButton = ({ active, onClick, children, icon }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center space-x-2 whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm
      transition-colors duration-200 ease-in-out
      ${active 
        ? 'border-blue-500 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
    `}
  >
    {icon}
    <span>{children}</span>
  </button>
);

// Alert component for showing error messages
const Alert = ({ message, type = "error" }) => (
  <div className={`p-4 mb-4 rounded-md ${type === "error" ? "bg-red-50" : "bg-yellow-50"}`}>
    <div className="flex">
      <div className="flex-shrink-0">
        <AlertCircle className={`h-5 w-5 ${type === "error" ? "text-red-400" : "text-yellow-400"}`} />
      </div>
      <div className="ml-3">
        <p className={`text-sm ${type === "error" ? "text-red-700" : "text-yellow-700"}`}>
          {message}
        </p>
      </div>
    </div>
  </div>
);

// Card component for consistent styling
const Card = ({ title, description, children, footer }) => (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      {description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>}
    </div>
    <div className="border-t border-gray-200">
      {children}
    </div>
    {footer && (
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        {footer}
      </div>
    )}
  </div>
);

const TutorDashboard = () => {
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // Fetch tutor data with error handling
  const fetchTutorData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/tutor/current-tutor', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setTutor(response.data.data);
    } catch (error) {
      console.error('Error fetching tutor data:', error);
      setError('Failed to load profile data. Please try again.');
      
      // If token refresh failed and we got 401, redirect to login
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sessions with error handling
  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/tutor/sessions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load session data. Please try again.');
    }
  }, []);

  // Fetch students with error handling
  const fetchStudents = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/tutor/students', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load student data. Please try again.');
    }
  }, []);

  // Handle logout with error handling
  const handleLogout = useCallback(async () => {
    try {
      await api.post('/tutor/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all local storage items
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);

  // Handle tab changes with data fetching as needed
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    
    if (tab === 'sessions' && sessions.length === 0) {
      fetchSessions();
    } else if (tab === 'students' && students.length === 0) {
      fetchStudents();
    }
  }, [fetchSessions, fetchStudents, sessions.length, students.length]);

  // Initial data fetching
  useEffect(() => {
    fetchTutorData();
  }, [fetchTutorData]);

  // Secondary data fetching after tutor is loaded
  useEffect(() => {
    if (tutor) {
      if (activeTab === 'sessions') {
        fetchSessions();
      } else if (activeTab === 'students') {
        fetchStudents();
      }
    }
  }, [tutor, activeTab, fetchSessions, fetchStudents]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-10 w-10 text-blue-600 animate-spin" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading your dashboard</h2>
          <p className="mt-2 text-sm text-gray-500">This will only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-md transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && <Alert message={error} />}
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <TabButton 
              active={activeTab === 'profile'} 
              onClick={() => handleTabChange('profile')}
              icon={<User className="h-4 w-4" />}
            >
              Profile
            </TabButton>
            <TabButton 
              active={activeTab === 'sessions'} 
              onClick={() => handleTabChange('sessions')}
              icon={<Calendar className="h-4 w-4" />}
            >
              Upcoming Sessions
            </TabButton>
            <TabButton 
              active={activeTab === 'students'} 
              onClick={() => handleTabChange('students')}
              icon={<Users className="h-4 w-4" />}
            >
              My Students
            </TabButton>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && tutor && (
          <Card 
            title="Tutor Profile" 
            description="Personal details and course information"
            footer={
              <button
                type="button"
                onClick={() => navigate('/edit-profile')}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Edit Profile
              </button>
            }
          >
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
                  {tutor.subjects?.length ? tutor.subjects.join(', ') : 'No subjects assigned'}
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
          </Card>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <Card 
            title="Upcoming Sessions" 
            description="Your scheduled tutoring sessions"
            footer={
              <button
                type="button"
                onClick={() => navigate('/schedule-session')}
                className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                Schedule New Session
              </button>
            }
          >
            {sessions.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <li key={session.id} className="px-4 py-4 sm:px-6 hover:bg-blue-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">Student: {session.studentName}</p>
                        <p className="text-sm text-gray-500">Subject: {session.subject}</p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-sm text-gray-500">
                            {new Date(session.sessionDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Time: {session.startTime} - {session.endTime}
                        </p>
                      </div>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors duration-200"
                        onClick={() => navigate(`/session/${session.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any upcoming tutoring sessions scheduled.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <Card 
            title="My Students" 
            description="Students assigned to you for tutoring"
          >
            {students.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {students.map((student) => (
                  <li key={student.id} className="px-4 py-4 sm:px-6 hover:bg-blue-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">Student ID: {student.studentID}</p>
                        <p className="text-sm text-gray-500">Email: {student.email}</p>
                        <p className="text-sm text-gray-500">
                          Subjects: {student.subjects?.length ? student.subjects.join(', ') : 'None'}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors duration-200"
                          onClick={() => navigate(`/student/${student.id}`)}
                        >
                          View Profile
                        </button>
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors duration-200"
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
              <div className="px-4 py-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No students assigned</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't have any students assigned to you yet.
                </p>
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default TutorDashboard;