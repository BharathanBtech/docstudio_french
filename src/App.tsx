import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import CampaignsDashboard from './pages/CampaignsDashboard';
import CampaignDetailsPage from './pages/CampaignDetailsPage';
import './styles/global.css';
import './styles/components.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/campaigns" replace /> : <LoginPage />} 
      />
      <Route 
        path="/campaigns" 
        element={
          <ProtectedRoute>
            <CampaignsDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/campaigns/:id" 
        element={
          <ProtectedRoute>
            <CampaignDetailsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/campaigns" : "/login"} replace />} 
      />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
