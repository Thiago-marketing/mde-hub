document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const menuToggle = document.getElementById("menuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const themeToggle = document.getElementById("themeToggle");

  /* ------------------------------------------
     MENU MOBILE PREMIUM
  ------------------------------------------ */
  const toggleMenu = () => {
    body.classList.toggle("sidebar-open");
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", toggleMenu);
  }

  /* ------------------------------------------
     TEMA (Dark / Light)
  ------------------------------------------ */
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";

      body.setAttribute("data-theme", next);

      try {
        localStorage.setItem("mdehub-theme", next);
      } catch {}
    });
  }

  // Carregar tema salvo
  try {
    const saved = localStorage.getItem("mdehub-theme");
    if (saved) {
      body.setAttribute("data-theme", saved);
    }
  } catch {}
});
