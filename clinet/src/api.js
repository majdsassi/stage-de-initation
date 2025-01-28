import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL for your API
  //timeout: 5000,    // Optional: Set a timeout for requests
});

// Add a request interceptor to include JWT token in the headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry and logout
api.interceptors.response.use(
  (response) => response, // For successful responses, just return the response
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 400) ) {
      // If the server responds with 401 (Unauthorized), token may be expired
      console.log('Token expired or invalid, logging out...');
      
      // Clear the token from localStorage or cookies
      localStorage.removeItem('token'); // Assuming you store the token in localStorage
      
      // Redirect to login page or show a login modal
      window.location.href = '/login'; // Redirect to login page
    }
    // Reject the promise for other types of errors
    return Promise.reject(error);
  }
);

export default api;
