const API = window.ERP_API || "/api";
const msg = document.getElementById("loginMsg");
const loginMode = document.getElementById("loginMode");
const signupMode = document.getElementById("signupMode");
const googleMode = document.getElementById("googleMode");
const loginModeBtn = document.getElementById("loginModeBtn");
const signupModeBtn = document.getElementById("signupModeBtn");
const googleModeBtn = document.getElementById("googleModeBtn");

const setMsg = (text, ok = false) => {
  msg.style.color = ok ? "#166534" : "#b91c1c";
  msg.textContent = text;
};

const switchMode = (mode) => {
  loginMode.classList.add("hidden");
  signupMode.classList.add("hidden");
  googleMode.classList.add("hidden");
  loginModeBtn.classList.remove("active");
  signupModeBtn.classList.remove("active");
  googleModeBtn.classList.remove("active");
  if (mode === "login") {
    loginMode.classList.remove("hidden");
    loginModeBtn.classList.add("active");
  }
  if (mode === "signup") {
    signupMode.classList.remove("hidden");
    signupModeBtn.classList.add("active");
  }
  if (mode === "google") {
    googleMode.classList.remove("hidden");
    googleModeBtn.classList.add("active");
  }
};
loginModeBtn.onclick = () => switchMode("login");
signupModeBtn.onclick = () => switchMode("signup");
googleModeBtn.onclick = () => switchMode("google");

const saveSession = (payload) => {
  localStorage.setItem("erp_token", payload.token);
  localStorage.setItem("erp_user", JSON.stringify(payload.user));
  window.location.href = "/dashboard.html";
};

document.getElementById("passwordLoginBtn").onclick = async () => {
  const identifier = document.getElementById("identifier").value.trim();
  const password = document.getElementById("password").value;
  if (!identifier || !password) return setMsg("Enter credentials.");
  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });
    const data = await response.json();
    if (!response.ok) return setMsg(data.message || "Login failed");
    setMsg(`Welcome ${data.user.name}! Redirecting...`, true);
    saveSession(data);
  } catch {
    setMsg("Server unavailable.");
  }
};

document.getElementById("signupBtn").onclick = async () => {
  const payload = {
    name: document.getElementById("signupName").value.trim(),
    enrollment: document.getElementById("signupEnrollment").value.trim(),
    role: document.getElementById("signupRole").value,
    password: document.getElementById("signupPassword").value
  };
  if (!payload.name || !payload.enrollment || !payload.password) return setMsg("Please fill all signup fields.");
  try {
    const response = await fetch(`${API}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) return setMsg(data.message || "Signup failed.");
    setMsg(`Signup success. Welcome ${data.user.name}!`, true);
    saveSession(data);
  } catch {
    setMsg("Server unavailable.");
  }
};

document.getElementById("googleLoginBtn").onclick = async () => {
  const gmail = document.getElementById("gmailInput").value.trim();
  const role = document.getElementById("googleRole").value;
  if (!gmail) return setMsg("Enter Gmail id.");
  try {
    const response = await fetch(`${API}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gmail, role })
    });
    const data = await response.json();
    if (!response.ok) return setMsg(data.message || "Google login failed.");
    setMsg(`Google login success. Welcome ${data.user.name}!`, true);
    saveSession(data);
  } catch {
    setMsg("Server unavailable.");
  }
};
