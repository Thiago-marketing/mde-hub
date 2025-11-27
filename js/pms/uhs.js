// Carregar HTML dos módulos (sidebar, header)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });
});

async function carregarUHs() {
  const uhList = document.getElementById("uhList");

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .limit(6);

  if (error) {
    uhList.innerHTML = "<p>Erro ao carregar UHs...</p>";
    return;
  }

  uhList.innerHTML = "";

  data.forEach(uh => {
    const statusClass = {
      "livre": "uh-livre",
      "ocupado": "uh-ocupado",
      "limpeza": "uh-limpeza",
      "manutencao": "uh-manutencao",
      "bloqueado": "uh-bloqueado"
    }[uh.status] || "";

    const card = `
      <div class="uh-card ${statusClass}">
        <h3>UH ${uh.numero}</h3>
        <p>Status: <strong>${uh.status}</strong></p>
        <p>Previsão saída: ${uh.previsao_saida || "-"}</p>

        <div class="uh-actions">
          <button class="btn-acao">Check-in</button>
          <button class="btn-acao">Check-out</button>
          <button class="btn-acao">Lançamentos</button>
        </div>
      </div>
    `;

    uhList.innerHTML += card;
  });
}

carregarUHs();

