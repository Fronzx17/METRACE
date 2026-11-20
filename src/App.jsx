import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout.jsx';
import AuthLayout from './components/layout/AuthLayout.jsx';

// Route guards
import ProtectedRoute, { PublicRoute } from './components/auth/ProtectedRoute.jsx';

// Auth pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

// App pages
import Dashboard from './pages/Dashboard.jsx';
import Activities from './pages/Activities.jsx';
import Timeline from './pages/Timeline.jsx';
import Analytics from './pages/Analytics.jsx';
import TimeFingerprint from './pages/TimeFingerprint.jsx';
import DecisionExplorer from './pages/DecisionExplorer.jsx';
import Challenges from './pages/Challenges.jsx';
import Achievements from './pages/Achievements.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>

      {/* ==============================
          PUBLIC AUTH ROUTES
          Redirect to /dashboard if already logged in
         ============================== */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* ==============================
          PROTECTED APP ROUTES
          Redirect to /login if not authenticated
         ============================== */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/time-fingerprint" element={<TimeFingerprint />} />
        <Route path="/decision-explorer" element={<DecisionExplorer />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
