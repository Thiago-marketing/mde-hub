// /js/app.js

// Chave padrão para guardar dados simples do usuário no navegador
const USER_STORAGE_KEY = "mdehub_user";
const THEME_STORAGE_KEY = "mdehub_theme";

// --------------------------------------------------
// THEME: dark / light
// --------------------------------------------------
function applyTheme(theme) {
  const html = document.documentElement;
  const body = document.body;
  const toggleBtn = document.querySelector("[data-theme-toggle]");
  const labelEl = toggleBtn?.querySelector(".theme-toggle-label");
  const iconEl = toggleBtn?.querySelector(".theme-toggle-icon");

  const normalized = theme === "light" ? "light" : "dark";

  html.setAttribute("data-theme", normalized);
  body.classList.remove("theme-light", "theme-dark");
  body.classList.add(`theme-${normalized}`);

  if (labelEl && iconEl) {
    if (normalized === "dark") {
      labelEl.textContent = "Modo claro";
      iconEl.textContent = "🌙";
    } else {
      labelEl.textContent = "Modo escuro";
      iconEl.textContent = "☀️";
    }
  }

  // salva preferência
  try {
    localStorage.setItem(THEME_STORAGE_KEY, normalized);
  } catch (e) {
    console.warn("Não foi possível salvar o tema no localStorage:", e);
  }
}

function initTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (e) {
    saved = null;
  }

  const initial = saved || document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(initial);

  const toggleBtn = document.querySelector("[data-theme-toggle]");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }
}

// --------------------------------------------------
// USUÁRIO (nome, e-mail, inicial) – por enquanto via localStorage
// --------------------------------------------------
function loadUserFromStorage() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Erro ao ler usuário do localStorage:", e);
    return null;
  }
}

function applyUserInfo() {
  const user = loadUserFromStorage();

  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");
  const initialEl = document.getElementById("userInitial");

  if (!nameEl && !emailEl && !initialEl) return; // página sem header de usuário

  if (user && user.email) {
    const name = user.name || "Usuário MDE";
    const email = user.email;
    const initial = (name || email || "?").trim().charAt(0).toUpperCase();

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    if (initialEl) initialEl.textContent = initial;
  } else {
    // fallback se ainda não tiver login real integrado
    if (nameEl) nameEl.textContent = "Usuário de teste";
    if (emailEl) emailEl.textContent = "teste@mdesistemas.com.br";
    if (initialEl) initialEl.textContent = "U";
  }
}

function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn("Erro ao limpar storage do usuário:", e);
    }
    // no futuro podemos também chamar supabase.auth.signOut()
    window.location.href = "/login.html";
  });
}

// --------------------------------------------------
// DASHBOARD: métricas e componentes visuais simples
// --------------------------------------------------
function initDashboardMetrics() {
  const elOcupacao = document.getElementById("metricOcupacao");
  const elReceita = document.getElementById("metricReceita");
  const elReservasFuturas = document.getElementById("metricReservasFuturas");

  // Se não estiver na página de dashboard, ignora
  if (!elOcupacao && !elReceita && !elReservasFuturas) return;

  // Valores fictícios por enquanto (para teste visual)
  if (elOcupacao) elOcupacao.textContent = "72%";
  if (elReceita) elReceita.textContent = "R$ 3.450,00";
  if (elReservasFuturas) elReservasFuturas.textContent = "18";
}

function initMiniMapaUhs() {
  const container = document.getElementById("miniMapaUhs");
  if (!container) return;

  // Exemplo simples de 6 UHs – depois podemos puxar isso do Supabase
  const uhs = [
    { nome: "101", status: "livre" },
    { nome: "102", status: "ocupado" },
    { nome: "103", status: "limpeza" },
    { nome: "104", status: "manutencao" },
    { nome: "105", status: "bloqueado" },
    { nome: "106", status: "livre" },
  ];

  container.innerHTML = "";

  uhs.forEach((uh) => {
    const card = document.createElement("div");
    card.classList.add("uh-card", `status-${uh.status}`);
    card.innerHTML = `
      <strong>UH ${uh.nome}</strong>
      <span>${
        uh.status === "livre" ? "Livre" :
        uh.status === "ocupado" ? "Ocupado" :
        uh.status === "limpeza" ? "Em limpeza" :
        uh.status === "manutencao" ? "Em manutenção" :
        "Bloqueado"
      }</span>
    `;
    container.appendChild(card);
  });
}

function initMovimentosHoje() {
  const container = document.getElementById("listaMovimentosHoje");
  if (!container) return;

  const movimentos = [
    { tipo: "Check-in", hospede: "Marcos C.", uh: "102", hora: "14:00" },
    { tipo: "Check-out", hospede: "Ana P.", uh: "205", hora: "11:00" },
    { tipo: "Check-in", hospede: "Família Souza", uh: "301", hora: "16:30" },
  ];

  container.innerHTML = "";

  movimentos.forEach((mov) => {
    const row = document.createElement("div");
    row.classList.add("reserva-item");
    row.innerHTML = `
      <div>
        <strong>${mov.tipo}</strong>
        <p>${mov.hospede}</p>
      </div>
      <div style="text-align:right;">
        <p>UH ${mov.uh}</p>
        <p>${mov.hora}</p>
      </div>
    `;
    container.appendChild(row);
  });
}

// --------------------------------------------------
// (Opcional) Proteção simples de rota – versão inicial
// Depois a gente troca para supabase.auth.getUser()
// --------------------------------------------------
function protectDashboard() {
  // Se quiser já bloquear acesso sem usuário, descomenta abaixo
  /*
  const user = loadUserFromStorage();
  if (!user) {
    window.location.href = "/login.html";
  }
  */
}

// --------------------------------------------------
// BOOT
// --------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  applyUserInfo();
  initLogout();
  initDashboardMetrics();
  initMiniMapaUhs();
  initMovimentosHoje();
  protectDashboard();
});
