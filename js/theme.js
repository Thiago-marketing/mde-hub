document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const toggleBtn = document.querySelector("[data-theme-toggle]");

  // ----------------------------
  // APLICA O TEMA
  // ----------------------------
  function applyTheme(theme) {
    const finalTheme = theme === "light" ? "light" : "dark";

    // Ajusta atributo no <html>
    html.setAttribute("data-theme", finalTheme);

    // Salva no localStorage
    localStorage.setItem("mdehub-theme", finalTheme);

    // Atualiza ícones e texto do botão
    if (toggleBtn) {
      const icon = toggleBtn.querySelector(".theme-toggle-icon");
      const label = toggleBtn.querySelector(".theme-toggle-label");

      if (finalTheme === "dark") {
        if (icon) icon.textContent = "🌞";
        if (label) label.textContent = "Modo claro";
      } else {
        if (icon) icon.textContent = "🌙";
        if (label) label.textContent = "Modo escuro";
      }
    }
  }

  // ----------------------------
  // TEMA INICIAL
  // ----------------------------
  const savedTheme = localStorage.getItem("mdehub-theme");
  applyTheme(savedTheme || "dark");

  // ----------------------------
  // ALTERNAR TEMA
  // ----------------------------
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = html.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  // ----------------------------
  // MOSTRAR / OCULTAR SENHA
  // ----------------------------
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
