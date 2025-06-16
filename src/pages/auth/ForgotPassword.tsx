import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { APP_NAME } from '../../utils/constants';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{email?: string}>({});
  const [resendCount, setResendCount] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !validateEmail(value)) {
      setErrors({ email: 'Please enter a valid email address' });
    } else {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setResendCount(1);
    }, 2000);
  };

  const handleResend = () => {
    setIsLoading(true);
    setResendCount(prev => prev + 1);
    setCountdown(60); // 60 second cooldown
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail('');
    setResendCount(0);
    setCountdown(0);
    setErrors({});
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-gradient-to-br from-violet-200/30 to-slate-200/30 rounded-full blur-3xl"
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
              <pattern id="forgot-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(148 163 184)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#forgot-grid)" />
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <motion.div
          className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl shadow-slate-900/10 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        >
          {/* Back Button */}
          <Link to="/signin" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 group transition-colors">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium text-sm">Back to sign in</span>
          </Link>

          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-white" size={20} />
                  </div>
                  <h2 className="text-2xl font-light text-slate-900 mb-2">Reset your password</h2>
                  <p className="text-slate-600 font-light text-sm leading-relaxed">
                    Enter your email address and we'll send you a secure link to reset your password
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email address</label>
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
                        placeholder="Enter your email address"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      {email && !errors.email && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-500\" size={16} />
                      )}
                    </div>
                    {errors.email && (
                      <motion.p 
                        className="mt-2 text-sm text-red-600"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  <motion.button
                    type="submit"
                    disabled={!email || !!errors.email || isLoading}
                    className={`w-full py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      email && !errors.email && !isLoading
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    whileHover={email && !errors.email ? { scale: 1.02 } : {}}
                    whileTap={email && !errors.email ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight size={16} />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Help Text */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500">
                    Remember your password?{' '}
                    <Link to="/signin" className="text-violet-600 hover:text-violet-700 font-medium transition-colors">
                      Sign in instead
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center"
              >
                {/* Success Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-white" size={22} />
                </div>

                <h2 className="text-2xl font-light text-slate-900 mb-2">Check your email</h2>
                <p className="text-slate-600 font-light mb-4 text-sm leading-relaxed">
                  We've sent a password reset link to
                </p>
                <div className="bg-slate-50/80 rounded-2xl p-3 mb-4">
                  <p className="font-medium text-slate-900 text-sm">{email}</p>
                </div>

                {/* Compact Instructions */}
                <div className="bg-blue-50/80 rounded-2xl p-4 mb-5 text-left">
                  <h3 className="font-medium text-slate-900 mb-2 text-sm">Next steps:</h3>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Check your email inbox (and spam folder)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Click the reset link within 15 minutes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span>Create a new secure password</span>
                    </li>
                  </ul>
                </div>

                {/* Resend Section */}
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Didn't receive the email?
                  </p>
                  
                  {countdown > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Clock size={14} />
                      <span className="text-xs">
                        You can resend in {countdown} seconds
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <motion.button 
                        onClick={handleResend}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-300/60 rounded-2xl text-slate-700 hover:bg-slate-50/80 transition-all duration-300 disabled:opacity-50 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        <span className="font-medium">
                          {resendCount > 1 ? `Resend again` : 'Resend email'}
                        </span>
                      </motion.button>
                      
                      <motion.button
                        onClick={handleTryAgain}
                        className="flex-1 px-3 py-2.5 text-violet-600 hover:text-violet-700 font-medium transition-colors text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Try different email
                      </motion.button>
                    </div>
                  )}
                </div>

                {/* Back to Sign In */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Link
                    to="/signin"
                    className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors group text-sm"
                  >
                    <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to sign in
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 text-slate-500 mb-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle size={8} className="text-white" />
            </div>
            <p className="text-xs font-medium">Secure password reset</p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Reset links expire after 15 minutes for your security. 
            We'll never ask for your password via email.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;