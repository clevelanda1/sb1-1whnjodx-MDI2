import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, Zap, Star, Trash2 } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteProject: () => void;
  projectCount: number;
  maxFreeProjects: number;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onDeleteProject,
  projectCount,
  maxFreeProjects
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const subscriptionPlans = [
    {
      name: 'Pro',
      price: 19,
      period: 'month',
      description: 'Perfect for individual designers',
      features: [
        'Unlimited projects',
        'Advanced AI analysis',
        'Priority product matching',
        'Export to PDF',
        'Email support'
      ],
      popular: false,
      color: 'from-violet-600 to-purple-600'
    },
    {
      name: 'Studio',
      price: 49,
      period: 'month',
      description: 'Best for design teams',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Brand customization',
        'API access',
        'Priority support',
        'Custom integrations'
      ],
      popular: true,
      color: 'from-blue-600 to-indigo-600'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.22, 1, 0.36, 1] 
            }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-full transition-all duration-200 z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} />
            </motion.button>

            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white p-8 text-center">
              <motion.div
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
              >
                <Crown size={28} className="text-white" />
              </motion.div>

              <motion.h2
                className="text-3xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                Project Limit Reached
              </motion.h2>

              <motion.p
                className="text-white/90 text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                You've reached the limit of {maxFreeProjects} free projects ({projectCount}/{maxFreeProjects})
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Options */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                  Choose an option to continue:
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Delete Project Option */}
                  <motion.button
                    onClick={onDeleteProject}
                    className="p-6 border-2 border-slate-200 rounded-2xl hover:border-red-300 hover:bg-red-50/50 transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Trash2 size={20} className="text-red-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900">Delete a Project</h4>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Remove an existing project to make room for a new one. This action cannot be undone.
                    </p>
                  </motion.button>

                  {/* Upgrade Option */}
                  <motion.button
                    className="p-6 border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl hover:border-violet-300 transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                        <Crown size={20} className="text-violet-600" />
                      </div>
                      <h4 className="font-semibold text-slate-900">Upgrade to Pro</h4>
                    </div>
                    <p className="text-slate-600 text-sm">
                      Get unlimited projects plus advanced features to supercharge your design workflow.
                    </p>
                  </motion.button>
                </div>
              </div>

              {/* Subscription Plans */}
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                  Unlock Unlimited Projects
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subscriptionPlans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      className={`relative p-6 border-2 rounded-2xl transition-all duration-300 ${
                        plan.popular 
                          ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50' 
                          : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50/30'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star size={12} />
                            Most Popular
                          </div>
                        </div>
                      )}

                      <div className="text-center mb-4">
                        <h4 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h4>
                        <p className="text-slate-600 text-sm mb-3">{plan.description}</p>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                          <span className="text-slate-600">/{plan.period}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check size={12} className="text-emerald-600" />
                            </div>
                            <span className="text-slate-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <motion.button
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Zap size={16} />
                        Choose {plan.name}
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  All plans include a 14-day free trial. Cancel anytime.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubscriptionModal;