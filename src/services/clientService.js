import { supabase } from '../lib/supabase';

export const clientService = {
  // Get all clients for current user
  async getClients(filters = {}) {
    try {
      let query = supabase?.from('clients')?.select(`
          *,
          invoices(id, total_amount, balance_due, status)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.search) {
        query = query?.or(`name.ilike.%${filters?.search}%,company.ilike.%${filters?.search}%,email.ilike.%${filters?.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error };
      }

      // Calculate client statistics
      const enrichedData = data?.map(client => {
        const clientInvoices = client?.invoices || [];
        const totalInvoices = clientInvoices?.length || 0;
        const totalRevenue = clientInvoices?.reduce((sum, inv) => sum + (parseFloat(inv?.total_amount) || 0), 0) || 0;
        const outstandingBalance = clientInvoices?.reduce((sum, inv) => sum + (parseFloat(inv?.balance_due) || 0), 0) || 0;
        
        // Determine payment status
        let paymentStatus = 'excellent';
        if (outstandingBalance > 5000) {
          paymentStatus = 'poor';
        } else if (outstandingBalance > 1000) {
          paymentStatus = 'warning';
        } else if (outstandingBalance > 0) {
          paymentStatus = 'good';
        }

        // Get last invoice date
        const lastInvoiceDate = clientInvoices?.length > 0 
          ? new Date(Math.max(...clientInvoices.map(inv => new Date(inv.created_at))))?.toISOString()?.split('T')?.[0]
          : null;

        return {
          ...client,
          totalInvoices,
          totalRevenue,
          outstandingBalance,
          paymentStatus,
          lastInvoiceDate
        };
      }) || [];

      return { data: enrichedData, error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get client by ID
  async getClientById(clientId) {
    try {
      const { data, error } = await supabase?.from('clients')?.select(`
          *,
          invoices(
            id, invoice_number, title, status, 
            total_amount, balance_due, issue_date, 
            due_date, created_at
          )
        `)?.eq('id', clientId)?.single();

      if (error) {
        return { data: null, error };
      }

      // Calculate client statistics
      const clientInvoices = data?.invoices || [];
      const totalInvoices = clientInvoices?.length || 0;
      const totalRevenue = clientInvoices?.reduce((sum, inv) => sum + (parseFloat(inv?.total_amount) || 0), 0) || 0;
      const outstandingBalance = clientInvoices?.reduce((sum, inv) => sum + (parseFloat(inv?.balance_due) || 0), 0) || 0;

      const enrichedData = {
        ...data,
        totalInvoices,
        totalRevenue,
        outstandingBalance
      };

      return { data: enrichedData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new client
  async createClient(clientData) {
    try {
      const { data, error } = await supabase?.from('clients')?.insert({
          name: clientData?.name,
          company: clientData?.company,
          email: clientData?.email,
          phone: clientData?.phone,
          address: clientData?.address,
          payment_terms: clientData?.paymentTerms || 30,
          credit_limit: clientData?.creditLimit || 0,
          notes: clientData?.notes,
          tags: clientData?.tags || []
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update client
  async updateClient(clientId, updates) {
    try {
      const { data, error } = await supabase?.from('clients')?.update({
          name: updates?.name,
          company: updates?.company,
          email: updates?.email,
          phone: updates?.phone,
          address: updates?.address,
          payment_terms: updates?.paymentTerms,
          credit_limit: updates?.creditLimit,
          notes: updates?.notes,
          tags: updates?.tags,
          status: updates?.status,
          updated_at: new Date()?.toISOString()
        })?.eq('id', clientId)?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete client
  async deleteClient(clientId) {
    try {
      const { error } = await supabase?.from('clients')?.delete()?.eq('id', clientId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get client statistics
  async getClientStats() {
    try {
      const { data: clients, error: clientsError } = await supabase?.from('clients')?.select('id, status, created_at');

      const { data: invoices, error: invoicesError } = await supabase?.from('invoices')?.select('client_id, total_amount, balance_due');

      if (clientsError || invoicesError) {
        return { 
          data: {
            totalClients: 0,
            activeClients: 0,
            totalOutstanding: 0,
            totalRevenue: 0
          }, 
          error: clientsError || invoicesError 
        };
      }

      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter(client => {
        const clientInvoices = invoices?.filter(inv => inv?.client_id === client?.id) || [];
        const hasRecentActivity = clientInvoices?.length > 0;
        return client?.status === 'active' && hasRecentActivity;
      })?.length || 0;

      const totalOutstanding = invoices?.reduce((sum, inv) => sum + (parseFloat(inv?.balance_due) || 0), 0) || 0;
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (parseFloat(inv?.total_amount) || 0), 0) || 0;

      const stats = {
        totalClients,
        activeClients,
        totalOutstanding,
        totalRevenue
      };

      return { data: stats, error: null };
    } catch (error) {
      return { 
        data: {
          totalClients: 0,
          activeClients: 0,
          totalOutstanding: 0,
          totalRevenue: 0
        }, 
        error 
      };
    }
  }
};