// financeiro.js
document.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  document.getElementById("btnFiltrar").addEventListener("click", gerarFinanceiro);
});

async function gerarFinanceiro() {
  const user = await supa.auth.getUser();
  const user_id = user.data.user.id;

  const de = document.getElementById("dataDe").value;
  const ate = document.getElementById("dataAte").value;

  let { data: lancs } = await supa
    .from("lancamentos")
    .select("*")
    .eq("user_id", user_id)
    .gte("created_at", de)
    .lte("created_at", ate);

  let debitos = 0;
  let creditos = 0;

  lancs.forEach((l) => {
    if (l.tipo === "debito") debitos += l.valor;
    else creditos += l.valor;
  });

  document.getElementById("kpiDebitos").innerText = "R$ " + debitos.toFixed(2);
  document.getElementById("kpiCreditos").innerText = "R$ " + creditos.toFixed(2);
  document.getElementById("kpiReceita").innerText = "R$ " + (creditos - debitos).toFixed(2);
}
