// Carregar módulos HTML
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarReservasAtivas();
});

let reservasCache = [];
let reservaAtual = null;
let totalDiarias = 0;
let totalLancamentos = 0;
let totalGeral = 0;


// ===============================
// CARREGAR RESERVAS EM CHECKIN
// ===============================

async function carregarReservasAtivas() {
  const select = document.getElementById("selectReserva");

  const { data, error } = await supabase
    .from("reservas")
    .select("*, units(numero)")
    .eq("status", "checkin");

  if (error) {
    console.error(error);
    return;
  }

  reservasCache = data || [];

  select.innerHTML = "<option value=''>Selecione...</option>";

  reservasCache.forEach(r => {
    select.innerHTML += `
      <option value="${r.id}">
        ${r.hospede} — UH ${r.units.numero}
      </option>
    `;
  });

  select.addEventListener("change", () => selecionarReserva(select.value));
}


// ===============================
// SELECIONAR RESERVA
// ===============================

async function selecionarReserva(id) {
  if (!id) {
    document.getElementById("resumoReserva").style.display = "none";
    document.getElementById("extratoLanc").style.display = "none";
    document.getElementById("totalGeralBox").style.display = "none";
    return;
  }

  reservaAtual = reservasCache.find(x => x.id == id);
  if (!reservaAtual) return;

  await montarResumo();
  await montarExtrato();
  calcularTotalGeral();
}


// ===============================
// RESUMO DA ESTADIA (DIÁRIAS)
// ===============================

async function montarResumo() {
  const r = reservaAtual;

  const entrada = new Date(r.data_entrada);
  const saida = new Date(r.data_saida);
  const diff = (saida - entrada) / (1000 * 60 * 60 * 24);
  const dias = diff || 1;

  const valorDiaria = Number(r.valor_diaria || 0);
  const subtotal = dias * valorDiaria;

  totalDiarias = subtotal;

  document.getElementById("rHospede").innerText = r.hospede;
  document.getElementById("rUH").innerText = "UH " + r.units.numero;
  document.getElementById("rEntrada").innerText = r.data_entrada;
  document.getElementById("rSaida").innerText = r.data_saida;
  document.getElementById("rDias").innerText = dias;
  document.getElementById("rDiaria").innerText = valorDiaria.toFixed(2);
  document.getElementById("rSubtotalDiarias").innerText = subtotal.toFixed(2);

  document.getElementById("resumoReserva").style.display = "block";
}


// ===============================
// EXTRATO DE LANÇAMENTOS
// ===============================

async function montarExtrato() {
  const reservaId = reservaAtual.id;
  const lista = document.getElementById("listaLancamentos");

  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("reserva_id", reservaId)
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  lista.innerHTML = "";
  totalLancamentos = 0;

  if (!data || data.length === 0) {
    lista.innerHTML = "<p>Não há lançamentos para esta reserva.</p>";
  } else {
    data.forEach(l => {
      totalLancamentos += Number(l.valor || 0);

      lista.innerHTML += `
        <div class="extrato-item">
          <span>${l.tipo.toUpperCase()} — ${l.descricao}</span>
          <span>R$ ${Number(l.valor).toFixed(2)}</span>
        </div>
      `;
    });
  }

  document.getElementById("rTotalLancamentos").innerText = totalLancamentos.toFixed(2);
  document.getElementById("extratoLanc").style.display = "block";
}


// ===============================
// TOTAL GERAL
// ===============================

function calcularTotalGeral() {
  totalGeral = totalDiarias + totalLancamentos;

  document.getElementById("rTotalGeral").innerText = totalGeral.toFixed(2);
  document.getElementById("totalGeralBox").style.display = "block";

  document.getElementById("btnCheckout").onclick = () => finalizarCheckout();
}


// ===============================
// FINALIZAR CHECK-OUT
// ===============================

async function finalizarCheckout() {
  if (!reservaAtual) return;

  const reservaId = reservaAtual.id;
  const unidadeId = reservaAtual.unidad_id; // mantendo o mesmo nome que usamos antes

  // 1. Atualizar reserva com total e status checkout
  const up1 = await supabase
    .from("reservas")
    .update({
      status: "checkout",
      valor_total: totalGeral
    })
    .eq("id", reservaId);

  // 2. Liberar UH (status = livre)
  const up2 = await supabase
    .from("units")
    .update({ status: "livre" })
    .eq("id", unidadeId);

  if (up1.error || up2.error) {
    alert("Erro ao finalizar check-out.");
    console.log(up1.error || up2.error);
    return;
  }

  alert("Check-out concluído com sucesso!");
  location.reload();
}
