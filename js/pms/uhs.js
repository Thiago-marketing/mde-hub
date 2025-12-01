// js/uhs.js
// Tela de Unidades Habitacionais – MDE Hub Lite
// IMPORTANTE: garante que o arquivo supabaseClient.js exponha a constante "supabase"

let currentHotelId = null;   // deve vir do login / seleção de hotel
let uhs = [];                // cache local

document.addEventListener("DOMContentLoaded", async () => {
  // Aqui você pode puxar usuário / hotel atual do localStorage
  try {
    const storedHotelId = localStorage.getItem("mde_current_hotel_id");
    if (!storedHotelId) {
      console.warn("Nenhum hotel selecionado. Defina mde_current_hotel_id no login.");
    } else {
      currentHotelId = storedHotelId;
    }
  } catch (err) {
    console.error("Erro ao ler hotel atual:", err);
  }

  // Bind dos elementos
  const btnNovaUh = document.querySelector("#btnNovaUh");
  const filtroUh = document.querySelector("#filtroUh");
  const btnSalvarUh = document.querySelector("#btnSalvarUh");
  const btnCancelarUh = document.querySelector("#btnCancelarUh");
  const btnFecharModalUh = document.querySelector("#btnFecharModalUh");

  btnNovaUh?.addEventListener("click", () => abrirModalUh());
  filtroUh?.addEventListener("input", filtrarUhs);
  btnSalvarUh?.addEventListener("click", salvarUh);
  btnCancelarUh?.addEventListener("click", fecharModalUh);
  btnFecharModalUh?.addEventListener("click", fecharModalUh);

  await carregarUhs();
});

// ------------------------------------------------------
// SUPABASE – CARREGAR, CRIAR, ATUALIZAR, EXCLUIR
// ------------------------------------------------------

async function carregarUhs() {
  const tbody = document.querySelector("#tbodyUhs");
  const vazio = document.querySelector("#estadoVazioUhs");

  tbody.innerHTML = `<tr><td colspan="6">Carregando UHs...</td></tr>`;
  vazio.style.display = "none";

  let query = supabase.from("uhs").select("*").order("nome", { ascending: true });

  if (currentHotelId) {
    query = query.eq("hotel_id", currentHotelId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao carregar UHs:", error);
    tbody.innerHTML = `<tr><td colspan="6">Erro ao carregar UHs.</td></tr>`;
    return;
  }

  uhs = data || [];
  renderizarUhs(uhs);
}

function renderizarUhs(lista) {
  const tbody = document.querySelector("#tbodyUhs");
  const vazio = document.querySelector("#estadoVazioUhs");

  if (!lista || lista.length === 0) {
    tbody.innerHTML = "";
    vazio.style.display = "block";
    return;
  }

  vazio.style.display = "none";
  tbody.innerHTML = "";

  lista.forEach((uh) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${sanitize(uh.nome)}</td>
      <td>${sanitize(uh.tipo || "-")}</td>
      <td>${uh.capacidade || "-"}</td>
      <td>
        <span class="badge ${classeStatus(uh.status)}">
          ${labelStatus(uh.status)}
        </span>
      </td>
      <td>${formatarValor(uh.diaria_padrao)}</td>
      <td>
        <button class="btn-table small" onclick="editarUh('${uh.id}')">Editar</button>
        <button class="btn-table small danger" onclick="excluirUh('${uh.id}')">Excluir</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

async function salvarUh(event) {
  if (event) event.preventDefault();

  const btn = document.querySelector("#btnSalvarUh");
  btn.disabled = true;
  btn.textContent = "Salvando...";

  const id = document.querySelector("#uhId").value || null;
  const nome = document.querySelector("#uhNome").value.trim();
  const tipo = document.querySelector("#uhTipo").value.trim();
  const capacidade = Number(document.querySelector("#uhCapacidade").value || 0);
  const status = document.querySelector("#uhStatus").value;
  const diaria = document.querySelector("#uhDiaria").value
    ? Number(document.querySelector("#uhDiaria").value)
    : null;
  const observacoes = document
    .querySelector("#uhObservacoes")
    .value.trim();

  if (!nome) {
    alert("Informe o nome da UH.");
    btn.disabled = false;
    btn.textContent = "Salvar UH";
    return;
  }

  if (!currentHotelId) {
    alert("Nenhum hotel selecionado. Configure mde_current_hotel_id no login.");
    btn.disabled = false;
    btn.textContent = "Salvar UH";
    return;
  }

  const payload = {
    nome,
    tipo,
    capacidade,
    status,
    diaria_padrao: diaria,
    observacoes,
    hotel_id: currentHotelId,
  };

  let resp;
  if (id) {
    // update
    resp = await supabase.from("uhs").update(payload).eq("id", id).select().single();
  } else {
    // insert
    resp = await supabase.from("uhs").insert(payload).select().single();
  }

  const { data, error } = resp;

  btn.disabled = false;
  btn.textContent = "Salvar UH";

  if (error) {
    console.error("Erro ao salvar UH:", error);
    alert("Erro ao salvar a UH. Verifique o console.");
    return;
  }

  fecharModalUh();
  await carregarUhs();
}

function editarUh(id) {
  const uh = uhs.find((u) => String(u.id) === String(id));
  if (!uh) return;

  document.querySelector("#uhId").value = uh.id;
  document.querySelector("#uhNome").value = uh.nome || "";
  document.querySelector("#uhTipo").value = uh.tipo || "";
  document.querySelector("#uhCapacidade").value = uh.capacidade || 2;
  document.querySelector("#uhStatus").value = uh.status || "LIVRE";
  document.querySelector("#uhDiaria").value = uh.diaria_padrao || "";
  document.querySelector("#uhObservacoes").value = uh.observacoes || "";

  abrirModalUh("Editar UH");
}

async function excluirUh(id) {
  const uh = uhs.find((u) => String(u.id) === String(id));
  if (!uh) return;

  const confirma = confirm(`Tem certeza que deseja excluir a UH "${uh.nome}"?`);
  if (!confirma) return;

  const { error } = await supabase.from("uhs").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir UH:", error);
    alert("Erro ao excluir a UH. Verifique o console.");
    return;
  }

  await carregarUhs();
}

// ------------------------------------------------------
// MODAL / UI
// ------------------------------------------------------

function abrirModalUh(titulo = "Nova UH") {
  const modal = document.querySelector("#modalUh");
  const tituloEl = document.querySelector("#modalUhTitulo");

  tituloEl.textContent = titulo;

  if (titulo === "Nova UH") {
    // limpa o form
    document.querySelector("#uhId").value = "";
    document.querySelector("#formUh").reset();
    document.querySelector("#uhStatus").value = "LIVRE";
  }

  modal.classList.remove("hidden");
}

function fecharModalUh() {
  const modal = document.querySelector("#modalUh");
  modal.classList.add("hidden");
}

// ------------------------------------------------------
// FILTRO LOCAL
// ------------------------------------------------------

function filtrarUhs(event) {
  const termo = event.target.value.toLowerCase().trim();

  if (!termo) {
    renderizarUhs(uhs);
    return;
  }

  const filtradas = uhs.filter((u) => {
    const nome = (u.nome || "").toLowerCase();
    const tipo = (u.tipo || "").toLowerCase();
    const status = (u.status || "").toLowerCase();
    return (
      nome.includes(termo) ||
      tipo.includes(termo) ||
      status.includes(termo)
    );
  });

  renderizarUhs(filtradas);
}

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------

function sanitize(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatarValor(v) {
  if (v === null || v === undefined || v === "") return "-";
  return Number(v).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function labelStatus(status) {
  switch (status) {
    case "OCUPADO":
      return "Ocupado";
    case "LIMPEZA":
      return "Limpeza";
    case "MANUTENCAO":
      return "Manutenção";
    case "BLOQUEADO":
      return "Bloqueado";
    default:
      return "Livre";
  }
}

function classeStatus(status) {
  switch (status) {
    case "OCUPADO":
      return "status-ocupado";
    case "LIMPEZA":
      return "status-limpeza";
    case "MANUTENCAO":
      return "status-manutencao";
    case "BLOQUEADO":
      return "status-bloqueado";
    default:
      return "status-livre";
  }
}
