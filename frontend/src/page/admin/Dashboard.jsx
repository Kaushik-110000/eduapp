import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingTutors, setPendingTutors] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get('/admin/current-admin', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        setAdmin(response.data.data);
        await fetchPendingTutors();
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          try {
            await refreshToken();
            // Retry the original request
            const retryResponse = await axios.get('/admin/current-admin', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
              }
            });
            setAdmin(retryResponse.data.data);
            await fetchPendingTutors();
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            setErrorMessage('Session expired. Please login again.');
            handleLogout();
          }
        } else {
          setErrorMessage('Failed to load admin data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const fetchPendingTutors = async () => {
    try {
      const response = await axios.post('/admin/unverifiedTutors', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setPendingTutors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending tutors:', error);
      if (error.response?.status !== 404) {
        // 404 is expected if there are no pending tutors
        setErrorMessage('Failed to load pending tutors.');
      }
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('/admin/refresh-token', { refreshToken });
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
      await axios.post('/admin/logout', {}, {
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

  const handleVerifyTutor = async (tutorID) => {
    try {
      await axios.post(`/admin/verify/${tutorID}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Remove the verified tutor from the pending list
      setPendingTutors(pendingTutors.filter(tutor => tutor._id !== tutorID));
      
      // Show success message (could use a toast notification here)
      alert('Tutor verified successfully');
    } catch (error) {
      console.error('Error verifying tutor:', error);
      setErrorMessage('Failed to verify tutor.');
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center">
            {admin && (
              <div className="mr-4 flex items-center">
                <img 
                  src={admin.avatar} 
                  alt="Admin" 
                  className="h-10 w-10 rounded-full mr-2"
                />
                <span className="text-gray-700">{admin.adminName}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <button onClick={() => setErrorMessage('')}>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </button>
            </span>
          </div>
        </div>
      )}

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('tutors')}
                className={`${
                  activeTab === 'tutors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Pending Tutors
                {pendingTutors.length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {pendingTutors.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && admin && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Profile</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information.</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.adminName}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Admin ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.adminID}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{admin.email}</dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Avatar</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <img src={admin.avatar} alt="Avatar" className="h-20 w-20 rounded-full" />
                    </dd>
                  </div>
                </dl>
              </div>
              
              {/* Stats Cards */}
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">System Overview</h3>
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Tutors</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{pendingTutors.length}</dd>
                    </div>
                  </div>
                  
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">--</dd>
                    </div>
                  </div>
                  
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">--</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pending Tutors Tab */}
          {activeTab === 'tutors' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Pending Tutor Verifications</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Tutors waiting for your approval.</p>
              </div>
              <div className="border-t border-gray-200">
                {pendingTutors.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {pendingTutors.map((tutor) => (
                      <li key={tutor._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-full"
                                src={tutor.avatar || "https://via.placeholder.com/100"}
                                alt={tutor.tutorName}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{tutor.tutorName}</div>
                              <div className="text-sm text-gray-500">
                                ID: {tutor.tutorID} | Email: {tutor.email}
                              </div>
                              <div className="text-sm text-gray-500">
                                Subjects: {tutor.subjects ? tutor.subjects.join(', ') : 'None listed'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                              onClick={() => navigate(`/tutor/${tutor._id}`)}
                            >
                              View Profile
                            </button>
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                              onClick={() => handleVerifyTutor(tutor._id)}
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-5 text-center text-gray-500">
                    No pending tutors to verify at this time.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Settings</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account settings and preferences.</p>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-gray-900">Change Password</h4>
                    <form className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="current-password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="new-password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirm-password"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="mt-8 mb-6">
                    <h4 className="text-md font-medium text-gray-900">Update Profile</h4>
                    <form className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700">
                          Admin Name
                        </label>
                        <input
                          type="text"
                          id="admin-name"
                          defaultValue={admin?.adminName}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          defaultValue={admin?.email}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                          Avatar
                        </label>
                        <div className="mt-1 flex items-center">
                          <img
                            src={admin?.avatar}
                            alt="Current avatar"
                            className="h-12 w-12 rounded-full mr-4"
                          />
                          <input
                            type="file"
                            id="avatar"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          />
                        </div>
                      </div>
                      <div>
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Update Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;