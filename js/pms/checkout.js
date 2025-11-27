// Carregar módulos HTML
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarReservasAtivas();
});


// ===============================
// CARREGAR RESERVAS EM CHECKIN
// ===============================

async function carregarReservasAtivas() {
  const select = document.getElementById("selectReserva");

  const { data, error } = await supabase
    .from("reservas")
    .select("*, units(numero)")
    .eq("status", "checkin");

  if (error) return console.error(error);

  select.innerHTML = "<option value=''>Selecione...</option>";

  data.forEach(r => {
    select.innerHTML += `
      <option value="${r.id}">
        ${r.hospede} — UH ${r.units.numero}
      </option>
    `;
  });

  select.addEventListener("change", () => mostrarResumo(select.value, data));
}


// ===============================
// EXIBIR RESUMO
// ===============================

function mostrarResumo(id, reservas) {
  if (!id) {
    document.getElementById("resumoReserva").style.display = "none";
    return;
  }

  const r = reservas.find(x => x.id == id);

  // Cálculo dos dias
  const entrada = new Date(r.data_entrada);
  const saida = new Date(r.data_saida);
  const diff = (saida - entrada) / (1000 * 60 * 60 * 24);
  const dias = diff || 1;

  const total = dias * Number(r.valor_diaria || 0);

  // Preencher no HTML
  document.getElementById("rHospede").innerText = r.hospede;
  document.getElementById("rUH").innerText = "UH " + r.units.numero;
  document.getElementById("rEntrada").innerText = r.data_entrada;
  document.getElementById("rSaida").innerText = r.data_saida;
  document.getElementById("rDias").innerText = dias;
  document.getElementById("rTotal").innerText = total.toFixed(2);

  document.getElementById("resumoReserva").style.display = "block";

  document.getElementById("btnCheckout").onclick = () => finalizarCheckout(r, total);
}


// ===============================
// FINALIZAR CHECK-OUT
// ===============================

async function finalizarCheckout(reserva, total) {

  // 1. Atualizar reserva para checkout
  const up1 = await supabase
    .from("reservas")
    .update({
      status: "checkout",
      valor_total: total
    })
    .eq("id", reserva.id);

  // 2. Liberar UH (status = livre)
  const up2 = await supabase
    .from("units")
    .update({ status: "livre" })
    .eq("id", reserva.unidad_id);

  if (up1.error || up2.error) {
    alert("Erro ao finalizar check-out.");
    console.log(up1.error || up2.error);
    return;
  }

  alert("Check-out concluído com sucesso!");

  location.reload();
}

