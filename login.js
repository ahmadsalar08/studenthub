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
  } else if (tab === "signup") {
    document.getElementById("panel-signup").classList.remove("hidden");
    document.getElementById("tab-signup").classList.add("active");
  }
}

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

// ===== SHOW ERROR =====
function showError(id, msg) {
  const el = document.getElementById(id);
  el.innerHTML = `<i class="ti ti-alert-circle"></i> ${msg}`;
}

function clearError(id) {
  document.getElementById(id).innerHTML = "";
}

// ===== INPUT SHAKE ANIMATION =====
function shake(inputId) {
  const input = document.getElementById(inputId);
  input.classList.add("error");
  input.style.animation = "shake 0.3s ease";
  setTimeout(() => {
    input.style.animation = "";
  }, 300);
}

// ===== LOGIN HANDLER =====
function handleLogin() {
  clearError("login-error");
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email) {
    shake("login-email");
    showError("login-error", "Email daalo please");
    return;
  }

  if (!email.includes("@")) {
    shake("login-email");
    showError("login-error", "Valid email daalo");
    return;
  }

  if (!password) {
    shake("login-password");
    showError("login-error", "Password daalo please");
    return;
  }

  if (password.length < 6) {
    shake("login-password");
    showError("login-error", "Password kam se kam 6 characters ka hona chahiye");
    return;
  }

  // Success — home par redirect
  const btn = document.querySelector("#panel-login .submit-btn");
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Signing in...';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

// ===== SIGNUP HANDLER =====
function handleSignup() {
  clearError("signup-error");
  const fname    = document.getElementById("signup-fname").value.trim();
  const email    = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm  = document.getElementById("signup-confirm").value;
  const terms    = document.getElementById("terms-check").checked;

  if (!fname) {
    shake("signup-fname");
    showError("signup-error", "Apna naam daalo");
    return;
  }

  if (!email || !email.includes("@")) {
    shake("signup-email");
    showError("signup-error", "Valid email daalo");
    return;
  }

  if (password.length < 8) {
    shake("signup-password");
    showError("signup-error", "Password kam se kam 8 characters ka hona chahiye");
    return;
  }

  if (password !== confirm) {
    shake("signup-confirm");
    showError("signup-error", "Dono passwords match nahi kar rahe");
    return;
  }

  if (!terms) {
    showError("signup-error", "Terms of Service se agree karna zaroori hai");
    return;
  }

  // Success
  const btn = document.querySelector("#panel-signup .submit-btn");
  btn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Account ban raha hai...';
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById("panel-signup").classList.add("hidden");
    document.getElementById("panel-success").classList.remove("hidden");
    document.getElementById("tab-login").classList.remove("active");
    document.getElementById("tab-signup").classList.remove("active");
  }, 1500);
}

// ===== SHAKE ANIMATION =====
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .ti-spin { animation: spin 1s linear infinite; display: inline-block; }
`;
document.head.appendChild(style);