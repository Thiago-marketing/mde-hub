// checkout.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarReservasEmEstadia();
  document.getElementById("btnCheckout").addEventListener("click", finalizarCheckout);
});

/* RESERVAS EM ESTADIA */
async function carregarReservasEmEstadia() {
  const user = await supa.auth.getUser();
  const user_id = user.data.user.id;

  let { data: reservas } = await supa
    .from("reservas")
    .select("*, uhs(*), hospedes(*)")
    .eq("user_id", user_id)
    .eq("status", "checkin");

  const select = document.getElementById("reservaSelect");
  select.innerHTML = "";

  reservas.forEach((r) => {
    select.innerHTML += `
      <option value="${r.id}">
        UH ${r.uhs.numero} • ${r.hospedes.nome}
      </option>
    `;
  });
}

/* CHECK-OUT */
async function finalizarCheckout() {
  const reservaID = document.getElementById("reservaSelect").value;

  if (!reservaID) return alert("Selecione uma reserva!");

  // puxar reserva
  const { data: r } = await supa
    .from("reservas")
    .select("uh_id")
    .eq("id", reservaID)
    .single();

  // atualizar reserva
  await supa
    .from("reservas")
    .update({ status: "checkout" })
    .eq("id", reservaID);

  // liberar UH
  await supa
    .from("uhs")
    .update({ status: "livre" })
    .eq("id", r.uh_id);

  document.getElementById("checkoutStatus").innerText =
    "Check-out concluído!";
  carregarReservasEmEstadia();
}
