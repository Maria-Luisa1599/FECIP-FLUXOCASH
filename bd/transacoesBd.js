// Importa a biblioteca do Supabase diretamente do CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cria o cliente Supabase usando a URL do projeto e a chave pública (anon key)
const supabase = createClient(
  "https://chvaqdzgvfqtcfaccomy.supabase.co", // URL do projeto Supabase
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I" // chave anon
);

// Recupera o ID do usuário que foi armazenado no navegador (localStorage)
const usuario_id = localStorage.getItem("usuario_id");

// Seleciona elementos principais do HTML para manipulação
const body = document.querySelector("body"); // corpo da página
const tabela = document.querySelector(".listaTransacoes"); // tabela de transações
const cartaoTransacao = document.getElementById("cartaoTransacao"); // card de transação
const cartaoCategoria = document.getElementById("cartaoCategoria"); // card de categoria

// Inputs e botões do cartão de categoria
const inputNovaCategoria = cartaoCategoria.querySelector("input[name='categoria']"); // input de nova categoria
const btnAdicionarCategoria = cartaoCategoria.querySelector("button:last-child"); // botão para adicionar categoria
const btnCategoriaSai = document.getElementById("btnCategoriaSai"); // botão fechar card categoria
const btnCategoriaEntra = document.getElementById("btnCategoriaEntra"); // botão abrir card categoria

// Botão de adicionar transação
const btnAdicionarTransacao = document.querySelector(".transacoes_botoes_sent button[type='submit']");

// Selects do cartão de transação (tipo e categoria)
const tipoSelect = cartaoTransacao.querySelector("select[name='tipo']");
const categoriaSelect = cartaoTransacao.querySelector("select[name='categoria']");

// Mostrar/ocultar card de categoria ao clicar nos botões
btnCategoriaEntra.addEventListener("click", () => cartaoCategoria.style.display = "block");
btnCategoriaSai.addEventListener("click", () => cartaoCategoria.style.display = "none");

// Função para mostrar alertas personalizados
function mostrarAlerta(mensagem) {
  const overlay = document.createElement("div"); // cria um overlay para o alerta
  overlay.className = "alert-overlay";

  // HTML do alerta
  overlay.innerHTML = `
    <div class="alert-card">
      <p>${mensagem}</p>
      <button>OK</button>
    </div>
  `;

  document.body.appendChild(overlay); // adiciona overlay ao body

  // Fecha o alerta ao clicar em OK
  overlay.querySelector("button").addEventListener("click", () => overlay.remove());
}

// Função para mostrar confirmação (Sim/Não) usando Promise
function mostrarConfirmacao(mensagem) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div"); // cria overlay
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

    // Se clicar "Sim", resolve com true
    overlay.querySelector("#simBtn").addEventListener("click", () => {
      resolve(true);
      overlay.remove();
    });

    // Se clicar "Não", resolve com false
    overlay.querySelector("#naoBtn").addEventListener("click", () => {
      resolve(false);
      overlay.remove();
    });
  });
}

// Função para carregar categorias do banco e preencher o <select>
async function carregarCategorias(selectEl = categoriaSelect, selectedId = null) {
  const { data: categorias, error } = await supabase
    .from("categoria")
    .select("*")
    .eq("id_usuario", usuario_id); // filtra apenas as categorias do usuário

  if (error) return console.error("Erro ao carregar categorias:", error);

  selectEl.innerHTML = ""; // limpa options existentes
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id_categoria;
    option.textContent = cat.tipo;

    // Se foi passado selectedId, seleciona automaticamente
    if (selectedId && cat.id_categoria === selectedId) option.selected = true;

    selectEl.appendChild(option);
  });
}

// Evento para adicionar nova categoria
btnAdicionarCategoria.addEventListener("click", async (e) => {
  e.preventDefault(); // previne envio do form

  // Pega e normaliza o nome digitado
  let nomeCategoria = inputNovaCategoria.value.trim().toLowerCase();
  if (!nomeCategoria) return mostrarAlerta("Digite o nome da categoria!");

  // Verifica se categoria já existe
  const { data: existente } = await supabase
    .from("categoria")
    .select("id_categoria")
    .ilike("tipo", nomeCategoria)
    .maybeSingle();

  if (existente) return mostrarAlerta("Essa categoria já existe!");

  // Formata com primeira letra maiúscula
  const nomeFormatado = nomeCategoria.charAt(0).toUpperCase() + nomeCategoria.slice(1);

  // Insere nova categoria no banco
  const { data: novaCat, error } = await supabase
    .from("categoria")
    .insert([{ tipo: nomeFormatado, id_usuario: usuario_id }])
    .select();

  if (error) return alert("Erro ao criar categoria: " + error.message);

  // Atualiza lista, limpa input e fecha card
  carregarCategorias();
  inputNovaCategoria.value = "";
  cartaoCategoria.style.display = "none";
  mostrarAlerta(`Categoria "${nomeFormatado}" adicionada!`);
});

// Função para atualizar o total de ganhos e gastos
function atualizarTotal(transacoes) {
  const totalRow = tabela.querySelector(".texto_cor"); // linha do total
  let total = 0;

  // Calcula total somando ganhos e subtraindo gastos
  transacoes.forEach(tran => {
    if (tran.tipo === "ganho") total += tran.valor;
    else if (tran.tipo === "gasto") total -= tran.valor;
  });

  totalRow.querySelector("td:last-child").textContent = `R$ ${total.toFixed(2)}`; // exibe total
}

// Função para carregar transações do banco e preencher tabela
async function carregarTransacoes() {
  console.log(usuario_id)
  const { data: transacoes, error } = await supabase
    .from("transacoes")
    .select("id_transacao, valor, tipo, data, fk_categoria_id_categoria, categoria:fk_categoria_id_categoria(*)")
    .eq('id_usuario', usuario_id)
    .order("data", { ascending: false }); // ordena pela data desc

  if (error) return console.error("Erro ao carregar transações:", error);

  const totalRow = tabela.querySelector(".texto_cor");

  // Remove linhas antigas de ganhos e gastos
  Array.from(tabela.querySelectorAll("tr.ganhos, tr.gastos")).forEach(tr => tr.remove());

  // Insere transações na tabela
  transacoes.forEach(transacao => {
    const tr = document.createElement("tr");
    tr.className = transacao.tipo === "ganho" ? "ganhos" : "gastos"; // adiciona classe
    const dataFormatada = new Date(transacao.data).toLocaleDateString("pt-BR");

    tr.innerHTML = `
      <td>${transacao.tipo === "ganho" ? "+ " : "- "} R$ ${transacao.valor.toFixed(2)}</td>
      <td>${transacao.categoria?.tipo || ""}</td>
      <td>${dataFormatada}</td>
      <td class="colunaEditarBotao">Editar</td>
    `;

    // Clique em editar abre card de edição
    tr.querySelector(".colunaEditarBotao").addEventListener("click", () => abrirEditar(transacao, tr));

    totalRow.insertAdjacentElement("beforebegin", tr);
  });

  atualizarTotal(transacoes); // atualiza total
}

// Função para abrir o card de edição de uma transação
function abrirEditar(transacao, trLinha) {
  const cartaoEditar = document.getElementById("cartaoEditar");

  // Inputs do card de edição
  const inputValor = cartaoEditar.querySelector("input[name='valor']");
  const selectTipo = cartaoEditar.querySelector("select[name='tipo']");
  const selectCategoria = cartaoEditar.querySelector("select[name='categoria']");
  const inputData = cartaoEditar.querySelector("input[name='data']");
  const btnCancelarEditar = cartaoEditar.querySelector("#btnCancelarEditar");
  const btnAtualizar = cartaoEditar.querySelector("#btnAtualizar");
  const btnExcluir = cartaoEditar.querySelector("#btnExcluir");

  // Preenche campos com valores atuais da transação
  inputValor.value = transacao.valor;
  selectTipo.value = transacao.tipo;
  inputData.value = transacao.data.split("T")[0]; // formata data

  carregarCategorias(selectCategoria, transacao.categoria?.id_categoria); // carrega categorias

  cartaoEditar.style.display = "block"; // mostra card
  cartaoEditar.style.opacity = 1;
  cartaoEditar.style.pointerEvents = "all";

  // Cancelar edição fecha card
  btnCancelarEditar.onclick = () => {
    cartaoEditar.style.display = "none";
  };

  // Atualizar transação no banco
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

    // Atualiza linha da tabela
    trLinha.children[0].textContent = `${novoTipo === "ganho" ? "+ " : "- "} R$ ${novoValor.toFixed(2)}`;
    trLinha.children[1].textContent = data.categoria?.tipo || "";
    trLinha.children[2].textContent = novaData;

    cartaoEditar.style.display = "none";
    atualizarTotal();
    await carregarTransacoes();
  };

  // Excluir transação
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

// Botão para excluir categoria
const btnExcluirCategoria = document.getElementById("btnExcluirCategoria");

btnExcluirCategoria.addEventListener("click", async () => {
  const nomeCategoria = inputNovaCategoria.value.trim(); // pega nome
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

  mostrarAlerta(`Categoria "${nomeCategoria}" excluída!`);

  inputNovaCategoria.value = "";
  cartaoCategoria.style.display = "none";

  atualizarTodosSelects();
});

// Atualiza todos os selects de categoria
async function atualizarTodosSelects() {
  const selects = document.querySelectorAll("select[name='categoria']");
  selects.forEach(async (sel) => {
    await carregarCategorias(sel);
  });
}

// Adicionar nova transação
btnAdicionarTransacao.addEventListener("click", async (e) => {
  e.preventDefault();

  const valor = parseFloat(cartaoTransacao.querySelector("input[name='valor']").value);
  const tipo = tipoSelect.value === "option1" ? "ganho" : "gasto";
  const categoriaId = parseInt(categoriaSelect.value);
  const data = cartaoTransacao.querySelector("input[name='data']").value;

  if (!valor || !tipo || !categoriaId || !data) return mostrarAlerta(`Preencha todos os campos!`);

  const { error } = await supabase.from("transacoes").insert([
    { valor, tipo, data, fk_categoria_id_categoria: categoriaId, id_usuario: usuario_id}
  ]);

  if (error) return alert("Erro ao salvar: " + error.message);

  carregarTransacoes();

  cartaoTransacao.querySelector("input[name='valor']").value = "";
  cartaoTransacao.querySelector("input[name='data']").value = "";
  tipoSelect.selectedIndex = 0;
  categoriaSelect.selectedIndex = 0;
});

// Botão para abrir menu de filtros
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

  const { data: categorias } = await supabase.from("categoria").select("*").eq("id_usuario", usuario_id);

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

// Carrega dados iniciais ao abrir a página
filtrarTransacoes();
carregarCategorias();
carregarTransacoes();
