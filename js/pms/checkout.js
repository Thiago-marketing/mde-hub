/***************************************************
 * CHECK-OUT – PMS Lite
 ***************************************************/
const sb = supabase;

const listaCheckout = document.getElementById("listaCheckout");
const extratoLista = document.getElementById("extratoLista");
const totalGeral = document.getElementById("totalGeral");
const btnFinalizar = document.getElementById("btnFinalizar");

let reserva = null;

document.addEventListener("DOMContentLoaded", loadCheckoutLista);

async function loadCheckoutLista() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await sb
    .from("reservas")
    .select("*, uhs(nome)")
    .lte("checkin", hoje)
    .gt("checkout", hoje);

  listaCheckout.innerHTML = "";

  data?.forEach((r) => {
    const div = document.createElement("div");
    div.className = "reserva-item";
    div.innerHTML = `
      <div>
        <strong>${r.hospede}</strong>
        <p>${r.uhs.nome}</p>
      </div>
    `;

    div.onclick = () => {
      reserva = r;
      loadExtrato(r.id);
    };

    listaCheckout.appendChild(div);
  });
}

async function loadExtrato(reservaId) {
  const { data } = await sb
    .from("lancamentos")
    .select("*")
    .eq("reserva_id", reservaId);

  extratoLista.innerHTML = "";
  let total = 0;

  data?.forEach((l) => {
    total += Number(l.valor);

    const linha = document.createElement("div");
    linha.className = "extrato-item";
    linha.innerHTML = `
      <span>${l.descricao}</span>
      <strong>R$ ${l.valor}</strong>
    `;
    extratoLista.appendChild(linha);
  });

  totalGeral.textContent = "Total: R$ " + total.toFixed(2);
}

btnFinalizar.onclick = async () => {
  if (!reserva) return alert("Selecione um hóspede.");

  const { error } = await sb
    .from("uhs")
    .update({ status: "limpeza" })
    .eq("id", reserva.uh_id);

  if (error) return alert("Erro ao finalizar saída.");

  alert("Check-out concluído!");

  extratoLista.innerHTML = "";
  totalGeral.textContent = "";
  loadCheckoutLista();
};
