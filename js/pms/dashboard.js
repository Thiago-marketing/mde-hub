/***************************************************
 * DASHBOARD – PMS Lite
 ***************************************************/
const sb = supabase;

// ELEMENTOS
const dashOcupacao = document.getElementById("dashOcupacao");
const dashHospedados = document.getElementById("dashHospedados");
const dashReceitaHoje = document.getElementById("dashReceitaHoje");
const dashUhs = document.getElementById("dashUhs");
const listaProximas = document.getElementById("listaProximas");

document.addEventListener("DOMContentLoaded", initDashboard);

async function initDashboard() {
  await loadResumo();
  await loadProximasReservas();
}

async function loadResumo() {
  // UHs
  const { data: uhs } = await sb.from("uhs").select("*");
  const totalUhs = uhs?.length || 0;

  // Ocupados
  const hojeISO = new Date().toISOString().slice(0, 10);
  const { data: ocupadas } = await sb
    .from("reservas")
    .select("*")
    .lte("checkin", hojeISO)
    .gt("checkout", hojeISO);

  const ocupadasCount = ocupadas?.length || 0;

  const ocupacao = totalUhs > 0 ? Math.round((ocupadasCount / totalUhs) * 100) : 0;

  dashOcupacao.textContent = ocupacao + "%";
  dashHospedados.textContent = ocupadasCount;
  dashUhs.textContent = totalUhs;

  // Receita hoje
  const { data: lanc } = await sb
    .from("lancamentos")
    .select("valor")
    .gte("created_at", hojeISO + " 00:00:00")
    .lte("created_at", hojeISO + " 23:59:59");

  const totalHoje = lanc?.reduce((s, l) => s + Number(l.valor), 0) || 0;
  dashReceitaHoje.textContent = totalHoje.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

async function loadProximasReservas() {
  const hoje = new Date().toISOString().slice(0, 10);

  const { data } = await sb
    .from("reservas")
    .select("*, uhs(nome)")
    .gt("checkin", hoje)
    .order("checkin", { ascending: true })
    .limit(10);

  listaProximas.innerHTML = "";

  data?.forEach((r) => {
    const div = document.createElement("div");
    div.className = "reserva-item";
    div.innerHTML = `
      <div>
        <strong>${r.hospede}</strong>
        <p>${r.uhs?.nome || "UH"}</p>
        <p style="color: var(--text-muted)">
          ${formatarData(r.checkin)}
        </p>
      </div>
    `;
    listaProximas.appendChild(div);
  });
}

function formatarData(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR");
}
