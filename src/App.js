import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import RealTimeMonitor from './pages/RealTimeMonitor';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import Attendance from './pages/Attendance';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {user && <Header />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/employees" element={
              <PrivateRoute>
                <Employees />
              </PrivateRoute>
            } />
            <Route path="/real-time" element={
              <PrivateRoute>
                <RealTimeMonitor />
              </PrivateRoute>
            } />
            <Route path="/attendance" element={
              <PrivateRoute>
                <Attendance />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;