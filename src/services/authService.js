import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName || '',
            company_name: userData?.companyName || '',
            role: userData?.role || 'user'
          }
        }
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out current user
  async signOut() {
    try {
      const { error } = await supabase?.auth?.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase?.auth?.getSession();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get current user
  async getUser() {
    try {
      const { data, error } = await supabase?.auth?.getUser();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email, {
        redirectTo: `${window.location?.origin}/reset-password`
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase?.auth?.updateUser({
        password: newPassword
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};