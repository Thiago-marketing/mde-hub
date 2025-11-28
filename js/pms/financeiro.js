/***************************************************
 * FINANCEIRO – PMS Lite
 ***************************************************/
const sb = supabase;

const entradasHoje = document.getElementById("entradasHoje");
const saidasHoje = document.getElementById("saidasHoje");
const balancoHoje = document.getElementById("balancoHoje");
const ocupacaoAtual = document.getElementById("ocupacaoAtual");
const extratoFin = document.getElementById("extratoFin");

document.addEventListener("DOMContentLoaded", initFinanceiro);

async function initFinanceiro() {
  await resumoHoje();
  await extratoCompleto();
}

async function resumoHoje() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data: lanc } = await sb
    .from("lancamentos")
    .select("*")
    .gte("created_at", hoje + " 00:00:00")
    .lte("created_at", hoje + " 23:59:59");

  const entradaTotal = lanc?.reduce((s, l) => s + Number(l.valor), 0) || 0;

  entradasHoje.textContent = entradaTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Ocupação
  const { data: uhs } = await sb.from("uhs").select("*");
  const totalUhs = uhs.length;

  const { data: ocupadas } = await sb
    .from("reservas")
    .select("id")
    .lte("checkin", hoje)
    .gt("checkout", hoje);

  const ocupacao = totalUhs > 0 ? Math.round((ocupadas.length / totalUhs) * 100) : 0;
  ocupacaoAtual.textContent = ocupacao + "%";

  // Balanço
  balancoHoje.textContent = entradasHoje.textContent;
}

async function extratoCompleto() {
  const { data } = await sb
    .from("lancamentos")
    .select("*")
    .order("created_at", { ascending: false });

  extratoFin.innerHTML = "";

  data.forEach((l) => {
    const div = document.createElement("div");
    div.className = "extrato-item";
    div.innerHTML = `
      <span>${l.descricao}</span>
      <strong>R$ ${l.valor}</strong>
    `;
    extratoFin.appendChild(div);
  });
}
