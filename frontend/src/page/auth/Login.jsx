import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials =true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    identifier: '', // Can be ID or email
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Check if we have a success message from registration
    if (location.state?.message) {
      setMessage(location.state.message);
      
      // Clear the message from location state after displaying it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleTypeChange = (e) => {
    setUserType(e.target.value);
    setError(''); // Clear any errors when changing user type
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.identifier || !formData.password) {
      setError('Please enter both identifier and password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      // Determine if identifier is email or ID
      const isEmail = formData.identifier.includes('@');
      
      const payload = {
        password: formData.password
      };
      
      // Set the right field based on user type and identifier type
      if (userType === 'student') {
        if (isEmail) {
          payload.email = formData.identifier;
        } else {
          payload.studentID = formData.identifier;
        }
      } else if (userType === 'tutor') {
        if (isEmail) {
          payload.email = formData.identifier;
        } else {
          payload.tutorID = formData.identifier;
        }
      } else {
        if (isEmail) {
          payload.email = formData.identifier;
        } else {
          payload.adminID = formData.identifier;
        }
      }

      const endpoint = `${API_BASE_URL}/${userType}/login`;
      const response = await axios.post(endpoint, payload);

      // Handle remember me
      const storageMethod = rememberMe ? localStorage : sessionStorage;
      
      // Store tokens
      storageMethod.setItem('accessToken', response.data.data.accessToken);
      storageMethod.setItem('refreshToken', response.data.data.refreshToken);
      storageMethod.setItem('userType', userType);
      
      // Store user data
      const userData = response.data.data[userType]; // student, tutor, or admin object
      storageMethod.setItem('user', JSON.stringify(userData));

      // Redirect based on user type
      if (userType === 'student') {
        navigate('/student/dashboard');
      } else if (userType === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid credentials. Please check your ID/email and password.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Account not found. Please check your ID/email or register a new account.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password', { state: { userType } });
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-xl mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
      
      {message && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md">
          <p className="font-medium">Success</p>
          <p>{message}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Account Type</label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="student"
              checked={userType === 'student'}
              onChange={handleTypeChange}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <span className='text-black'>Student</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="tutor"
              checked={userType === 'tutor'}
              onChange={handleTypeChange}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <span className='text-black'>Tutor</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="admin"
              checked={userType === 'admin'}
              onChange={handleTypeChange}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <span className='text-black'>Admin</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="identifier">
            Email or ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="Enter your email address or ID"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full text-black px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Remember me</span>
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 transition duration-200 font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;