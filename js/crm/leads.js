// js/crm/leads.js
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalNovoLead");
  const btnNovoLead = document.getElementById("novoLeadBtn");
  const btnCancelar = document.getElementById("cancelarLead");
  const btnSalvar = document.getElementById("salvarLead");
  const tabelaLeads = document.getElementById("tabelaLeads");

  const inputNome = document.getElementById("leadNome");
  const inputContato = document.getElementById("leadContato");
  const inputInteresse = document.getElementById("leadInteresse");
  const selectOrigem = document.getElementById("leadOrigem");

  let leads = []; // por enquanto em memória; depois plugamos no Supabase

  function abrirModal() {
    if (!modal) return;
    modal.style.display = "flex"; // garante exibição mesmo se o CSS usar display none
  }

  function fecharModal() {
    if (!modal) return;
    modal.style.display = "none";
    limparFormulario();
  }

  function limparFormulario() {
    if (inputNome) inputNome.value = "";
    if (inputContato) inputContato.value = "";
    if (inputInteresse) inputInteresse.value = "";
    if (selectOrigem) selectOrigem.value = "WhatsApp";
  }

  function renderizarTabela() {
    if (!tabelaLeads) return;

    if (leads.length === 0) {
      tabelaLeads.innerHTML = `
        <p class="muted">Nenhum lead cadastrado ainda.</p>
      `;
      return;
    }

    let linhas = leads
      .map(
        (lead) => `
        <tr>
          <td>${lead.nome}</td>
          <td>${lead.contato}</td>
          <td>${lead.interesse}</td>
          <td>${lead.origem}</td>
          <td>${lead.data}</td>
        </tr>
      `
      )
      .join("");

    tabelaLeads.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Contato</th>
            <th>Interesse</th>
            <th>Origem</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${linhas}
        </tbody>
      </table>
    `;
  }

  async function salvarLead() {
    const nome = inputNome?.value.trim();
    const contato = inputContato?.value.trim();
    const interesse = inputInteresse?.value.trim();
    const origem = selectOrigem?.value || "WhatsApp";

    if (!nome || !contato) {
      alert("Preencha pelo menos Nome e Contato.");
      return;
    }

    const novoLead = {
      nome,
      contato,
      interesse: interesse || "-",
      origem,
      data: new Date().toLocaleDateString("pt-BR"),
    };

    // 🔹 Por enquanto, só em memória + tela
    leads.push(novoLead);
    renderizarTabela();
    fecharModal();

    // 🔹 FUTURO: salvar no Supabase
    // try {
    //   const { data, error } = await supabase
    //     .from("leads")
    //     .insert([{ ...novoLead, user_id, hotel_id }]);
    //   if (error) console.error("Erro ao salvar no Supabase:", error);
    // } catch (err) {
    //   console.error("Erro inesperado:", err);
    // }
  }

  // Eventos
  if (btnNovoLead) {
    btnNovoLead.addEventListener("click", abrirModal);
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", (e) => {
      e.preventDefault();
      fecharModal();
    });
  }

  if (btnSalvar) {
    btnSalvar.addEventListener("click", (e) => {
      e.preventDefault();
      salvarLead();
    });
  }

  // Fecha ao clicar fora do conteúdo
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        fecharModal();
      }
    });
  }

  // Inicializa tabela vazia
  renderizarTabela();
});
