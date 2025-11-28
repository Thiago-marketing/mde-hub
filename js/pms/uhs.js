// ======================================================
// MDE Hub – PMS Lite
// Unidades Habitacionais (UHs) – CRUD + Mapa + Lista
// ======================================================

// ELEMENTOS DA PÁGINA
const modal = document.getElementById("modalUH");
const modalTitle = document.getElementById("modalTitle");

const btnAddUH = document.getElementById("btnAddUH");
const btnCancel = document.getElementById("btnCancel");
const uhForm = document.getElementById("uhForm");

const uhIdInput = document.getElementById("uhId");
const numeroInput = document.getElementById("numeroUH");
const categoriaInput = document.getElementById("categoriaUH");
const statusInput = document.getElementById("statusUH");
const precoInput = document.getElementById("precoUH");
const fotoInput = document.getElementById("fotoUH");

const uhGrid = document.getElementById("uhGrid");
const uhTableBody = document.getElementById("uhTableBody");
const uhResumo = document.getElementById("uhResumo");

// ===================== ABRIR / FECHAR MODAL =====================

btnAddUH?.addEventListener("click", () => {
  openModal();
});

btnCancel?.addEventListener("click", () => {
  closeModal();
});

// fecha clicando fora do conteúdo do modal
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function openModal(editData = null) {
  if (!modal) return;

  modal.classList.remove("hidden");

  if (editData) {
    modalTitle.innerText = "Editar UH";

    uhIdInput.value = editData.id;
    numeroInput.value = editData.numero;
    categoriaInput.value = editData.categoria || "";
    statusInput.value = editData.status || "livre";
    precoInput.value = editData.preco || "";
    // foto não é recarregada no input file (por padrão do browser)
  } else {
    modalTitle.innerText = "Nova UH";
    uhForm.reset();
    uhIdInput.value = "";
    statusInput.value = "livre";
  }
}

function closeModal() {
  if (!modal) return;
  modal.classList.add("hidden");
}

// ===================== CARREGAR UHs =====================

async function loadUHs() {
  const { data, error } = await supabase
    .from("uhs") // troque para "uh" se criar a tabela com esse nome
    .select("*")
    .order("numero", { ascending: true });

  if (error) {
    console.error(error);
    showError?.("Erro ao carregar UHs.");
    return;
  }

  renderMapa(data || []);
  renderTabela(data || []);
  renderResumo(data || []);
}

// ===================== RENDER MAPA =====================

function renderMapa(uhs) {
  if (!uhGrid) return;

  uhGrid.innerHTML = "";

  if (!uhs.length) {
    uhGrid.innerHTML = `<p class="subtitle">Nenhuma UH cadastrada ainda.</p>`;
    return;
  }

  uhs.forEach((uh) => {
    const card = document.createElement("div");
    card.classList.add("uh-card");

    // adiciona classe de status para usar as cores do CSS
    const statusClass = getStatusClass(uh.status || "livre");
    if (statusClass) card.classList.add(statusClass);

    card.innerHTML = `
      <div class="uh-card-header">
        <span class="uh-number">${escapeHtml(uh.numero)}</span>
      </div>
      <div class="uh-card-body">
        <span class="uh-category">${uh.categoria || "-"}</span>
        <span class="uh-status-label">${labelStatus(uh.status)}</span>
      </div>
    `;

    uhGrid.appendChild(card);
  });
}

// ===================== RENDER TABELA =====================

function renderTabela(uhs) {
  if (!uhTableBody) return;

  uhTableBody.innerHTML = "";

  if (!uhs.length) {
    uhTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">Nenhuma UH cadastrada.</td>
      </tr>
    `;
    return;
  }

  uhs.forEach((uh) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${escapeHtml(uh.numero)}</td>
      <td>${uh.categoria || "-"}</td>
      <td>${labelStatus(uh.status)}</td>
      <td>${formatPreco(uh.preco)}</td>
      <td>
        <button class="btn-mini btn-blue" data-edit-id="${uh.id}">Editar</button>
        <button class="btn-mini btn-red" data-delete-id="${uh.id}">Excluir</button>
      </td>
    `;

    uhTableBody.appendChild(tr);
  });

  // eventos dos botões
  uhTableBody.querySelectorAll("[data-edit-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-edit-id"), 10);
      handleEdit(id);
    });
  });

  uhTableBody.querySelectorAll("[data-delete-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-delete-id"), 10);
      handleDelete(id);
    });
  });
}

// ===================== RENDER RESUMO =====================

function renderResumo(uhs) {
  if (!uhResumo) return;

  if (!uhs.length) {
    uhResumo.textContent = "Nenhuma UH cadastrada.";
    return;
  }

  const total = uhs.length;
  const cont = {
    livre: 0,
    ocupado: 0,
    limpeza: 0,
    manutencao: 0,
    bloqueado: 0,
  };

  uhs.forEach((uh) => {
    const s = (uh.status || "livre").toLowerCase();
    if (cont[s] !== undefined) cont[s]++;
  });

  uhResumo.textContent =
    `Total: ${total} | ` +
    `Livre: ${cont.livre} | ` +
    `Ocupado: ${cont.ocupado} | ` +
    `Limpeza: ${cont.limpeza} | ` +
    `Manutenção: ${cont.manutencao} | ` +
    `Bloqueado: ${cont.bloqueado}`;
}

// ===================== SUBMIT FORM (CREATE / UPDATE) =====================

uhForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = uhIdInput.value ? parseInt(uhIdInput.value, 10) : null;
  const numeroRaw = numeroInput.value.trim();
  const categoria = categoriaInput.value.trim();
  const status = statusInput.value;
  const preco = precoInput.value ? Number(precoInput.value) : null;

  if (!numeroRaw) {
    showError?.("Informe o número ou nome da UH.");
    return;
  }

  // valida duplicidade
  const jaExiste = await existsNumero(numeroRaw, id);
  if (jaExiste) {
    showError?.("Já existe uma UH com este número/nome.");
    return;
  }

  let fotoBase64 = null;
  if (fotoInput.files && fotoInput.files.length > 0) {
    try {
      fotoBase64 = await fileToBase64(fotoInput.files[0]);
    } catch (err) {
      console.error(err);
      showError?.("Erro ao processar a foto da UH.");
      return;
    }
  }

  const payload = {
    numero: numeroRaw,
    categoria: categoria || null,
    status: status || "livre",
    preco: preco !== null && !isNaN(preco) ? preco : null,
    foto: fotoBase64 || null,
  };

  let error;

  if (id) {
    ({ error } = await supabase
      .from("uhs")
      .update(payload)
      .eq("id", id));
  } else {
    ({ error } = await supabase
      .from("uhs")
      .insert([payload]));
  }

  if (error) {
    console.error(error);
    showError?.("Erro ao salvar UH.");
    return;
  }

  showSuccess?.(id ? "UH atualizada com sucesso." : "UH cadastrada com sucesso.");
  closeModal();
  await loadUHs();
});

// ===================== EDITAR =====================

async function handleEdit(id) {
  const { data, error } = await supabase
    .from("uhs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    showError?.("Erro ao carregar dados da UH.");
    return;
  }

  openModal(data);
}

// ===================== EXCLUIR =====================

async function handleDelete(id) {
  const confirmar = confirm("Deseja realmente excluir esta UH?");
  if (!confirmar) return;

  const { error } = await supabase
    .from("uhs")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    showError?.("Erro ao excluir UH.");
    return;
  }

  showSuccess?.("UH excluída com sucesso.");
  await loadUHs();
}

// ===================== DUPLICIDADE =====================

async function existsNumero(numero, ignoreId = null) {
  const { data, error } = await supabase
    .from("uhs")
    .select("id, numero")
    .eq("numero", numero)
    .limit(1);

  if (error) {
    console.error(error);
    return false; // em caso de erro, não bloqueia o cadastro
  }

  if (!data || data.length === 0) return false;

  const found = data[0];

  if (ignoreId && found.id === ignoreId) return false;

  return true;
}

// ===================== HELPERS =====================

function getStatusClass(status) {
  const s = (status || "livre").toLowerCase();

  switch (s) {
    case "livre":
      return "status-livre";
    case "ocupado":
      return "status-ocupado";
    case "limpeza":
      return "status-limpeza";
    case "manutencao":
      return "status-manutencao";
    case "bloqueado":
      return "status-bloqueado";
    default:
      return "status-livre";
  }
}

function labelStatus(status) {
  const s = (status || "livre").toLowerCase();

  switch (s) {
    case "livre":
      return "Livre";
    case "ocupado":
      return "Ocupado";
    case "limpeza":
      return "Limpeza";
    case "manutencao":
      return "Manutenção";
    case "bloqueado":
      return "Bloqueado";
    default:
      return "Livre";
  }
}

function formatPreco(valor) {
  if (valor === null || valor === undefined || isNaN(Number(valor))) return "-";
  return `R$ ${Number(valor).toFixed(2)}`;
}

// converter arquivo para base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

// evitar XSS básico
function escapeHtml(text) {
  if (!text && text !== 0) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ===================== INICIALIZAÇÃO =====================

document.addEventListener("DOMContentLoaded", () => {
  loadUHs();
});
