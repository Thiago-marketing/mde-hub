// uhs.js

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  listarUHs();

  const form = document.getElementById("uhForm");
  if (form) {
    form.addEventListener("submit", salvarUH);
  }
});

/* LISTAR UHs */
async function listarUHs() {
  const { data: user } = await supa.auth.getUser();
  const user_id = user?.user?.id;

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
  atualizarResumo(uhs);
}

/* GRID VISUAL */
function montarGrid(uhs) {
  const grid = document.getElementById("uhGrid");
  if (!grid) return;

  grid.innerHTML = "";

  uhs.forEach((uh) => {
    const div = document.createElement("div");
    div.className = `uh-card status-${uh.status || "livre"}`;
    div.innerHTML = `
      <strong>${uh.numero}</strong>
      <span>${traduzStatus(uh.status)}</span>
      <small>${uh.tipo || ""}</small>
    `;
    grid.appendChild(div);
  });
}

/* TABELA */
function montarTabela(uhs) {
  const tbody = document.getElementById("uhTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  uhs.forEach((uh) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${uh.numero}</td>
      <td>${uh.tipo || "-"}</td>
      <td>${traduzStatus(uh.status)}</td>
      <td>${uh.previsao_saida || "-"}</td>
      <td>
        <button class="btn-small" onclick="verReservaUH('${uh.numero}')">
          Detalhes
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* RESUMO RÁPIDO (KPIZINHO EM CIMA DO MAPA) */
function atualizarResumo(uhs) {
  const el = document.getElementById("uhResumo");
  if (!el) return;

  const total = uhs.length;
  const livres = uhs.filter((u) => u.status === "livre").length;
  const ocupados = uhs.filter((u) => u.status === "ocupado").length;

  el.textContent = `${total} UHs • ${livres} livres • ${ocupados} ocupadas`;
}

/* CADASTRO DE UH */
async function salvarUH(e) {
  e.preventDefault();

  const numero = document.getElementById("uhNumero").value.trim();
  const tipo = document.getElementById("uhTipo").value.trim();
  const statusInicial = document.getElementById("uhStatusInicial").value;

  if (!numero) {
    alert("Informe o número ou nome da UH.");
    return;
  }

  const { data: user } = await supa.auth.getUser();
  const user_id = user?.user?.id;

  const payload = {
    numero,
    tipo,
    status: statusInicial || "livre",
    user_id
  };

  const { error } = await supa.from("uhs").insert(payload);

  if (error) {
    console.error("Erro ao salvar UH:", error);
    alert("Erro ao salvar UH. Verifique o console.");
    return;
  }

  document.getElementById("uhForm").reset();
  document.getElementById("uhFormStatus").textContent = "UH cadastrada com sucesso!";
  setTimeout(() => {
    document.getElementById("uhFormStatus").textContent = "";
  }, 2500);

  listarUHs();
}

/* HELPERS */
function traduzStatus(s) {
  const map = {
    livre: "Livre",
    ocupado: "Ocupado",
    limpeza: "Limpeza",
    manutencao: "Manutenção",
    bloqueado: "Bloqueado"
  };
  return map[s] || "Livre";
}

function verReservaUH(numero) {
  alert("Em breve: abrir detalhes / reservas da UH " + numero);
}
