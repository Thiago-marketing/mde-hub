// Carregar módulos HTML
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarReservasPendentes();
});


// ==========================
// CARREGAR RESERVAS PENDENTES
// ==========================

async function carregarReservasPendentes() {
  const select = document.getElementById("selectReserva");

  const { data, error } = await supabase
    .from("reservas")
    .select("*, units(numero)")
    .eq("status", "confirmada");

  if (error) {
    console.error(error);
    return;
  }

  select.innerHTML = "<option value=''>Selecione...</option>";

  data.forEach(r => {
    select.innerHTML += `
      <option value="${r.id}">
        ${r.hospede} — UH ${r.units.numero} (${r.data_entrada} → ${r.data_saida})
      </option>
    `;
  });

  select.addEventListener("change", () => mostrarDados(select.value, data));
}


// ==========================
// EXIBIR DADOS DA RESERVA
// ==========================

function mostrarDados(id, reservas) {
  const card = document.getElementById("dadosReserva");

  if (!id) {
    card.style.display = "none";
    return;
  }

  const r = reservas.find(x => x.id == id);

  document.getElementById("rHospede").innerText = r.hospede;
  document.getElementById("rUH").innerText = "UH " + r.units.numero;
  document.getElementById("rEntrada").innerText = r.data_entrada;
  document.getElementById("rSaida").innerText = r.data_saida;

  card.style.display = "block";

  document.getElementById("btnCheckin").onclick = () => confirmarCheckin(r);
}


// ==========================
// PROCESSAR CHECK-IN
// ==========================

async function confirmarCheckin(reserva) {
  const reservaId = reserva.id;
  const unidadeId = reserva.unidad_id;

  // 1. Atualizar reserva
  const up1 = await supabase
    .from("reservas")
    .update({ status: "checkin" })
    .eq("id", reservaId);

  // 2. Atualizar UH para "ocupado"
  const up2 = await supabase
    .from("units")
    .update({ status: "ocupado" })
    .eq("id", unidadeId);

  if (up1.error || up2.error) {
    alert("Erro ao realizar check-in.");
    console.log(up1.error || up2.error);
    return;
  }

  alert("Check-in realizado com sucesso!");

  // Recarregar tela
  location.reload();
}

