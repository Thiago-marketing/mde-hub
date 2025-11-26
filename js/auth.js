// auth.js
// Cuida de login, sessão, logout e proteção das páginas

document.addEventListener("DOMContentLoaded", async () => {

  // --- LOGIN PAGE ---
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login_email").value.trim();
      const password = document.getElementById("login_password").value.trim();

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Erro ao entrar: " + error.message);
        return;
      }

      // Redireciona ao painel
      window.location.href = "dashboard.html";
    });
  }

  // --- PROTEÇÃO DO DASHBOARD ---
  const isDashboard = window.location.pathname.includes("dashboard.html");

  if (isDashboard) {
    const { data: sessionData } = await supabaseClient.auth.getSession();

    if (!sessionData.session) {
      // Sem sessão → volta para login
      window.location.href = "login.html";
      return;
    }

    const user = sessionData.session.user;

    // Mostrar e-mail no topo
    const userEmailElement = document.getElementById("user-email");
    const userGreeting = document.getElementById("user-greeting");

    if (userEmailElement) userEmailElement.textContent = user.email;

    if (userGreeting) {
      userGreeting.textContent = `Olá, ${user.user_metadata?.full_name || user.email}!`;
    }

    // Botão logout
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
      });
    }
  }

});
