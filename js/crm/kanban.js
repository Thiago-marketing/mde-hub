// Carregar módulos
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarLeadsKanban();
});


// ===============================
// BUSCAR TODOS OS LEADS
// ===============================

async function carregarLeadsKanban() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  montarKanban(data);
}


// ===============================
// MONTAR KANBAN COM LEADS
// ===============================

function montarKanban(leads) {
  const etapas = [
    "novo",
    "qualificando",
    "demonstracao",
    "proposta",
    "fechamento",
    "perdido"
  ];

  etapas.forEach(etapa => {
    document.getElementById(`col-${etapa}`).innerHTML = "";
  });

  leads.forEach(lead => {
    const card = criarCardLead(lead);
    document.getElementById(`col-${lead.etapa}`).appendChild(card);
  });

  ativarDragAndDrop();
}


// ===============================
// CRIAR CARD HTML
// ===============================

function criarCardLead(lead) {
  const div = document.createElement("div");
  div.className = "kanban-card";
  div.draggable = true;
  div.dataset.id = lead.id;

  const dataProx = lead.proximo_contato
    ? new Date(lead.proximo_contato).toLocaleDateString("pt-BR")
    : "-";

  div.innerHTML = `
    <strong>${lead.nome}</strong>
    <p>${lead.empresa || ""}</p>
    <small>Resp.: ${lead.responsavel || "-"}</small><br>
    <small>Próx.: ${dataProx}</small>
  `;

  return div;
}


// ===============================
// DRAG & DROP
// ===============================

function ativarDragAndDrop() {
  const cards = document.querySelectorAll(".kanban-card");
  const columns = document.querySelectorAll(".kanban-list");

  cards.forEach(card => {
    card.addEventListener("dragstart", () => {
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", async () => {
      card.classList.remove("dragging");

      const id = card.dataset.id;
      const novaEtapa = card.parentElement.parentElement.dataset.etapa;

      await atualizarEtapa(id, novaEtapa);
    });
  });

  columns.forEach(col => {
    col.addEventListener("dragover", e => {
      e.preventDefault();
      const dragging = document.querySelector(".kanban-card.dragging");
      col.appendChild(dragging);
    });
  });
}


// ===============================
// ATUALIZAR ETAPA NO SUPABASE
// ===============================

async function atualizarEtapa(id, etapa) {
  const { error } = await supabase
    .from("leads")
    .update({ etapa })
    .eq("id", id);

  if (error) {
    console.error("Erro ao mover lead:", error);
    alert("Erro ao atualizar etapa.");
  }
}
