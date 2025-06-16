import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Zap, Star, ArrowLeft, Sparkles, Users, Shield, Rocket, ChevronDown, ChevronUp, Gift, Loader2, AlertCircle } from 'lucide-react';
import { STRIPE_PRODUCTS, SUBSCRIPTION_TIERS } from '../stripe-config';
import { StripeService } from '../services/stripeService';
import { useSubscription } from '../contexts/SubscriptionContext';
import PricingCard from '../components/common/PricingCard';

const Upgrade: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const plan = params.get('plan');
    
    if (success === 'true' && plan) {
      setSuccessMessage(`Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription has been activated successfully!`);
      
      // Clear the URL parameters after a delay
      const timeout = setTimeout(() => {
        navigate('/upgrade', { replace: true });
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
    
    // Check for canceled parameter
    const canceled = params.get('canceled');
    if (canceled === 'true') {
      setErrorMessage('Checkout was canceled. Your subscription has not been changed.');
      
      // Clear the URL parameters after a delay
      const timeout = setTimeout(() => {
        navigate('/upgrade', { replace: true });
        setErrorMessage(null);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [location, navigate]);

  const getPrice = (plan: string) => {
    if (plan === 'pro') {
      return billingCycle === 'yearly' ? 15 : 19.99;
    } else if (plan === 'studio') {
      return billingCycle === 'yearly' ? 39 : 49.99;
    }
    return 0;
  };

  const getYearlySavings = (plan: string) => {
    if (plan === 'pro') {
      return ((19.99 - 15) * 12).toFixed(0);
    } else if (plan === 'studio') {
      return ((49.99 - 39) * 12).toFixed(0);
    }
    return '0';
  };

  const handleUpgrade = async (planId: string) => {
    try {
      setIsProcessing(true);
      setProcessingPlan(planId);
      setErrorMessage(null);
      
      // Get the Stripe product configuration based on billing cycle
      const productKey = billingCycle === 'yearly' 
        ? `${planId}Yearly` as keyof typeof STRIPE_PRODUCTS 
        : planId as keyof typeof STRIPE_PRODUCTS;
      
      const product = STRIPE_PRODUCTS[productKey];
      if (!product) {
        throw new Error(`Invalid plan: ${planId}`);
      }
      
      // Create a checkout session
      const { url } = await StripeService.createCheckoutSession({
        priceId: product.priceId,
        successUrl: `${window.location.origin}/account?success=true&plan=${planId}`,
        cancelUrl: `${window.location.origin}/upgrade?canceled=true`,
        mode: 'subscription'
      });
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error: any) {
      console.error('Error starting checkout:', error);
      setErrorMessage(error.message || 'Failed to start checkout process. Please try again.');
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  // Updated feature lists to match specifications
  const freeFeatures = [
    'AI Image analysis',
    '4 active projects',
    '40 Amazon searches/month',
    '25 Etsy searches/month',
    '1 active vision board'
  ];

  const proFeatures = [
    'Everything in Free',
    '25 active projects',
    '200 Amazon searches/month',
    '125 Etsy searches/month',
    '12 active vision boards',
    'Vision board sharing',
    'Ad-free experience'
  ];

  const studioFeatures = [
    'Everything in Pro',
    'Unlimited projects',
    '1,200 monthly Amazon search credits',
    '750 monthly Etsy search credits',
    'Unlimited vision boards',
    'White label branding'
  ];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-violet-200/40 to-purple-200/40 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white py-20 lg:py-24 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Hero Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-dots" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" className="text-white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Back Button */}
            <motion.div 
              className="flex mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Link to="/studio" className="inline-flex items-center text-slate-300 hover:text-white transition-all duration-300 font-medium group bg-white/10 backdrop-blur-sm px-5 py-3 rounded-full hover:bg-white/20">
                <svg 
                  className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back to Studio</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="w-16 h-1 bg-gradient-to-r from-violet-400 to-blue-400 mb-6 rounded-full"
            />
            
            <motion.h1 
              className="font-light text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Unlock Your
              <motion.span 
                className="block font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Creative Potential
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-300 leading-relaxed max-w-3xl font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Transform your design workflow with more projects, advanced AI features, 
              and priority support. Get started with no ads today!
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {(successMessage || errorMessage) && (
          <motion.div
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`p-4 rounded-xl shadow-lg ${
              successMessage ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {successMessage ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-800">{successMessage}</p>
                      <p className="text-sm text-emerald-600 mt-1">Redirecting you to the studio...</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="font-medium text-red-800">{errorMessage}</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative z-10">
        {/* Billing Toggle */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Choose Your Plan</h2>
          <p className="text-slate-600 text-lg mb-8">Select the plan that works best for you and your design journey.</p>
          
          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-white rounded-xl p-2 shadow-lg border border-slate-200">
            <motion.button
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setBillingCycle('monthly')}
              whileTap={{ scale: 0.95 }}
            >
              Monthly
            </motion.button>
            <motion.button
              className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 relative ${
                billingCycle === 'yearly'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              onClick={() => setBillingCycle('yearly')}
              whileTap={{ scale: 0.95 }}
            >
              Yearly
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                20%
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
          
          {/* Free Plan */}
          <PricingCard
            name="Free"
            price={0}
            period={billingCycle}
            description="Everything you need to get started"
            features={freeFeatures}
            isCurrentPlan={subscription.tier === 'free'}
            buttonText="Start Free - It's Free"
            onButtonClick={() => navigate('/studio')}
            colorClass="from-slate-600 to-slate-700"
            bgColorClass="from-slate-50 to-slate-100"
          />
          
          {/* Pro Plan */}
          <PricingCard
            name="Pro"
            price={billingCycle === 'yearly' ? 15 : 19.99}
            period={billingCycle}
            description="Everything you need to bring your vision to life"
            features={proFeatures}
            isPopular={true}
            isCurrentPlan={subscription.tier === 'pro'}
            buttonText={`Upgrade to Pro${billingCycle === 'yearly' ? '' : ''}`}
            onButtonClick={() => handleUpgrade('pro')}
            isLoading={isProcessing && processingPlan === 'pro'}
            colorClass="from-blue-600 to-blue-700"
            bgColorClass="from-blue-50 to-blue-50"
          />
          
          {/* Studio Plan */}
          <PricingCard
            name="Studio"
            price={billingCycle === 'yearly' ? 39 : 49.99}
            period={billingCycle}
            description="Built for teams that create without compromise"
            features={studioFeatures}
            isCurrentPlan={subscription.tier === 'studio'}
            buttonText={`Upgrade to Studio${billingCycle === 'yearly' ? '' : ''}`}
            onButtonClick={() => handleUpgrade('studio')}
            isLoading={isProcessing && processingPlan === 'studio'}
            colorClass="from-violet-600 to-purple-600"
            bgColorClass="from-violet-50 to-purple-50"
          />
        </div>

        {/* Why Upgrade Features */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">Why Upgrade?</h3>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Unlock powerful features designed to accelerate your design workflow and enhance collaboration.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Rocket className="w-8 h-8" />,
                title: 'More Projects',
                description: 'Create up to 25 design projects with Pro, or unlimited with Studio.',
                gradient: 'from-violet-500 to-purple-600'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Advanced AI Features',
                description: 'Get more accurate product matching and enhanced design analysis powered by AI.',
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Priority Support',
                description: 'Get help when you need it with our dedicated support team and faster response times.',
                gradient: 'from-emerald-500 to-teal-600'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-6`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-3xl font-bold text-slate-900 mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-slate-600 text-lg mb-12 max-w-2xl mx-auto">
            Have questions? We've got answers to help you make the right choice.
          </p>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: 'Can I cancel anytime?',
                answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
              },
              {
                question: 'What happens to my projects if I downgrade?',
                answer: 'Your projects will remain accessible, but you\'ll be limited to 4 active projects on the Free plan or 25 on the Pro plan. You can archive older projects to stay within the limit.'
              },
              {
                question: 'Do you offer an ad-free experience?',
                answer: 'Yes! Upgrade to our Pro or Studio plan to enjoy an completely ad-free experience. Free plan users will see promotional content, but our paid subscribers get uninterrupted access to all design tools and features without any advertisements'
              },
              {
                question: 'What\'s the difference between monthly and yearly billing?',
                answer: 'Yearly billing offers a 20% discount compared to monthly billing. You\'ll be charged once per year instead of monthly.'
              }
            ].map((faq, index) => (
              <motion.div
                key={faq.question}
                className="text-left p-6 bg-white border border-slate-200 rounded-2xl shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              >
                <h4 className="font-semibold text-slate-900 mb-2">
                  {faq.question}
                </h4>
                <p className="text-slate-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upgrade;