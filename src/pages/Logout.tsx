import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Logout: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('Logout failed:', error);
        navigate('/');
      }
    };

    performLogout();
  }, [logout, navigate]);

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
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Signing Out...</h2>
        <p className="text-slate-600">Please wait while we securely log you out</p>
      </motion.div>
    </div>
  );
};

export default Logout;