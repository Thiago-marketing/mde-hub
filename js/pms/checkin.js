/***************************************************
 * CHECK-IN – PMS Lite
 ***************************************************/
const sb = supabase;

const listaCheckin = document.getElementById("listaCheckin");
const dadosReserva = document.getElementById("dadosReserva");
const btnConfirmarCheckin = document.getElementById("btnConfirmarCheckin");

let reservaSelecionada = null;

document.addEventListener("DOMContentLoaded", loadCheckinLista);

async function loadCheckinLista() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await sb
    .from("reservas")
    .select("*, uhs(id, nome)")
    .eq("checkin", hoje);

  listaCheckin.innerHTML = "";

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
      reservaSelecionada = r;
      mostrarDados(r);
    };

    listaCheckin.appendChild(div);
  });
}

function mostrarDados(r) {
  dadosReserva.innerHTML = `
    <p><strong>Hóspede:</strong> ${r.hospede}</p>
    <p><strong>UH:</strong> ${r.uhs.nome}</p>
    <p><strong>Telefone:</strong> ${r.telefone || "-"}</p>
    <p><strong>Período:</strong> ${formatarData(r.checkin)} → ${formatarData(r.checkout)}</p>
  `;
}

btnConfirmarCheckin.onclick = async () => {
  if (!reservaSelecionada) return alert("Selecione uma reserva.");

  const { error } = await sb
    .from("uhs")
    .update({ status: "ocupado" })
    .eq("id", reservaSelecionada.uh_id);

  if (error) return alert("Erro ao atualizar UH.");

  alert("Check-in confirmado!");
  loadCheckinLista();
  dadosReserva.innerHTML = "";
};
