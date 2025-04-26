// src/page/student/StudentDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // Refresh token on 401
  const setupAxiosInterceptor = () => {
    axios.interceptors.response.use(
      res => res,
      async err => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;
          const refreshRes = await axios.post('/student/refresh-token');
          localStorage.setItem('accessToken', refreshRes.data.data.accessToken);
          localStorage.setItem('refreshToken', refreshRes.data.data.refreshToken);
          original.headers['Authorization'] = `Bearer ${refreshRes.data.data.accessToken}`;
          return axios(original);
        }
        return Promise.reject(err);
      }
    );
  };

  useEffect(() => {
    setupAxiosInterceptor();
    const fetchStudentData = async () => {
      try {
        const res = await axios.get('/student/current-student', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        setStudent(res.data.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/courses');
      setCourses(res.data.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/student/logout', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const { data } = await axios.post('/student/generatePaymentOrder', { courseId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const { order } = data.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: 'My Tutoring App',
        order_id: order.id,
        handler: function (response) {
          console.log('Payment success', response);
          // TODO: verify payment on backend, then refresh student data
        },
        prefill: {
          name: student.studentName,
          email: student.email,
        },
        theme: { color: '#317ef3' }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment order error:', error);
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
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Navigation Tabs */}
        <nav className="flex space-x-6 mb-6 border-b border-gray-200">
          {['profile', 'courses'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>

        {/* Profile Tab */}
        {activeTab === 'profile' && student && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
              <p className="mt-1 text-sm text-gray-500">Your account details</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.studentName}</dd>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.studentID}</dd>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.email}</dd>
                </div>
                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
                  <dt className="text-sm font-medium text-gray-500">Interests</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.interests?.join(', ') || 'None'}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {courses.length > 0 ? courses.map(course => (
              <div key={course._id} className="bg-white shadow rounded-lg p-5 flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{course.title}</h4>
                  <p className="text-sm text-gray-500">{course.description}</p>
                  <p className="mt-1 font-semibold">Price: ₹{course.coursePrice}</p>
                </div>
                <button
                  onClick={() => handleEnroll(course._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                  Enroll
                </button>
              </div>
            )) : (
              <div className="text-center text-gray-500">No courses available</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
