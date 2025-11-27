// uhs.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  listarUHs();
});

/* LISTAR UHs */
async function listarUHs() {
  const user = await supa.auth.getUser();
  const user_id = user.data.user.id;

  let { data: uhs, error } = await supa
    .from("uhs")
    .select("*")
    .eq("user_id", user_id)
    .order("numero", { ascending: true });

  if (error) {
    console.error("Erro ao carregar UHs:", error);
    return;
  }

  montarGrid(uhs);
  montarTabela(uhs);
}

/* GRID VISUAL */
function montarGrid(uhs) {
  const grid = document.getElementById("uhGrid");
  grid.innerHTML = "";

  uhs.forEach((uh) => {
    const div = document.createElement("div");
    div.className = `uh-card status-${uh.status}`;
    div.innerHTML = `
      <strong>${uh.numero}</strong>
      <span>${traduzStatus(uh.status)}</span>
    `;
    grid.appendChild(div);
  });
}

/* TABELA */
function montarTabela(uhs) {
  const tbody = document.getElementById("uhTableBody");
  tbody.innerHTML = "";

  uhs.forEach((uh) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${uh.numero}</td>
      <td>${uh.tipo || "-"}</td>
      <td>${traduzStatus(uh.status)}</td>
      <td>${uh.previsao_saida || "-"}</td>
      <td>
        <button class="btn-small" onclick="verReservaUH('${uh.numero}')">Detalhes</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function traduzStatus(s) {
  const map = {
    livre: "Livre",
    ocupado: "Ocupado",
    limpeza: "Limpeza",
    manutencao: "Manutenção",
    bloqueado: "Bloqueado"
  };
  return map[s] || s;
}

function verReservaUH(numero) {
  alert("Aqui futuramente abriremos a última reserva da UH " + numero);
}
