document.addEventListener("DOMContentLoaded", () => {
  // Tema salvo
  const body = document.body;
  const toggleBtn = document.querySelector("[data-theme-toggle]");

  const applyTheme = (theme) => {
    body.classList.remove("theme-light", "theme-dark");
    body.classList.add(theme);
    localStorage.setItem("mdehub-theme", theme);

    if (toggleBtn) {
      const icon = toggleBtn.querySelector(".theme-toggle-icon");
      const label = toggleBtn.querySelector(".theme-toggle-label");
      if (theme === "theme-dark" || theme === "dark") {
        body.classList.remove("theme-light");
        body.classList.add("theme-dark");
        icon.textContent = "🌞";
        label.textContent = "Modo claro";
      } else {
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");
        icon.textContent = "🌙";
        label.textContent = "Modo escuro";
      }
    }
  };

  // Definir tema inicial
  const savedTheme = localStorage.getItem("mdehub-theme");
  if (savedTheme === "theme-dark" || savedTheme === "dark") {
    applyTheme("theme-dark");
  } else {
    applyTheme("theme-light");
  }

  // Toggle de tema
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isDark = body.classList.contains("theme-dark");
      applyTheme(isDark ? "theme-light" : "theme-dark");
    });
  }

  // Mostrar/ocultar senha
  document.querySelectorAll("[data-password-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const inputId = btn.getAttribute("data-password-toggle");
      const input = document.getElementById(inputId);
      if (!input) return;

      const isPassword = input.type === "password";
      input.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "🙈" : "👁";
    });
  });
});
