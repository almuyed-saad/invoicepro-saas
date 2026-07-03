// ============================================
// EDIT INVOICE — LOAD AND UPDATE
// ============================================

// ===== LOAD INVOICE DATA =====
async function loadInvoiceForEdit() {
  // Get invoice ID from URL
  const params = new URLSearchParams(window.location.search);
  const invoiceId = params.get('id');
  
  if (!invoiceId) {
    showToast('No invoice ID provided', 'error');
    window.location.href = '/dashboard.html';
    return;
  }
  
  try {
    const invoice = await getInvoiceById(parseInt(invoiceId));
    
    if (!invoice) {
      showToast('Invoice not found', 'error');
      window.location.href = '/dashboard.html';
      return;
    }
    
    // Populate form
    document.getElementById('invoiceId').value = invoice.id;
    document.getElementById('clientName').value = invoice.client_name || '';
    document.getElementById('clientEmail').value = invoice.client_email || '';
    document.getElementById('project').value = invoice.project || '';
    document.getElementById('hours').value = invoice.hours || '';
    document.getElementById('rate').value = invoice.rate || '';
    document.getElementById('status').value = invoice.status || 'draft';
    
    // Update total
    updateTotal();
    
    // Show form, hide loading
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('invoiceForm').style.display = 'block';
    
  } catch (error) {
    console.error('Error loading invoice:', error);
    showToast('Failed to load invoice', 'error');
    window.location.href = '/dashboard.html';
  }
}

// ===== CALCULATE TOTAL ON INPUT CHANGE =====
document.addEventListener('DOMContentLoaded', function() {
  const hoursInput = document.getElementById('hours');
  const rateInput = document.getElementById('rate');
  const totalDisplay = document.getElementById('totalDisplay');
  
  window.updateTotal = function() {
    const hours = parseFloat(hoursInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const total = hours * rate;
    totalDisplay.textContent = formatCurrency(total);
  };
  
  hoursInput.addEventListener('input', updateTotal);
  rateInput.addEventListener('input', updateTotal);
});

// ===== HANDLE FORM SUBMISSION =====
async function handleSubmit(event) {
  event.preventDefault();
  
  const id = parseInt(document.getElementById('invoiceId').value);
  const clientName = document.getElementById('clientName').value.trim();
  const project = document.getElementById('project').value.trim();
  const hours = parseFloat(document.getElementById('hours').value);
  const rate = parseFloat(document.getElementById('rate').value);
  const status = document.getElementById('status').value;
  
  // Validate
  if (!clientName) {
    showToast('Please enter a client name', 'error');
    return;
  }
  
  if (!project) {
    showToast('Please enter a project description', 'error');
    return;
  }
  
  if (!hours || hours <= 0) {
    showToast('Please enter valid hours worked', 'error');
    return;
  }
  
  if (!rate || rate <= 0) {
    showToast('Please enter a valid rate per hour', 'error');
    return;
  }
  
  // Prepare data
  const invoiceData = {
    client_name: clientName,
    project: project,
    hours: hours,
    rate: rate,
    status: status
  };
  
  // Disable button
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';
  
  // Update invoice
  const result = await updateInvoice(id, invoiceData);
  
  submitBtn.disabled = false;
  submitBtn.textContent = 'Update Invoice';
  
  if (result) {
    // Redirect to dashboard after success
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
  }
}

// ===== MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.loadInvoiceForEdit = loadInvoiceForEdit;
window.handleSubmit = handleSubmit;
window.updateTotal = updateTotal;

console.log('✅ Edit Invoice module loaded!');