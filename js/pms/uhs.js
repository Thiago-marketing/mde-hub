/***************************************************
 * PMS Lite - UHs (CRUD Completo)
 * MDE Hub - BRsys
 **************************************************/

// ----------- CONFIGURAÇÃO SUPABASE ------------
const sb = supabase; // já vem do supabase.js

// TABELA
const TABLE = "uhs";

// STORAGE
const STORAGE_BUCKET = "uh-fotos";


// ----------- ELEMENTOS DA INTERFACE ------------
const btnAddUH = document.getElementById("btnAddUH");
const modalUH = document.getElementById("modalUH");
const modalTitle = document.getElementById("modalTitle");
const btnCancel = document.getElementById("btnCancel");

const uhGrid = document.getElementById("uhGrid");
const uhTableBody = document.getElementById("uhTableBody");
const uhResumo = document.getElementById("uhResumo");

const formUH = document.getElementById("uhForm");

const inputId = document.getElementById("uhId");
const inputNumero = document.getElementById("numeroUH");
const inputCategoria = document.getElementById("categoriaUH");
const inputStatus = document.getElementById("statusUH");
const inputPreco = document.getElementById("precoUH");
const inputFoto = document.getElementById("fotoUH");


// ----------- ABRIR MODAL ------------
btnAddUH.addEventListener("click", () => {
    inputId.value = "";
    formUH.reset();
    modalTitle.textContent = "Nova UH";
    modalUH.classList.remove("hidden");
});

btnCancel.addEventListener("click", () => {
    modalUH.classList.add("hidden");
});


// ----------- CARREGAR TODAS AS UHs ------------
async function loadUHs() {
    const { data, error } = await sb.from(TABLE).select("*").order("numero");

    if (error) {
        console.error("Erro ao carregar UHs:", error);
        return;
    }

    montarGrid(data);
    montarTabela(data);
    uhResumo.textContent = `${data.length} UH(s)`;
}

loadUHs();


// ----------- GRID VISUAL ------------
function montarGrid(lista) {
    uhGrid.innerHTML = "";

    lista.forEach(uh => {
        const card = document.createElement("div");
        card.className = `uh-card status-${uh.status}`;

        card.innerHTML = `
            <h3>${uh.numero}</h3>
            <p>${uh.categoria || "-"}</p>
        `;

        card.addEventListener("click", () => editarUH(uh));

        uhGrid.appendChild(card);
    });
}


// ----------- TABELA LISTA ------------
function montarTabela(lista) {
    uhTableBody.innerHTML = "";

    lista.forEach(uh => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${uh.numero}</td>
            <td>${uh.categoria ?? "-"}</td>
            <td>${formatarStatus(uh.status)}</td>
            <td>R$ ${Number(uh.preco ?? 0).toFixed(2)}</td>
            <td>
                <button class="btn-small btn-primary" onclick="editarUH(${uh.id})">Editar</button>
                <button class="btn-small btn-danger" onclick="excluirUH(${uh.id})">Excluir</button>
            </td>
        `;

        uhTableBody.appendChild(row);
    });
}

function formatarStatus(s) {
    const map = {
        livre: "Livre",
        ocupado: "Ocupado",
        limpeza: "Limpeza",
        manutencao: "Manutenção",
        bloqueado: "Bloqueado"
    };
    return map[s] || "-";
}


// ----------- EDITAR ------------
async function editarUH(id) {
    // Se veio um objeto direto do grid
    if (typeof id === "object") {
        preencherModal(id);
        return;
    }

    const { data, error } = await sb.from(TABLE).select("*").eq("id", id).single();

    if (error) {
        alert("Erro ao carregar UH!");
        return;
    }

    preencherModal(data);
}

function preencherModal(uh) {
    inputId.value = uh.id;
    inputNumero.value = uh.numero;
    inputCategoria.value = uh.categoria;
    inputStatus.value = uh.status;
    inputPreco.value = uh.preco || 0;

    modalTitle.textContent = "Editar UH";
    modalUH.classList.remove("hidden");
}


// ----------- SALVAR (CRIAR / ATUALIZAR) ------------
formUH.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = inputId.value.trim();
    const numero = inputNumero.value.trim();
    const categoria = inputCategoria.value.trim();
    const status = inputStatus.value;
    const preco = parseFloat(inputPreco.value || 0);

    // --------- VALIDAÇÃO DE DUPLICIDADE ----------
    const { data: existentes } = await sb.from(TABLE)
        .select("*")
        .eq("numero", numero);

    if (!id && existentes && existentes.length > 0) {
        alert("Já existe uma UH com esse número!");
        return;
    }

    let fotoURL = null;

    // --------- UPLOAD DE FOTO (OPCIONAL) ----------
    if (inputFoto.files.length > 0) {
        const arquivo = inputFoto.files[0];
        const nomeArquivo = `${Date.now()}-${arquivo.name}`;

        const { error: uploadError } = await sb.storage
            .from(STORAGE_BUCKET)
            .upload(nomeArquivo, arquivo);

        if (uploadError) {
            console.warn("Erro no upload da foto:", uploadError);
        } else {
            fotoURL = `${nomeArquivo}`;
        }
    }

    // -------- CRIAÇÃO OU ATUALIZAÇÃO --------
    let payload = {
        numero,
        categoria,
        status,
        preco,
    };

    if (fotoURL) payload.foto = fotoURL;

    let result;

    if (id) {
        result = await sb.from(TABLE).update(payload).eq("id", id);
    } else {
        result = await sb.from(TABLE).insert(payload);
    }

    if (result.error) {
        alert("Erro ao salvar UH!");
        console.error(result.error);
        return;
    }

    modalUH.classList.add("hidden");
    formUH.reset();
    loadUHs();
    alert("UH salva com sucesso!");
});


// ----------- EXCLUIR ------------
async function excluirUH(id) {
    if (!confirm("Tem certeza que deseja excluir esta UH?")) return;

    const { error } = await sb.from(TABLE).delete().eq("id", id);

    if (error) {
        alert("Erro ao excluir UH!");
        return;
    }

    loadUHs();
    alert("UH removida!");
}

