// ============================================
// PROFILE — LOAD AND UPDATE USER PROFILE
// ============================================

// ===== LOAD PROFILE =====
async function loadProfile() {
  try {
    const user = await getCurrentUser();
    if (!user) return;
    
    // Update avatar
    const avatar = document.getElementById('profileAvatar');
    const displayName = user.user_metadata?.full_name || user.email || 'User';
    avatar.textContent = getUserInitials(displayName);
    
    // Update email
    document.getElementById('profileEmail').textContent = user.email;
    
    // Update joined date
    document.getElementById('profileJoined').textContent = formatDate(user.created_at);
    
    // Update invoice count
    const invoices = await getInvoices();
    document.getElementById('profileInvoiceCount').textContent = invoices.length;
    
    // Populate display name field
    document.getElementById('displayName').value = displayName;
    
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Failed to load profile', 'error');
  }
}

// ===== HANDLE PROFILE UPDATE =====
async function handleProfileUpdate(event) {
  event.preventDefault();
  
  const displayName = document.getElementById('displayName').value.trim();
  
  if (!displayName) {
    showToast('Please enter a display name', 'error');
    return;
  }
  
  const updateBtn = document.getElementById('updateProfileBtn');
  updateBtn.disabled = true;
  updateBtn.textContent = 'Updating...';
  
  try {
    const { data, error } = await supabaseClient.auth.updateUser({
      data: { full_name: displayName }
    });
    
    if (error) throw error;
    
    showToast('Profile updated successfully!', 'success');
    
    // Update avatar
    document.getElementById('profileAvatar').textContent = getUserInitials(displayName);
    
  } catch (error) {
    console.error('Profile update error:', error);
    showToast(error.message || 'Failed to update profile', 'error');
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = 'Update Profile';
  }
}

// ===== HANDLE PASSWORD CHANGE =====
async function handlePasswordChange(event) {
  event.preventDefault();
  
  const newPassword = document.getElementById('newPassword').value;
  
  if (!newPassword || newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }
  
  const updateBtn = document.getElementById('updatePasswordBtn');
  updateBtn.disabled = true;
  updateBtn.textContent = 'Updating...';
  
  try {
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    showToast('Password updated successfully!', 'success');
    document.getElementById('passwordForm').reset();
    
  } catch (error) {
    console.error('Password update error:', error);
    showToast(error.message || 'Failed to update password', 'error');
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = 'Update Password';
  }
}

// ===== MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.loadProfile = loadProfile;
window.handleProfileUpdate = handleProfileUpdate;
window.handlePasswordChange = handlePasswordChange;

console.log('✅ Profile module loaded!');