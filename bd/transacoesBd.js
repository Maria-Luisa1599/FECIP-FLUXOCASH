// Importa a biblioteca do Supabase direto do CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cria o cliente Supabase com a URL do projeto e a chave pública (anon key)
const supabase = createClient(
  "https://chvaqdzgvfqtcfaccomy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I"
);

// Recupera o ID do usuário armazenado no navegador (localStorage)
const usuario_id = localStorage.getItem("usuario_id");

// Seleciona elementos principais do HTML
const body = document.querySelector("body");
const tabela = document.querySelector(".listaTransacoes");
const cartaoTransacao = document.getElementById("cartaoTransacao");
const cartaoCategoria = document.getElementById("cartaoCategoria");

// Inputs e botões do cartão de categoria
const inputNovaCategoria = cartaoCategoria.querySelector("input[name='categoria']");
const btnAdicionarCategoria = cartaoCategoria.querySelector("button:last-child");
const btnCategoriaSai = document.getElementById("btnCategoriaSai");
const btnCategoriaEntra = document.getElementById("btnCategoriaEntra");

// Botão de adicionar transação
const btnAdicionarTransacao = document.querySelector(".transacoes_botoes_sent button[type='submit']");

// Selects do cartão de transação (tipo e categoria)
const tipoSelect = cartaoTransacao.querySelector("select[name='tipo']");
const categoriaSelect = cartaoTransacao.querySelector("select[name='categoria']");

// Mostra/oculta o card de categoria
btnCategoriaEntra.addEventListener("click", () => cartaoCategoria.style.display = "block");
btnCategoriaSai.addEventListener("click", () => cartaoCategoria.style.display = "none");

// Função para mostrar alertas personalizados
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

// Função para mostrar confirmação (Sim/Não) usando Promise
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

    // Se clicar em "Sim", retorna true
    overlay.querySelector("#simBtn").addEventListener("click", () => {
      resolve(true);
      overlay.remove();
    });

    // Se clicar em "Não", retorna false
    overlay.querySelector("#naoBtn").addEventListener("click", () => {
      resolve(false);
      overlay.remove();
    });
  });
}

// Carrega categorias do banco e preenche o <select>
async function carregarCategorias(selectEl = categoriaSelect, selectedId = null) {
  const { data: categorias, error } = await supabase
    .from("categoria")
    .select("*")
    .eq("id_usuario", usuario_id);

  if (error) return console.error("Erro ao carregar categorias:", error);

  selectEl.innerHTML = "";
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id_categoria;
    option.textContent = cat.tipo;

    // Se foi passado um "selectedId", marca a categoria correta
    if (selectedId && cat.id_categoria === selectedId) option.selected = true;

    selectEl.appendChild(option);
  });
}

// Evento para adicionar nova categoria
btnAdicionarCategoria.addEventListener("click", async (e) => {
  e.preventDefault();

  // Pega e normaliza o nome digitado
  let nomeCategoria = inputNovaCategoria.value.trim().toLowerCase();
  if (!nomeCategoria) return mostrarAlerta("Digite o nome da categoria!");

  // Verifica se já existe categoria igual no banco
  const { data: existente } = await supabase
    .from("categoria")
    .select("id_categoria")
    .ilike("tipo", nomeCategoria)
    .maybeSingle();

  if (existente) return mostrarAlerta("Essa categoria já existe!");

  // Formata o nome com a primeira letra maiúscula
  const nomeFormatado = nomeCategoria.charAt(0).toUpperCase() + nomeCategoria.slice(1);

  // Insere a nova categoria no banco
  const { data: novaCat, error } = await supabase
    .from("categoria")
    .insert([{ tipo: nomeFormatado, id_usuario: usuario_id }])
    .select();

  if (error) return alert("Erro ao criar categoria: " + error.message);

  // Atualiza lista e limpa input
  carregarCategorias();
  inputNovaCategoria.value = "";
  cartaoCategoria.style.display = "none";
  mostrarAlerta(`Categoria "${nomeFormatado}" adicionada!`);
});

// Atualiza o total (ganhos - gastos)
function atualizarTotal(transacoes) {
  const totalRow = tabela.querySelector(".texto_cor");
  let total = 0;

  transacoes.forEach(tran => {
    if (tran.tipo === "ganho") total += tran.valor;
    else if (tran.tipo === "gasto") total -= tran.valor;
  });

  totalRow.querySelector("td:last-child").textContent = `R$ ${total.toFixed(2)}`;
}

// Carrega transações do banco e preenche tabela
async function carregarTransacoes() {
  console.log(usuario_id)
  const { data: transacoes, error } = await supabase
    .from("transacoes")
    .select("id_transacao, valor, tipo, data, fk_categoria_id_categoria, categoria:fk_categoria_id_categoria(*)")
    .eq('id_usuario', usuario_id)
    .order("data", { ascending: false });

  if (error) return console.error("Erro ao carregar transações:", error);

  const totalRow = tabela.querySelector(".texto_cor");
  // Remove linhas antigas antes de recarregar
  Array.from(tabela.querySelectorAll("tr.ganhos, tr.gastos")).forEach(tr => tr.remove());

  // Insere cada transação como uma linha <tr>
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

    // Ao clicar em "Editar", abre o card de edição
    tr.querySelector(".colunaEditarBotao").addEventListener("click", () => abrirEditar(transacao, tr));

    totalRow.insertAdjacentElement("beforebegin", tr);
  });

  atualizarTotal(transacoes);
}

// Função para abrir o card de edição de transação
function abrirEditar(transacao, trLinha) {
  const cartaoEditar = document.getElementById("cartaoEditar");

  // Inputs dentro do cartão de edição
  const inputValor = cartaoEditar.querySelector("input[name='valor']");
  const selectTipo = cartaoEditar.querySelector("select[name='tipo']");
  const selectCategoria = cartaoEditar.querySelector("select[name='categoria']");
  const inputData = cartaoEditar.querySelector("input[name='data']");
  const btnCancelarEditar = cartaoEditar.querySelector("#btnCancelarEditar");
  const btnAtualizar = cartaoEditar.querySelector("#btnAtualizar");
  const btnExcluir = cartaoEditar.querySelector("#btnExcluir");

  // Preenche os campos com os dados atuais da transação
  inputValor.value = transacao.valor;
  selectTipo.value = transacao.tipo;
  inputData.value = transacao.data.split("T")[0];

  carregarCategorias(selectCategoria, transacao.categoria?.id_categoria);

  cartaoEditar.style.display = "block";
  cartaoEditar.style.opacity = 1;
  cartaoEditar.style.pointerEvents = "all";

  // Botão cancelar: apenas fecha
  btnCancelarEditar.onclick = () => {
    cartaoEditar.style.display = "none";
  };

  // Botão atualizar: salva edição no banco
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

    // Atualiza os valores na tabela sem recarregar toda a página
    trLinha.children[0].textContent = `${novoTipo === "ganho" ? "+ " : "- "} R$ ${novoValor.toFixed(2)}`;
    trLinha.children[1].textContent = data.categoria?.tipo || "";
    trLinha.children[2].textContent = novaData;

    cartaoEditar.style.display = "none";
    atualizarTotal();
    await carregarTransacoes();
  };

  // Botão excluir: deleta a transação
  btnExcluir.onclick = async () => {
    const confirmado = await mostrarConfirmacao("Deseja realmente excluir essa transação?");
    if (!confirmado) return;

    const { error } = await supabase
      .from("transacoes")
      .delete()
      .eq("id_transacao", transacao.id_transacao);

    if (error) return mostrarAlerta("Erro ao excluir: " + error.message);

    cartaoEditar.style.display = "none";
    await carregarTransacoes();
  };
}
// Botão para excluir uma categoria existente
const btnExcluirCategoria = document.getElementById("btnExcluirCategoria");

btnExcluirCategoria.addEventListener("click", async () => {
  // Pega o valor digitado no input de categoria
  const nomeCategoria = inputNovaCategoria.value.trim();
  if (!nomeCategoria) return mostrarAlerta("Digite o nome da categoria que deseja excluir!");

  // Confirmação antes de excluir
  const confirmado = await mostrarConfirmacao(`Tem certeza que deseja excluir a categoria "${nomeCategoria}"?`);
  if (!confirmado) return;

  // Busca a categoria no banco pelo nome
  const { data: cat, error } = await supabase
    .from("categoria")
    .select("*")
    .ilike("tipo", nomeCategoria) // busca sem diferenciar maiúsculas/minúsculas
    .maybeSingle();

  if (error) return mostrarAlerta("Erro ao buscar categoria: " + error.message);
  if (!cat) return mostrarAlerta("Categoria não encontrada!");

  // Exclui a categoria pelo id
  const { error: delError } = await supabase
    .from("categoria")
    .delete()
    .eq("id_categoria", cat.id_categoria);

  if (delError) return mostrarAlerta("Erro ao excluir categoria: " + delError.message);

  // Feedback de sucesso
  mostrarAlerta(`Categoria "${nomeCategoria}" excluída!`, { tipo: "sucesso" });

  // Limpa campo e fecha o modal de categorias
  inputNovaCategoria.value = "";
  cartaoCategoria.style.display = "none";

  // Atualiza selects de categoria em todo o sistema
  atualizarTodosSelects();
});


// Atualiza todos os <select> de categoria (ex: no cadastro e na edição de transação)
async function atualizarTodosSelects() {
  const selects = document.querySelectorAll("select[name='categoria']");
  selects.forEach(async (sel) => {
    await carregarCategorias(sel);
  });
}


// Botão para adicionar uma transação
btnAdicionarTransacao.addEventListener("click", async (e) => {
  e.preventDefault();

  // Pega valores do formulário
  const valor = parseFloat(cartaoTransacao.querySelector("input[name='valor']").value);
  const tipo = tipoSelect.value === "option1" ? "ganho" : "gasto"; // Define se é ganho ou gasto
  const categoriaId = parseInt(categoriaSelect.value);
  const data = cartaoTransacao.querySelector("input[name='data']").value;

  // Validação de campos
  if (!valor || !tipo || !categoriaId || !data) return mostrarAlerta(`Preencha todos os campos!`);

  // Insere a transação no banco
  const { error } = await supabase.from("transacoes").insert([
    { valor, tipo, data, fk_categoria_id_categoria: categoriaId, id_usuario: usuario_id}
  ]);

  if (error) return alert("Erro ao salvar: " + error.message);

  // Recarrega lista de transações
  carregarTransacoes();

  // Limpa formulário
  cartaoTransacao.querySelector("input[name='valor']").value = "";
  cartaoTransacao.querySelector("input[name='data']").value = "";
  tipoSelect.selectedIndex = 0;
  categoriaSelect.selectedIndex = 0;
});


// Botão para abrir o menu de filtros
const btnFiltrar = document.getElementById("btnFiltrar");
const menuFiltrar = document.getElementById("menuFiltrar");

btnFiltrar.addEventListener("click", async () => {
  // Mostra/oculta o menu de filtro
  menuFiltrar.style.display = menuFiltrar.style.display === "block" ? "none" : "block";
  menuFiltrar.innerHTML = "";

  // Botão para mostrar todas as categorias
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

  // Busca todas as categorias do usuário no banco
  const { data: categorias } = await supabase.from("categoria").select("*").eq("id_usuario", usuario_id);

  // Cria um botão para cada categoria
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


// Função para filtrar transações por categoria
async function filtrarTransacoes(idCategoria = null) {
  let query = supabase
    .from("transacoes")
    .select("id_transacao, valor, tipo, data, fk_categoria_id_categoria, categoria:fk_categoria_id_categoria(*)")
    .eq("id_usuario", usuario_id)
    .order("data", { ascending: false });

  // Se for passado um idCategoria, filtra só ela
  if (idCategoria) query = query.eq("fk_categoria_id_categoria", idCategoria);

  // Executa a query
  const { data: transacoes, error } = await query;
  if (error) return mostrarAlerta("Erro ao carregar transações: " + error.message);

  // Limpa as linhas da tabela (menos o total)
  const totalRow = tabela.querySelector(".texto_cor");
  Array.from(tabela.querySelectorAll("tr.ganhos, tr.gastos")).forEach(tr => tr.remove());

  // Insere as transações filtradas na tabela
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

    // Ao clicar em editar abre o cartão de edição
    tr.querySelector(".colunaEditarBotao").addEventListener("click", () => abrirEditar(transacao, tr));

    totalRow.insertAdjacentElement("beforebegin", tr);
  });

  // Atualiza o total da tabela
  atualizarTotal(transacoes);
}


// Carrega os dados iniciais ao abrir a página
filtrarTransacoes();
carregarCategorias();
carregarTransacoes();
