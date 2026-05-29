import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://bafpnqleaivhlbtbvufg.supabase.co'
const SUPABASE_KEY = 'sb_publishable_dyg3P9bHZkwRn7_bErLySw_lGPgdGfc'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ===== TAB SWITCHING =====
function showTab(tab) {
  document.getElementById("panel-login").classList.add("hidden");
  document.getElementById("panel-signup").classList.add("hidden");
  document.getElementById("panel-success").classList.add("hidden");
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("tab-signup").classList.remove("active");
  if (tab === "login") {
    document.getElementById("panel-login").classList.remove("hidden");
    document.getElementById("tab-login").classList.add("active");
  } else {
    document.getElementById("panel-signup").classList.remove("hidden");
    document.getElementById("tab-signup").classList.add("active");
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

  if (!email || !email.includes("@")) { shake("login-email"); showError("login-error", "Valid email daalo"); return; }
  if (!password || password.length < 6) { shake("login-password"); showError("login-error", "Password kam se kam 6 characters ka hona chahiye"); return; }

  const btn = document.querySelector("#panel-login .submit-btn");
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Signing in...';
  btn.disabled = true;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    btn.innerHTML = '<span>Sign in</span> <i class="ti ti-arrow-right"></i>';
    btn.disabled = false;
    if (error.message.includes("Invalid login")) {
      showError("login-error", "Email ya password galat hai");
    } else if (error.message.includes("Email not confirmed")) {
      showError("login-error", "Pehle apna email verify karo — inbox check karo");
    } else {
      showError("login-error", "Kuch masla hua: " + error.message);
    }
    return;
  }

  btn.innerHTML = '<i class="ti ti-check"></i> Logged in!';
  setTimeout(() => { window.location.href = "index.html"; }, 800);
}
window.handleLogin = handleLogin;

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

  if (!fname) { shake("signup-fname"); showError("signup-error", "Apna first name daalo"); return; }
  if (!email || !email.includes("@")) { shake("signup-email"); showError("signup-error", "Valid email daalo"); return; }
  if (!password || password.length < 6) { shake("signup-password"); showError("signup-error", "Password kam se kam 6 characters ka hona chahiye"); return; }
  if (password !== confirm) { shake("signup-confirm"); showError("signup-error", "Dono passwords match nahi kar rahe"); return; }
  if (!terms) { showError("signup-error", "Terms & Privacy Policy se agree karna zaroori hai"); return; }

  const btn = document.querySelector("#panel-signup .submit-btn");
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Account ban raha hai...';
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
    btn.innerHTML = '<span>Account banao — free!</span> <i class="ti ti-arrow-right"></i>';
    btn.disabled = false;
    if (error.message.includes("already registered")) {
      showError("signup-error", "Yeh email pehle se registered hai — sign in karo");
    } else if (error.message.includes("Password should")) {
      showError("signup-error", "Password aur strong hona chahiye");
    } else {
      showError("signup-error", "Kuch masla hua: " + error.message);
    }
    return;
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    showError("signup-error", "Yeh email pehle se registered hai — sign in karo");
    btn.innerHTML = '<span>Account banao — free!</span> <i class="ti ti-arrow-right"></i>';
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