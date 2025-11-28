<link rel="stylesheet" href="/css/app.css">
<script src="/js/theme.js"></script>

/* CARREGAR UHs LIVRES */
async function carregarUHsLivres() {
  const user = await supa.auth.getUser();
  const user_id = user.data.user.id;

  let { data: uhs } = await supa
    .from("uhs")
    .select("*")
    .eq("user_id", user_id)
    .eq("status", "livre");

  const select = document.getElementById("uhSelect");
  select.innerHTML = "";

  uhs.forEach((uh) => {
    select.innerHTML += `<option value="${uh.id}">${uh.numero}</option>`;
  });
}

/* CHECK-IN */
async function fazerCheckin(e) {
  e.preventDefault();

  const user = await supa.auth.getUser();
  const user_id = user.data.user.id;

  const nome = document.getElementById("nomeHospede").value;
  const telefone = document.getElementById("telefone").value;
  const uh_id = document.getElementById("uhSelect").value;
  const origem = document.getElementById("origem").value;
  const entrada = document.getElementById("dataEntrada").value;
  const saida = document.getElementById("dataSaida").value;

  // 1. criar hóspede
  let { data: hospede, error: erroHosp } = await supa
    .from("hospedes")
    .insert({
      nome,
      telefone,
      user_id
    })
    .select()
    .single();

  if (erroHosp) return alert("Erro ao criar hóspede");

  // 2. criar reserva
  let { error: erroRes } = await supa.from("reservas").insert({
    uh_id,
    hospede_id: hospede.id,
    data_entrada: entrada,
    data_saida: saida,
    origem,
    status: "checkin",
    user_id
  });

  if (erroRes) return alert("Erro ao criar reserva");

  // 3. marcar UH como ocupada
  await supa
    .from("uhs")
    .update({ status: "ocupado" })
    .eq("id", uh_id);

  document.getElementById("checkinStatus").innerText =
    "Check-in realizado com sucesso!";
  e.target.reset();
  carregarUHsLivres();
}
