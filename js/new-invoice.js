// ============================================
// NEW INVOICE — FORM HANDLING
// ============================================

// ===== CALCULATE TOTAL ON INPUT CHANGE =====
document.addEventListener('DOMContentLoaded', function() {
  const hoursInput = document.getElementById('hours');
  const rateInput = document.getElementById('rate');
  const totalDisplay = document.getElementById('totalDisplay');
  
  function updateTotal() {
    const hours = parseFloat(hoursInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const total = hours * rate;
    totalDisplay.textContent = formatCurrency(total);
  }
  
  hoursInput.addEventListener('input', updateTotal);
  rateInput.addEventListener('input', updateTotal);
});

// ===== HANDLE FORM SUBMISSION =====
async function handleSubmit(event) {
  event.preventDefault();
  
  const clientName = document.getElementById('clientName').value.trim();
  const project = document.getElementById('project').value.trim();
  const hours = parseFloat(document.getElementById('hours').value);
  const rate = parseFloat(document.getElementById('rate').value);
  const clientEmail = document.getElementById('clientEmail').value.trim();
  
  // Validate
  if (!clientName) {
    showToast('Please enter a client name', 'error');
    return;
  }
  
  if (!project) {
    showToast('Please enter a project description', 'error');
    return;
  }

  // Validate
if (!clientEmail || !isValidEmail(clientEmail)) {
  showToast('Please enter a valid client email', 'error');
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
    client_email: clientEmail,
    project: project,
    hours: hours,
    rate: rate
  };
  
  // Disable button
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating...';
  
  // Create invoice
  const result = await createInvoice(invoiceData);
  
  submitBtn.disabled = false;
  submitBtn.textContent = 'Generate Invoice';
  
  if (result) {
    // Redirect to dashboard after success
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 1000);
  }
}

// ===== MAKE FUNCTION GLOBALLY AVAILABLE =====
window.handleSubmit = handleSubmit;

console.log('✅ New Invoice module loaded!');