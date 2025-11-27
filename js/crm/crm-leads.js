// crm-leads.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarLeads();

  document.getElementById("leadForm").addEventListener("submit", salvarLead);
  document.getElementById("filtroEtapa").addEventListener("change", carregarLeads);
  document.getElementById("filtroResponsavel").addEventListener("input", carregarLeads);
});

async function carregarLeads() {
  const { data: leads, error } = await supa
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar leads:", error);
    return;
  }

  const etapaFiltro = document.getElementById("filtroEtapa").value;
  const respFiltro  = document.getElementById("filtroResponsavel").value.toLowerCase();

  const filtrados = leads.filter(l => {
    const etapaOk = etapaFiltro ? l.etapa === etapaFiltro : true;
    const respOk  = respFiltro ? (l.responsavel || "").toLowerCase().includes(respFiltro) : true;
    return etapaOk && respOk;
  });

  const tbody = document.getElementById("leadsTableBody");
  tbody.innerHTML = "";

  filtrados.forEach(l => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${l.nome || "-"}</td>
      <td>${l.origem || "-"}</td>
      <td>
        <select onchange="alterarEtapa(${l.id}, this.value)">
          ${opcaoEtapa("novo", "Novo", l.etapa)}
          ${opcaoEtapa("qualificando", "Qualificando", l.etapa)}
          ${opcaoEtapa("proposta", "Proposta", l.etapa)}
          ${opcaoEtapa("negociando", "Negociando", l.etapa)}
          ${opcaoEtapa("ganho", "Ganho", l.etapa)}
          ${opcaoEtapa("perdido", "Perdido", l.etapa)}
        </select>
      </td>
      <td>
        <input type="text" value="${l.responsavel || ""}"
               onchange="alterarResponsavel(${l.id}, this.value)">
      </td>
      <td>R$ ${l.valor_estimado ? l.valor_estimado.toFixed(2) : "0,00"}</td>
      <td>${l.status || "aberto"}</td>
      <td>
        <button class="btn-small" onclick="marcarGanho(${l.id})">Ganho</button>
        <button class="btn-small secondary" onclick="marcarPerdido(${l.id})">Perdido</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function opcaoEtapa(valor, label, etapaAtual) {
  const sel = etapaAtual === valor ? "selected" : "";
  return `<option value="${valor}" ${sel}>${label}</option>`;
}

async function salvarLead(e) {
  e.preventDefault();

  const payload = {
    nome: document.getElementById("leadNome").value,
    telefone: document.getElementById("leadTelefone").value,
    email: document.getElementById("leadEmail").value,
    origem: document.getElementById("leadOrigem").value,
    responsavel: document.getElementById("leadResponsavel").value,
    valor_estimado: parseFloat(document.getElementById("leadValor").value || 0),
    etapa: "novo",
    status: "aberto"
  };

  const { error } = await supa.from("leads").insert(payload);

  if (error) {
    console.error("Erro ao salvar lead:", error);
    alert("Erro ao salvar lead");
    return;
  }

  document.getElementById("leadForm").reset();
  document.getElementById("leadStatus").innerText = "Lead salvo com sucesso!";
  setTimeout(() => (document.getElementById("leadStatus").innerText = ""), 2500);

  carregarLeads();
}

async function alterarEtapa(id, etapa) {
  await supa.from("leads").update({ etapa }).eq("id", id);
}

async function alterarResponsavel(id, responsavel) {
  await supa.from("leads").update({ responsavel }).eq("id", id);
}

async function marcarGanho(id) {
  await supa.from("leads").update({ etapa: "ganho", status: "fechado" }).eq("id", id);
  carregarLeads();
}

async function marcarPerdido(id) {
  await supa.from("leads").update({ etapa: "perdido", status: "fechado" }).eq("id", id);
  carregarLeads();
}
