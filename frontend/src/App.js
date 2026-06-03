import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import axios from 'axios';

// Layout components
import Layout from './components/Layout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard views
import Dashboard from './pages/Dashboard';
import ResourceMonitoring from './pages/ResourceMonitoring';
import WorkloadAnalysis from './pages/WorkloadAnalysis';
import MLPrediction from './pages/MLPrediction';
import ResourceAllocation from './pages/ResourceAllocation';
import PerformanceMonitoring from './pages/PerformanceMonitoring';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Global Axios Interceptor to handle expired/invalid JWT tokens (forcing redirect to login)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication & Dark Mode Contexts
export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true); // default to Dark Mode (Premium UI Look)
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'System initialized successfully', type: 'info', time: 'Just now' },
    { id: 2, message: 'Seeded historical ML metrics database loaded', type: 'success', time: '2 mins ago' }
  ]);

  // Sync dark mode class on body element
  useEffect(() => {
    const root = window.document.body;
    if (darkMode) {
      root.classList.add('dark');
      root.style.background = 'linear-gradient(135deg, #020000 0%, #200404 50%, #080000 100%)';
      root.style.backgroundAttachment = 'fixed';
    } else {
      root.classList.remove('dark');
      root.style.background = 'linear-gradient(135deg, #FFFFFF 0%, #FFF3F3 50%, #FFE6E6 100%)';
      root.style.backgroundAttachment = 'fixed';
    }
  }, [darkMode]);

  // Load user from localStorage if exists
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [
      { id: Date.now(), message, type, time: 'Just now' },
      ...prev.slice(0, 19) // Keep last 20 notifications
    ]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const theme = getTheme(darkMode ? 'dark' : 'light');

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      darkMode,
      setDarkMode,
      notifications,
      setNotifications,
      addNotification,
      handleLogout
    }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

            {/* Protected Dashboard Layout Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="monitoring" element={<ResourceMonitoring />} />
              <Route path="workload" element={<WorkloadAnalysis />} />
              <Route path="prediction" element={<MLPrediction />} />
              <Route path="allocation" element={<ResourceAllocation />} />
              <Route path="performance" element={<PerformanceMonitoring />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AppContext.Provider>
  );
}

export default App;
