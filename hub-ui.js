document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const menuToggle = document.getElementById("menuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const themeToggle = document.getElementById("themeToggle");

  // MENU MOBILE
  if (menuToggle && sidebarOverlay) {
    const toggleMenu = () => {
      body.classList.toggle("sidebar-open");
    };

    menuToggle.addEventListener("click", toggleMenu);
    sidebarOverlay.addEventListener("click", toggleMenu);
  }

  // TEMA – salva preferência básica em localStorage
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      body.setAttribute("data-theme", next);
      try {
        localStorage.setItem("mdehub-theme", next);
      } catch (e) {}
    });

    // carrega tema salvo
    try {
      const saved = localStorage.getItem("mdehub-theme");
      if (saved) {
        body.setAttribute("data-theme", saved);
      }
    } catch (e) {}
  }
});
