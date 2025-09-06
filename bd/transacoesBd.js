import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://chvaqdzgvfqtcfaccomy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I"
);

const body = document.querySelector("body");

const tabela = document.querySelector(".listaTransacoes");
const cartaoTransacao = document.getElementById("cartaoTransacao");
const cartaoCategoria = document.getElementById("cartaoCategoria");

const inputNovaCategoria = cartaoCategoria.querySelector("input[name='categoria']");
const btnAdicionarCategoria = cartaoCategoria.querySelector("button:last-child");
const btnCategoriaSai = document.getElementById("btnCategoriaSai");
const btnCategoriaEntra = document.getElementById("btnCategoriaEntra");
const btnAdicionarTransacao = document.querySelector(".transacoes_botoes_sent button[type='submit']");

const tipoSelect = cartaoTransacao.querySelector("select[name='tipo']");
const categoriaSelect = cartaoTransacao.querySelector("select[name='categoria']");

btnCategoriaEntra.addEventListener("click", () => cartaoCategoria.style.display = "block");
btnCategoriaSai.addEventListener("click", () => cartaoCategoria.style.display = "none");

function mostrarAlerta(mensagem) {
  const overlay = document.createElement("div");
  overlay.className = "alert-overlay";

  overlay.innerHTML = `
    <div class="alert-card">
      <p>${mensagem}</p>
      <button>OK</button>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector("button").addEventListener("click", () => overlay.remove());
}


function mostrarConfirmacao(mensagem) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "alert-overlay";

    overlay.innerHTML = `
      <div class="alert-card">
        <p>${mensagem}</p>
        <div style="display:flex; justify-content:center; gap:10px; margin-top:10px;">
          <button id="simBtn">Sim</button>
          <button id="naoBtn">Não</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#simBtn").addEventListener("click", () => {
      resolve(true);
      overlay.remove();
    });

    overlay.querySelector("#naoBtn").addEventListener("click", () => {
      resolve(false);
      overlay.remove();
    });
  });
}

async function carregarCategorias(selectEl = categoriaSelect, selectedId = null) {
  const { data: categorias, error } = await supabase.from("categoria").select("*");
  if (error) return console.error("Erro ao carregar categorias:", error);

  selectEl.innerHTML = "";
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id_categoria;
    option.textContent = cat.tipo;
    if (selectedId && cat.id_categoria === selectedId) option.selected = true;
    selectEl.appendChild(option);
  });
}



btnAdicionarCategoria.addEventListener("click", async (e) => {
  e.preventDefault();

  let nomeCategoria = inputNovaCategoria.value.trim().toLowerCase();
  if (!nomeCategoria) return mostrarAlerta("Digite o nome da categoria!");

  const { data: existente } = await supabase
    .from("categoria")
    .select("id_categoria")
    .ilike("tipo", nomeCategoria)
    .maybeSingle();

if (existente) return mostrarAlerta("Essa categoria já existe!");

  const nomeFormatado = nomeCategoria.charAt(0).toUpperCase() + nomeCategoria.slice(1);

  const { data: novaCat, error } = await supabase
    .from("categoria")
    .insert([{ tipo: nomeFormatado }])
    .select();

  if (error) return alert("Erro ao criar categoria: " + error.message);

  carregarCategorias();
  inputNovaCategoria.value = "";
  cartaoCategoria.style.display = "none";
  mostrarAlerta(`Categoria "${nomeFormatado}" adicionada!`);
});

function atualizarTotal(transacoes) {
  const totalRow = tabela.querySelector(".texto_cor");
  let total = 0;

  transacoes.forEach(tran => {
    if (tran.tipo === "ganho") total += tran.valor;
    else if (tran.tipo === "gasto") total -= tran.valor;
  });

  totalRow.querySelector("td:last-child").textContent = `R$ ${total.toFixed(2)}`;
}

async function carregarTransacoes() {
  const { data: transacoes, error } = await supabase
    .from("transacoes")
    .select("id_transacao, valor, tipo, data, fk_categoria_id_categoria, categoria:fk_categoria_id_categoria(*)")
    .order("data", { ascending: false });

  if (error) return console.error("Erro ao carregar transações:", error);

  const totalRow = tabela.querySelector(".texto_cor");
  Array.from(tabela.querySelectorAll("tr.ganhos, tr.gastos")).forEach(tr => tr.remove());

  transacoes.forEach(transacao => {
    const tr = document.createElement("tr");
    tr.className = transacao.tipo === "ganho" ? "ganhos" : "gastos";
    const dataFormatada = new Date(transacao.data).toLocaleDateString("pt-BR");

    tr.innerHTML = `
      <td>${transacao.tipo === "ganho" ? "+ " : "- "} R$ ${transacao.valor.toFixed(2)}</td>
      <td>${transacao.categoria?.tipo || ""}</td>
      <td>${dataFormatada}</td>
      <td class="colunaEditarBotao">Editar</td>
    `;

    tr.querySelector(".colunaEditarBotao").addEventListener("click", () => abrirEditar(transacao, tr));

    totalRow.insertAdjacentElement("beforebegin", tr);
  });

  atualizarTotal(transacoes);
}


function abrirEditar(transacao, trLinha) {
  const cartaoEditar = document.getElementById("cartaoEditar");

  const inputValor = cartaoEditar.querySelector("input[name='valor']");
  const selectTipo = cartaoEditar.querySelector("select[name='tipo']");
  const selectCategoria = cartaoEditar.querySelector("select[name='categoria']");
  const inputData = cartaoEditar.querySelector("input[name='data']");
  const btnCancelarEditar = cartaoEditar.querySelector("#btnCancelarEditar");
  const btnAtualizar = cartaoEditar.querySelector("#btnAtualizar");
  const btnExcluir = cartaoEditar.querySelector("#btnExcluir");

  inputValor.value = transacao.valor;
  selectTipo.value = transacao.tipo;
  inputData.value = transacao.data.split("T")[0];

  carregarCategorias(selectCategoria, transacao.categoria?.id_categoria);

  cartaoEditar.style.display = "block";
  cartaoEditar.style.opacity = 1;
  cartaoEditar.style.pointerEvents = "all";

  btnCancelarEditar.onclick = () => {
    cartaoEditar.style.display = "none";
  };

  btnAtualizar.onclick = async (e) => {
    e.preventDefault();

    const novoValor = parseFloat(inputValor.value);
    const novoTipo = selectTipo.value; 
    const novaCategoriaId = parseInt(selectCategoria.value);
    const novaData = inputData.value;

    if (!novoValor || !novaCategoriaId || !novaData) {
      mostrarAlerta(`Preencha todos os campos!`);
      return;
    }

    const { data, error } = await supabase
      .from("transacoes")
      .update({
        valor: novoValor,
        tipo: novoTipo,
        data: novaData,
        fk_categoria_id_categoria: novaCategoriaId,
      })
      .eq("id_transacao", transacao.id_transacao)
      .select("*, categoria:fk_categoria_id_categoria(*)")
      .single();

    if (error) {
      alert("Erro ao atualizar: " + error.message);
      return;
    }

    trLinha.children[0].textContent = `${novoTipo === "ganho" ? "+ " : "- "} R$ ${novoValor.toFixed(2)}`;
    trLinha.children[1].textContent = data.categoria?.tipo || "";
    trLinha.children[2].textContent = novaData;

    cartaoEditar.style.display = "none";
    atualizarTotal();
    await carregarTransacoes();

  };

btnExcluir.onclick = async () => {
  const confirmado = await mostrarConfirmacao("Deseja realmente excluir essa transação?");
  if (!confirmado) return;

  // Executa a exclusão no Supabase
  const { error } = await supabase
    .from("transacoes")
    .delete()
    .eq("id_transacao", transacao.id_transacao);

  if (error) return mostrarAlerta("Erro ao excluir: " + error.message);

  // Fecha o card imediatamente
  cartaoEditar.style.display = "none";

  // Recarrega as transações para atualizar a tabela e total
  await carregarTransacoes();
};



}
const btnExcluirCategoria = document.getElementById("btnExcluirCategoria");

btnExcluirCategoria.addEventListener("click", async () => {
  const nomeCategoria = inputNovaCategoria.value.trim();
  if (!nomeCategoria) return mostrarAlerta("Digite o nome da categoria que deseja excluir!");

  const confirmado = await mostrarConfirmacao(`Tem certeza que deseja excluir a categoria "${nomeCategoria}"?`);
  if (!confirmado) return;

  const { data: cat, error } = await supabase
    .from("categoria")
    .select("*")
    .ilike("tipo", nomeCategoria)
    .maybeSingle();

  if (error) return mostrarAlerta("Erro ao buscar categoria: " + error.message);
  if (!cat) return mostrarAlerta("Categoria não encontrada!");

  const { error: delError } = await supabase
    .from("categoria")
    .delete()
    .eq("id_categoria", cat.id_categoria);

  if (delError) return mostrarAlerta("Erro ao excluir categoria: " + delError.message);

  mostrarAlerta(`Categoria "${nomeCategoria}" excluída!`, { tipo: "sucesso" });
  inputNovaCategoria.value = "";
  cartaoCategoria.style.display = "none";

  atualizarTodosSelects();
});


async function atualizarTodosSelects() {
  const selects = document.querySelectorAll("select[name='categoria']");
  selects.forEach(async (sel) => {
    await carregarCategorias(sel);
  });
}


btnAdicionarTransacao.addEventListener("click", async (e) => {
  e.preventDefault();

  const valor = parseFloat(cartaoTransacao.querySelector("input[name='valor']").value);
  const tipo = tipoSelect.value === "option1" ? "ganho" : "gasto";
  const categoriaId = parseInt(categoriaSelect.value);
  const data = cartaoTransacao.querySelector("input[name='data']").value;

  if (!valor || !tipo || !categoriaId || !data) return mostrarAlerta(`Preencha todos os campos!`);

  const { error } = await supabase.from("transacoes").insert([
    { valor, tipo, data, fk_categoria_id_categoria: categoriaId }
  ]);

  if (error) return alert("Erro ao salvar: " + error.message);

  carregarTransacoes();

  cartaoTransacao.querySelector("input[name='valor']").value = "";
  cartaoTransacao.querySelector("input[name='data']").value = "";
  tipoSelect.selectedIndex = 0;
  categoriaSelect.selectedIndex = 0;
});

const btnFiltrar = document.getElementById("btnFiltrar");
const menuFiltrar = document.getElementById("menuFiltrar");

btnFiltrar.addEventListener("click", async () => {
  menuFiltrar.style.display = menuFiltrar.style.display === "block" ? "none" : "block";
  menuFiltrar.innerHTML = "";

  const btnTodas = document.createElement("button");
  btnTodas.textContent = "Todas as categorias";
  btnTodas.style.display = "block";
  btnTodas.style.width = "100%";
  btnTodas.style.margin = "2px 0";
  btnTodas.addEventListener("click", () => {
    filtrarTransacoes(null);
    menuFiltrar.style.display = "none";
  });
  menuFiltrar.appendChild(btnTodas);

  const { data: categorias } = await supabase.from("categoria").select("*");

  categorias.forEach(cat => {
    const btnCat = document.createElement("button");
    btnCat.textContent = cat.tipo;
    btnCat.style.display = "block";
    btnCat.style.width = "100%";
    btnCat.style.margin = "2px 0";
    btnCat.addEventListener("click", () => {
      filtrarTransacoes(cat.id_categoria);
      menuFiltrar.style.display = "none";
    });
    menuFiltrar.appendChild(btnCat);
  });
});


async function filtrarTransacoes(idCategoria = null) {
  let query = supabase
    .from("transacoes")
    .select("id_transacao, valor, tipo, data, fk_categoria_id_categoria, categoria:fk_categoria_id_categoria(*)")
    .order("data", { ascending: false });

  if (idCategoria) query = query.eq("fk_categoria_id_categoria", idCategoria);

  const { data: transacoes, error } = await query;
  if (error) return mostrarAlerta("Erro ao carregar transações: " + error.message);

  const totalRow = tabela.querySelector(".texto_cor");
  Array.from(tabela.querySelectorAll("tr.ganhos, tr.gastos")).forEach(tr => tr.remove());

  transacoes.forEach(transacao => {
    const tr = document.createElement("tr");
    tr.className = transacao.tipo === "ganho" ? "ganhos" : "gastos";
    const dataFormatada = new Date(transacao.data).toLocaleDateString("pt-BR");

    tr.innerHTML = `
      <td>${transacao.tipo === "ganho" ? "+ " : "- "} R$ ${transacao.valor.toFixed(2)}</td>
      <td>${transacao.categoria?.tipo || ""}</td>
      <td>${dataFormatada}</td>
      <td class="colunaEditarBotao">Editar</td>
    `;

    tr.querySelector(".colunaEditarBotao").addEventListener("click", () => abrirEditar(transacao, tr));

    totalRow.insertAdjacentElement("beforebegin", tr);
  });

  atualizarTotal(transacoes);
}




filtrarTransacoes();
carregarCategorias();
carregarTransacoes();
