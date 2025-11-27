// crm-dashboard.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarKPIs();
  carregarUltimosLeads();
});

async function carregarKPIs() {
  const { data: leads, error } = await supa
    .from("leads")
    .select("*");

  if (error) {
    console.error("Erro ao buscar leads:", error);
    return;
  }

  const total = leads.length;
  const emAberto = leads.filter(l => l.status === "aberto" || !l.status).length;
  const propostas = leads.filter(l => l.etapa === "proposta").length;
  const ganhos = leads.filter(l => l.etapa === "ganho").length;

  document.getElementById("kpiTotalLeads").textContent = total;
  document.getElementById("kpiEmAberto").textContent = emAberto;
  document.getElementById("kpiPropostas").textContent = propostas;
  document.getElementById("kpiGanhos").textContent = ganhos;
}

async function carregarUltimosLeads() {
  const { data: leads, error } = await supa
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Erro ao carregar últimos leads:", error);
    return;
  }

  const tbody = document.getElementById("ultimosLeadsBody");
  tbody.innerHTML = "";

  leads.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.nome || "-"}</td>
      <td>${l.origem || "-"}</td>
      <td>${l.etapa || "-"}</td>
      <td>${l.responsavel || "-"}</td>
      <td>${l.created_at ? new Date(l.created_at).toLocaleDateString() : "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}
