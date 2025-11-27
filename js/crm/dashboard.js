// Carregar módulos (sidebar + header)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarDashboard();
});


async function carregarDashboard() {

  const hoje = new Date().toISOString().split("T")[0];

  // Buscar todos os leads
  const { data: leads, error: err1 } = await supabase
    .from("leads")
    .select("*");

  if (err1) return console.error(err1);

  // KPIs principais
  document.getElementById("kpiTotalLeads").innerText = leads.length;

  // Próximos contatos de hoje
  const prox = leads.filter(l => l.proximo_contato === hoje);
  document.getElementById("kpiProxHoje").innerText = prox.length;

  // Etapa Proposta / Fechamento
  const etapaProposta = leads.filter(l => l.etapa === "proposta").length;
  const etapaFechamento = leads.filter(l => l.etapa === "fechamento").length;

  document.getElementById("kpiProposta").innerText = etapaProposta;
  document.getElementById("kpiFechamento").innerText = etapaFechamento;

  // Preencher listas
  montarEtapas(leads);
  montarResponsaveis(leads);
  montarProximos(prox);
}


function montarEtapas(leads) {
  const etapas = [
    "novo",
    "qualificando",
    "demonstracao",
    "proposta",
    "fechamento",
    "perdido"
  ];

  const box = document.getElementById("chartEtapas");
  box.innerHTML = "";

  etapas.forEach(etapa => {
    const qtde = leads.filter(l => l.etapa === etapa).length;
    const nome = etapa.charAt(0).toUpperCase() + etapa.slice(1);

    box.innerHTML += `
      <div class="dash-row">
        <span>${nome}</span>
        <strong>${qtde}</strong>
      </div>
    `;
  });
}


function montarResponsaveis(leads) {
  const box = document.getElementById("chartResponsavel");
  box.innerHTML = "";

  const mapa = {};

  leads.forEach(l => {
    const resp = l.responsavel || "Não definido";
    mapa[resp] = (mapa[resp] || 0) + 1;
  });

  Object.keys(mapa).forEach(resp => {
    box.innerHTML += `
      <div class="dash-row">
        <span>${resp}</span>
        <strong>${mapa[resp]}</strong>
      </div>
    `;
  });
}


function montarProximos(lista) {
  const box = document.getElementById("listaProximos");
  box.innerHTML = "";

  if (!lista.length) {
    box.innerHTML = "<p>Nenhum próximo contato para hoje.</p>";
    return;
  }

  lista.forEach(l => {
    box.innerHTML += `
      <div class="dash-row">
        <span>${l.nome} (${l.empresa || "-"})</span>
        <strong>${new Date(l.proximo_contato).toLocaleDateString("pt-BR")}</strong>
      </div>
    `;
  });
}
