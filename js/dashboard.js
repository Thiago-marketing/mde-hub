// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // carrega sidebar/header
  document.querySelectorAll("[data-include]").forEach(el => {
    fetch(el.getAttribute("data-include"))
      .then(res => res.text())
      .then(html => el.innerHTML = html);
  });

  carregarDashboard();
});

async function carregarDashboard() {
  try {
    // 1) Usuário logado
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error(authError);
    }

    const user = authData?.user || null;

    if (user) {
      const name =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Usuário";

      document.getElementById("userName").textContent = name;
      document.getElementById("userEmail").textContent = user.email || "";
    }

    const hoje = new Date().toISOString().split("T")[0];

    // 2) Buscar leads
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, etapa, proximo_contato");

    if (leadsError) {
      console.error("Erro ao carregar leads:", leadsError);
    }

    const totalLeads = leads?.length || 0;
    const proximosHoje = (leads || []).filter(
      l => l.proximo_contato === hoje
    ).length;

    // 3) Buscar UHs
    const { data: uhs, error: uhsError } = await supabase
      .from("uhs")
      .select("id, status");

    if (uhsError) {
      console.error("Erro ao carregar UHs:", uhsError);
    }

    const totalUhs = uhs?.length || 0;
    const uhsOcupadas = (uhs || []).filter(u => u.status === "ocupado").length;
    const uhsLivres = (uhs || []).filter(u => u.status === "livre").length;

    // 4) Reservas de hoje (Lite)
    const { data: reservasHoje, error: resError } = await supabase
      .from("reservas")
      .select("id, nome_hospede, checkin, checkout")
      .or(`checkin.eq.${hoje},checkout.eq.${hoje}`);

    if (resError) {
      console.error("Erro ao carregar reservas:", resError);
    }

    // 5) Preencher cards de KPIs

    // CRM
    document.getElementById("kpiTotalLeads").textContent = totalLeads;
    document.getElementById("kpiProxHoje").textContent = proximosHoje;

    document.getElementById("resumoLeadsTotal").textContent = totalLeads;
    document.getElementById("resumoLeadsProxHoje").textContent =
      proximosHoje;

    // PMS Lite
    document.getElementById("kpiTotalUhs").textContent = totalUhs;
    document.getElementById("kpiUhsOcupadas").textContent = uhsOcupadas;

    document.getElementById("resumoUhsTotal").textContent = totalUhs;
    document.getElementById("resumoUhsLivres").textContent = uhsLivres;
    document.getElementById("resumoUhsOcupadas").textContent = uhsOcupadas;

    const textoReservas = document.getElementById("textoReservasHoje");

    if (reservasHoje && reservasHoje.length > 0) {
      const qtd = reservasHoje.length;
      textoReservas.textContent =
        qtd === 1
          ? "Existe 1 reserva com movimento hoje (check-in ou check-out)."
          : `Existem ${qtd} reservas com movimento hoje (check-in ou check-out).`;
    } else {
      textoReservas.textContent = "Nenhuma reserva com movimento hoje ainda.";
    }
  } catch (e) {
    console.error("Erro geral no dashboard:", e);
  }
}
