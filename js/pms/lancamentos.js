// Carregar módulos (sidebar, header)
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarReservasAtivas();
});


// ===============================
// CARREGAR RESERVAS EM CHECK-IN
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

  select.addEventListener("change", () => mostrarArea(select.value, data));
}


// ===============================
// MOSTRAR ÁREA DE LANÇAMENTOS
// ===============================

function mostrarArea(id, reservas) {
  if (!id) {
    document.getElementById("areaLancamentos").style.display = "none";
    document.getElementById("listaLanc").style.display = "none";
    return;
  }

  const reserva = reservas.find(x => x.id == id);

  document.getElementById("areaLancamentos").style.display = "block";
  document.getElementById("listaLanc").style.display = "block";

  iniciarFormulario(reserva.id);
  listarLancamentos(reserva.id);
}


// ===============================
// FORMULÁRIO DE LANÇAMENTO
// ===============================

function iniciarFormulario(reservaId) {
  const form = document.getElementById("formLancamento");

  form.onsubmit = async (e) => {
    e.preventDefault();

    const dados = {
      reserva_id: reservaId,
      tipo: document.getElementById("tipo").value,
      descricao: document.getElementById("descricao").value,
      valor: Number(document.getElementById("valor").value)
    };

    const { error } = await supabase.from("lancamentos").insert([dados]);

    if (error) {
      alert("Erro ao adicionar lançamento");
      return;
    }

    alert("Lançamento adicionado!");
    form.reset();
    listarLancamentos(reservaId);
  };
}


// ===============================
// LISTAR LANÇAMENTOS
// ===============================

async function listarLancamentos(reservaId) {
  const box = document.getElementById("lancamentosContainer");

  const { data, error } = await supabase
    .from("lancamentos")
    .select("*")
    .eq("reserva_id", reservaId)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  box.innerHTML = "";

  data.forEach(l => {
    box.innerHTML += `
      <div class="lanc-item">
        <span><strong>${l.tipo.toUpperCase()}</strong> — ${l.descricao}</span>
        <span>R$ ${l.valor.toFixed(2)}</span>
      </div>
    `;
  });
}

