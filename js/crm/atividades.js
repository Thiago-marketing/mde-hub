// crm-atividades.js
let leadsCache = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarLeadsParaSelect();
  carregarAtividades();

  document.getElementById("atividadeForm").addEventListener("submit", salvarAtividade);
  document.getElementById("filtroLeadNome").addEventListener("input", carregarAtividades);
  document.getElementById("filtroResp").addEventListener("input", carregarAtividades);
});

async function carregarLeadsParaSelect() {
  const { data: leads, error } = await supa
    .from("leads")
    .select("id, nome")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar leads:", error);
    return;
  }

  leadsCache = leads;

  const sel = document.getElementById("atividadeLead");
  sel.innerHTML = "";
  leads.forEach(l => {
    sel.innerHTML += `<option value="${l.id}">${l.nome}</option>`;
  });
}

async function salvarAtividade(e) {
  e.preventDefault();

  const payload = {
    lead_id: parseInt(document.getElementById("atividadeLead").value, 10),
    tipo: document.getElementById("atividadeTipo").value,
    responsavel: document.getElementById("atividadeResponsavel").value,
    descricao: document.getElementById("atividadeDescricao").value
  };

  const { error } = await supa.from("atividades").insert(payload);

  if (error) {
    console.error("Erro ao salvar atividade:", error);
    alert("Erro ao salvar atividade");
    return;
  }

  document.getElementById("atividadeForm").reset();
  document.getElementById("atividadeStatus").innerText = "Atividade registrada!";
  setTimeout(() => (document.getElementById("atividadeStatus").innerText = ""), 2500);

  carregarAtividades();
}

async function carregarAtividades() {
  const { data: atividades, error } = await supa
    .from("atividades")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Erro ao buscar atividades:", error);
    return;
  }

  const filtroLead = document.getElementById("filtroLeadNome").value.toLowerCase();
  const filtroResp = document.getElementById("filtroResp").value.toLowerCase();

  const tbody = document.getElementById("atividadesBody");
  tbody.innerHTML = "";

  atividades.forEach(a => {
    const lead = leadsCache.find(l => l.id === a.lead_id);
    const nomeLead = lead ? lead.nome : "—";

    const passaLead = filtroLead
      ? nomeLead.toLowerCase().includes(filtroLead)
      : true;

    const passaResp = filtroResp
      ? (a.responsavel || "").toLowerCase().includes(filtroResp)
      : true;

    if (!passaLead || !passaResp) return;

    tbody.innerHTML += `
      <tr>
        <td>${a.created_at ? new Date(a.created_at).toLocaleString() : "-"}</td>
        <td>${nomeLead}</td>
        <td>${a.tipo}</td>
        <td>${a.responsavel || "-"}</td>
        <td>${a.descricao}</td>
      </tr>
    `;
  });
}
