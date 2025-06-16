import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';

interface PricingCardProps {
  name: string;
  price: number;
  period: string | 'monthly' | 'yearly';
  description: string;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  buttonText: string;
  onButtonClick: () => void;
  isLoading?: boolean;
  colorClass?: string;
  bgColorClass?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  period,
  description,
  features,
  isPopular = false,
  isCurrentPlan = false,
  buttonText,
  onButtonClick,
  isLoading = false,
  colorClass = 'from-violet-600 to-purple-600',
  bgColorClass = 'from-violet-50 via-purple-50 to-violet-50'
}) => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
    >
      <div className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
        isCurrentPlan 
          ? 'bg-white border-2 border-blue-400' 
          : isPopular 
          ? 'bg-white border-2 border-blue-200' 
          : 'bg-white border-2 border-slate-200'
      }`}>
        
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Most Popular
            </div>
          </div>
        )}
        
        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Current Plan
            </div>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold text-slate-900 mb-2">{name}</h3>
          <p className="text-slate-600 mb-6">{description}</p>

          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-baseline justify-center gap-1">
              <motion.span 
                className="text-4xl font-bold text-slate-900"
                key={price}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                ${price}
              </motion.span>
              <span className="text-slate-600 ml-1">/{period}</span>
            </div>
            
            {/* Yearly savings badge */}
            {period === 'yearly' && price > 0 && (
              <div className="mt-2 inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Save 20% with yearly billing
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-4 text-left mb-8">
            {features.map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isPopular ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <Check className={`w-3 h-3 ${
                    isPopular ? 'text-blue-600' : 'text-slate-600'
                  }`} />
                </div>
                <span className="text-slate-600 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={onButtonClick}
            disabled={isLoading || isCurrentPlan}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isCurrentPlan
                ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                : isPopular
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg'
            }`}
            whileHover={{ scale: isCurrentPlan || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isCurrentPlan || isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : isCurrentPlan ? (
              'Current Plan'
            ) : (
              buttonText
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PricingCard;