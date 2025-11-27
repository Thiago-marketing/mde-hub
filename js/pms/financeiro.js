// Carregar módulos
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });
});

// ===========================
// ABRIR CAIXA
// ===========================

document.getElementById("btnAbrir").addEventListener("click", async () => {

  const data = document.getElementById("dataCaixa").value;
  const valorInicial = Number(document.getElementById("valorInicial").value || 0);

  if (!data) return alert("Selecione a data.");

  // Verificar se já existe caixa
  const { data: caixaExistente } = await supabase
    .from("caixa_diario")
    .select("*")
    .eq("data", data)
    .maybeSingle();

  // Se já existe, carrega resumo
  if (caixaExistente) {
    carregarResumo(data, caixaExistente.valor_inicial);
    return;
  }

  // Criar novo caixa
  const { error } = await supabase
    .from("caixa_diario")
    .insert([{ data, valor_inicial: valorInicial }]);

  if (error) {
    alert("Erro ao abrir caixa.");
    return;
  }

  alert("Caixa aberto com sucesso!");
  carregarResumo(data, valorInicial);
});


// ===========================
// CARREGAR RESUMO DO CAIXA
// ===========================

async function carregarResumo(data, valorInicial) {

  // Lançamentos do dia
  const { data: lancs } = await supabase
    .from("lancamentos")
    .select("*")
    .gte("created_at", data + " 00:00:00")
    .lte("created_at", data + " 23:59:59");

  const totalLancs = lancs?.reduce((s, x) => s + Number(x.valor), 0) || 0;

  // Totais de check-out do dia
  const { data: checkouts } = await supabase
    .from("reservas")
    .select("*")
    .eq("status", "checkout")
    .eq("data_saida", data);

  const totalCheckouts = checkouts?.reduce((s, x) => s + Number(x.valor_total || 0), 0) || 0;

  // Saldo final
  const saldoFinal = valorInicial + totalLancs + totalCheckouts;

  // Atualizar HTML
  document.getElementById("boxResumo").style.display = "block";
  document.getElementById("entradas").innerText = totalLancs.toFixed(2);
  document.getElementById("checkouts").innerText = totalCheckouts.toFixed(2);
  document.getElementById("saidas").innerText = "0.00"; // versão Lite não tem saídas ainda
  document.getElementById("saldo").innerText = saldoFinal.toFixed(2);

  // Botão Fechar
  document.getElementById("btnFechar").onclick = () => fecharCaixa(data, saldoFinal);
}


// ===========================
// FECHAR CAIXA
// ===========================

async function fecharCaixa(data, saldoFinal) {
  const { error } = await supabase
    .from("caixa_diario")
    .update({ saldo_final: saldoFinal, status: "fechado" })
    .eq("data", data);

  if (error) {
    alert("Erro ao fechar caixa.");
    return;
  }

  alert("Caixa fechado!");
  location.reload();
}

