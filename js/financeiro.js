/* =========================================================================
   MDE HUB • FINANCEIRO.JS PREMIUM
   Painel financeiro do proprietário (entradas, saídas e fluxo de caixa)
   -------------------------------------------------------------------------
   TOTALMENTE PRONTO para conectar no SQL Server via Acumulador.
========================================================================= */

import { supabase } from "./supabase.js";

/* ----------------------------------------------------------------------
   CAPTURA DE ELEMENTOS
---------------------------------------------------------------------- */
const hotelSelect = document.querySelector("#hotelSelect");
const grid = document.querySelector(".grid");  // cards finance
const tabelaEntradas = document.querySelector("#tabelaEntradas");
const tabelaSaidas = document.querySelector("#tabelaSaidas");

/* ----------------------------------------------------------------------
   TEMPLATE DE LOADING
---------------------------------------------------------------------- */
function showLoading() {
    grid.innerHTML = `
        <div class="card">
            <div class="card-title">Carregando dados financeiros...</div>
            <p class="card-desc">Aguarde enquanto consultamos o SQL Server.</p>
        </div>
    `;

    if (tabelaEntradas) tabelaEntradas.innerHTML = "";
    if (tabelaSaidas) tabelaSaidas.innerHTML = "";
}

/* ----------------------------------------------------------------------
   RENDERIZAR CARDS SUPERIORES
---------------------------------------------------------------------- */
function renderFinanceCards(data) {
    grid.innerHTML = `
        <div class="card">
            <div class="card-title">Receita do Dia</div>
            <div class="card-value">R$ ${data.receita_do_dia.toLocaleString("pt-BR")}</div>
            <div class="card-desc">Total de entradas financeiras registradas hoje.</div>
        </div>

        <div class="card">
            <div class="card-title">Saídas do Dia</div>
            <div class="card-value">R$ ${data.saidas_do_dia.toLocaleString("pt-BR")}</div>
            <div class="card-desc">Total de pagamentos efetuados hoje.</div>
        </div>

        <div class="card">
            <div class="card-title">Saldo Previsto</div>
            <div class="card-value">R$ ${data.saldo_previsto.toLocaleString("pt-BR")}</div>
            <div class="card-desc">Receitas menos despesas do dia.</div>
        </div>

        <div class="card">
            <div class="card-title">Caixa Atual</div>
            <div class="card-value">R$ ${data.caixa_atual.toLocaleString("pt-BR")}</div>
            <div class="card-desc">Total disponível em caixa.</div>
        </div>
    `;
}

/* ----------------------------------------------------------------------
   RENDERIZAR TABELAS DE ENTRADAS E SAÍDAS
---------------------------------------------------------------------- */
function renderTabelaEntradas(lista) {
    if (!tabelaEntradas) return;

    if (!lista.length) {
        tabelaEntradas.innerHTML = `<tr><td colspan="3">Nenhuma entrada encontrada</td></tr>`;
        return;
    }

    tabelaEntradas.innerHTML = "";

    lista.forEach(item => {
        tabelaEntradas.innerHTML += `
            <tr>
                <td>${item.descricao}</td>
                <td>${item.origem}</td>
                <td>R$ ${item.valor.toLocaleString("pt-BR")}</td>
            </tr>
        `;
    });
}

function renderTabelaSaidas(lista) {
    if (!tabelaSaidas) return;

    if (!lista.length) {
        tabelaSaidas.innerHTML = `<tr><td colspan="3">Nenhuma saída encontrada</td></tr>`;
        return;
    }

    tabelaSaidas.innerHTML = "";

    lista.forEach(item => {
        tabelaSaidas.innerHTML += `
            <tr>
                <td>${item.descricao}</td>
                <td>${item.categoria}</td>
                <td>R$ ${item.valor.toLocaleString("pt-BR")}</td>
            </tr>
        `;
    });
}

/* ----------------------------------------------------------------------
   CONSULTAR ACUMULADOR (SQL SERVER)
   Este endpoint será implementado pelo Bera depois
---------------------------------------------------------------------- */
async function fetchFinanceiroFromAcumulador(hotelId) {

    try {
        console.log("🔍 Consultando financeiro do hotel:", hotelId);

        // 🔥 MOCK TEMPORÁRIO (simulando SQL Server)
        const mock = {
            receita_do_dia: 12470.00,
            saidas_do_dia: 3200.00,
            saldo_previsto: 9270.00,
            caixa_atual: 18700.00,

            entradas: [
                { descricao: "Diária UH 305", origem: "Hospedagem", valor: 460.00 },
                { descricao: "Consumo — Restaurante", origem: "A&B", valor: 120.00 },
                { descricao: "Reserva Direta", origem: "Website", valor: 720.00 }
            ],

            saidas: [
                { descricao: "Compra de alimentos", categoria: "A&B", valor: 840.00 },
                { descricao: "Manutenção elétrica", categoria: "Manutenção", valor: 250.00 },
                { descricao: "Lavanderia", categoria: "Serviços", valor: 180.00 }
            ]
        };

        await new Promise(r => setTimeout(r, 300));

        return mock;

    } catch (error) {
        console.error("Erro ao carregar financeiro:", error);
        return null;
    }
}

/* ----------------------------------------------------------------------
   FUNÇÃO PRINCIPAL
---------------------------------------------------------------------- */
async function carregarFinanceiro() {
    const hotelId = hotelSelect.value;

    if (!hotelId || hotelId === "Carregando hotéis...") return;

    showLoading();

    const data = await fetchFinanceiroFromAcumulador(hotelId);
    if (!data) return;

    renderFinanceCards(data);
    renderTabelaEntradas(data.entradas);
    renderTabelaSaidas(data.saidas);
}

/* ----------------------------------------------------------------------
   EVENTO QUANDO O HOTEL MUDA
---------------------------------------------------------------------- */
hotelSelect?.addEventListener("change", carregarFinanceiro);

/* ----------------------------------------------------------------------
   CARREGAR AO ABRIR A PÁGINA
---------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (hotelSelect && hotelSelect.value !== "Carregando hotéis...") {
            carregarFinanceiro();
        }
    }, 500);
});
