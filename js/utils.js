// ============================================
// UTILITY FUNCTIONS
// ============================================

// ===== 1. FORMAT CURRENCY =====
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// ===== 2. FORMAT DATE =====
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ===== 3. GENERATE INVOICE NUMBER =====
function generateInvoiceNumber(id) {
  if (!id) return 'INV-0000';
  return `INV-${String(id).padStart(4, '0')}`;
}

// ===== 4. GET STATUS BADGE COLOR =====
function getStatusColor(status) {
  const colors = {
    draft: '#F59E0B',   // Amber
    sent: '#3B82F6',    // Blue
    paid: '#10B981'     // Emerald
  };
  return colors[status] || '#94A3B8';
}

// ===== 5. TOAST NOTIFICATIONS =====
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toasts
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Auto-remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===== 6. VALIDATE EMAIL =====
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===== 7. VALIDATE PASSWORD =====
function isValidPassword(password) {
  return password && password.length >= 6;
}

// ===== 8. GENERATE UNIQUE ID (for temporary use) =====
function generateTempId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ===== 9. CAPITALIZE FIRST LETTER =====
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ===== 10. TRUNCATE TEXT =====
function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ===== 11. GET USER INITIALS =====
function getUserInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ===== 12. DARK MODE TOGGLE =====
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.querySelector('.theme-toggle');
  if (!icon) return;
  const theme = document.documentElement.getAttribute('data-theme');
  icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon();
}

// ===== 13. MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.generateInvoiceNumber = generateInvoiceNumber;
window.getStatusColor = getStatusColor;
window.showToast = showToast;
window.isValidEmail = isValidEmail;
window.isValidPassword = isValidPassword;
window.capitalize = capitalize;
window.truncateText = truncateText;
window.getUserInitials = getUserInitials;
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.loadTheme = loadTheme;

console.log('✅ Utils loaded!');