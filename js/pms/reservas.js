// Carregar módulos HTML
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarUHs();
  carregarReservas();
});


// ==========================
// CARREGAR UHs NO SELECT
// ==========================
async function carregarUHs() {
  const selectUH = document.getElementById("unidade");

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .limit(6);

  if (error) {
    console.error(error);
    return;
  }

  selectUH.innerHTML = "";
  data.forEach(uh => {
    selectUH.innerHTML += `<option value="${uh.id}">UH ${uh.numero}</option>`;
  });
}


// ==========================
// CRIAR RESERVA
// ==========================
const formReserva = document.getElementById("formReserva");

formReserva.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dados = {
    hospede: document.getElementById("hospede").value,
    telefone: document.getElementById("telefone").value,
    whatsapp: document.getElementById("whatsapp").value,
    unidad_id: document.getElementById("unidade").value,
    data_entrada: document.getElementById("dataEntrada").value,
    data_saida: document.getElementById("dataSaida").value,
    valor_diaria: document.getElementById("valorDiaria").value,
    status: "confirmada"
  };

  const { error } = await supabase.from("reservas").insert([dados]);

  if (error) {
    alert("Erro ao criar reserva.");
    console.log(error);
  } else {
    alert("Reserva criada com sucesso!");
    formReserva.reset();
    carregarReservas();
  }
});


// ==========================
// LISTAR RESERVAS
// ==========================
async function carregarReservas() {
  const lista = document.getElementById("listaReservas");

  const { data, error } = await supabase
    .from("reservas")
    .select("*, units(numero)")
    .order("data_entrada", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  lista.innerHTML = "";

  data.forEach(r => {
    const item = `
      <div class="reserva-item">
        <div>
          <strong>${r.hospede}</strong>
          <p>UH ${r.units.numero} — ${r.data_entrada} → ${r.data_saida}</p>
        </div>
        <span class="status">${r.status}</span>
      </div>
    `;
    lista.innerHTML += item;
  });
}

