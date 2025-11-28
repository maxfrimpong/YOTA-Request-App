import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { StaffDashboard } from './pages/StaffDashboard';
import { AuthorizerDashboard } from './pages/AuthorizerDashboard';
import { ApproverDashboard } from './pages/ApproverDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Role } from './types';

const DashboardRouter = () => {
  const { user, activeRole } = useApp();

  if (!user || !activeRole) return <Navigate to="/login" />;

  switch (activeRole) {
    case Role.STAFF:
      return <StaffDashboard />;
    case Role.AUTHORIZER:
      return <AuthorizerDashboard />;
    case Role.APPROVER:
      return <ApproverDashboard />;
    case Role.ADMIN:
      return <AdminDashboard />;
    default:
      return <div>Unknown Role</div>;
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
