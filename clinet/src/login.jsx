import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; // Assuming api is set up with axios

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send login request
      const response = await api.post('/login', { username, password });
      
      // Assuming response.data contains the access token
      const { access_token } = response.data;

      if (access_token) {
        // Store token in localStorage
        localStorage.setItem('token', access_token);

        // Log to see if the token is being saved
        console.log('Token stored:', access_token);

        // Navigate to the dashboard after successful login
        window.location.href = "/"
         // This should work!
      } else {
        setError('No token received');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 ">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        {error && (
          <div className="p-2 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="mt-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          This Login Page is for Admin only !!!!
        </p>
      </div>
    </div>
  );
};

export default Login;
