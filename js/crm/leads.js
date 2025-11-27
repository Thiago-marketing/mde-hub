// Carregar módulos (sidebar, header)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  inicializarFormLead();
  carregarLeads();
});


// ============================
// Formulário: criar novo lead
// ============================

function inicializarFormLead() {
  const form = document.getElementById("formLead");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const lead = {
      nome: document.getElementById("leadNome").value,
      empresa: document.getElementById("leadEmpresa").value,
      segmento: document.getElementById("leadSegmento").value,
      origem: document.getElementById("leadOrigem").value,
      responsavel: document.getElementById("leadResponsavel").value,
      proximo_contato: document.getElementById("leadProxContato").value,
      etapa: document.getElementById("leadEtapa").value,
      observacoes: document.getElementById("leadObs").value
    };

    const { error } = await supabase.from("leads").insert([lead]);

    if (error) {
      console.error(error);
      alert("Erro ao salvar lead.");
      return;
    }

    alert("Lead salvo com sucesso!");
    form.reset();
    carregarLeads();
  });
}


// ============================
// Carregar leads da tabela
// ============================

async function carregarLeads() {
  const lista = document.getElementById("leadLista");

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    lista.innerHTML = "<p>Erro ao carregar leads.</p>";
    return;
  }

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Nenhum lead cadastrado ainda.</p>";
    return;
  }

  lista.innerHTML = "";

  data.forEach(lead => {
    lista.innerHTML += montarCardLead(lead);
  });

  // Ativar eventos dos selects de etapa
  document.querySelectorAll(".lead-etapa-select").forEach(sel => {
    sel.addEventListener("change", async (e) => {
      const leadId = e.target.getAttribute("data-id");
      const novaEtapa = e.target.value;
      await atualizarEtapa(leadId, novaEtapa);
    });
  });
}


// ============================
// Montar card HTML de cada lead
// ============================

function montarCardLead(lead) {
  const dataProx = lead.proximo_contato
    ? new Date(lead.proximo_contato).toLocaleDateString("pt-BR")
    : "-";

  const etapas = [
    { value: "novo", label: "Novo" },
    { value: "qualificando", label: "Qualificando" },
    { value: "demonstracao", label: "Demonstração" },
    { value: "proposta", label: "Proposta" },
    { value: "fechamento", label: "Fechamento" },
    { value: "perdido", label: "Perdido" },
  ];

  const optionsHtml = etapas
    .map(e => `<option value="${e.value}" ${lead.etapa === e.value ? "selected" : ""}>${e.label}</option>`)
    .join("");

  return `
    <div class="lead-item">
      <div class="lead-main">
        <strong>${lead.nome || "(sem nome)"}</strong>
        <p>${lead.empresa || ""}</p>
        <p>Segmento: ${lead.segmento || "-"} • Origem: ${lead.origem || "-"}</p>
        <p>Responsável: ${lead.responsavel || "-"} • Próx. contato: ${dataProx}</p>
      </div>

      <div class="lead-side">
        <label>Etapa</label>
        <select class="lead-etapa-select" data-id="${lead.id}">
          ${optionsHtml}
        </select>
      </div>
    </div>
  `;
}


// ============================
// Atualizar etapa do lead
// ============================

async function atualizarEtapa(id, etapa) {
  const { error } = await supabase
    .from("leads")
    .update({ etapa })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Erro ao atualizar etapa.");
    return;
  }
}

