import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME } from '../../utils/constants';

const SignIn: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const [rememberMe, setRememberMe] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value && value.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const getErrorMessage = (error: any) => {
    // Handle specific Supabase auth errors
    if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
        return 'The email or password you entered is incorrect. Please check your credentials and try again.';
      }
      
      if (message.includes('email not confirmed')) {
        return 'Please check your email and click the confirmation link before signing in.';
      }
      
      if (message.includes('too many requests')) {
        return 'Too many login attempts. Please wait a few minutes before trying again.';
      }
      
      if (message.includes('user not found')) {
        return 'No account found with this email address. Please check your email or create a new account.';
      }
      
      if (message.includes('network')) {
        return 'Network error. Please check your internet connection and try again.';
      }
      
      // Return the original error message if it's user-friendly
      if (error.message.length < 100) {
        return error.message;
      }
    }
    
    // Default fallback message
    return 'Sign in failed. Please check your credentials and try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      await login(email, password, rememberMe);
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || '/studio';
        navigate(from, { replace: true });
      }, 100);
      
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ general: getErrorMessage(error) });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    try {
      // In a real app, you would use Google OAuth SDK here
      setTimeout(() => {
        setIsGoogleLoading(false);
        console.log('Google sign in successful');
        navigate('/studio');
      }, 2000);
      
    } catch (error) {
      setIsGoogleLoading(false);
      console.error('Google sign in failed:', error);
    }
  };

  const isFormValid = email && password && !errors.email && !errors.password;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-violet-200/30 to-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div 
          className="absolute inset-0 opacity-[0.03]"
          animate={{
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="signin-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(148 163 184)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#signin-grid)" />
          </svg>
        </motion.div>
      </div>

      {/* Left Side - Branding */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center pl-6 pr-12 lg:pl-12 lg:pr-12 xl:pl-16 xl:pr-16 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="max-w-lg ml-auto text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <span className="text-sm font-medium">Welcome back to My Design Index</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-4xl xl:text-5xl font-light leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Turning Inspiration Into
            <span className="block font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Shoppable Products
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-slate-300 leading-relaxed mb-6 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Continue where you left off. Access your saved projects, vision boards, and curated product recommendations.
          </motion.p>

          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {[
              { metric: "Skip The Search", label: "We'll Shop For You" },
              { metric: "Instant Alternatives", label: "No Waiting Around" },
              { metric: "Vision Boards", label: "Share Anywhere" }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-semibold">{stat.metric}</div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 xl:px-16 relative z-10"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="w-full max-w-md">
          <motion.div
            className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-900/10 p-8"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-block mb-4">
                <h1 className="font-semibold text-2xl text-slate-900">{APP_NAME}</h1>
              </Link>
              <h2 className="text-2xl font-light text-slate-900 mb-2">Welcome back</h2>
              <p className="text-slate-600 font-light text-sm">Sign in to continue to your dashboard</p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50/80 border border-red-200 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 text-sm font-medium mb-1">Sign in failed</p>
                    <p className="text-red-600 text-sm leading-relaxed">{errors.general}</p>
                    {errors.general.includes('incorrect') && (
                      <div className="mt-2 text-xs text-red-600">
                        <p>• Double-check your email address for typos</p>
                        <p>• Make sure your password is correct</p>
                        <p>• Use "Forgot password?" if you need to reset it</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Google Sign In */}
            <div className="mb-6">
              <motion.button 
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300/60 rounded-2xl hover:bg-slate-50/80 transition-all duration-300 group disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span className="font-medium text-slate-700 group-hover:text-slate-900">
                  {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                </span>
              </motion.button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-slate-500 font-medium">or</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full pl-11 pr-10 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-white/60 backdrop-blur-sm text-sm ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : email && !errors.email
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                    }`}
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  {email && !errors.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {errors.email && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" size={16} />
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full pl-11 pr-11 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-white/60 backdrop-blur-sm text-sm ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : password && !errors.password
                        ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                    }`}
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500" 
                  />
                  <span className="ml-2 text-sm text-slate-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                  isFormValid && !loading
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
                whileHover={isFormValid && !loading ? { scale: 1.02 } : {}}
                whileTap={isFormValid && !loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 font-light text-sm">
                New to {APP_NAME}?{' '}
                <Link to="/signup" className="text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <p className="text-xs text-slate-500 mb-2">Trusted by designers worldwide</p>
            <div className="flex items-center justify-center gap-3 opacity-60">
              {['Amazon', 'Wayfair', 'Vision Boards'].map((feature, index) => (
                <div key={feature} className="text-xs font-medium text-slate-400 px-2 py-1 bg-white/50 rounded">
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;