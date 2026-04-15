const API = 'http://localhost:5263/api';

// ── URL param: pre-select tab ──
const urlMode = new URLSearchParams(location.search).get('mode');
if (urlMode === 'signup') switchTab('signup');

function switchTab(tab) {
  document.getElementById('loginPanel').classList.toggle('active', tab==='login');
  document.getElementById('signupPanel').classList.toggle('active', tab==='signup');
  document.getElementById('loginTab').classList.toggle('active', tab==='login');
  document.getElementById('signupTab').classList.toggle('active', tab==='signup');
}

function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function checkStrength(pw) {
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const pct = (score/4)*100;
  fill.style.width = pct + '%';
  const colors = ['#ff6b6b','#ffd93d','#00e5cc','#6bcb77'];
  const labels = ['Weak','Fair','Good','Strong'];
  fill.style.background = colors[score-1] || '#ff6b6b';
  label.textContent = score > 0 ? labels[score-1] : '';
  label.style.color = colors[score-1] || '#ff6b6b';
}

function showError(id, show) {
  const el = document.getElementById(id);
  el.classList.toggle('show', show);
  const input = el.previousElementSibling?.tagName === 'INPUT'
    ? el.previousElementSibling
    : el.previousElementSibling?.querySelector('input');
  if (input) input.classList.toggle('error', show);
}

function toast(msg, type='success') {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = type==='success' ? '✅' : '❌';
  t.className = `toast ${type==='success'?'success':'error-t'} show`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

function setLoading(panel, loading) {
  const btn = document.getElementById(panel+'Btn');
  const spinner = document.getElementById(panel+'Spinner');
  const txt = document.getElementById(panel+'BtnText');
  btn.disabled = loading;
  spinner.classList.toggle('show', loading);
  txt.style.opacity = loading ? '0.5' : '1';
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  let valid = true;

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  showError('loginEmailErr', !emailOk);
  if (!emailOk) valid = false;
  showError('loginPassErr', !pass);
  if (!pass) valid = false;
  if (!valid) return;

  setLoading('login', true);
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    
    console.log('Login response status:', res.status);
    const responseText = await res.text();
    console.log('Login response raw:', responseText);
    
    if (res.ok) {
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Login response parsed:', data);
      } catch (parseError) {
        console.log('JSON parse error:', parseError);
        toast('Invalid response from server. Please try again.', 'error');
        return;
      }
      
      // Backend returns { token: string } (lowercase)
      console.log('Login response data:', data);
      console.log('Token property:', data.token);
      console.log('Token type:', typeof data.token);
      
      const token = data.token;
      
      if (token) {
        console.log('Token found:', token);
        console.log('Token length:', token.length);
        localStorage.setItem('mx_token', token);
        localStorage.setItem('mx_user', JSON.stringify({ email, name: email.split('@')[0] }));
        console.log('Token stored in localStorage');
        console.log('Stored token:', localStorage.getItem('mx_token'));
        console.log('Stored user:', localStorage.getItem('mx_user'));
        toast('Welcome back! Redirecting...');
        setTimeout(() => location.href = 'dashboard.html', 1200);
      } else {
        console.log('No token found in response');
        console.log('Full response object keys:', Object.keys(data));
        toast('Login successful but no token received.', 'error');
      }
    } else {
      console.log('Login failed with status:', res.status);
      const errorText = await res.text();
      console.log('Login error response:', errorText);
      
      // Backend returns "Invalid credentials" for 401
      if (res.status === 401) {
        toast('Invalid credentials. Please check your email and password.', 'error');
      } else {
        toast('Login failed. Please try again.', 'error');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    toast('Connection error. Please check if backend is running on port 5263.', 'error');
  } finally {
    setLoading('login', false);
  }
}

async function handleSignup() {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  let valid = true;

  showError('signupNameErr', !name); if (!name) valid = false;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  showError('signupEmailErr', !emailOk); if (!emailOk) valid = false;
  showError('signupPassErr', pass.length < 8); if (pass.length < 8) valid = false;
  showError('signupConfirmErr', pass !== confirm); if (pass !== confirm) valid = false;
  if (!valid) return;

  setLoading('signup', true);
  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });
    
    console.log('Signup response status:', res.status);
    const responseText = await res.text();
    console.log('Signup response raw:', responseText);
    
    if (res.ok) {
      toast('Account created! Please log in.');
      setTimeout(() => switchTab('login'), 1500);
    } else {
      console.log('Signup error response:', responseText);
      
      // Backend returns "Email already exists" string for 400 status
      if (res.status === 400) {
        toast(responseText || 'Email already exists', 'error');
      } else {
        toast('Signup failed. Please try again.', 'error');
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    if (error.message.includes('Failed to fetch')) {
      toast(`Cannot connect to backend at ${API}. Please ensure backend is running on port 5263.`, 'error');
    } else {
      toast('Network error. Please check your connection.', 'error');
    }
  } finally {
    setLoading('signup', false);
  }
}

// Enter key support
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (document.getElementById('loginPanel').classList.contains('active')) handleLogin();
  else handleSignup();
});
