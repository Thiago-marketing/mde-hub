// Carregar módulos
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  document.getElementById("btnGerar").onclick = gerarRelatorios;
});


async function gerarRelatorios() {
  const ini = document.getElementById("dataInicial").value;
  const fim = document.getElementById("dataFinal").value;

  if (!ini || !fim) {
    alert("Selecione as duas datas.");
    return;
  }

  // Buscar reservas no período
  const { data: reservas, error } = await supabase
    .from("reservas")
    .select("*, units(numero)")
    .gte("data_entrada", ini)
    .lte("data_saida", fim);

  if (error) {
    alert("Erro ao buscar reservas.");
    return;
  }

  // Quantidade de reservas
  const qtde = reservas.length;

  // Ocupação = total de diárias ocupadas / total possível
  // No PMS Lite (6 UHs), cálculo simples:
  const diasPeriodo = calcularDias(ini, fim);
  const capacidade = 6 * diasPeriodo;

  let diasOcupados = 0;
  reservas.forEach(r => {
    diasOcupados += calcularDias(r.data_entrada, r.data_saida);
  });

  const ocupacao = capacidade > 0
    ? ((diasOcupados / capacidade) * 100).toFixed(1)
    : 0;

  // Faturamento
  let faturamento = 0;
  reservas.forEach(r => {
    faturamento += Number(r.valor_total || 0);
  });

  // Mostrar resultados
  document.getElementById("rQtdeReservas").innerText = qtde;
  document.getElementById("rOcupacao").innerText = ocupacao + "%";
  document.getElementById("rFaturamento").innerText = faturamento.toFixed(2);

  document.getElementById("boxResultados").style.display = "block";

  listarDetalhes(reservas);
}


// ==============================
// Funções auxiliares
// ==============================

function calcularDias(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  const diff = (b - a) / (1000 * 60 * 60 * 24);
  return diff || 1;
}

function listarDetalhes(reservas) {
  const box = document.getElementById("listaDetalhes");
  box.innerHTML = "";

  reservas.forEach(r => {
    box.innerHTML += `
      <div class="detalhe-item">
        <strong>${r.hospede}</strong>
        <p>UH ${r.units.numero}</p>
        <p>${r.data_entrada} → ${r.data_saida}</p>
        <p>Total: R$ ${Number(r.valor_total).toFixed(2)}</p>
      </div>
    `;
  });
}
