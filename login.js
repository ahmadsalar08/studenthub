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

// ===== SHOW ERROR =====
function showError(id, msg) {
  document.getElementById(id).innerHTML = `<i class="ti ti-alert-circle"></i> ${msg}`;
}
function clearError(id) {
  document.getElementById(id).innerHTML = "";
}

// ===== SHAKE =====
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

  const { error } = await supabase.auth.signInWithPassword({ email, password });}