// Importa a biblioteca Supabase do CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cria o cliente Supabase com a URL do projeto e a chave pública
const supabase = createClient(
  "https://chvaqdzgvfqtcfaccomy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I"
);

window.onload = async function () {
  somarValoresTransacaoeCat()
}
// Recupera o ID do usuário armazenado no localStorage
const usuario_id = localStorage.getItem("usuario_id");

// Função que carrega as categorias do banco de dados para o usuário logado
async function carregarCategoriasDoBanco() {
  const { data: categorias, error } = await supabase
    .from("categoria")      // tabela 'categoria'
    .select("*")            // seleciona todas as colunas
    .eq("id_usuario", usuario_id); // filtra apenas as categorias do usuário

  if (error) {
    console.error("Erro ao carregar categorias:", error);
    return []; // retorna array vazio em caso de erro
  }

  // Retorna apenas os nomes/tipos das categorias
  return categorias.map(cat => cat.tipo);
}

// Função que inicia os gráficos com cores e categorias carregadas do banco
async function iniciarGraficos() {
  const categorias = await carregarCategoriasDoBanco();

  // Paleta de cores para os gráficos
  const paletaCores = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4CAF50",
    "#9C27B0", "#FF9800", "#795548", "#009688"
  ];

  // Associa cada categoria a uma cor, repetindo se necessário
  const cores = categorias.map((_, i) => paletaCores[i % paletaCores.length]);

  // Inicializa o bloco de gastos com categorias e cores
  inicializarBloco("blocoGastos", categorias, cores);
}

async function somarValoresTransacaoeCat() {
  const { data: transacoes, error } = await supabase
    .from("transacoes")      // tabela 'transacoes'
    .select("*")            // seleciona todas as colunas
    .eq("id_usuario", usuario_id) // filtra apenas as categorias do usuário
  // .groupBy();

    console.log("TRnasacoes:", transacoes);

  if (error) {
    console.error("Erro ao carregar transacoes:", error);
    return []; // retorna array vazio em caso de erro
  }

  const { data: categorias, error: errorCategorias } = await supabase
    .from("categoria")
    .select("*")
    .eq("id_usuario", usuario_id);
    
    // console.log("Categoriaaaaas:", categorias);
  if (errorCategorias) {
    console.error("Erro ao carregar categorias:", errorCategorias);
    return;
  }

  const gastos = categorias
    .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === "gasto"))
    .map(cat => cat.tipo);

    
const gastosPorCategoria = transacoes
  .filter(tr => tr.tipo === "gasto") // só gastos
  .reduce((acc, tr) => {
    // acha a categoria correspondente
    const categoria = categorias.find(cat => cat.id_categoria === tr.fk_categoria_id_categoria);

    if (categoria) {
      // se ainda não existe, inicializa
      if (!acc[categoria.tipo]) {
        acc[categoria.tipo] = 0;
      }
      // soma os valores
      acc[categoria.tipo] += tr.valor;
    }
    return acc;
  }, {});


const ganhosPorCategoria = transacoes
  .filter(tr => tr.tipo === "ganho") // só gastos
  .reduce((acc, tr) => {
    // acha a categoria correspondente
    const categoria = categorias.find(cat => cat.id_categoria === tr.fk_categoria_id_categoria);

    if (categoria) {
      // se ainda não existe, inicializa
      if (!acc[categoria.tipo]) {
        acc[categoria.tipo] = 0;
      }
      // soma os valores
      acc[categoria.tipo] += tr.valor;
    }
    return acc;
  }, {});

console.log(ganhosPorCategoria);


}


// async function ValoresCategoria() {
//   // const usuario_id = localStorage.getItem("usuario_id");



//   const { data: transacoes, error: errorTransacoes } = await supabase
//     .from("transacoes")
//     .select("tipo, fk_categoria_id_categoria")
//     .eq("id_usuario", usuario_id);
//   if (errorTransacoes) {
//     console.error("Erro ao carregar transações:", errorTransacoes);
//     return;
//   }

//   console.log("Transações:", transacoes);

//   const nomesGastos = categorias
//     .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === "gasto"))
//     .map(cat => cat.tipo);

//   const nomesGanhos = categorias
//     .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === "ganho"))
//     .map(cat => cat.tipo);

//   console.log("Categorias Gasto:", nomesGastos);
//   console.log("Categorias Ganho:", nomesGanhos);

//   if (nomesGastos.length > 0) {
//     inicializarBloco("blocoGastos", nomesGastos, ["#ff6384", "#36a2eb", "#ffcd56", "#4caf50"]);
//   }

//   if (nomesGanhos.length > 0) {
//     inicializarBloco("blocoGanhos", nomesGanhos, ["#4caf50", "#36a2eb", "#ffcd56"]);
//   }


// }

// Função que desenha a legenda do gráfico
function desenharLegenda(ctx, categorias, cores, xOffset = 0) {
  const xCor = ctx.canvas.width - 150 + xOffset; // posição horizontal da legenda
  categorias.forEach((nome, i) => {
    ctx.fillStyle = cores[i]; // cor do quadrado
    ctx.fillRect(xCor, 20 + i * 25, 15, 15); // desenha o quadrado da legenda
    ctx.fillStyle = "#000000ff"; // cor do texto
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(nome, xCor + 20, 32 + i * 25); // escreve o nome da categoria
  });
}

// Função que desenha gráfico de pizza
function desenharPizza(ctx, dados, categorias, cores) {
  let total = dados.reduce((a, b) => a + b, 0); // soma todos os valores
  let anguloInicio = 0; // começa do ângulo zero

  dados.forEach((valor, i) => {
    let angulo = (valor / total) * 2 * Math.PI; // calcula ângulo da fatia
    ctx.beginPath();
    ctx.moveTo(250, 150); // centro da pizza
    ctx.arc(250, 150, 100, anguloInicio, anguloInicio + angulo); // desenha a fatia
    ctx.fillStyle = cores[i];
    ctx.fill();

    // Calcula posição do texto percentual
    let meio = anguloInicio + angulo / 2;
    let x = 250 + Math.cos(meio) * 60;
    let y = 150 + Math.sin(meio) * 60;
    let porcent = ((valor / total) * 100).toFixed(1) + "%";
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(porcent, x, y); // escreve a porcentagem na fatia

    anguloInicio += angulo; // atualiza ângulo inicial para a próxima fatia
  });

  desenharLegenda(ctx, categorias, cores); // desenha legenda do gráfico
}

// Função que desenha a grade de fundo (linhas horizontais) para gráficos de barras e linha
function desenharGrid(ctx, width, height, maxValor) {
  ctx.strokeStyle = "#ddd"; // cor da grade
  ctx.fillStyle = "#000"; // cor do texto
  ctx.font = "14px Arial";
  ctx.lineWidth = 1;
  let linhas = 5; // número de linhas
  let margemTop = 50;
  let margemBottom = 50;

  for (let i = 0; i <= linhas; i++) {
    let y = height - margemBottom - (i * (height - margemTop - margemBottom) / linhas);
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 180, y);
    ctx.stroke();
    let valor = Math.round((maxValor / linhas) * i);
    ctx.fillText(valor, 5, y + 5); // escreve os valores na lateral
  }
}

// Função que desenha gráfico de barras
function desenharBarras(ctx, dados, categorias, cores, maxValor) {
  let larguraBarra = 60;
  let espacamento = 100;
  let baseY = 300; // linha base do gráfico

  dados.forEach((valor, i) => {
    let altura = (valor / maxValor) * 250; // altura proporcional
    ctx.fillStyle = cores[i];
    ctx.fillRect(i * espacamento + 80, baseY - altura, larguraBarra, altura);

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(categorias[i], i * espacamento + 80, baseY + 15); // escreve a categoria abaixo da barra
  });

  desenharLegenda(ctx, categorias, cores); // legenda
}

// Função que desenha gráfico de linha
function desenharLinha(ctx, dados, categorias, cores, maxValor) {
  ctx.beginPath();
  ctx.moveTo(80, 300 - (dados[0] / maxValor) * 250); // ponto inicial
  ctx.strokeStyle = "#36a2eb";
  ctx.lineWidth = 2;

  dados.forEach((valor, i) => {
    ctx.lineTo(80 + i * 100, 300 - (valor / maxValor) * 250);
  });
  ctx.stroke();

  // desenha círculos nos pontos e escreve categorias
  dados.forEach((valor, i) => {
    ctx.beginPath();
    ctx.arc(80 + i * 100, 300 - (valor / maxValor) * 250, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#36a2eb";
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.fillText(categorias[i], 80 + i * 100 - 20, 320);
  });

  desenharLegenda(ctx, categorias, cores); // legenda
}

// Função que inicializa um bloco de gráfico (pizza, barras ou linha)
function inicializarBloco(blocoId, categorias, cores, maxValor = 1500) {
  const bloco = document.getElementById(blocoId);
  const canvas = bloco.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const botoes = bloco.querySelectorAll(".botao"); // botões de trocar gráfico
  const inputs = bloco.querySelectorAll(".inputs input"); // inputs de valores

  let tipoAtual = "pizza"; // tipo inicial do gráfico

  // Função que pega os dados atuais dos inputs
  function getDados() {
    return Array.from(inputs).map(input => parseFloat(input.value) || 0);
  }

  // Função que desenha o gráfico conforme o tipo selecionado
  function desenharGrafico(tipo) {
    let dados = getDados();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // limpa o canvas

    if (tipo === "pizza") {
      desenharPizza(ctx, dados, categorias, cores);
    } else {
      desenharGrid(ctx, canvas.width, canvas.height, maxValor);
      if (tipo === "barras") desenharBarras(ctx, dados, categorias, cores, maxValor);
      if (tipo === "linha") desenharLinha(ctx, dados, categorias, cores, maxValor);
    }
    tipoAtual = tipo; // atualiza o tipo atual
  }

  // Adiciona eventos aos botões para trocar tipo de gráfico
  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      botoes.forEach(b => b.classList.remove("ativo")); // remove ativo dos outros botões
      botao.classList.add("ativo"); // adiciona ativo ao botão clicado
      let novoTipo = botao.getAttribute("data-tipo");
      desenharGrafico(novoTipo);
    });
  });

  // Atualiza o gráfico ao mudar qualquer input
  inputs.forEach(input => {
    input.addEventListener("input", () => {
      desenharGrafico(tipoAtual);
    });
  });

  desenharGrafico(tipoAtual); // desenha gráfico inicial
}

// Função que inicializa o gráfico anual com ganhos e gastos por mês
// function inicializarBlocoAnual() {
//   const canvas = document.getElementById("graficoAnual");
//   const ctx = canvas.getContext("2d");
//   const inputsDiv = document.getElementById("inputsAnual");

//   const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
//   const cores = ["green", "red"];

//   // Cria inputs de ganhos e gastos para cada mês
//   meses.forEach((mes) => {
//     inputsDiv.innerHTML += `
//       <label>${mes} Ganhos: <input type="number" value="1000"></label>
//       <label>${mes} Gastos: <input type="number" value="700"></label><br>
//     `;
//   });
//   const inputs = inputsDiv.querySelectorAll("input");

//   // Função que pega os dados dos inputs de ganhos e gastos
//   function getDados() {
//     let ganhos = [], gastos = [];
//     for (let i = 0; i < inputs.length; i += 2) {
//       ganhos.push(parseFloat(inputs[i].value) || 0);
//       gastos.push(parseFloat(inputs[i + 1].value) || 0);
//     }
//     return { ganhos, gastos };
//   }

//   // Função que desenha a grade fixa
//   function desenharGridFixo() {
//     const linhas = 5;
//     const maxValor = 1500;
//     const margemTop = 50;
//     const margemBottom = 50;
//     const alturaGrafico = canvas.height - margemTop - margemBottom;

//     ctx.strokeStyle = "#ddd";
//     ctx.fillStyle = "#000";
//     ctx.font = "14px Arial";
//     ctx.lineWidth = 1;

//     for (let i = 0; i <= linhas; i++) {
//       let y = canvas.height - margemBottom - (i * alturaGrafico / linhas);
//       ctx.beginPath();
//       ctx.moveTo(40, y);
//       ctx.lineTo(canvas.width - 80, y);
//       ctx.stroke();
//       let valor = Math.round(maxValor / linhas * i);
//       ctx.fillText(valor, 5, y + 5);
//     }
//   }

//   // Função que desenha gráfico de barras anual
//   function desenharBarrasAnual() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     desenharGridFixo();

//     const { ganhos, gastos } = getDados();
//     const larguraBarra = 20;
//     const espacamento = 60;
//     const baseY = canvas.height - 50;
//     const alturaMax = canvas.height - 100;

//     meses.forEach((mes, i) => {
//       let alturaG = (ganhos[i] / 1500) * alturaMax;
//       let alturaC = (gastos[i] / 1500) * alturaMax;

//       // Desenha ganhos
//       ctx.fillStyle = "green";
//       ctx.fillRect(80 + i * espacamento, baseY - alturaG, larguraBarra, alturaG);

//       // Desenha gastos
//       ctx.fillStyle = "red";
//       ctx.fillRect(80 + i * espacamento + larguraBarra + 5, baseY - alturaC, larguraBarra, alturaC);

//       ctx.fillStyle = "#000";
//       ctx.fillText(mes, 80 + i * espacamento, baseY + 15);
//     });

//     // Desenha legenda
//     ctx.fillStyle = "green";
//     ctx.fillRect(canvas.width - 120, 30, 15, 15);
//     ctx.fillStyle = "#000";
//     ctx.fillText("Ganhos", canvas.width - 100, 42);

//     ctx.fillStyle = "red";
//     ctx.fillRect(canvas.width - 120, 55, 15, 15);
//     ctx.fillStyle = "#000";
//     ctx.fillText("Gastos", canvas.width - 100, 67);
//   }

//   // Atualiza gráfico ao mudar qualquer input
//   inputs.forEach(input => input.addEventListener("input", desenharBarrasAnual));
//   desenharBarrasAnual(); // desenha gráfico inicial
// }

// Inicializa os blocos com categorias fixas ou carregadas do banco
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

  console.log("Categorias:", categorias);

  const { data: transacoes, error: errorTransacoes } = await supabase
    .from("transacoes")
    .select("tipo, fk_categoria_id_categoria")
    .eq("id_usuario", usuario_id);
  if (errorTransacoes) {
    console.error("Erro ao carregar transações:", errorTransacoes);
    return;
  }

  console.log("Transações:", transacoes);

  const nomesGastos = categorias
    .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === "gasto"))
    .map(cat => cat.tipo);

  const nomesGanhos = categorias
    .filter(cat => transacoes.some(tr => tr.fk_categoria_id_categoria === cat.id_categoria && tr.tipo === "ganho"))
    .map(cat => cat.tipo);

  console.log("Categorias Gasto:", nomesGastos);
  console.log("Categorias Ganho:", nomesGanhos);

  if (nomesGastos.length > 0) {
    inicializarBloco("blocoGastos", nomesGastos, ["#ff6384", "#36a2eb", "#ffcd56", "#4caf50"]);
  }

  if (nomesGanhos.length > 0) {
    inicializarBloco("blocoGanhos", nomesGanhos, ["#4caf50", "#36a2eb", "#ffcd56"]);
  }

  // inicializarBlocoAnual();
}


document.addEventListener("DOMContentLoaded", carregarCategorias);
