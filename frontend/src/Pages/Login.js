import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = ({ setToken, setUserType }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/users/login', formData);
      const { token, msg, userType, username } = res.data;

      if (!token || !userType || !username) throw new Error("Invalid response");

      localStorage.setItem('token', token);
      localStorage.setItem('userType', userType);
      localStorage.setItem('username', username);

      setToken(token);
      setUserType(userType);
      setMessage(msg || 'Login successful');

      userType.toLowerCase() === 'admin' ? navigate('/admin-panel') : navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Login failed';
      setMessage(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">🔐 Login</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Sign in to your account</p>

        {message && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 text-sm px-4 py-2 rounded mb-4 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-gray-800 placeholder-gray-400 transition"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none text-gray-800 placeholder-gray-400 transition"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-lg transition-all duration-200 shadow-sm"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-5">
          <p className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link to="/register" className="text-yellow-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
