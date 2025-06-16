import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, Loader2, Check, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { WhiteLabelService } from '../../services/whiteLabelService';

interface WhiteLabelSettingsProps {
  userId: string;
}

const WhiteLabelSettings: React.FC<WhiteLabelSettingsProps> = ({ userId }) => {
  const { subscription } = useSubscription();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Only Studio plan users can access white label features
  const canAccessWhiteLabel = subscription.tier === 'studio';

  // Load existing white label settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!canAccessWhiteLabel) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const settings = await WhiteLabelService.getWhiteLabelSettings();
        if (settings?.logoUrl) {
          setLogoUrl(settings.logoUrl);
        }
      } catch (error) {
        console.error('Error loading white label settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [canAccessWhiteLabel]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);
      
      const newLogoUrl = await WhiteLabelService.uploadLogo(file);
      setLogoUrl(newLogoUrl);
      setSuccess('Logo uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      setError(error.message || 'Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);
      
      await WhiteLabelService.removeLogo();
      setLogoUrl(null);
      setSuccess('Logo removed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error removing logo:', error);
      setError(error.message || 'Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  };

  if (!canAccessWhiteLabel) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">White Label Branding</h2>
        <p className="text-slate-600 mb-6">Customize how your shared vision boards appear to clients</p>
        
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 text-sm font-medium mb-1">Studio Plan Required</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                White label branding is available exclusively for Studio plan subscribers. 
                Upgrade to Studio to add your logo to shared vision boards.
              </p>
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={() => window.location.href = '/upgrade'}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Upgrade to Studio
        </motion.button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">White Label Branding</h2>
      <p className="text-slate-600 mb-6">Customize how your shared vision boards appear to clients</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Logo Upload Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Company Logo</h3>
            
            {/* Current Logo Preview */}
            {logoUrl ? (
              <div className="mb-6">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center">
                  {/* Updated logo container with fixed dimensions and padding */}
                  <div className="w-48 h-24 flex items-center justify-center mb-4 bg-white rounded-lg border border-slate-100 overflow-hidden">
                    <div className="w-full h-full relative p-1.5">
                      <img 
                        src={logoUrl} 
                        alt="Your logo" 
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                  </div>
                  <motion.button
                    onClick={handleRemoveLogo}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    <span>Remove Logo</span>
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-slate-700 font-medium mb-2">Upload your company logo</p>
                  <p className="text-slate-500 text-sm mb-4 text-center">
                    Your logo will appear on all shared vision boards
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    <motion.div 
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          <span>Select Logo</span>
                        </>
                      )}
                    </motion.div>
                  </label>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Check size={16} className="text-emerald-500 mt-0.5" />
                  <p className="text-emerald-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">i</span>
                </div>
                <div>
                  <p className="text-blue-800 text-sm font-medium mb-1">About White Labeling</p>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Your logo will replace the MDI branding on all shared vision boards. 
                    For best results, upload a transparent PNG logo with dimensions of 
                    approximately 300×150 pixels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WhiteLabelSettings;