// -----------------------------
// 1. Importação da biblioteca Supabase
// -----------------------------

// Importa a biblioteca oficial do Supabase via CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// -----------------------------
// 2. Criação do cliente Supabase
// -----------------------------

// Cria o cliente do Supabase usando a URL do projeto e a chave pública (anon key)
// Essa chave permite acessar o banco de dados do frontend, mas apenas com permissões públicas
const supabase = createClient(
  "https://chvaqdzgvfqtcfaccomy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I"
);

// -----------------------------
// 3. Executa funções ao carregar a página
// -----------------------------

// Quando a janela for carregada, chama a função para somar valores por categoria
window.onload = async function () {
  somarValoresTransacaoeCat();
}

// -----------------------------
// 4. Recupera o ID do usuário logado
// -----------------------------

// Pega o ID do usuário que está salvo no localStorage
const usuario_id = localStorage.getItem("usuario_id");

// -----------------------------
// 5. Função para carregar categorias do banco
// -----------------------------
async function carregarCategoriasDoBanco() {
  // Faz uma consulta na tabela 'categoria' filtrando pelo usuário
  const { data: categorias, error } = await supabase
    .from("categoria")
    .select("*") // pega todas as colunas
    .eq("id_usuario", usuario_id); // filtra categorias apenas do usuário logado

  if (error) {
    console.error("Erro ao carregar categorias:", error);
    return []; // retorna array vazio caso haja erro
  }

  // Retorna apenas o nome/tipo das categorias
  return categorias.map(cat => cat.tipo);
}

// -----------------------------
// 6. Inicializa gráficos com cores e categorias
// -----------------------------
async function iniciarGraficos() {
  const categorias = await carregarCategoriasDoBanco();

  // Paleta de cores padrão para os gráficos
  const paletaCores = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50",
    "#9C27B0", "#FF9800", "#795548", "#009688"
  ];

  // Associa uma cor para cada categoria (repete se tiver mais categorias que cores)
  const cores = categorias.map((_, i) => paletaCores[i % paletaCores.length]);

  // Inicializa o bloco de gráfico de gastos
  inicializarBloco("blocoGastos", categorias, cores);
}

// -----------------------------
// 7. Soma valores de transações por categoria
// -----------------------------
async function somarValoresTransacaoeCat(tipo) {
  // Consulta todas as transações do usuário
  const { data: transacoes, error } = await supabase
    .from("transacoes")
    .select("*")
    .eq("id_usuario", usuario_id);

  if (error) {
    console.error("Erro ao carregar transacoes:", error);
    return [];
  }

  // Consulta todas as categorias do usuário
  const { data: categorias, error: errorCategorias } = await supabase
    .from("categoria")
    .select("*")
    .eq("id_usuario", usuario_id);

  if (errorCategorias) {
    console.error("Erro ao carregar categorias:", errorCategorias);
    return;
  }

  // Filtra categorias que possuem transações do tipo desejado
  const gastos = categorias
    .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === tipo))
    .map(cat => cat.tipo);
  // console.log(gastos)
  // Soma valores por categoria usando reduce
  const valoresPorCategoria = transacoes
    .filter(tr => tr.tipo === tipo) // filtra apenas o tipo (ganho/gasto)
    .reduce((acc, tr) => {
      const categoria = categorias.find(cat => cat.id_categoria === tr.fk_categoria_id_categoria);
      if (categoria) {
        if (!acc[categoria.tipo]) acc[categoria.tipo] = 0; // inicializa caso não exista
        acc[categoria.tipo] += tr.valor; // soma valores
      }
      return acc;
    }, {});

  let dados = [];

  // Prepara os elementos HTML para exibir os valores
  if (tipo === "ganho") {
    Object.entries(valoresPorCategoria).forEach(([categoria, soma]) => {
      dados.push(soma);
    });
  } else {
    Object.entries(valoresPorCategoria).forEach(([categoria, soma]) => {
      dados.push(soma);
    });
  }

  return dados; // retorna os valores para os gráficos
}

// -----------------------------
// 8. Desenha legenda para gráficos
// -----------------------------
function desenharLegenda(ctx, categorias, cores, xOffset = 0) {
  const xCor = ctx.canvas.width - 150 + xOffset; // posição horizontal da legenda
  categorias.forEach((nome, i) => {
    ctx.fillStyle = cores[i]; // cor do quadrado da legenda
    ctx.fillRect(xCor, 20 + i * 25, 15, 15);
    ctx.fillStyle = "#000"; // cor do texto
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(nome, xCor + 20, 32 + i * 25);
  });
}

// -----------------------------
// 9. Desenha gráfico de pizza
// -----------------------------
function desenharPizza(ctx, dados, categorias, cores) {
  let total = dados.reduce((a, b) => a + b, 0); // soma total
  let anguloInicio = 0; // inicia ângulo

  dados.forEach((valor, i) => {
    let angulo = (valor / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(250, 150); // centro
    ctx.arc(250, 150, 100, anguloInicio, anguloInicio + angulo);
    ctx.fillStyle = cores[i];
    ctx.fill();

    // escreve porcentagem
    let meio = anguloInicio + angulo / 2;
    let x = 250 + Math.cos(meio) * 60;
    let y = 150 + Math.sin(meio) * 60;
    let porcent = ((valor / total) * 100).toFixed(1) + "%";
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(porcent, x, y);

    anguloInicio += angulo; // atualiza ângulo
  });

  desenharLegenda(ctx, categorias, cores); // adiciona legenda
}

// -----------------------------
// 10. Desenha grade de fundo para gráficos de barras e linha
// -----------------------------
function desenharGrid(ctx, width, height, maxValor) {
  ctx.strokeStyle = "#ddd";
  ctx.fillStyle = "#000";
  ctx.font = "14px Arial";
  ctx.lineWidth = 1;
  let linhas = 5;
  let margemTop = 50;
  let margemBottom = 50;

  for (let i = 0; i <= linhas; i++) {
    let y = height - margemBottom - (i * (height - margemTop - margemBottom) / linhas);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 180, y);
    ctx.stroke();
    let valor = Math.round((maxValor / linhas) * i);
    ctx.fillText(valor, 5, y + 5);
  }
}

// -----------------------------
// 11. Desenha gráfico de barras
// -----------------------------
function desenharBarras(ctx, dados, categorias, cores, maxValor) {
  let larguraBarra = 60;
  let espacamento = 100;
  let baseY = 300;

  dados.forEach((valor, i) => {
    let altura = (valor / maxValor) * 250;
    ctx.fillStyle = cores[i];
    ctx.fillRect(i * espacamento + 80, baseY - altura, larguraBarra, altura);

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(categorias[i], i * espacamento + 80, baseY + 15);
  });

  desenharLegenda(ctx, categorias, cores);
}

// -----------------------------
// 12. Desenha gráfico de linha
// -----------------------------
function desenharLinha(ctx, dados, categorias, cores, maxValor) {
  ctx.beginPath();
  ctx.moveTo(80, 300 - (dados[0] / maxValor) * 250);
  ctx.strokeStyle = "#36a2eb";
  ctx.lineWidth = 2;

  dados.forEach((valor, i) => {
    ctx.lineTo(80 + i * 100, 300 - (valor / maxValor) * 250);
  });
  ctx.stroke();

  // Desenha pontos
  dados.forEach((valor, i) => {
    ctx.beginPath();
    ctx.arc(80 + i * 100, 300 - (valor / maxValor) * 250, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#36a2eb";
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(categorias[i], 80 + i * 100 - 20, 320);
  });

  desenharLegenda(ctx, categorias, cores);
}

// -----------------------------
// 13. Inicializa bloco de gráfico (pizza, barras, linha)
// -----------------------------
function inicializarBloco(blocoId, categorias, cores, maxValor = 1500) {
  const bloco = document.getElementById(blocoId);
  const canvas = bloco.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const botoes = bloco.querySelectorAll(".botao");
  const inputs = bloco.querySelectorAll(".inputs input");

  let tipoAtual = "pizza"; // tipo inicial

  const tipoTransacao = blocoId.includes("Gastos") ? "gasto" : "ganho";

  async function desenharGrafico(tipo) {
    let dados = await somarValoresTransacaoeCat(tipoTransacao);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (tipo === "pizza") {
      desenharPizza(ctx, dados, categorias, cores);
    } else {
      desenharGrid(ctx, canvas.width, canvas.height, maxValor);
      if (tipo === "barras") desenharBarras(ctx, dados, categorias, cores, maxValor);
      if (tipo === "linha") desenharLinha(ctx, dados, categorias, cores, maxValor);
    }
    tipoAtual = tipo;
  }

  // Eventos para troca de gráfico
  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      botoes.forEach(b => b.classList.remove("ativo"));
      botao.classList.add("ativo");
      desenharGrafico(botao.getAttribute("data-tipo"));
    });
  });

  // Atualiza gráfico quando input muda
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      desenharGrafico(tipoAtual);
    });
  });

  desenharGrafico(tipoAtual);
}

// -----------------------------
// 14. Inicializa categorias carregadas do banco
// -----------------------------
async function carregarCategorias() {
  const usuario_id = localStorage.getItem("usuario_id");

  const { data: categorias, error: errorCategorias } = await supabase
    .from("categoria")
    .select("*")
    .eq("id_usuario", usuario_id);

  if (errorCategorias) {
    console.error("Erro ao carregar categorias:", errorCategorias);
    return;
  }

  const { data: transacoes, error: errorTransacoes } = await supabase
    .from("transacoes")
    .select("tipo, fk_categoria_id_categoria")
    .eq("id_usuario", usuario_id);

  if (errorTransacoes) {
    console.error("Erro ao carregar transações:", errorTransacoes);
    return;
  }

  // Cria listas de categorias com transações de gasto e ganho
  const nomesGastos = categorias
    .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === "gasto"))
    .map(cat => cat.tipo);

  const nomesGanhos = categorias
    .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === "ganho"))
    .map(cat => cat.tipo);

  // Inicializa blocos de gráfico
  if (nomesGastos.length > 0) {
    inicializarBloco("blocoGastos", nomesGastos, ["#ff6384", "#36a2eb", "#ffcd56", "#4caf50", "#9C27B0", "#FF9800", "#795548", "#009688"]);
  }

  if (nomesGanhos.length > 0) {
    inicializarBloco("blocoGanhos", nomesGanhos, ["#4caf50", "#36a2eb", "#ffcd56","#9C27B0", "#FF9800", "#795548", "#009688"]);
  }
}

// -----------------------------
// 15. Dispara carregamento quando DOM estiver pronto
// -----------------------------
document.addEventListener("DOMContentLoaded", carregarCategorias);
