// lancamentos.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarReservas();
  document.getElementById("lancForm").addEventListener("submit", adicionarLancamento);
});

/* RESERVAS */
async function carregarReservas() {
  const user = await supa.auth.getUser();
  const user_id = user.data.user.id;

  let { data: reservas } = await supa
    .from("reservas")
    .select("id, uhs(numero), hospedes(nome)")
    .eq("user_id", user_id)
    .eq("status", "checkin");

  const select = document.getElementById("reservaLancSelect");
  select.innerHTML = "";

  reservas.forEach((r) => {
    select.innerHTML += `
      <option value="${r.id}">
        UH ${r.uhs.numero} • ${r.hospedes.nome}
      </option>
    `;
  });

  listarLancamentos();
  select.addEventListener("change", listarLancamentos);
}

/* LISTAR LANÇAMENTOS */
async function listarLancamentos() {
  const reservaID = document.getElementById("reservaLancSelect").value;

  let { data: lancs } = await supa
    .from("lancamentos")
    .select("*")
    .eq("reserva_id", reservaID)
    .order("created_at", { ascending: false });

  const tbody = document.getElementById("lancTableBody");
  tbody.innerHTML = "";

  lancs.forEach((l) => {
    tbody.innerHTML += `
      <tr>
        <td>${l.descricao}</td>
        <td>R$ ${l.valor.toFixed(2)}</td>
        <td>${l.tipo}</td>
        <td>${new Date(l.created_at).toLocaleString()}</td>
      </tr>
    `;
  });
}

/* ADICIONAR LANÇAMENTO */
async function adicionarLancamento(e) {
  e.preventDefault();

  const reserva_id = document.getElementById("reservaLancSelect").value;
  const descricao = document.getElementById("descricao").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  let { error } = await supa.from("lancamentos").insert({
    reserva_id,
    descricao,
    valor,
    tipo
  });

  if (error) return alert("Erro ao adicionar lançamento");

  e.target.reset();
  listarLancamentos();
}
