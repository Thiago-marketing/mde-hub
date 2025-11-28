/***************************************************
 * LANÇAMENTOS – PMS Lite
 ***************************************************/
const sb = supabase;

const listaLanc = document.getElementById("listaLanc");
const formLanc = document.getElementById("formLanc");

document.addEventListener("DOMContentLoaded", initLanc);

async function initLanc() {
  await carregarUHs();
  await carregarLancamentos();
}

async function carregarUHs() {
  const { data } = await sb.from("uhs").select("*").order("id");
  const select = document.getElementById("lancUH");

  data.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.id;
    opt.textContent = u.nome;
    select.appendChild(opt);
  });
}

formLanc.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    uh_id: Number(document.getElementById("lancUH").value),
    descricao: document.getElementById("lancDescricao").value,
    valor: Number(document.getElementById("lancValor").value),
    created_at: new Date().toISOString(),
  };

  const { error } = await sb.from("lancamentos").insert([payload]);
  if (error) return alert("Erro ao salvar lançamento.");

  formLanc.reset();
  carregarLancamentos();
});

async function carregarLancamentos() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await sb
    .from("lancamentos")
    .select("*")
    .gte("created_at", hoje + " 00:00:00")
    .lte("created_at", hoje + " 23:59:59");

  listaLanc.innerHTML = "";

  data?.forEach((l) => {
    const div = document.createElement("div");
    div.className = "lanc-item";
    div.innerHTML = `
      <span>${l.descricao}</span>
      <strong>R$ ${l.valor}</strong>
    `;
    listaLanc.appendChild(div);
  });
}
