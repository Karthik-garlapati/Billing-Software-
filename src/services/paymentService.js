import { supabase } from '../lib/supabase';

export const paymentService = {
  // Get all payments for current user
  async getPayments(filters = {}) {
    try {
      let query = supabase?.from('payments')?.select(`
          *,
          invoice:invoices(
            id, invoice_number, total_amount,
            client:clients(name, company)
          )
        `)?.order('payment_date', { ascending: false });

      // Apply filters
      if (filters?.invoiceId) {
        query = query?.eq('invoice_id', filters?.invoiceId);
      }

      if (filters?.method && filters?.method !== 'all') {
        query = query?.eq('method', filters?.method);
      }

      if (filters?.dateRange) {
        query = query?.gte('payment_date', filters?.dateRange?.start)?.lte('payment_date', filters?.dateRange?.end);
      }

      const { data, error } = await query;

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const { data, error } = await supabase?.from('payments')?.select(`
          *,
          invoice:invoices(
            id, invoice_number, total_amount, balance_due,
            client:clients(name, company, email)
          )
        `)?.eq('id', paymentId)?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new payment
  async createPayment(paymentData) {
    try {
      const { data, error } = await supabase?.from('payments')?.insert({
          invoice_id: paymentData?.invoiceId,
          amount: paymentData?.amount,
          method: paymentData?.method || 'cash',
          payment_date: paymentData?.paymentDate || new Date()?.toISOString()?.split('T')?.[0],
          reference_number: paymentData?.referenceNumber,
          notes: paymentData?.notes
        })?.select(`
          *,
          invoice:invoices(
            id, invoice_number, total_amount,
            client:clients(name, company)
          )
        `)?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update payment
  async updatePayment(paymentId, updates) {
    try {
      const { data, error } = await supabase?.from('payments')?.update({
          amount: updates?.amount,
          method: updates?.method,
          payment_date: updates?.paymentDate,
          reference_number: updates?.referenceNumber,
          notes: updates?.notes
        })?.eq('id', paymentId)?.select(`
          *,
          invoice:invoices(
            id, invoice_number, total_amount,
            client:clients(name, company)
          )
        `)?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete payment
  async deletePayment(paymentId) {
    try {
      const { error } = await supabase?.from('payments')?.delete()?.eq('id', paymentId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get payment statistics
  async getPaymentStats(dateRange = null) {
    try {
      let query = supabase?.from('payments')?.select('id, amount, payment_date, method');

      if (dateRange) {
        query = query?.gte('payment_date', dateRange?.start)?.lte('payment_date', dateRange?.end);
      }

      const { data: payments, error } = await query;

      if (error) {
        return { 
          data: {
            totalPayments: 0,
            totalAmount: 0,
            methodBreakdown: {},
            monthlyTrend: []
          }, 
          error 
        };
      }

      const totalPayments = payments?.length || 0;
      const totalAmount = payments?.reduce((sum, payment) => sum + (parseFloat(payment?.amount) || 0), 0) || 0;

      // Method breakdown
      const methodBreakdown = payments?.reduce((breakdown, payment) => {
        const method = payment?.method || 'other';
        breakdown[method] = (breakdown?.[method] || 0) + (parseFloat(payment?.amount) || 0);
        return breakdown;
      }, {}) || {};

      // Monthly trend (last 6 months)
      const monthlyTrend = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = date?.toISOString()?.split('T')?.[0];
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)?.toISOString()?.split('T')?.[0];
        
        const monthPayments = payments?.filter(p => 
          p?.payment_date >= monthStart && p?.payment_date <= monthEnd
        ) || [];
        
        const monthTotal = monthPayments?.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0) || 0;
        
        monthlyTrend?.push({
          month: date?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          amount: monthTotal,
          count: monthPayments?.length || 0
        });
      }

      const stats = {
        totalPayments,
        totalAmount,
        methodBreakdown,
        monthlyTrend
      };

      return { data: stats, error: null };
    } catch (error) {
      return { 
        data: {
          totalPayments: 0,
          totalAmount: 0,
          methodBreakdown: {},
          monthlyTrend: []
        }, 
        error 
      };
    }
  },

  // Get payments for specific invoice
  async getInvoicePayments(invoiceId) {
    try {
      const { data, error } = await supabase?.from('payments')?.select('*')?.eq('invoice_id', invoiceId)?.order('payment_date', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }
};