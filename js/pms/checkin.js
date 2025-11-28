// /js/theme.js
function applySavedTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}

document.addEventListener("DOMContentLoaded", applySavedTheme);
// checkin.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarUHsLivres();
  document.getElementById("checkinForm").addEventListener("submit", fazerCheckin);
});

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
