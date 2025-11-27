// Carregar módulos (sidebar + header)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarLeads();
});

let leadAtual = null;

// =========================
// CARREGAR LEADS NO SELECT
// =========================
async function carregarLeads() {
  const select = document.getElementById("selectLead");

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error(error);
    select.innerHTML = "<option value=''>Erro ao carregar leads</option>";
    return;
  }

  if (!data || data.length === 0) {
    select.innerHTML = "<option value=''>Nenhum lead cadastrado</option>";
    return;
  }

  select.innerHTML = "<option value=''>Selecione...</option>";

  data.forEach(lead => {
    select.innerHTML += `
      <option value="${lead.id}">${lead.nome} — ${lead.empresa || ""}</option>
    `;
  });

  select.addEventListener("change", () => {
    const id = select.value;
    if (!id) {
      document.getElementById("boxAtividade").style.display = "none";
      document.getElementById("boxHistorico").style.display = "none";
      leadAtual = null;
      return;
    }
    leadAtual = id;
    document.getElementById("boxAtividade").style.display = "block";
    document.getElementById("boxHistorico").style.display = "block";
    inicializarForm();
    carregarAtividades(id);
  });
}

// =========================
// FORMULÁRIO DE ATIVIDADE
// =========================
function inicializarForm() {
  const form = document.getElementById("formAtividade");

  form.onsubmit = async (e) => {
    e.preventDefault();
    if (!leadAtual) {
      alert("Selecione um lead primeiro.");
      return;
    }

    const atividade = {
      lead_id: leadAtual,
      tipo: document.getElementById("tipoAtividade").value,
      data_atividade: document.getElementById("dataAtividade").value || null,
      hora_atividade: document.getElementById("horaAtividade").value || null,
      status: document.getElementById("statusAtividade").value,
      proximo_contato: document.getElementById("proxContato").value || null,
      descricao: document.getElementById("descricaoAtividade").value
    };

    const { error } = await supabase
      .from("atividades")
      .insert([atividade]);

    if (error) {
      console.error(error);
      alert("Erro ao salvar atividade.");
      return;
    }

    alert("Atividade salva!");
    form.reset();
    carregarAtividades(leadAtual);
  };
}

// =========================
// CARREGAR ATIVIDADES
// =========================
async function carregarAtividades(leadId) {
  const box = document.getElementById("listaAtividades");

  const { data, error } = await supabase
    .from("atividades")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    box.innerHTML = "<p>Erro ao carregar atividades.</p>";
    return;
  }

  if (!data || data.length === 0) {
    box.innerHTML = "<p>Nenhuma atividade registrada para este lead ainda.</p>";
    return;
  }

  box.innerHTML = "";

  data.forEach(a => {
    box.innerHTML += montarCardAtividade(a);
  });
}

// =========================
// CARD DE ATIVIDADE
// =========================
function montarCardAtividade(a) {
  const dataAtv = a.data_atividade
    ? new Date(a.data_atividade).toLocaleDateString("pt-BR")
    : "-";

  const prox = a.proximo_contato
    ? new Date(a.proximo_contato).toLocaleDateString("pt-BR")
    : "-";

  const tipoLabel = {
    ligacao: "Ligação",
    whatsapp: "WhatsApp",
    email: "E-mail",
    reuniao: "Reunião",
    outro: "Outro"
  }[a.tipo] || a.tipo;

  const statusLabel = {
    pendente: "Pendente",
    concluida: "Concluída"
  }[a.status] || a.status;

  return `
    <div class="atividade-item">
      <div>
        <strong>${tipoLabel}</strong> • <span class="atividade-status">${statusLabel}</span>
        <p>Data: ${dataAtv} ${a.hora_atividade || ""}</p>
        <p>Próx. contato: ${prox}</p>
        <p>${a.descricao || ""}</p>
      </div>
    </div>
  `;
}
