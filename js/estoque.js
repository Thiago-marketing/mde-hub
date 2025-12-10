/* =========================================================================
   MDE HUB • ESTOQUE.JS PREMIUM
   Lê os dados do Acumulador (SQL Server) e atualiza o estoque
   -------------------------------------------------------------------------
========================================================================= */

import { supabase } from "./supabase.js";

const hotelSelect = document.querySelector("#hotelSelect");
const tabelaEstoque = document.querySelector("#tabelaEstoque");
const tabelaMov = document.querySelector("#tabelaMovimentacoes");

/* ----------------------------------------------------------------------
   EXIBE LOADING
---------------------------------------------------------------------- */
function showLoading() {
    tabelaEstoque.innerHTML = `<tr><td colspan="4">Carregando...</td></tr>`;
    tabelaMov.innerHTML = `<tr><td colspan="4">Carregando...</td></tr>`;
}

/* ----------------------------------------------------------------------
   CONSULTA MOCK (SQL Server → Acumulador)
---------------------------------------------------------------------- */
async function fetchEstoqueFromAcumulador(hotelId) {
    console.log("🔍 Consultando estoque do hotel:", hotelId);

    // Simula atraso
    await new Promise(r => setTimeout(r, 300));

    return {
        total_itens: 18,
        itens_criticos: 4,
        movimentacoes_hoje: 6,
        ultima_atualizacao: "10:42",

        estoque: [
            { item: "Sabonete 20g", atual: 320, minimo: 200 },
            { item: "Shampoo 30ml", atual: 150, minimo: 300 },
            { item: "Fronha", atual: 45, minimo: 60 },
            { item: "Lençol", atual: 12, minimo: 30 },
            { item: "Café em pó 500g", atual: 8, minimo: 15 },
            { item: "Papel higiênico", atual: 120, minimo: 80 }
        ],

        movimentacoes: [
            { tipo: "Saída", item: "Shampoo 30ml", qtd: 40, hora: "08:15" },
            { tipo: "Saída", item: "Sabonete 20g", qtd: 60, hora: "08:40" },
            { tipo: "Entrada", item: "Lençol", qtd: 20, hora: "09:10" },
            { tipo: "Saída", item: "Fronha", qtd: 10, hora: "09:50" },
            { tipo: "Entrada", item: "Café em pó", qtd: 12, hora: "10:05" },
            { tipo: "Saída", item: "Papel higiênico", qtd: 25, hora: "10:20" }
        ]
    };
}

/* ----------------------------------------------------------------------
   RENDERIZA INDICADORES E TABELAS
---------------------------------------------------------------------- */
function renderEstoque(data) {

    document.querySelector("#card_total_itens").innerText = data.total_itens;
    document.querySelector("#card_itens_criticos").innerText = data.itens_criticos;
    document.querySelector("#card_movimentacoes").innerText = data.movimentacoes_hoje;
    document.querySelector("#card_atualizacao").innerText = data.ultima_atualizacao;

    // Tabela de estoque
    tabelaEstoque.innerHTML = "";
    data.estoque.forEach(i => {
        const situacao = i.atual < i.minimo
            ? `<span style="color:#ff4d4d; font-weight:bold;">Crítico</span>`
            : `<span style="color:#0fbf6f; font-weight:bold;">OK</span>`;

        tabelaEstoque.innerHTML += `
            <tr>
                <td>${i.item}</td>
                <td>${i.atual}</td>
                <td>${i.minimo}</td>
                <td>${situacao}</td>
            </tr>
        `;
    });

    // Movimentações
    tabelaMov.innerHTML = "";
    data.movimentacoes.forEach(m => {
        tabelaMov.innerHTML += `
            <tr>
                <td>${m.tipo}</td>
                <td>${m.item}</td>
                <td>${m.qtd}</td>
                <td>${m.hora}</td>
            </tr>
        `;
    });
}

/* ----------------------------------------------------------------------
   FUNÇÃO PRINCIPAL
---------------------------------------------------------------------- */
async function carregarEstoque() {
    const hotelId = hotelSelect.value;

    if (!hotelId || hotelId === "Carregando hotéis...") return;

    showLoading();

    const data = await fetchEstoqueFromAcumulador(hotelId);
    renderEstoque(data);
}

/* ----------------------------------------------------------------------
   EVENTOS
---------------------------------------------------------------------- */
hotelSelect?.addEventListener("change", carregarEstoque);

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (hotelSelect && hotelSelect.value !== "Carregando hotéis...") {
            carregarEstoque();
        }
    }, 500);
});
