import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import PublicRoute from '../components/auth/PublicRoute';
import { Loader2 } from 'lucide-react';

// Lazy load page components
const Home = lazy(() => import('../pages/Home'));
const Studio = lazy(() => import('../pages/Studio'));
const Curation = lazy(() => import('../pages/Curation'));
const VisionBoard = lazy(() => import('../pages/VisionBoard'));
const Upgrade = lazy(() => import('../pages/Upgrade'));
const Account = lazy(() => import('../pages/Account'));
const SignIn = lazy(() => import('../pages/auth/SignIn'));
const SignUp = lazy(() => import('../pages/auth/SignUp'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const SharedVisionBoard = lazy(() => import('../pages/SharedVisionBoard'));
const SharedCollection = lazy(() => import('../pages/SharedCollection'));
const Logout = lazy(() => import('../pages/Logout'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading...</h2>
      <p className="text-slate-600">Please wait while we prepare your experience</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes (redirect to studio if authenticated) */}
            <Route path="/signin" element={
              <PublicRoute redirectTo="/studio">
                <SignIn />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute redirectTo="/studio">
                <SignUp />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute redirectTo="/studio">
                <ForgotPassword />
              </PublicRoute>
            } />
            
            {/* Shared Vision Board - Public Route */}
            <Route path="/shared-visionboard/:shareToken" element={<SharedVisionBoard />} />
            
            {/* Shared Collection - Public Route */}
            <Route path="/shared/:shareToken" element={<SharedCollection />} />
            
            {/* Logout route */}
            <Route path="/logout" element={<Logout />} />
            
            {/* Main app routes (with MainLayout) */}
            <Route path="/" element={<MainLayout />}>
              {/* Home page - only accessible to non-authenticated users, redirect authenticated users to studio */}
              <Route index element={
                <PublicRoute redirectTo="/studio">
                  <Home />
                </PublicRoute>
              } />
              
              {/* Protected routes - only accessible to authenticated users */}
              <Route path="studio" element={
                <ProtectedRoute redirectTo="/signin">
                  <Studio />
                </ProtectedRoute>
              } />
              <Route path="curation" element={
                <ProtectedRoute redirectTo="/signin">
                  <Curation />
                </ProtectedRoute>
              } />
              <Route path="visionboard" element={
                <ProtectedRoute redirectTo="/signin">
                  <VisionBoard />
                </ProtectedRoute>
              } />
              <Route path="upgrade" element={
                <ProtectedRoute redirectTo="/signin">
                  <Upgrade />
                </ProtectedRoute>
              } />
              <Route path="account" element={
                <ProtectedRoute redirectTo="/signin">
                  <Account />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Suspense>
      </SubscriptionProvider>
    </AuthProvider>
  );
};

export default AppRoutes;