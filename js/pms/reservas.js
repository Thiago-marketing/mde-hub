// reservas.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  listarReservas();
  document.getElementById("filtroStatus").addEventListener("change", listarReservas);
});

/* LISTAR RESERVAS */
async function listarReservas() {
  const user = await supa.auth.getUser();
  const user_id = user.data.user.id;

  const filtro = document.getElementById("filtroStatus").value;

  let query = supa
    .from("reservas")
    .select(`*, hospedes(*), uhs(*)`)
    .eq("user_id", user_id)
    .order("data_entrada", { ascending: true });

  if (filtro) query = query.eq("status", filtro);

  let { data: reservas, error } = await query;

  if (error) {
    console.error("Erro ao carregar reservas:", error);
    return;
  }

  montarTabela(reservas);
}

function montarTabela(reservas) {
  const tbody = document.getElementById("reservasTableBody");
  tbody.innerHTML = "";

  reservas.forEach((r) => {
    tbody.innerHTML += `
      <tr>
        <td>${r.uhs?.numero || "-"}</td>
        <td>${r.hospedes?.nome || "-"}</td>
        <td>${r.data_entrada}</td>
        <td>${r.data_saida}</td>
        <td>${traduzStatusReserva(r.status)}</td>
        <td>${r.origem || "-"}</td>
        <td><button class="btn-small" onclick="abrirReserva(${r.id})">Ver</button></td>
      </tr>
    `;
  });
}

function traduzStatusReserva(s) {
  const map = {
    reservado: "Reservado",
    checkin: "Em estadia",
    checkout: "Finalizado",
    cancelado: "Cancelado"
  };
  return map[s] || s;
}

function abrirReserva(id) {
  alert("Abrir detalhes da reserva " + id);
}
