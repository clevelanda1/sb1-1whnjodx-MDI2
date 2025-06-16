import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { APP_NAME } from '../../utils/constants';

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [step, setStep] = useState(1);

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    return requirements;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (value && !validateEmail(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        const requirements = validatePassword(value);
        if (value && !Object.values(requirements).every(req => req)) {
          newErrors.password = 'Password must meet all requirements';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'firstName':
        if (value && value.length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;
      case 'lastName':
        if (value && value.length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    
    try {
      setTimeout(() => {
        setIsGoogleLoading(false);
        console.log('Google sign up successful');
        navigate('/studio');
      }, 2000);
      
    } catch (error) {
      setIsGoogleLoading(false);
      console.error('Google sign up failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate step 1
      const newErrors: {[key: string]: string} = {};
      
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      setStep(2);
      return;
    }
    
    // Final validation
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!acceptTerms) newErrors.terms = 'You must accept the terms and conditions';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      
      navigate('/studio');
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    }
  };

  const passwordRequirements = validatePassword(formData.password);
  const isStep1Valid = formData.firstName && formData.lastName && formData.email && !errors.firstName && !errors.lastName && !errors.email;
  const isStep2Valid = formData.password && formData.confirmPassword && acceptTerms && !errors.password && !errors.confirmPassword;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-blue-200/30 to-violet-200/30 rounded-full blur-3xl"
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
              <pattern id="signup-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(148 163 184)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#signup-grid)" />
          </svg>
        </motion.div>
      </div>

      {/* Left Side - Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12 xl:px-16 relative z-10"
        initial={{ opacity: 0, x: -50 }}
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
              <h2 className="text-2xl font-light text-slate-900 mb-2">Create your account</h2>
              <p className="text-slate-600 font-light text-sm">Join thousands of designers worldwide</p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-1/2 h-1.5 rounded-full ${step >= 1 ? 'bg-violet-600' : 'bg-slate-200'} transition-all duration-300`}></div>
                <div className={`w-1/2 h-1.5 rounded-full ml-2 ${step >= 2 ? 'bg-violet-600' : 'bg-slate-200'} transition-all duration-300`}></div>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Step {step} of 2: {step === 1 ? 'Personal Information' : 'Security Setup'}
              </p>
            </div>

            {/* Error Message */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-2xl flex items-center gap-2"
              >
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{errors.general}</span>
              </motion.div>
            )}

            {/* Google Sign Up (Step 1 only) */}
            {step === 1 && (
              <div className="mb-5">
                <motion.button 
                  onClick={handleGoogleSignUp}
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
                    {isGoogleLoading ? 'Creating account...' : 'Sign up with Google'}
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
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                // Step 1: Personal Information
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-white/60 backdrop-blur-sm text-sm ${
                            errors.firstName 
                              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                              : formData.firstName && !errors.firstName
                              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                              : 'border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                          }`}
                          placeholder="John"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last name</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-white/60 backdrop-blur-sm text-sm ${
                            errors.lastName 
                              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                              : formData.lastName && !errors.lastName
                              ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                              : 'border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                          }`}
                          placeholder="Doe"
                        />
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Work email</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-white/60 backdrop-blur-sm text-sm ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : formData.email && !errors.email
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                        }`}
                        placeholder="john@company.com"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      {formData.email && !errors.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>
                </>
              ) : (
                // Step 2: Security Setup
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Create password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-white/60 backdrop-blur-sm text-sm ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : formData.password && !errors.password
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                        }`}
                        placeholder="Create a strong password"
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
                    
                    {/* Compact Password Requirements */}
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className={passwordRequirements.length ? 'text-emerald-600' : 'text-slate-500'}>8+ chars</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.uppercase ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className={passwordRequirements.uppercase ? 'text-emerald-600' : 'text-slate-500'}>A-Z</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.number ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className={passwordRequirements.number ? 'text-emerald-600' : 'text-slate-500'}>0-9</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 border rounded-2xl focus:outline-none transition-all duration-300 bg-white/60 backdrop-blur-sm text-sm ${
                          errors.confirmPassword 
                            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                            : formData.confirmPassword && !errors.confirmPassword
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-slate-300/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                        }`}
                        placeholder="Confirm your password"
                      />
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="bg-slate-50/80 rounded-2xl p-3">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 mt-0.5" 
                      />
                      <div className="text-xs text-slate-600 leading-relaxed">
                        I agree to the{' '}
                        <Link to="/terms" className="text-violet-600 hover:text-violet-700 font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-violet-600 hover:text-violet-700 font-medium">
                          Privacy Policy
                        </Link>
                      </div>
                    </div>
                    {errors.terms && (
                      <p className="mt-2 text-xs text-red-600">{errors.terms}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-slate-300/60 rounded-2xl font-medium text-slate-700 hover:bg-slate-50/80 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Back
                  </motion.button>
                )}
                
                <motion.button
                  type="submit"
                  disabled={(step === 1 && !isStep1Valid) || (step === 2 && (!isStep2Valid || loading))}
                  className={`${step === 2 ? 'flex-1' : 'w-full'} py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    ((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid)) && !loading
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                  whileHover={((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid)) && !loading ? { scale: 1.02 } : {}}
                  whileTap={((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid)) && !loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : step === 1 ? (
                    'Continue'
                  ) : (
                    <>
                      Create account
                      <Sparkles size={16} />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-slate-600 font-light text-sm">
                Already have an account?{' '}
                <Link to="/signin" className="text-violet-600 hover:text-violet-700 font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            className="mt-4 flex items-center justify-center gap-2 text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Shield size={14} />
            <p className="text-xs">Your data is encrypted and secure</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Benefits */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center px-12 xl:px-16 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="max-w-lg text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
              <span className="text-sm font-medium">No design experience needed</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl xl:text-6xl font-light leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Upgrade Your
            <span className="block font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Design Process
            </span>
          </motion.h1>
          
          <motion.div
            className="space-y-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              {
                title: "Upload & Discover",
                description: "Upload any photo and see exactly what furniture and décor would complete your space"
              },
              {
                title: "Smart Shopping",
                description: "Get personalized product suggestions from thousands of top-rated items"
              },
              {
                title: "Plan & Visualize",
                description: "Create beautiful mood boards to see your vision come to life"
              }
            ].map((benefit, index) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-slate-300 font-light text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="flex items-center gap-6 pt-4 border-t border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="text-center">
              <div className="text-xl font-semibold">Free Forever</div>
              <div className="text-xs text-slate-400">No Creditcard Required</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">Upgrade Anytime</div>
              <div className="text-xs text-slate-400">When You're Ready</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold">Best Selection</div>
              <div className="text-xs text-slate-400">Top Retailers Included</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;