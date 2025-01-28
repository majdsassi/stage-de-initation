import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Navigate, Routes } from 'react-router-dom';
import Login from './login';
import Dashboard from './dashboard';
import { Toaster } from 'react-hot-toast';
import NewContract from './contra';
import NewFournisseur from "./Forni"
import Stats from "./stats"
import EditContract from "./editContract"

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const saveToken = (userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
  <Routes>
    {/* Root route redirects based on token presence */}
    <Route
      path="/"
      element={
        token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
      }
    />
    {/* Login route */}
    <Route path="/login" element={<Login setToken={saveToken} />} />

    {/* Protected routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard logout={logout} />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add-supplier"
      element={
        <ProtectedRoute>
          <NewFournisseur />
        </ProtectedRoute>
      }
    />
    <Route
  path="/edit-contract/:id"
  element={
    <ProtectedRoute>
      <EditContract />
    </ProtectedRoute>
  }
/>
    <Route
      path="/add-contract"
      element={
        <ProtectedRoute>
          <NewContract />
        </ProtectedRoute>
      }
    />
    <Route
      path="/stats"
      element={
        <ProtectedRoute>
          <Stats />
        </ProtectedRoute>
      }
    />
  </Routes>
  {/* Toaster for notifications */}
  <Toaster position="top-center" reverseOrder={false} />
</Router>

  );
};

export default App;
