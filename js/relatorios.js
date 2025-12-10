/* =========================================================================
   MDE HUB • RELATORIOS.JS PREMIUM
   Carrega estatísticas, gráficos e rankings vindos do Acumulador (SQL Server)
========================================================================= */

import { supabase } from "./supabase.js";

const hotelSelect = document.querySelector("#hotelSelect");

/* ELEMENTOS */
const tabelaUH = document.querySelector("#tabelaRankingUH");
const tabelaCanais = document.querySelector("#tabelaCanais");

/* GRÁFICOS */
let graficoOcupacao = null;
let graficoReceita = null;

/* ----------------------------------------------------------------------
   MOSTRA LOADING NAS TABELAS
---------------------------------------------------------------------- */
function showLoading() {
    tabelaUH.innerHTML = `<tr><td colspan="3">Carregando...</td></tr>`;
    tabelaCanais.innerHTML = `<tr><td colspan="3">Carregando...</td></tr>`;
}

/* ----------------------------------------------------------------------
   MOCK SQL SERVER (Acumulador) — substitua quando a API estiver pronta
---------------------------------------------------------------------- */
async function fetchRelatoriosFromAcumulador(hotelId) {

    console.log("🔍 Consultando relatórios do hotel:", hotelId);

    await new Promise(r => setTimeout(r, 300));

    return {
        ocupacao_media: 62,
        receita_mes: 58740,
        ticket_medio: 380,
        revpar: 215,

        ocupacao_diaria: Array.from({ length: 30 }).map(() => Math.floor(Math.random() * 100)),
        receita_diaria: Array.from({ length: 30 }).map(() => Math.floor(Math.random() * 5000)),

        ranking_uh: [
            { uh: "305 — Master", reservas: 18, receita: 12400 },
            { uh: "210 — Luxo", reservas: 15, receita: 9800 },
            { uh: "108 — Standard", reservas: 22, receita: 8900 },
        ],

        canais: [
            { origem: "Booking.com", reservas: 32, receita: 18700 },
            { origem: "Site Próprio", reservas: 21, receita: 13900 },
            { origem: "Balcão", reservas: 15, receita: 7400 }
        ]
    };
}

/* ----------------------------------------------------------------------
   RENDERIZA CARDS
---------------------------------------------------------------------- */
function renderCards(data) {
    document.querySelector("#card_ocupacao_media").innerText = data.ocupacao_media + "%";
    document.querySelector("#card_receita_mes").innerText = "R$ " + data.receita_mes.toLocaleString("pt-BR");
    document.querySelector("#card_ticket_medio").innerText = "R$ " + data.ticket_medio.toLocaleString("pt-BR");
    document.querySelector("#card_revpar").innerText = "R$ " + data.revpar.toLocaleString("pt-BR");
}

/* ----------------------------------------------------------------------
   RENDERIZA TABELAS
---------------------------------------------------------------------- */
function renderTabelas(data) {

    // UH Ranking
    tabelaUH.innerHTML = "";
    data.ranking_uh.forEach(r => {
        tabelaUH.innerHTML += `
            <tr>
                <td>${r.uh}</td>
                <td>${r.reservas}</td>
                <td>R$ ${r.receita.toLocaleString("pt-BR")}</td>
            </tr>
        `;
    });

    // Canais de venda
    tabelaCanais.innerHTML = "";
    data.canais.forEach(r => {
        tabelaCanais.innerHTML += `
            <tr>
                <td>${r.origem}</td>
                <td>${r.reservas}</td>
                <td>R$ ${r.receita.toLocaleString("pt-BR")}</td>
            </tr>
        `;
    });
}

/* ----------------------------------------------------------------------
   GRÁFICOS (Chart.js)
---------------------------------------------------------------------- */
function renderGraficos(data) {

    // Ocupação diária
    const ctx1 = document.querySelector("#graficoOcupacao").getContext("2d");

    if (graficoOcupacao) graficoOcupacao.destroy();

    graficoOcupacao = new Chart(ctx1, {
        type: "line",
        data: {
            labels: data.ocupacao_diaria.map((_, i) => i + 1),
            datasets: [{
                label: "Ocupação (%)",
                data: data.ocupacao_diaria,
                borderWidth: 2,
                borderColor: "#0ea5e9",
                pointRadius: 0,
                tension: .3
            }]
        },
        options: { responsive: true }
    });

    // Receita diária
    const ctx2 = document.querySelector("#graficoReceita").getContext("2d");

    if (graficoReceita) graficoReceita.destroy();

    graficoReceita = new Chart(ctx2, {
        type: "bar",
        data: {
            labels: data.receita_diaria.map((_, i) => i + 1),
            datasets: [{
                label: "Receita (R$)",
                data: data.receita_diaria,
                backgroundColor: "#22c55e",
                borderRadius: 6
            }]
        },
        options: { responsive: true }
    });
}

/* ----------------------------------------------------------------------
   FUNÇÃO PRINCIPAL
---------------------------------------------------------------------- */
async function carregarRelatorios() {
    const hotelId = hotelSelect.value;
    if (!hotelId || hotelId === "Carregando hotéis...") return;

    showLoading();

    const data = await fetchRelatoriosFromAcumulador(hotelId);

    renderCards(data);
    renderTabelas(data);
    renderGraficos(data);
}

/* EVENTOS */
hotelSelect?.addEventListener("change", carregarRelatorios);

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (hotelSelect && hotelSelect.value !== "Carregando hotéis...") {
            carregarRelatorios();
        }
    }, 500);
});
