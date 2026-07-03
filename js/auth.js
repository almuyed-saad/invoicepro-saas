// ============================================
// AUTHENTICATION — SIGN UP, LOGIN, LOGOUT
// ============================================

async function signIn(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Sign in error:', error);
    showToast(error.message || 'Invalid email or password', 'error');
    return { success: false, error: error.message };
  }
}

async function signUp(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });
    
    if (error) throw error;
    showToast('Account created! Please check your email to confirm.', 'success');
    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    showToast(error.message || 'Failed to create account', 'error');
    return { success: false, error: error.message };
  }
}

// ===== HANDLE OAUTH REDIRECT =====
async function handleOAuthRedirect() {
  try {
    // Check if we're coming from an OAuth redirect
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      console.error('OAuth session error:', error);
      return false;
    }
    
    if (data?.session) {
      console.log('✅ OAuth session restored!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('OAuth redirect handling error:', error);
    return false;
  }
}

async function signInWithGoogle() {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard.html'
      }
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Google sign in error:', error);
    showToast(error.message || 'Failed to sign in with Google', 'error');
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('supabase.auth.token');
    showToast('Signed out successfully', 'success');
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Sign out error:', error);
    showToast(error.message || 'Failed to sign out', 'error');
  }
}

// ===== GET CURRENT USER =====
async function getCurrentUser() {
  try {
    // First, try to get the session
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return null;
    }
    
    // If no session, return null
    if (!sessionData?.session) {
      console.log('No active session found');
      return null;
    }
    
    // Session exists, get user
    const { data, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    
    return data?.user || null;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// ===== MAKE FUNCTIONS GLOBALLY AVAILABLE =====
window.signIn = signIn;
window.signUp = signUp;
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
window.handleOAuthRedirect = handleOAuthRedirect;

console.log('✅ Auth module loaded!');