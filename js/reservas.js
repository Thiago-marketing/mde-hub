/* =========================================================================
   MDE HUB • RESERVAS.JS PREMIUM
   Lê o hotel selecionado, consulta API do acumulador e popula os cartões.
   -------------------------------------------------------------------------
   OBS: Este arquivo está pronto para conexão SQL Server assim que o endpoint
   do Acumulador for liberado.
========================================================================= */

import { supabase } from "./supabase.js";

/* ----------------------------------------------------------------------
   1) CAPTURAR ELEMENTOS DA PÁGINA
---------------------------------------------------------------------- */
const hotelSelect = document.querySelector("#hotelSelect");
const grid = document.querySelector(".grid");

/* ----------------------------------------------------------------------
   2) PLACEHOLDER DE LOADING PREMIUM
---------------------------------------------------------------------- */
function showLoading() {
    grid.innerHTML = `
        <div class="card">
            <div class="card-title">Carregando reservas...</div>
            <p class="card-desc">Consultando o SQL Server, aguarde...</p>
        </div>
    `;
}

/* ----------------------------------------------------------------------
   3) RENDERIZAR RESERVAS NA TELA
---------------------------------------------------------------------- */
function renderReservas(lista) {
    if (!lista || lista.length === 0) {
        grid.innerHTML = `
            <div class="card">
                <div class="card-title">Nenhuma reserva encontrada</div>
                <p class="card-desc">Não há dados para o hotel selecionado.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = "";

    lista.forEach(r => {
        const card = document.createElement("div");
        card.classList.add("card", "reserva-card");

        const statusClass = {
            "checkin": "status-checkin",
            "checkout": "status-checkout",
            "hospedado": "status-hospedado",
            "pendente": "status-pendente"
        }[r.status] || "status-pendente";

        card.innerHTML = `
            <div class="card-title">${r.titulo}</div>

            <div class="reserva-info">
                <strong>${r.hospede}</strong><br>
                UH: ${r.uh}<br>
                ${r.infoExtra || ""}
            </div>

            <span class="reserva-status ${statusClass}">
                ${r.status.toUpperCase()}
            </span>
        `;

        grid.appendChild(card);
    });
}

/* ----------------------------------------------------------------------
   4) CONSULTAR SQL SERVER via ACUMULADOR (endpoint futuro)
---------------------------------------------------------------------- */
async function fetchReservasFromAcumulador(hotelId) {

    // IMPORTANTE: aqui entrará o endpoint REAL do Bera.
    // Exemplo de endpoint:
    // GET: https://api.mdehub.com/acumulador/reservas?hotel_id=123

    try {
        console.log("🔍 Consultando reservas do hotel:", hotelId);

        // *** MOCK TEMPORÁRIO ***
        // 🔥 Quando o SQL Server estiver conectado, troque por fetch(endpoint)
        const mock = [
            {
                titulo: "Entrada Hoje",
                hospede: "João Pereira",
                uh: "203 — Luxo Casal",
                status: "checkin",
                infoExtra: "Check-in previsto: 14:00"
            },
            {
                titulo: "Saída Hoje",
                hospede: "Ana Silva",
                uh: "108 — Standard",
                status: "checkout",
                infoExtra: "Check-out até 12:00"
            },
            {
                titulo: "Hóspede Atual",
                hospede: "Marcos Braga",
                uh: "305 — Master",
                status: "hospedado",
                infoExtra: "Saída prevista: amanhã"
            },
            {
                titulo: "Reserva Futura",
                hospede: "Camila Duarte",
                uh: "210 — Luxo",
                status: "pendente",
                infoExtra: "Entrada: 15/12"
            }
        ];

        // apenas simula atraso para parecer real
        await new Promise(r => setTimeout(r, 300));

        return mock;

    } catch (err) {
        console.error("Erro ao consultar acumulador:", err);
        return [];
    }
}

/* ----------------------------------------------------------------------
   5) CARREGAR RESERVAS QUANDO MUDAR HOTEL
---------------------------------------------------------------------- */
async function carregarReservas() {
    const hotelId = hotelSelect.value;

    if (!hotelId || hotelId === "Carregando hotéis...") return;

    showLoading();

    const reservas = await fetchReservasFromAcumulador(hotelId);
    renderReservas(reservas);
}

/* ----------------------------------------------------------------------
   6) OUVIR ALTERAÇÃO DE HOTEL
---------------------------------------------------------------------- */
hotelSelect?.addEventListener("change", carregarReservas);

/* ----------------------------------------------------------------------
   7) CARREGAR AUTOMATICAMENTE AO ABRIR A PÁGINA
---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    // Quando o app.js carregar os hotéis, chamaremos carregarReservas()
    setTimeout(() => {
        if (hotelSelect && hotelSelect.value !== "Carregando hotéis...") {
            carregarReservas();
        }
    }, 500);
});
