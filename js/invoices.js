// ============================================
// INVOICE CRUD OPERATIONS
// ============================================

// ===== 1. GET ALL INVOICES FOR CURRENT USER =====
async function getInvoices() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.warn('No user logged in');
      return [];
    }
    
    const { data, error } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    showToast('Failed to load invoices', 'error');
    return [];
  }
}

// ===== 2. GET A SINGLE INVOICE BY ID =====
async function getInvoiceById(id) {
  try {
    const { data, error } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    showToast('Invoice not found', 'error');
    return null;
  }
}

// ===== 3. CREATE A NEW INVOICE =====
async function createInvoice(invoiceData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      showToast('Please log in to create invoices', 'error');
      return null;
    }
    
    // Calculate total
    const total = invoiceData.hours * invoiceData.rate;
    
    const { data, error } = await supabaseClient
      .from('invoices')
      .insert([{
        user_id: user.id,
        client_name: invoiceData.client_name,
        client_email: invoiceData.client_email,
        project: invoiceData.project,
        hours: invoiceData.hours,
        rate: invoiceData.rate,
        total: total,
        status: 'draft'
      }])
      .select();
    
    if (error) throw error;
    
    showToast('Invoice created successfully!', 'success');
    return data[0];
  } catch (error) {
    console.error('Error creating invoice:', error);
    showToast('Failed to create invoice', 'error');
    return null;
  }
}

// ===== 4. UPDATE AN INVOICE =====
async function updateInvoice(id, invoiceData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      showToast('Please log in to update invoices', 'error');
      return null;
    }
    
    // Calculate total
    const total = invoiceData.hours * invoiceData.rate;
    
    const { data, error } = await supabaseClient
      .from('invoices')
      .update({
        client_name: invoiceData.client_name,
        client_email: invoiceData.client_email,
        project: invoiceData.project,
        hours: invoiceData.hours,
        rate: invoiceData.rate,
        total: total,
        status: invoiceData.status || 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)  // Extra safety: only update if owned by user
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      showToast('Invoice not found or you do not have permission', 'error');
      return null;
    }
    
    showToast('Invoice updated successfully!', 'success');
    return data[0];
  } catch (error) {
    console.error('Error updating invoice:', error);
    showToast('Failed to update invoice', 'error');
    return null;
  }
}

// ===== 5. DELETE AN INVOICE =====
async function deleteInvoice(id) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      showToast('Please log in to delete invoices', 'error');
      return false;
    }
    
    const { error } = await supabaseClient
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);  // Extra safety: only delete if owned by user
    
    if (error) throw error;
    
    showToast('Invoice deleted successfully!', 'success');
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    showToast('Failed to delete invoice', 'error');
    return false;
  }
}

// ===== 6. UPDATE INVOICE STATUS =====
async function updateInvoiceStatus(id, status) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      showToast('Please log in to update invoices', 'error');
      return null;
    }
    
    const { data, error } = await supabaseClient
      .from('invoices')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    
    if (error) throw error;
    
    showToast(`Invoice marked as ${status}`, 'success');
    return data[0];
  } catch (error) {
    console.error('Error updating invoice status:', error);
    showToast('Failed to update status', 'error');
    return null;
  }
}

// ===== 7. GET INVOICE STATS =====
async function getInvoiceStats() {
  try {
    const invoices = await getInvoices();
    
    const total = invoices.length;
    const draft = invoices.filter(i => i.status === 'draft').length;
    const sent = invoices.filter(i => i.status === 'sent').length;
    const paid = invoices.filter(i => i.status === 'paid').length;
    
    // Calculate total revenue (only paid invoices)
    const revenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0);
    
    return {
      total,
      draft,
      sent,
      paid,
      revenue
    };
  } catch (error) {
    console.error('Error getting invoice stats:', error);
    return {
      total: 0,
      draft: 0,
      sent: 0,
      paid: 0,
      revenue: 0
    };
  }
}

// ===== 8. MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.getInvoices = getInvoices;
window.getInvoiceById = getInvoiceById;
window.createInvoice = createInvoice;
window.updateInvoice = updateInvoice;
window.deleteInvoice = deleteInvoice;
window.updateInvoiceStatus = updateInvoiceStatus;
window.getInvoiceStats = getInvoiceStats;

console.log('✅ Invoices module loaded!');