import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZnBucWxlYWl2aGxidGJ2dWZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjYzMjYsImV4cCI6MjA5NTU0MjMyNn0.U7dlH_j_CoSL4kqHQjqcaCziWU-tAOO2WJnjPbbAM8I'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)





// ===== TAB SWITCHING =====
function showTab(tab) {
  document.getElementById("panel-login").classList.add("hidden");
  document.getElementById("panel-signup").classList.add("hidden");
  document.getElementById("panel-success").classList.add("hidden");
  document.getElementById("panel-forgot").classList.add("hidden");
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("tab-signup").classList.remove("active");
  if (tab === "login") {
    document.getElementById("panel-login").classList.remove("hidden");
    document.getElementById("tab-login").classList.add("active");
  } else if (tab === "signup") {
    document.getElementById("panel-signup").classList.remove("hidden");
    document.getElementById("tab-signup").classList.add("active");
  } else if (tab === "forgot") {
    document.getElementById("panel-forgot").classList.remove("hidden");
  }
}
window.showTab = showTab;

// ===== PASSWORD TOGGLE =====
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "ti ti-eye-off";
  } else {
    input.type = "password";
    icon.className = "ti ti-eye";
  }
}
window.togglePass = togglePass;

// ===== PASSWORD STRENGTH =====
function checkStrength(val) {
  const fill = document.getElementById("strength-fill");
  const label = document.getElementById("strength-label");
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w: "0%",   bg: "transparent", text: "" },
    { w: "25%",  bg: "#ef4444",     text: "Weak" },
    { w: "50%",  bg: "#f97316",     text: "Fair" },
    { w: "75%",  bg: "#eab308",     text: "Good" },
    { w: "100%", bg: "#22c55e",     text: "Strong" },
  ];
  const level = val.length === 0 ? levels[0] : levels[score] || levels[1];
  fill.style.width = level.w;
  fill.style.background = level.bg;
  label.textContent = level.text;
  label.style.color = level.bg;
}
window.checkStrength = checkStrength;

// ===== HELPERS =====
function showError(id, msg) {
  document.getElementById(id).innerHTML = `<i class="ti ti-alert-circle"></i> ${msg}`;
}
function clearError(id) {
  document.getElementById(id).innerHTML = "";
}
function shake(inputId) {
  const input = document.getElementById(inputId);
  input.style.animation = "shake 0.3s ease";
  setTimeout(() => { input.style.animation = ""; }, 300);
}

// ===== LOGIN HANDLER =====
async function handleLogin() {
  clearError("login-error");
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !email.includes("@")) { shake("login-email"); showError("login-error", "Please enter a valid email"); return; }
  if (!password || password.length < 6) { shake("login-password"); showError("login-error", "Password must be at least 6 characters"); return; }

  const btn = document.querySelector("#panel-login .submit-btn");
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Signing in...';
  btn.disabled = true;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    btn.innerHTML = '<span>Sign in</span> <i class="ti ti-arrow-right"></i>';
    btn.disabled = false;
    if (error.message.includes("Invalid login")) {
      showError("login-error", "Incorrect email or password");
    } else if (error.message.includes("Email not confirmed")) {
      showError("login-error", "Please verify your email first — check your inbox");
    } else {
      showError("login-error", "An error occurred: " + error.message);
    }
    return;
  }

  btn.innerHTML = '<i class="ti ti-check"></i> Logged in!';
  setTimeout(() => { window.location.href = "index.html"; }, 800);
}
window.handleLogin = handleLogin;

// ===== FORGOT PASSWORD HANDLER =====
async function handleForgotPassword() {
  clearError("forgot-error");
  const email = document.getElementById("forgot-email").value.trim();

  if (!email || !email.includes("@")) {
    shake("forgot-email");
    showError("forgot-error", "Please enter a valid email");
    return;
  }

  const btn = document.querySelector("#panel-forgot .submit-btn");
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Sending...';
  btn.disabled = true;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://studenthub-plum.vercel.app/reset-password.html',
  });

  if (error) {
    btn.innerHTML = '<span>Send reset link</span> <i class="ti ti-arrow-right"></i>';
    btn.disabled = false;
    showError("forgot-error", "An error occurred: " + error.message);
    return;
  }

  // Success
  document.getElementById("panel-forgot").innerHTML = `
    <div class="success-state">
      <div class="success-icon"><i class="ti ti-mail-check"></i></div>
      <h2 class="success-title">Email sent! 📧</h2>
      <p class="success-sub">${email} pe password reset link bheja gaya hai. Inbox check karo!</p>
      <button class="submit-btn" onclick="showTab('login')" style="margin-top:8px">
        <span>Back to Sign in</span> <i class="ti ti-arrow-right"></i>
      </button>
    </div>
  `;
}
window.handleForgotPassword = handleForgotPassword;

// ===== SIGNUP HANDLER =====
async function handleSignup() {
  clearError("signup-error");
  const fname    = document.getElementById("signup-fname").value.trim();
  const lname    = document.getElementById("signup-lname").value.trim();
  const email    = document.getElementById("signup-email").value.trim();
  const uni      = document.getElementById("signup-uni").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm  = document.getElementById("signup-confirm").value;
  const terms    = document.getElementById("terms-check").checked;

  if (!fname) { shake("signup-fname"); showError("signup-error", "Please enter your first name"); return; }
  if (!email || !email.includes("@")) { shake("signup-email"); showError("signup-error", "Please enter a valid email"); return; }
  if (!password || password.length < 6) { shake("signup-password"); showError("signup-error", "Password must be at least 6 characters"); return; }
  if (password !== confirm) { shake("signup-confirm"); showError("signup-error", "Both passwords do not match"); return; }
  if (!terms) { showError("signup-error", "You must agree to the Terms & Privacy Policy"); return; }

  const btn = document.querySelector("#panel-signup .submit-btn");
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Creating account...';
  btn.disabled = true;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${fname} ${lname}`.trim(),
        university: uni || "",
      }
    }
  });

  if (error) {
    btn.innerHTML = '<span>Create account — free!</span> <i class="ti ti-arrow-right"></i>';
    btn.disabled = false;
    if (error.message.includes("already registered")) {
      showError("signup-error", "This email is already registered — please sign in");
    } else if (error.message.includes("Password should")) {
      showError("signup-error", "Password should be stronger");
    } else {
      showError("signup-error", "An error occurred: " + error.message);
    }
    return;
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    showError("signup-error", "This email is already registered — please sign in");
    btn.innerHTML = '<span>Create account — free!</span> <i class="ti ti-arrow-right"></i>';
    btn.disabled = false;
    return;
  }

  document.getElementById("panel-login").classList.add("hidden");
  document.getElementById("panel-signup").classList.add("hidden");
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("tab-signup").classList.remove("active");
  document.getElementById("panel-success").classList.remove("hidden");
}
window.handleSignup = handleSignup;

// ===== AUTO REDIRECT IF ALREADY LOGGED IN =====
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    window.location.href = "index.html";
  }
});

// ===== GOOGLE LOGIN =====
async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://studenthub-plum.vercel.app/'
    }
  })
  if (error) {
    console.error('Google login error:', error.message)
  }
}
window.handleGoogleLogin = handleGoogleLogin