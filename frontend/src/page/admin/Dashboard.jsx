import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Loader, LogOut, Users, BarChart, Settings, User,
  AlertCircle, Grid, Search, Calendar, BookOpen, AlertTriangle
} from 'lucide-react';

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
        const response = await axios.post('/admin/refresh-token', { refreshToken });
        
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
const TabButton = ({ active, onClick, children, icon, count }) => (
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
    {count !== undefined && (
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
        {count}
      </span>
    )}
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
const Card = ({ title, description, children, footer, className = "" }) => (
  <div className={`bg-white shadow overflow-hidden sm:rounded-lg mb-6 ${className}`}>
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

// StatCard component for dashboard metrics
const StatCard = ({ title, value, icon, trend, trendValue, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700"
  };
  
  const trendColorClasses = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600"
  };
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${colorClasses[color]}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
                {trend && (
                  <div className={`flex items-center text-sm ${trendColorClasses[trend]}`}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                    <span className="ml-1">{trendValue}</span>
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data states
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [reports, setReports] = useState([]);
  
  const navigate = useNavigate();

  // Fetch admin data
  const fetchAdminData = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/admin/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setAdmin(response.data.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load profile data. Please try again.');
      
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users (tutors and students)
  const fetchUsers = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch tutors
      const tutorsResponse = await api.get('/admin/tutors', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setTutors(tutorsResponse.data.data || []);
      
      // Fetch students
      const studentsResponse = await api.get('/admin/students', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setStudents(studentsResponse.data.data || []);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load user data. Please try again.');
    }
  }, []);

  // Fetch pending approvals
  const fetchPendingApprovals = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/admin/pending-approvals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setPendingApprovals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      setError('Failed to load approval requests. Please try again.');
    }
  }, []);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/admin/sessions', {
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

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get('/admin/reports', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to load report data. Please try again.');
    }
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await api.post('/admin/logout', {}, {
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
      navigate('/login');
    }
  }, [navigate]);

  // Handle tab changes with data fetching as needed
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    
    switch(tab) {
      case 'users':
        fetchUsers();
        break;
      case 'sessions':
        fetchSessions();
        break;
      case 'approvals':
        fetchPendingApprovals();
        break;
      case 'reports':
        fetchReports();
        break;
      default:
        // For dashboard tab, we might want to fetch summary data
        break;
    }
  }, [fetchUsers, fetchSessions, fetchPendingApprovals, fetchReports]);

  // Handle user action (approve, reject, etc.)
  const handleUserAction = useCallback(async (userId, action) => {
    try {
      await api.post(`/admin/users/${userId}/${action}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Refresh users data after action
      fetchUsers();
      
      // Also refresh pending approvals if needed
      if (action === 'approve' || action === 'reject') {
        fetchPendingApprovals();
      }
    } catch (error) {
      console.error(`Error performing ${action} on user:`, error);
      setError(`Failed to ${action} user. Please try again.`);
    }
  }, [fetchUsers, fetchPendingApprovals]);

  // Handle session action
  const handleSessionAction = useCallback(async (sessionId, action) => {
    try {
      await api.post(`/admin/sessions/${sessionId}/${action}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Refresh sessions data after action
      fetchSessions();
    } catch (error) {
      console.error(`Error performing ${action} on session:`, error);
      setError(`Failed to ${action} session. Please try again.`);
    }
  }, [fetchSessions]);

  // Simulate initial data fetch for demo
  useEffect(() => {
    fetchAdminData();
    
    // For demo purposes, let's create some mock data
    setTutors([
      { id: 1, tutorName: 'John Smith', tutorID: 'T-10001', email: 'john@example.com', status: 'Active', subjects: ['Math', 'Physics'], rating: 4.8 },
      { id: 2, tutorName: 'Sarah Johnson', tutorID: 'T-10002', email: 'sarah@example.com', status: 'Active', subjects: ['Chemistry', 'Biology'], rating: 4.6 },
      { id: 3, tutorName: 'David Brown', tutorID: 'T-10003', email: 'david@example.com', status: 'Inactive', subjects: ['English', 'Literature'], rating: 4.2 }
    ]);
    
    setStudents([
      { id: 1, name: 'Emma Wilson', studentID: 'S-20001', email: 'emma@example.com', status: 'Active', subjects: ['Math', 'Physics'] },
      { id: 2, name: 'Michael Chen', studentID: 'S-20002', email: 'michael@example.com', status: 'Active', subjects: ['Chemistry'] },
      { id: 3, name: 'Olivia Davis', studentID: 'S-20003', email: 'olivia@example.com', status: 'Inactive', subjects: ['English', 'History'] }
    ]);
    
    setSessions([
      { id: 1, tutorName: 'John Smith', studentName: 'Emma Wilson', subject: 'Math', sessionDate: '2025-05-01', startTime: '14:00', endTime: '15:30', status: 'Scheduled' },
      { id: 2, tutorName: 'Sarah Johnson', studentName: 'Michael Chen', subject: 'Chemistry', sessionDate: '2025-05-02', startTime: '10:00', endTime: '11:30', status: 'Scheduled' },
      { id: 3, tutorName: 'John Smith', studentName: 'Olivia Davis', subject: 'Physics', sessionDate: '2025-04-28', startTime: '16:00', endTime: '17:30', status: 'Completed' }
    ]);
    
    setPendingApprovals([
      { id: 1, name: 'Robert Lee', email: 'robert@example.com', role: 'Tutor', requestDate: '2025-04-25', subjects: ['Computer Science', 'Mathematics'] },
      { id: 2, name: 'Lisa Wang', email: 'lisa@example.com', role: 'Tutor', requestDate: '2025-04-26', subjects: ['Economics', 'Business'] }
    ]);
    
    setReports([
      { id: 1, reportType: 'Technical Issue', reportedBy: 'John Smith', date: '2025-04-24', status: 'Open', description: 'Unable to access video chat during session' },
      { id: 2, reportType: 'Conduct Complaint', reportedBy: 'Emma Wilson', date: '2025-04-23', status: 'Under Review', description: 'Tutor did not show up for scheduled session' }
    ]);
    
    setLoading(false);
  }, [fetchAdminData]);

  // Filter users based on search term
  const filteredTutors = tutors.filter(tutor => 
    tutor.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.tutorID.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto h-10 w-10 text-blue-600 animate-spin" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading Admin Dashboard</h2>
          <p className="mt-2 text-sm text-gray-500">Preparing your administrative tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-gray-800">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
              <h2 className="text-lg font-bold text-white">Admin Panel</h2>
            </div>
            <div className="h-0 flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'dashboard' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Grid className="mr-3 h-5 w-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleTabChange('users')}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'users' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Users
                </button>
                <button
                  onClick={() => handleTabChange('sessions')}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'sessions' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  Sessions
                </button>
                <button
                  onClick={() => handleTabChange('approvals')}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'approvals' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <User className="mr-3 h-5 w-5" />
                  <span>Approvals</span>
                  {pendingApprovals.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingApprovals.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('reports')}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'reports' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="mr-3 h-5 w-5" />
                  <span>Reports</span>
                  {reports.filter(r => r.status === 'Open').length > 0 && (
                    <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      {reports.filter(r => r.status === 'Open').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('settings')}
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'settings' 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Settings
                </button>
              </nav>
            </div>
            <div className="flex-shrink-0 flex bg-gray-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center text-gray-700 font-bold">
                    {admin?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{admin?.name || 'Admin User'}</p>
                    <button 
                      onClick={handleLogout}
                      className="text-xs font-medium text-gray-300 hover:text-white flex items-center"
                    >
                      <LogOut className="h-3 w-3 mr-1" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white shadow-sm z-10">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="md:hidden">
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
                <div className="max-w-lg w-full lg:max-w-xs">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="search"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search users, sessions..."
                      type="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="md:hidden flex items-center">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center ml-2 text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
            {error && <Alert message={error} />}

            {/* Dashboard Overview */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <StatCard 
                    title="Total Tutors" 
                    value={tutors.length} 
                    icon={<User className="h-5 w-5" />} 
                    trend="up" 
                    trendValue="2% from last month" 
                    color="blue"
                  />
                  <StatCard 
                    title="Total Students" 
                    value={students.length} 
                    icon={<Users className="h-5 w-5" />} 
                    trend="up" 
                    trendValue="5% from last month" 
                    color="green"
                  />
                  <StatCard 
                    title="Upcoming Sessions" 
                    value={sessions.filter(s => s.status === 'Scheduled').length} 
                    icon={<Calendar className="h-5 w-5" />} 
                    trend="neutral" 
                    trendValue="Same as last week" 
                    color="purple"
                  />
                  <StatCard 
                    title="Pending Approvals" 
                    value={pendingApprovals.length} 
                    icon={<AlertCircle className="h-5 w-5" />} 
                    trend="down" 
                    trendValue="3 less than yesterday" 
                    color="yellow"
                  />
                </div>
                
                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card title="Recent Sessions" description="Latest tutoring sessions">
                    <ul className="divide-y divide-gray-200">
                      {sessions.slice(0, 5).map((session) => (
                        <li key={session.id} className="px-4 py-3 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{session.subject} - {session.tutorName}</p>
                              <p className="text-sm text-gray-500">Student: {session.studentName}</p>
                              <div className="flex items-center mt-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(session.sessionDate).toLocaleDateString()}
                                <span className="mx-1">•</span>
                                {session.startTime} - {session.endTime}
                              </div>
                            </div>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${session.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                session.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                            `}>
                              {session.status}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-gray-50 px-4 py-3 text-right text-sm font-medium">
                      <button 
                        onClick={() => handleTabChange('sessions')}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        View all sessions
                      </button>
                    </div>
                  </Card>
                  
                  <Card title="Pending Approvals" description="Users waiting for account approval">
                    {pendingApprovals.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {pendingApprovals.map((approval) => (
                          <li key={approval.id} className="px-4 py-3 hover:bg-gray-50">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{approval.name}</p>
                                <p className="text-sm text-gray-500">{approval.email}</p>
                                <div className="flex items-center mt-1">
                                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mr-2">
                                    {approval.role}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Requested: {new Date(approval.requestDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleUserAction(approval.id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleUserAction(approval.id, 'reject')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-5 text-center text-gray-500">
                        No pending approval requests.
                      </div>
                    )}
                    {pendingApprovals.length > 0 && (
                      <div className="bg-gray-50 px-4 py-3 text-right text-sm font-medium">
                        <button 
                          onClick={() => handleTabChange('approvals')}
                          className="text-blue-600 hover:text-blue-500"
                        >
                          View all requests
                        </button>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}
            </main>
        </div>
        </div>
        </div>)}
        export default AdminDashboard;

        