// crm-kanban.js
const ETAPAS = [
  { id: "novo", label: "Novo" },
  { id: "qualificando", label: "Qualificando" },
  { id: "proposta", label: "Proposta" },
  { id: "negociando", label: "Negociando" },
  { id: "ganho", label: "Fechado ganho" },
  { id: "perdido", label: "Fechado perdido" }
];

let leadsKanban = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarKanban();
});

async function carregarKanban() {
  const { data: leads, error } = await supa
    .from("leads")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao carregar leads:", error);
    return;
  }

  leadsKanban = leads;
  montarColunas();
}

function montarColunas() {
  const board = document.getElementById("kanbanBoard");
  board.innerHTML = "";

  ETAPAS.forEach(etapa => {
    const col = document.createElement("div");
    col.className = "kanban-col";
    col.dataset.etapa = etapa.id;
    col.innerHTML = `
      <h2>${etapa.label}</h2>
      <div class="kanban-col-body"
           ondragover="permitirDrop(event)"
           ondrop="soltarCard(event, '${etapa.id}')"></div>
    `;
    board.appendChild(col);
  });

  // colocar cards
  leadsKanban.forEach(lead => {
    const colBody = board.querySelector(
      `.kanban-col[data-etapa="${lead.etapa || "novo"}"] .kanban-col-body`
    ) || board.querySelector(`.kanban-col[data-etapa="novo"] .kanban-col-body`);

    const card = document.createElement("div");
    card.className = "kanban-card";
    card.draggable = true;
    card.dataset.id = lead.id;
    card.ondragstart = arrastarCard;
    card.innerHTML = `
      <strong>${lead.nome || "Sem nome"}</strong>
      <span>${lead.origem || "-"}</span>
      <small>${lead.responsavel || ""}</small>
    `;
    colBody.appendChild(card);
  });
}

/* Drag and drop */
function arrastarCard(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.dataset.id);
}

function permitirDrop(ev) {
  ev.preventDefault();
}

async function soltarCard(ev, novaEtapa) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text/plain");

  await supa.from("leads").update({ etapa: novaEtapa }).eq("id", id);
  await carregarKanban();
}
