/***************************************************
 * PMS Lite – Reservas com Calendário Visual
 * MDE Hub • BRsys
 ***************************************************/

// Supabase client global (vem de /js/supabase.js)
const sb = supabase;

// DOM Elements
const calendarGrid = document.getElementById("calendarGrid");
const weekLabel = document.getElementById("weekLabel");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

// Modal
const modalReserva = document.getElementById("modalReserva");
const modalTitle = document.getElementById("modalTitle");
const reservaForm = document.getElementById("reservaForm");
const btnCancel = document.getElementById("btnCancel");

// Form inputs
const inputReservaId = document.getElementById("reservaId");
const selectReservaUH = document.getElementById("reservaUH");
const inputHospede = document.getElementById("reservaHospede");
const inputTelefone = document.getElementById("reservaTelefone");
const inputOrigem = document.getElementById("reservaOrigem");
const inputCheckin = document.getElementById("reservaCheckin");
const inputCheckout = document.getElementById("reservaCheckout");
const inputAdultos = document.getElementById("reservaAdultos");
const inputCriancas = document.getElementById("reservaCriancas");

// Estado em memória
let uhs = [];
let reservas = [];
let currentWeekStart = getMonday(new Date()); // início da semana atual (segunda)

// ================== Helpers de Data ==================

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Dom,1=Seg,...
  const diff = (day === 0 ? -6 : 1) - day; // ajustar pra segunda
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateISO(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(date) {
  const d = new Date(date);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const nomeDia = diasSemana[d.getDay()];
  return `${nomeDia} ${dia}/${mes}`;
}

function formatRangeLabel(start, end) {
  const ds = new Date(start);
  const de = new Date(end);
  const diaS = String(ds.getDate()).padStart(2, "0");
  const mesS = String(ds.getMonth() + 1).padStart(2, "0");
  const diaE = String(de.getDate()).padStart(2, "0");
  const mesE = String(de.getMonth() + 1).padStart(2, "0");
  const ano = ds.getFullYear();
  return `${diaS}/${mesS} – ${diaE}/${mesE}/${ano}`;
}

// ================== Supabase – Carregamento ==================

async function loadUhs() {
  const { data, error } = await sb
    .from("uhs")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao carregar UHs:", error);
    alert("Erro ao carregar UHs.");
    return [];
  }

  uhs = data || [];
  preencherSelectUH();
  return uhs;
}

function labelUH(uh) {
  // Flexível para futuro: se você criar numero/categoria, ele usa.
  const numero = uh.numero || "";
  const nome = uh.nome || "";
  const categoria = uh.categoria || "";

  if (numero && categoria) return `${numero} (${categoria})`;
  if (numero && nome) return `${numero} – ${nome}`;
  if (nome) return nome;
  if (numero) return `UH ${numero}`;
  return `UH ${uh.id}`;
}

function preencherSelectUH() {
  selectReservaUH.innerHTML = "";
  uhs.forEach((uh) => {
    const opt = document.createElement("option");
    opt.value = uh.id;
    opt.textContent = labelUH(uh);
    selectReservaUH.appendChild(opt);
  });
}

async function loadReservasInRange(weekStart) {
  // traz reservas que tenham QUALQUER DIA dentro da semana
  const startISO = formatDateISO(weekStart);
  const endDate = addDays(weekStart, 7);
  const endISO = formatDateISO(endDate);

  const { data, error } = await sb
    .from("reservas")
    .select("*")
    .lt("checkout", endISO)  // checkout < fim da semana
    .gt("checkin", startISO) // checkin > antes do fim da semana anterior
    .order("checkin", { ascending: true });

  if (error) {
    console.error("Erro ao carregar reservas:", error);
    alert("Erro ao carregar reservas.");
    return [];
  }

  reservas = data || [];
  return reservas;
}

// ================== Renderização do Calendário ==================

async function renderCalendar() {
  if (!uhs || uhs.length === 0) {
    await loadUhs();
  }

  await loadReservasInRange(currentWeekStart);

  // Label superior
  const endWeek = addDays(currentWeekStart, 6);
  weekLabel.textContent = formatRangeLabel(currentWeekStart, endWeek);

  // Limpa grid
  calendarGrid.innerHTML = "";

  // Cabeçalho: coluna UH + 7 dias
  const headerUH = document.createElement("div");
  headerUH.className = "day-cell";
  headerUH.textContent = "UH / Dia";
  calendarGrid.appendChild(headerUH);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(currentWeekStart, i);
    days.push(dayDate);

    const dayCell = document.createElement("div");
    dayCell.className = "day-cell";
    dayCell.textContent = formatDateLabel(dayDate);
    calendarGrid.appendChild(dayCell);
  }

  // Mapa rápido de reservas por UH
  const reservasPorUH = {};
  reservas.forEach((res) => {
    if (!reservasPorUH[res.uh_id]) reservasPorUH[res.uh_id] = [];
    reservasPorUH[res.uh_id].push(res);
  });

  // Linhas por UH
  uhs.forEach((uh) => {
    // Coluna UH
    const uhNameCell = document.createElement("div");
    uhNameCell.className = "uh-name";
    uhNameCell.textContent = labelUH(uh);
    calendarGrid.appendChild(uhNameCell);

    // 7 colunas de dias
    for (let i = 0; i < 7; i++) {
      const cellDate = days[i];
      const cellISO = formatDateISO(cellDate);

      const cell = document.createElement("div");
      cell.className = "calendar-cell";
      cell.style.minHeight = "40px";
      cell.dataset.uhId = uh.id;
      cell.dataset.date = cellISO;

      // Reservas desta UH que cobrem este dia
      const reservasUH = reservasPorUH[uh.id] || [];
      const reservasNoDia = reservasUH.filter((res) => {
        // Check-in <= dia < Check-out
        return res.checkin <= cellISO && cellISO < res.checkout;
      });

      if (reservasNoDia.length === 0) {
        // Célula vazia – clique cria nova reserva
        cell.classList.add("calendar-cell-empty");
        cell.addEventListener("click", () => {
          abrirModalNovaReserva(uh.id, cellISO);
        });
      } else {
        reservasNoDia.forEach((res) => {
          const block = document.createElement("div");
          block.className = "reserva-block";
          block.textContent = res.hospede || "Reserva";
          block.title = `${res.hospede || ""}\n${res.checkin} → ${res.checkout}`;

          block.addEventListener("click", (e) => {
            if (e.altKey) {
              // atalho: ALT + click = excluir direto
              excluirReserva(res.id);
            } else {
              abrirModalEditarReserva(res);
            }
          });

          cell.appendChild(block);
        });
      }

      calendarGrid.appendChild(cell);
    }
  });
}

// ================== Modal – Abrir / Fechar ==================

function abrirModalNovaReserva(uhId, dataISO) {
  inputReservaId.value = "";
  reservaForm.reset();

  if (uhId) {
    selectReservaUH.value = uhId;
  }

  if (dataISO) {
    inputCheckin.value = dataISO;
    // Checkout = dia seguinte
    const checkoutDate = addDays(new Date(dataISO), 1);
    inputCheckout.value = formatDateISO(checkoutDate);
  }

  if (!inputAdultos.value) inputAdultos.value = 1;
  if (!inputCriancas.value) inputCriancas.value = 0;

  modalTitle.textContent = "Nova Reserva";
  modalReserva.classList.remove("hidden");
}

function abrirModalEditarReserva(res) {
  inputReservaId.value = res.id;
  selectReservaUH.value = res.uh_id;
  inputHospede.value = res.hospede || "";
  inputTelefone.value = res.telefone || "";
  inputOrigem.value = res.origem || "";
  inputCheckin.value = res.checkin;
  inputCheckout.value = res.checkout;
  inputAdultos.value = res.adultos ?? 1;
  inputCriancas.value = res.criancas ?? 0;

  modalTitle.textContent = "Editar Reserva";
  modalReserva.classList.remove("hidden");
}

btnCancel.addEventListener("click", () => {
  modalReserva.classList.add("hidden");
});

// Fecha modal clicando fora do conteúdo
modalReserva.addEventListener("click", (e) => {
  if (e.target === modalReserva) {
    modalReserva.classList.add("hidden");
  }
});

// ================== Salvar Reserva (Create/Update) ==================

reservaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = inputReservaId.value ? Number(inputReservaId.value) : null;
  const uh_id = Number(selectReservaUH.value);
  const hospede = inputHospede.value.trim();
  const telefone = inputTelefone.value.trim();
  const origem = inputOrigem.value.trim();
  const checkin = inputCheckin.value;
  const checkout = inputCheckout.value;
  const adultos = Number(inputAdultos.value || 1);
  const criancas = Number(inputCriancas.value || 0);

  if (!uh_id || !checkin || !checkout) {
    alert("Preencha UH, check-in e check-out.");
    return;
  }

  if (checkout <= checkin) {
    alert("Check-out deve ser após o check-in.");
    return;
  }

  const payload = {
    uh_id,
    hospede,
    telefone,
    origem,
    checkin,
    checkout,
    adultos,
    criancas
  };

  let error;

  if (id) {
    ({ error } = await sb.from("reservas").update(payload).eq("id", id));
  } else {
    ({ error } = await sb.from("reservas").insert([payload]));
  }

  if (error) {
    console.error("Erro ao salvar reserva:", error);
    alert("Erro ao salvar reserva.");
    return;
  }

  modalReserva.classList.add("hidden");
  await renderCalendar();
  alert("Reserva salva com sucesso!");
});

// ================== Excluir Reserva ==================

async function excluirReserva(id) {
  if (!confirm("Deseja realmente excluir esta reserva?")) return;

  const { error } = await sb.from("reservas").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir reserva:", error);
    alert("Erro ao excluir reserva.");
    return;
  }

  await renderCalendar();
  alert("Reserva excluída.");
}

// ================== Navegação de Semana ==================

btnPrev.addEventListener("click", async () => {
  currentWeekStart = addDays(currentWeekStart, -7);
  await renderCalendar();
});

btnNext.addEventListener("click", async () => {
  currentWeekStart = addDays(currentWeekStart, 7);
  await renderCalendar();
});

// ================== Inicialização ==================

document.addEventListener("DOMContentLoaded", async () => {
  await loadUhs();
  await renderCalendar();
});
