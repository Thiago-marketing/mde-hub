/* =========================================================
   MDE HUB • APP.JS PREMIUM – Bills Mode Supreme
   Funções globais de UI + Tema + Sidebar + Sessão futura
========================================================= */

/* ---------------------------------------------------------
   1) DETECTAR TEMA DO NAVEGADOR (DARK/CLEAN)
--------------------------------------------------------- */
function applySystemTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const current = document.documentElement.getAttribute("data-theme");

  if (!current) {
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "clean");
  }
}

applySystemTheme();

/* Escutar mudanças no tema do sistema */
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
  const newTheme = event.matches ? "dark" : "clean";
  document.documentElement.setAttribute("data-theme", newTheme);
});


/* ---------------------------------------------------------
   2) TOGGLE MANUAL DO TEMA (BOTÃO 🌓)
--------------------------------------------------------- */
const btnThemeToggle = document.getElementById("btnThemeToggle");

if (btnThemeToggle) {
  btnThemeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "clean" : "dark";
    document.documentElement.setAttribute("data-theme", next);
  });
}


/* ---------------------------------------------------------
   3) SIDEBAR MOBILE (abrir/fechar)
--------------------------------------------------------- */
const sidebar = document.getElementById("sidebar");
const btnSidebarToggle = document.getElementById("btnSidebarToggle");

if (btnSidebarToggle) {
  btnSidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

/* Fechar sidebar tocando fora dela no mobile */
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 830) {
    if (!sidebar.contains(event.target) && !btnSidebarToggle.contains(event.target)) {
      sidebar.classList.remove("open");
    }
  }
});


/* ---------------------------------------------------------
   4) HIGHLIGHT NO MENU (Sidebar)
--------------------------------------------------------- */
function highlightActiveMenu() {
  const path = window.location.pathname;

  document.querySelectorAll(".nav-item").forEach(item => {
    const href = item.getAttribute("href");
    if (href && path.includes(href.replace("/", ""))) {
      item.classList.add("active");
    }
  });
}

highlightActiveMenu();


/* ---------------------------------------------------------
   5) FUNÇÕES FUTURAS – SUPABASE (placeholder)
--------------------------------------------------------- */

/* Estrutura básica para futura leitura de sessão */
async function loadUserSession() {
  // Exemplo futuro:
  // const { data: { user } } = await supabase.auth.getUser();
  // if (user) atualizarAvatar(user), atualizarNome(user)

  console.log("Sessão do usuário será carregada aqui (Fase 2).");
}

/* Estrutura para trocar de hotel futuro */
function selecionarHotel(idHotel) {
  // sessionStorage.setItem("hotel_id", idHotel);
  console.log("Hotel selecionado:", idHotel);
}

/* Estrutura base para atualizações do Painel (futuro Acumulador Lite) */
function carregarIndicadoresPainel() {
  // Chamadas ao supabase | APIs | acumulador estarão aqui
  console.log("Indicadores do Painel do Proprietário serão carregados aqui.");
}


/* ---------------------------------------------------------
   6) ANIMAÇÕES E UX EXTRA (opcional)
--------------------------------------------------------- */

/* Efeito suave de click */
document.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("card")) {
    e.target.style.transform = "scale(0.98)";
  }
});

document.addEventListener("mouseup", (e) => {
  if (e.target.classList.contains("card")) {
    e.target.style.transform = "scale(1)";
  }
});


/* ---------------------------------------------------------
   7) LOG DE INICIALIZAÇÃO (debug)
--------------------------------------------------------- */
console.log("%cMDE Hub Loaded • Bills Mode Supreme", "color:#00aaff; font-weight:bold;");
