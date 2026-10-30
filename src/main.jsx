import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountsPage from './pages/AccountsPage';
import NewAccountPage from './pages/NewAccountPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/accounts"
          element={(
            <ProtectedRoute>
              <AccountsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/accounts/new"
          element={(
            <ProtectedRoute>
              <NewAccountPage />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
