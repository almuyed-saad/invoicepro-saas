// ============================================
// PREVIEW — RENDER INVOICE
// ============================================

// Use the existing supabaseKey from supabase-client.js
// DO NOT redeclare it here — it's already available globally

let currentInvoice = null;
let currentInvoiceId = null;

// ===== LOAD INVOICE PREVIEW =====
async function loadInvoicePreview() {
  const params = new URLSearchParams(window.location.search);
  const invoiceId = params.get('id');
  
  if (!invoiceId) {
    showToast('No invoice ID provided', 'error');
    window.location.href = '/dashboard.html';
    return;
  }
  
  currentInvoiceId = parseInt(invoiceId);
  
  try {
    const invoice = await getInvoiceById(currentInvoiceId);
    
    if (!invoice) {
      showToast('Invoice not found', 'error');
      window.location.href = '/dashboard.html';
      return;
    }
    
    currentInvoice = invoice;
    renderInvoice(invoice);
    
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('invoiceContainer').style.display = 'block';
    
  } catch (error) {
    console.error('Error loading invoice:', error);
    showToast('Failed to load invoice', 'error');
    window.location.href = '/dashboard.html';
  }
}

// ===== RENDER INVOICE =====
function renderInvoice(invoice) {
  const container = document.getElementById('invoiceContent');
  
  const invoiceNumber = generateInvoiceNumber(invoice.id);
  const date = formatDate(invoice.created_at);
  const total = formatCurrency(invoice.total);
  
  container.innerHTML = `
    <div class="invoice-header">
      <div>
        <div class="invoice-title">INVOICE</div>
        <div style="color: var(--text-secondary); font-size: 0.9rem;">${invoiceNumber}</div>
      </div>
      <div class="invoice-meta">
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Status:</strong> <span class="status-badge ${invoice.status}">${invoice.status || 'draft'}</span></p>
      </div>
    </div>
    
    <div class="invoice-client-section">
      <h4>Bill To:</h4>
      <p><strong>${escapeHtml(invoice.client_name)}</strong></p>
      <p>${escapeHtml(invoice.project || 'No project specified')}</p>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Hours</th>
          <th style="text-align: center;">Rate</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHtml(invoice.project || 'Professional Services')}</td>
          <td style="text-align: center;">${invoice.hours}</td>
          <td style="text-align: center;">${formatCurrency(invoice.rate)}</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrency(invoice.total)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" style="text-align: right; font-weight: 700;">Total Due</td>
          <td style="text-align: right; font-weight: 700; font-size: 1.2rem;">${total}</td>
        </tr>
      </tbody>
    </table>
    
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid var(--border-color);">
      <p style="font-size: 0.85rem; color: var(--text-secondary);">
        <strong>Payment Instructions:</strong><br />
        Bank Transfer: 123-456-789<br />
        Reference: ${invoiceNumber}
      </p>
    </div>
  `;
}

// ===== DOWNLOAD PDF =====
function downloadPDF() {
  if (!currentInvoice) {
    showToast('No invoice to download', 'error');
    return;
  }
  window.print();
}

// ===== MARK INVOICE AS SENT =====
async function markAsSent() {
  if (!currentInvoice) {
    showToast('No invoice to update', 'error');
    return;
  }
  
  if (currentInvoice.status === 'sent') {
    showToast('Invoice is already marked as Sent', 'warning');
    return;
  }
  
  if (currentInvoice.status === 'paid') {
    showToast('Invoice is already paid', 'warning');
    return;
  }
  
  try {
    const result = await updateInvoiceStatus(currentInvoice.id, 'sent');
    if (result) {
      currentInvoice = result;
      renderInvoice(currentInvoice);
      showToast('✅ Invoice marked as Sent!', 'success');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Failed to update status', 'error');
  }
}

// ===== SEND INVOICE =====
async function sendInvoice() {
  if (!currentInvoice) {
    showToast('No invoice to send', 'error');
    return;
  }
  
  if (!currentInvoice.client_email) {
    showToast('No client email found. Please add email in invoice.', 'warning');
    return;
  }
  
  const sendBtn = document.querySelector('.btn-primary');
  const originalText = sendBtn.textContent;
  sendBtn.textContent = '⏳ Sending...';
  sendBtn.disabled = true;
  
  try {
    const invoiceNumber = generateInvoiceNumber(currentInvoice.id);
    const date = formatDate(currentInvoice.created_at);
    const total = formatCurrency(currentInvoice.total);
    
    const subject = encodeURIComponent(`Invoice #${invoiceNumber} from InvoicePro`);
    const body = encodeURIComponent(
      `Dear ${currentInvoice.client_name},\n\n` +
      `Please find your invoice details below:\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `INVOICE #${invoiceNumber}\n` +
      `Date: ${date}\n` +
      `Project: ${currentInvoice.project || 'Professional Services'}\n` +
      `Hours: ${currentInvoice.hours} hrs @ ${formatCurrency(currentInvoice.rate)}/hr\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `TOTAL DUE: ${total}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Payment Instructions:\n` +
      `Bank Transfer: 123-456-789\n` +
      `Reference: ${invoiceNumber}\n\n` +
      `Thank you for your business!\n` +
      `InvoicePro Team`
    );
    
    window.open(`mailto:${currentInvoice.client_email}?subject=${subject}&body=${body}`, '_blank');
    
    if (currentInvoice.status === 'draft') {
      const updated = await updateInvoiceStatus(currentInvoice.id, 'sent');
      if (updated) {
        currentInvoice = updated;
        renderInvoice(currentInvoice);
      }
    }
    
    showToast(`📧 Email opened for ${currentInvoice.client_email}`, 'success');
    
  } catch (error) {
    console.error('Send error:', error);
    showToast('Failed to prepare invoice. Please try again.', 'error');
  } finally {
    sendBtn.textContent = originalText;
    sendBtn.disabled = false;
  }
}

// ===== ESCAPE HTML =====
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== PRINT INVOICE =====
function printInvoice() {
  if (!currentInvoice) {
    showToast('No invoice to print', 'error');
    return;
  }
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  const invoiceNumber = generateInvoiceNumber(currentInvoice.id);
  const date = formatDate(currentInvoice.created_at);
  const total = formatCurrency(currentInvoice.total);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; background: white; }
        .invoice-container { max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; background: white; }
        .invoice-header { display: flex; justify-content: space-between; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
        .invoice-header h1 { font-size: 28px; color: #4F46E5; margin: 0; }
        .invoice-header .number { text-align: right; font-size: 14px; color: #64748b; }
        .invoice-header .number .num { font-size: 20px; font-weight: 700; color: #1a1a2e; }
        .client-section { margin-bottom: 30px; }
        .client-section .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .client-section .name { font-size: 18px; font-weight: 600; margin-top: 4px; }
        .client-section .project { color: #64748b; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { text-align: left; padding: 12px; background: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        td:last-child { text-align: right; font-weight: 600; }
        td:nth-child(2), td:nth-child(3) { text-align: center; }
        .total-row td { border-top: 2px solid #4F46E5; padding-top: 16px; font-size: 18px; font-weight: 700; color: #4F46E5; }
        .total-row td:last-child { font-size: 20px; }
        .payment-section { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        .payment-section .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
        .payment-section p { margin-top: 4px; color: #1a1a2e; font-size: 14px; }
        .footer-meta { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
        .status-draft { color: #f59e0b; }
        .status-sent { color: #3b82f6; }
        .status-paid { color: #10b981; }
        @media print { body { padding: 20px; } .invoice-container { border: none; padding: 20px; } .no-print { display: none !important; } }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div><h1>INVOICE</h1></div>
          <div class="number">
            <div>Invoice Number</div>
            <div class="num">${invoiceNumber}</div>
          </div>
        </div>
        <div class="client-section">
          <div class="label">Bill To</div>
          <div class="name">${currentInvoice.client_name}</div>
          <div class="project">${currentInvoice.project || 'Professional Services'}</div>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            <tr>
              <td>${currentInvoice.project || 'Professional Services'}</td>
              <td>${currentInvoice.hours}</td>
              <td>${formatCurrency(currentInvoice.rate)}</td>
              <td>${formatCurrency(currentInvoice.total)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">Total Due</td>
              <td>${total}</td>
            </tr>
          </tbody>
        </table>
        <div class="payment-section">
          <div class="label">Payment Instructions</div>
          <p>Bank Transfer: 123-456-789</p>
          <p>Reference: ${invoiceNumber}</p>
        </div>
        <div class="footer-meta">
          <div>Date: ${date}</div>
          <div class="status-${currentInvoice.status || 'draft'}">Status: ${currentInvoice.status || 'draft'}</div>
        </div>
      </div>
      <div style="text-align:center;margin-top:20px;padding:16px;background:#f8fafc;border-radius:8px;" class="no-print">
        <p style="color:#64748b;">Press <strong>Ctrl + P</strong> (Windows) or <strong>Cmd + P</strong> (Mac) to save as PDF.</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  showToast('🖨️ Use Ctrl+P to save as PDF', 'info', 4000);
}

// ===== MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.loadInvoicePreview = loadInvoicePreview;
window.downloadPDF = downloadPDF;
window.markAsSent = markAsSent;
window.renderInvoice = renderInvoice;
window.sendInvoice = sendInvoice;
window.printInvoice = printInvoice;

console.log('✅ Preview module loaded!');