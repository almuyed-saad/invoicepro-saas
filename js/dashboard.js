// ============================================
// DASHBOARD — RENDER INVOICES AND STATS
// ============================================

// ===== LOAD DASHBOARD DATA =====
async function loadDashboard() {
  try {
    // Show loading state
    document.getElementById('invoiceList').innerHTML = `
      <div class="loading" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        ⏳ Loading your invoices...
      </div>
    `;
    
    // Get invoices and stats
    const invoices = await getInvoices();
    const stats = await getInvoiceStats();
    
    // Update stats
    updateStats(stats);
    
    // Render invoice list
    renderInvoiceList(invoices);
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById('invoiceList').innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--danger);">
        ❌ Failed to load invoices. Please refresh the page.
      </div>
    `;
  }
}

// ===== SEND INVOICE =====
async function sendInvoice(id) {
  // Get invoice data
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    showToast('Invoice not found', 'error');
    return;
  }
  
  // Use stored client email, or ask if not available
  let email = invoice.client_email;
  
  if (!email) {
    email = prompt('Enter client email address:');
    if (!email) {
      showToast('Email sending cancelled', 'warning');
      return;
    }
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  // Generate the invoice link
  const previewUrl = window.location.origin + '/invoice-preview.html?id=' + id;
  
  // Construct email content
  const subject = encodeURIComponent(`Invoice #${generateInvoiceNumber(id)} from InvoicePro`);
  const body = encodeURIComponent(
    `Hi ${invoice.client_name},\n\n` +
    `Please find your invoice here:\n\n` +
    `${previewUrl}\n\n` +
    `Amount Due: ${formatCurrency(invoice.total)}\n\n` +
    `If you have any questions, feel free to reply.\n\n` +
    `Thanks,\nInvoicePro`
  );
  
  // Open email client
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  
  // Update invoice status to 'sent' if it was 'draft'
  if (invoice.status === 'draft') {
    await updateInvoiceStatus(id, 'sent');
  }
  
  showToast(`📧 Invoice sent to ${email}`, 'success');
}

// ===== UPDATE STATS =====
function updateStats(stats) {
  document.getElementById('statTotal').textContent = stats.total || 0;
  document.getElementById('statSent').textContent = stats.sent || 0;
  document.getElementById('statPaid').textContent = stats.paid || 0;
  document.getElementById('statRevenue').textContent = formatCurrency(stats.revenue || 0);
}

// ===== RENDER INVOICE LIST =====
function renderInvoiceList(invoices) {
  const container = document.getElementById('invoiceList');
  
  if (!invoices || invoices.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No invoices yet</h3>
        <p>Create your first invoice and start tracking your work.</p>
        <button class="btn btn-primary" onclick="window.location.href='/new-invoice.html'">
          + Create Your First Invoice
        </button>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  invoices.forEach((invoice, index) => {
    const statusColors = {
      draft: 'draft',
      sent: 'sent',
      paid: 'paid'
    };
    
    html += `
      <div class="invoice-item" style="animation: slideIn 0.3s ease ${index * 0.05}s both;">
        <span class="invoice-number">${generateInvoiceNumber(invoice.id)}</span>
        <span class="invoice-client">${escapeHtml(invoice.client_name)}</span>
        <span class="invoice-amount">${formatCurrency(invoice.total)}</span>
        <span class="status-badge ${statusColors[invoice.status] || 'draft'}">${invoice.status || 'draft'}</span>
        <div class="invoice-actions">
        
          <button onclick="viewInvoice(${invoice.id})" title="View PDF">📄</button>
          <button onclick="editInvoice(${invoice.id})" title="Edit">✏️</button>
          <button onclick="confirmDeleteInvoice(${invoice.id})" title="Delete" class="delete-btn">🗑️</button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ===== VIEW INVOICE (Preview) =====
function viewInvoice(id) {
  window.location.href = `/invoice-preview.html?id=${id}`;
}

// ===== EDIT INVOICE =====
function editInvoice(id) {
  window.location.href = `/edit-invoice.html?id=${id}`;
}

// ===== CONFIRM DELETE =====
function confirmDeleteInvoice(id) {
  const invoiceNumber = generateInvoiceNumber(id);
  if (confirm(`Are you sure you want to delete ${invoiceNumber}? This action cannot be undone.`)) {
    deleteInvoice(id).then(success => {
      if (success) {
        loadDashboard(); // Refresh the dashboard
      }
    });
  }
}

// ===== ESCAPE HTML =====
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.loadDashboard = loadDashboard;
window.viewInvoice = viewInvoice;
window.editInvoice = editInvoice;
window.confirmDeleteInvoice = confirmDeleteInvoice;

console.log('✅ Dashboard module loaded!');

// ===== SEND INVOICE =====
function sendInvoice(id) {
  const email = prompt('Enter client email address:');
  
  if (!email) {
    showToast('Email sending cancelled', 'warning');
    return;
  }
  
  if (!isValidEmail(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }
  
  // Generate the invoice link
  const previewUrl = window.location.origin + '/invoice-preview.html?id=' + id;
  
  // Construct email content
  const subject = encodeURIComponent('Invoice from InvoicePro');
  const body = encodeURIComponent(
    `Hi,\n\nPlease find your invoice here:\n\n${previewUrl}\n\n` +
    `If you have any questions, feel free to reply.\n\n` +
    `Thanks,\n${document.querySelector('.navbar-brand')?.textContent || 'InvoicePro'}`
  );
  
  // Open email client
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  
  // Update invoice status to 'sent' if it was 'draft'
  getInvoiceById(id).then(invoice => {
    if (invoice && invoice.status === 'draft') {
      updateInvoiceStatus(id, 'sent');
    }
  });
  
  showToast(`📧 Opening email for ${email}`, 'success');
}

// ===== MAKE SEND FUNCTION GLOBALLY AVAILABLE =====
window.sendInvoice = sendInvoice;