import { supabase } from '../lib/supabase';

export const companyService = {
  // Get company settings for current user
  async getCompanySettings() {
    try {
      const { data, error } = await supabase?.from('company_settings')?.select('*')?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update company settings
  async updateCompanySettings(updates) {
    try {
      const { data, error } = await supabase?.from('company_settings')?.upsert({
          company_name: updates?.companyName,
          company_email: updates?.companyEmail,
          company_phone: updates?.companyPhone,
          company_address: updates?.companyAddress,
          company_logo_url: updates?.companyLogoUrl,
          tax_number: updates?.taxNumber,
          currency: updates?.currency,
          invoice_prefix: updates?.invoicePrefix,
          default_payment_terms: updates?.defaultPaymentTerms,
          default_tax_rate: updates?.defaultTaxRate,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get next invoice number
  async getNextInvoiceNumber() {
    try {
      const { data, error } = await supabase?.rpc('generate_invoice_number', { 
          company_user_id: (await supabase?.auth?.getUser())?.data?.user?.id 
        });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Upload company logo
  async uploadCompanyLogo(file) {
    try {
      const user = (await supabase?.auth?.getUser())?.data?.user;
      if (!user) {
        return { data: null, error: { message: 'User not authenticated' } };
      }

      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${user?.id}/logo.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase?.storage?.from('company-logos')?.upload(fileName, file, { upsert: true });

      if (uploadError) {
        return { data: null, error: uploadError };
      }

      // Get public URL
      const { data: urlData } = supabase?.storage?.from('company-logos')?.getPublicUrl(fileName);

      // Update company settings with logo URL
      const { data, error } = await supabase?.from('company_settings')?.upsert({
          company_logo_url: urlData?.publicUrl,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      return { data: { ...data, logoUrl: urlData?.publicUrl }, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete company logo
  async deleteCompanyLogo() {
    try {
      const user = (await supabase?.auth?.getUser())?.data?.user;
      if (!user) {
        return { error: { message: 'User not authenticated' } };
      }

      // Remove from storage (try common extensions)
      const extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg'];
      for (const ext of extensions) {
        await supabase?.storage?.from('company-logos')?.remove([`${user?.id}/logo.${ext}`]);
      }

      // Update company settings to remove logo URL
      const { data, error } = await supabase?.from('company_settings')?.upsert({
          company_logo_url: null,
          updated_at: new Date()?.toISOString()
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { error };
    }
  }
};