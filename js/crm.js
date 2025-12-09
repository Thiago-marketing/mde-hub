/* =========================================================
   MDE HUB • CRM.JS
   Integração CRM Hoteleiro 5.0 (Leads + Kanban + Propostas)
========================================================= */

import { supabase } from "./supabase.js";

/* ---------------------------------------------------------
   CONFIG BÁSICA
--------------------------------------------------------- */

export const KANBAN_ETAPAS = [
  "novo",
  "contato",
  "qualificado",
  "proposta",
  "follow_up",
  "ganho",
  "perdido"
];

/**
 * Recupera o hotel atual da sessão (definido em outra parte do app).
 */
export function getHotelId() {
  return sessionStorage.getItem("hotel_id") || null;
}

/**
 * Recupera o usuário atual (quando Auth estiver ligado).
 * Por enquanto só tenta ler de sessionStorage.
 */
export function getUserId() {
  return sessionStorage.getItem("user_id") || null;
}

/* ---------------------------------------------------------
   FUNÇÕES PRINCIPAIS DO CRM
--------------------------------------------------------- */

/**
 * Atualiza a etapa de um lead no funil Kanban.
 * @param {string} leadId
 * @param {string} novaEtapa
 */
export async function atualizarEtapaLead(leadId, novaEtapa) {
  try {
    if (!leadId) throw new Error("Lead inválido");

    const { error } = await supabase
      .from("leads")
      .update({
        etapa: novaEtapa,
        updated_at: new Date().toISOString()
      })
      .eq("id", leadId);

    if (error) throw error;

    console.log("Etapa do lead atualizada para:", novaEtapa);
  } catch (err) {
    console.error("Erro ao atualizar etapa do lead:", err.message);
    alert("Não foi possível atualizar a etapa do lead.");
  }
}

/**
 * Registra uma atividade na timeline do lead.
 * @param {string} leadId
 * @param {string} tipo
 * @param {string} descricao
 */
export async function criarAtividade(leadId, tipo, descricao) {
  try {
    if (!leadId) throw new Error("Lead inválido");

    const { error } = await supabase.from("atividades").insert({
      lead_id: leadId,
      tipo,
      descricao,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    console.log("Atividade registrada:", tipo);
  } catch (err) {
    console.error("Erro ao criar atividade:", err.message);
  }
}

/**
 * Carrega todas as propostas vinculadas a um lead.
 * @param {string} leadId
 * @returns {Promise<Array>}
 */
export async function carregarPropostasLead(leadId) {
  try {
    if (!leadId) throw new Error("Lead inválido");

    const { data, error } = await supabase
      .from("propostas")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.error("Erro ao carregar propostas do lead:", err.message);
    return [];
  }
}

/**
 * Carrega todas as propostas do hotel atual e devolve
 * um mapa por lead_id para ser usado no Kanban.
 * @returns {Promise<Map<string, Array>>}
 */
export async function carregarMapaPropostasPorLead() {
  const hotelId = getHotelId();
  const mapa = new Map();

  try {
    if (!hotelId) {
      console.warn("Nenhum hotel_id na sessão para carregar propostas.");
      return mapa;
    }

    const { data, error } = await supabase
      .from("propostas")
      .select("*")
      .eq("hotel_id", hotelId);

    if (error) throw error;

    (data || []).forEach((prop) => {
      if (!mapa.has(prop.lead_id)) {
        mapa.set(prop.lead_id, []);
      }
      mapa.get(prop.lead_id).push(prop);
    });

    return mapa;
  } catch (err) {
    console.error("Erro ao carregar mapa de propostas:", err.message);
    return mapa;
  }
}

/* ---------------------------------------------------------
   UI – APLICAÇÃO VISUAL NOS CARDS DO KANBAN
--------------------------------------------------------- */

/**
 * Aplica selos de propostas nos cards do Kanban, baseado
 * em um mapa { lead_id -> [propostas] }.
 * 
 * Espera que cada card tenha:
 * <div class="kanban-card" data-lead-id="...">...</div>
 * e um container opcional .lead-proposta-info para injetar badge.
 *
 * @param {Map<string, Array>} mapaPropostas
 */
export function aplicarBadgesPropostasNoKanban(mapaPropostas) {
  const cards = document.querySelectorAll(".kanban-card[data-lead-id]");

  cards.forEach((card) => {
    const leadId = card.getAttribute("data-lead-id");
    const propostas = mapaPropostas.get(leadId);

    let info = card.querySelector(".lead-proposta-info");
    if (!info) {
      info = document.createElement("div");
      info.className = "lead-proposta-info";
      card.appendChild(info);
    }
    info.innerHTML = "";

    if (!propostas || propostas.length === 0) {
      info.style.display = "none";
      return;
    }

    info.style.display = "flex";
    info.style.justifyContent = "space-between";
    info.style.marginTop = "6px";

    const ultima = propostas[0]; // já vem ordenada desc se usar carregarPropostasLead

    const badge = document.createElement("span");
    badge.className = "badge badge-proposta";
    badge.textContent =
      ultima.status === "aceita"
        ? "✅ Proposta aceita"
        : ultima.status === "enviada"
        ? "📄 Proposta enviada"
        : "📄 Proposta";

    const valor = document.createElement("span");
    valor.className = "valor-proposta";
    valor.textContent = ultima.valor_total
      ? `R$ ${Number(ultima.valor_total).toLocaleString("pt-BR", {
          minimumFractionDigits: 2
        })}`
      : "";

    info.appendChild(badge);
    info.appendChild(valor);
  });
}

/* ---------------------------------------------------------
   KANBAN – DRAG & DROP
--------------------------------------------------------- */

/**
 * Inicializa o drag & drop do Kanban.
 * Espera colunas com .kanban-column[data-etapa]
 * e cards com .kanban-card[data-lead-id].
 */
export function initKanbanDragAndDrop() {
  const cards = document.querySelectorAll(".kanban-card");
  const columns = document.querySelectorAll(".kanban-column");

  let draggedCard = null;

  cards.forEach((card) => {
    card.setAttribute("draggable", "true");

    card.addEventListener("dragstart", (e) => {
      draggedCard = card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    card.addEventListener("dragend", () => {
      if (draggedCard) {
        draggedCard.classList.remove("dragging");
        draggedCard = null;
      }
    });
  });

  columns.forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      col.classList.add("drag-over");
    });

    col.addEventListener("dragleave", () => {
      col.classList.remove("drag-over");
    });

    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");

      if (!draggedCard) return;

      const leadId = draggedCard.getAttribute("data-lead-id");
      const novaEtapa = col.getAttribute("data-etapa");

      // Move visualmente
      const list = col.querySelector(".kanban-list") || col;
      list.appendChild(draggedCard);

      // Atualiza no Supabase
      await atualizarEtapaLead(leadId, novaEtapa);

      // Atividade automática
      await criarAtividade(
        leadId,
        "mudanca_etapa",
        `Lead movido para a etapa: ${novaEtapa}`
      );

      // Se entrou na coluna de Proposta, podemos disparar modal
      if (novaEtapa === "proposta") {
        abrirModalPropostaParaLead(leadId);
      }
    });
  });

  console.log("Kanban drag & drop inicializado.");
}

/**
 * Abre modal de criação/associação de proposta para o lead.
 * Se o modal não existir ainda, apenas loga no console.
 * 
 * Espera um elemento #modalProposta (opcional).
 */
export function abrirModalPropostaParaLead(leadId) {
  const modal = document.getElementById("modalProposta");
  if (!modal) {
    console.log(
      "Lead entrou na etapa Proposta. Implementar modalProposta futuramente. leadId=",
      leadId
    );
    return;
  }

  // Exemplo de uso: setar leadId em um hidden
  const inputLead = modal.querySelector("input[name='lead_id']");
  if (inputLead) {
    inputLead.value = leadId;
  }

  modal.classList.add("open");
}

/* ---------------------------------------------------------
   INICIALIZAÇÃO AUTOMÁTICA EM PÁGINAS DE CRM
--------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  const body = document.body;

  // Se for uma página de Kanban (possui .kanban-board), ativa drag & drop
  if (body.classList.contains("page-crm-kanban")) {
    initKanbanDragAndDrop();

    // Carrega propostas por lead e aplica badges
    const mapa = await carregarMapaPropostasPorLead();
    aplicarBadgesPropostasNoKanban(mapa);
  }

  // Outras páginas de CRM podem ser tratadas aqui no futuro
  console.log("CRM.js carregado.");
});
