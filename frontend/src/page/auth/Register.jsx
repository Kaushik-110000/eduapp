// src/components/auth/Register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    interests: '',
    description: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleTypeChange = (e) => {
    setUserType(e.target.value);
    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      interests: '',
      description: '',
    });
    setAvatar(null);
    setPreviewUrl('');
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.id || !formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!avatar) {
      setError('Avatar image is required');
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
      const form = new FormData();
      if (userType === 'student') {
        form.append('studentID', formData.id);
        form.append('studentName', formData.name);
        form.append('interests', JSON.stringify(formData.interests.split(',').map(i => i.trim())));
      } else if (userType === 'tutor') {
        form.append('tutorID', formData.id);
        form.append('tutorName', formData.name);
        form.append('description', formData.description);
      } else {
        form.append('adminID', formData.id);
        form.append('adminName', formData.name);
      }

      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('avatar', avatar);

      const endpoint = `/${userType}/register`;
      const response = await axios.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Registration successful:', response.data);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-black">
        <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">I am a:</label>
          <div className="flex gap-4">
            {['student', 'tutor', 'admin'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  value={type}
                  checked={userType === type}
                  onChange={handleTypeChange}
                  className="mr-2"
                />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{userType.charAt(0).toUpperCase() + userType.slice(1)} ID:</label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{userType.charAt(0).toUpperCase() + userType.slice(1)} Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Confirm Password:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>

          {userType === 'student' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Interests (comma separated):</label>
              <input
                type="text"
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                className="text-black w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                placeholder="math, science, programming"
              />
            </div>
          )}

          {userType === 'tutor' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                rows="3"
                placeholder="Briefly describe your teaching experience and subjects"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Avatar:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              required
            />
            {previewUrl && (
              <div className="mt-2 flex justify-center">
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-24 h-24 object-cover rounded-full border-2 border-gray-300"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-black">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
