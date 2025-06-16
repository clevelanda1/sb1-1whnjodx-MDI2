import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/signin' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading...</h2>
          <p className="text-slate-600">Please wait while we verify your session</p>
        </motion.div>
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in with return url
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;