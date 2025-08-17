import { supabase } from '../lib/supabase';

export const invoiceService = {
  // Get all invoices for current user
  async getInvoices(filters = {}) {
    try {
      let query = supabase?.from('invoices')?.select(`
          *,
          client:clients(id, name, company, email),
          invoice_line_items(id, description, quantity, unit_price, line_total),
          payments(id, amount, payment_date, method)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters?.status !== 'all') {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.search) {
        query = query?.or(`invoice_number.ilike.%${filters?.search}%,title.ilike.%${filters?.search}%`);
      }

      if (filters?.dateRange) {
        query = query?.gte('issue_date', filters?.dateRange?.start)?.lte('issue_date', filters?.dateRange?.end);
      }

      const { data, error } = await query;

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get invoice by ID
  async getInvoiceById(invoiceId) {
    try {
      const { data, error } = await supabase?.from('invoices')?.select(`
          *,
          client:clients(*),
          invoice_line_items(*),
          payments(*)
        `)?.eq('id', invoiceId)?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new invoice
  async createInvoice(invoiceData) {
    try {
      // Generate invoice number
      const { data: numberData, error: numberError } = await supabase?.rpc('generate_invoice_number', { 
          company_user_id: (await supabase?.auth?.getUser())?.data?.user?.id 
        });

      if (numberError) {
        return { data: null, error: numberError };
      }

      const { data: invoice, error: invoiceError } = await supabase?.from('invoices')?.insert({
          client_id: invoiceData?.clientId,
          invoice_number: numberData,
          title: invoiceData?.title,
          status: invoiceData?.status || 'draft',
          issue_date: invoiceData?.issueDate || new Date()?.toISOString()?.split('T')?.[0],
          due_date: invoiceData?.dueDate,
          tax_rate: invoiceData?.taxRate || 0,
          discount_amount: invoiceData?.discountAmount || 0,
          currency: invoiceData?.currency || 'USD',
          notes: invoiceData?.notes,
          terms: invoiceData?.terms
        })?.select()?.single();

      if (invoiceError) {
        return { data: null, error: invoiceError };
      }

      // Create line items if provided
      if (invoiceData?.lineItems?.length > 0) {
        const { error: lineItemsError } = await supabase?.from('invoice_line_items')?.insert(
            invoiceData?.lineItems?.map((item, index) => ({
              invoice_id: invoice?.id,
              description: item?.description,
              quantity: item?.quantity || 1,
              unit_price: item?.unitPrice || 0,
              sort_order: index + 1
            }))
          );

        if (lineItemsError) {
          return { data: null, error: lineItemsError };
        }
      }

      return { data: invoice, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update invoice
  async updateInvoice(invoiceId, updates) {
    try {
      const { data, error } = await supabase?.from('invoices')?.update({
          client_id: updates?.clientId,
          title: updates?.title,
          status: updates?.status,
          issue_date: updates?.issueDate,
          due_date: updates?.dueDate,
          tax_rate: updates?.taxRate,
          discount_amount: updates?.discountAmount,
          notes: updates?.notes,
          terms: updates?.terms,
          updated_at: new Date()?.toISOString()
        })?.eq('id', invoiceId)?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete invoice
  async deleteInvoice(invoiceId) {
    try {
      const { error } = await supabase?.from('invoices')?.delete()?.eq('id', invoiceId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Add line item to invoice
  async addLineItem(invoiceId, lineItem) {
    try {
      const { data, error } = await supabase?.from('invoice_line_items')?.insert({
          invoice_id: invoiceId,
          description: lineItem?.description,
          quantity: lineItem?.quantity || 1,
          unit_price: lineItem?.unitPrice || 0,
          sort_order: lineItem?.sortOrder || 0
        })?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update line item
  async updateLineItem(lineItemId, updates) {
    try {
      const { data, error } = await supabase?.from('invoice_line_items')?.update({
          description: updates?.description,
          quantity: updates?.quantity,
          unit_price: updates?.unitPrice,
          sort_order: updates?.sortOrder
        })?.eq('id', lineItemId)?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Delete line item
  async deleteLineItem(lineItemId) {
    try {
      const { error } = await supabase?.from('invoice_line_items')?.delete()?.eq('id', lineItemId);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Mark invoice as sent
  async markAsSent(invoiceId) {
    try {
      const { data, error } = await supabase?.from('invoices')?.update({
          status: 'sent',
          sent_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })?.eq('id', invoiceId)?.select()?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark invoice as paid
  async markAsPaid(invoiceId, paymentData = {}) {
    try {
      // Update invoice status
      const { data: invoice, error: invoiceError } = await supabase?.from('invoices')?.update({
          status: 'paid',
          paid_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })?.eq('id', invoiceId)?.select()?.single();

      if (invoiceError) {
        return { data: null, error: invoiceError };
      }

      // Add payment record if payment amount is provided
      if (paymentData?.amount) {
        const { error: paymentError } = await supabase?.from('payments')?.insert({
            invoice_id: invoiceId,
            amount: paymentData?.amount,
            method: paymentData?.method || 'other',
            payment_date: paymentData?.paymentDate || new Date()?.toISOString()?.split('T')?.[0],
            reference_number: paymentData?.referenceNumber,
            notes: paymentData?.notes
          });

        if (paymentError) {
          return { data: null, error: paymentError };
        }
      }

      return { data: invoice, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get invoice statistics
  async getInvoiceStats() {
    try {
      const { data: invoices, error } = await supabase?.from('invoices')?.select('id, status, total_amount, balance_due, due_date');

      if (error) {
        return { 
          data: {
            totalInvoices: 0,
            totalRevenue: 0,
            outstandingBalance: 0,
            overdueAmount: 0,
            paidInvoices: 0
          }, 
          error 
        };
      }

      const totalInvoices = invoices?.length || 0;
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (parseFloat(inv?.total_amount) || 0), 0) || 0;
      const outstandingBalance = invoices?.reduce((sum, inv) => sum + (parseFloat(inv?.balance_due) || 0), 0) || 0;
      
      const paidInvoices = invoices?.filter(inv => inv?.status === 'paid')?.length || 0;
      
      const overdueAmount = invoices?.filter(inv => {
        return inv?.status !== 'paid' && new Date(inv?.due_date) < new Date();
      })?.reduce((sum, inv) => sum + (parseFloat(inv?.balance_due) || 0), 0) || 0;

      const stats = {
        totalInvoices,
        totalRevenue,
        outstandingBalance,
        overdueAmount,
        paidInvoices
      };

      return { data: stats, error: null };
    } catch (error) {
      return { 
        data: {
          totalInvoices: 0,
          totalRevenue: 0,
          outstandingBalance: 0,
          overdueAmount: 0,
          paidInvoices: 0
        }, 
        error 
      };
    }
  },

  // Get recent invoices
  async getRecentInvoices(limit = 5) {
    try {
      const { data, error } = await supabase?.from('invoices')?.select(`
          *,
          client:clients(name, company, email)
        `)?.order('created_at', { ascending: false })?.limit(limit);

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }
};