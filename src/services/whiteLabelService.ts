import { supabase } from '../lib/supabase';
import { WhiteLabelSettings } from '../types/visionboard';

export class WhiteLabelService {
  // Get white label settings for the current user
  static async getWhiteLabelSettings(): Promise<WhiteLabelSettings | null> {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('white_label_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching white label settings:', error);
        throw new Error(`Failed to fetch white label settings: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      return {
        logoUrl: data.logo_url,
        brandName: data.brand_name,
        primaryColor: data.primary_color
      };
    } catch (error: any) {
      console.error('Error in getWhiteLabelSettings:', error);
      throw new Error(error.message || 'Failed to fetch white label settings');
    }
  }

  // Upload a logo for white labeling
  static async uploadLogo(file: File): Promise<string> {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        throw new Error('User not authenticated');
      }

      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image.');
      }

      // Check file size (limit to 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('File too large. Please upload an image smaller than 2MB.');
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${session.user.id}-logo-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('white-label-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        throw new Error(`Failed to upload logo: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('white-label-logos')
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL for uploaded logo');
      }

      // Save or update white label settings
      const { data: existingSettings } = await supabase
        .from('white_label_settings')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('white_label_settings')
          .update({
            logo_url: urlData.publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id);

        if (updateError) {
          console.error('Error updating white label settings:', updateError);
          throw new Error(`Failed to update white label settings: ${updateError.message}`);
        }
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from('white_label_settings')
          .insert({
            user_id: session.user.id,
            logo_url: urlData.publicUrl
          });

        if (insertError) {
          console.error('Error creating white label settings:', insertError);
          throw new Error(`Failed to create white label settings: ${insertError.message}`);
        }
      }

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error in uploadLogo:', error);
      throw new Error(error.message || 'Failed to upload logo');
    }
  }

  // Remove the logo
  static async removeLogo(): Promise<void> {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session?.user) {
        throw new Error('User not authenticated');
      }

      // Get current settings to find the logo filename
      const { data: settings, error: settingsError } = await supabase
        .from('white_label_settings')
        .select('logo_url')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (settingsError) {
        console.error('Error fetching white label settings:', settingsError);
        throw new Error(`Failed to fetch white label settings: ${settingsError.message}`);
      }

      if (settings?.logo_url) {
        // Extract filename from URL
        const urlParts = settings.logo_url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Delete from storage
        const { error: deleteError } = await supabase.storage
          .from('white-label-logos')
          .remove([fileName]);

        if (deleteError) {
          console.warn('Error deleting logo from storage:', deleteError);
          // Continue even if storage deletion fails
        }
      }

      // Update settings to remove logo URL
      const { error: updateError } = await supabase
        .from('white_label_settings')
        .update({
          logo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id);

      if (updateError) {
        console.error('Error updating white label settings:', updateError);
        throw new Error(`Failed to update white label settings: ${updateError.message}`);
      }
    } catch (error: any) {
      console.error('Error in removeLogo:', error);
      throw new Error(error.message || 'Failed to remove logo');
    }
  }

  // Get white label settings for a specific user (for shared boards)
  static async getWhiteLabelSettingsForUser(userId: string): Promise<WhiteLabelSettings | null> {
    try {
      const { data, error } = await supabase
        .from('white_label_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching white label settings for user:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        logoUrl: data.logo_url,
        brandName: data.brand_name,
        primaryColor: data.primary_color
      };
    } catch (error) {
      console.error('Error in getWhiteLabelSettingsForUser:', error);
      return null;
    }
  }
}