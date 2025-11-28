/***************************************************
 * PMS Lite – Gestão de UHs
 * MDE Hub • BRsys
 ***************************************************/

// Supabase global client (vem do /js/supabase.js)
const sb = supabase;

// DOM
const uhForm = document.getElementById("uhForm");
const inputNome = document.getElementById("uhNome");
const inputStatus = document.getElementById("uhStatus");
const uhList = document.getElementById("uhList");

let editId = null;

// =======================================
// Carregar UHs
// =======================================

async function loadUhs() {
  const { data, error } = await sb
    .from("uhs")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao carregar UHs:", error);
    alert("Erro ao carregar unidades.");
    return;
  }

  renderUhs(data);
}

// =======================================
// Renderizar lista
// =======================================

function renderUhs(lista) {
  uhList.innerHTML = "";

  if (!lista || lista.length === 0) {
    uhList.innerHTML = `<p style="color:#8fbaff;">Nenhuma UH cadastrada.</p>`;
    return;
  }

  lista.forEach((uh) => {
    const div = document.createElement("div");
    div.className = "uh-item";

    div.innerHTML = `
      <div>
        <strong>${uh.nome}</strong><br>
        <small style="color:#8fbaff;">Status: ${formatStatus(uh.status)}</small>
      </div>

      <div>
        <button class="btn-primary" style="padding:6px 10px;margin-right:8px;" onclick="editarUH(${uh.id}, '${uh.nome}', '${uh.status}')">
          Editar
        </button>

        <button class="btn-delete" onclick="excluirUH(${uh.id})">
          Excluir
        </button>
      </div>
    `;

    uhList.appendChild(div);
  });
}

// Texto formatado
function formatStatus(s) {
  switch (s) {
    case "livre": return "Livre (verde)";
    case "ocupado": return "Ocupado (vermelho)";
    case "limpeza": return "Limpeza (azul)";
    case "manutencao": return "Manutenção (cinza)";
    case "bloqueado": return "Bloqueado (preto)";
    default: return s;
  }
}

// =======================================
// Criar / Atualizar UH
// =======================================

uhForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  const status = inputStatus.value;

  if (!nome) {
    alert("Digite o nome da UH.");
    return;
  }

  const payload = { nome, status };

  let error;

  if (editId) {
    // Atualizar
    ({ error } = await sb
      .from("uhs")
      .update(payload)
      .eq("id", editId));
  } else {
    // Criar novo
    ({ error } = await sb
      .from("uhs")
      .insert([payload]));
  }

  if (error) {
    console.error("Erro ao salvar UH:", error);
    alert("Erro ao salvar unidade.");
    return;
  }

  // Resetar form
  uhForm.reset();
  editId = null;
  inputStatus.value = "livre";

  loadUhs();
});

// =======================================
// Editar UH (preenche form)
// =======================================

function editarUH(id, nome, status) {
  editId = id;
  inputNome.value = nome;
  inputStatus.value = status;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =======================================
// Excluir UH
// =======================================

async function excluirUH(id) {
  if (!confirm("Deseja realmente excluir esta UH?")) return;

  const { error } = await sb.from("uhs").delete().eq("id", id);

  if (error) {
    console.error("Erro ao excluir UH:", error);
    alert("Erro ao excluir unidade.");
    return;
  }

  loadUhs();
}

// =======================================
// Inicialização
// =======================================

document.addEventListener("DOMContentLoaded", loadUhs);
