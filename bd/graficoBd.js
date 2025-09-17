function desenharLegenda(ctx, categorias, cores, xOffset=0) {
  const xCor = ctx.canvas.width - 150 + xOffset;
  categorias.forEach((nome, i) => {
    ctx.fillStyle = cores[i];
    ctx.fillRect(xCor, 20 + i * 25, 15, 15);
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(nome, xCor + 20, 32 + i * 25);
  });
}

function desenharPizza(ctx, dados, categorias, cores) {
  let total = dados.reduce((a, b) => a + b, 0);
  let anguloInicio = 0;
  dados.forEach((valor, i) => {
    let angulo = (valor / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(250, 150);
    ctx.arc(250, 150, 100, anguloInicio, anguloInicio + angulo);
    ctx.fillStyle = cores[i];
    ctx.fill();

    let meio = anguloInicio + angulo / 2;
    let x = 250 + Math.cos(meio) * 60;
    let y = 150 + Math.sin(meio) * 60;
    let porcent = ((valor / total) * 100).toFixed(1) + "%";
    ctx.fillStyle = "#000";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(porcent, x, y);

    anguloInicio += angulo;
  });
  desenharLegenda(ctx, categorias, cores);
}

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

function desenharLinha(ctx, dados, categorias, cores, maxValor) {
  ctx.beginPath();
  ctx.moveTo(80, 300 - (dados[0] / maxValor) * 250);
  ctx.strokeStyle = "#36a2eb";
  ctx.lineWidth = 2;

  dados.forEach((valor, i) => {
    ctx.lineTo(80 + i * 100, 300 - (valor / maxValor) * 250);
  });
  ctx.stroke();

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

function inicializarBloco(blocoId, categorias, cores, maxValor = 1500) {
  const bloco = document.getElementById(blocoId);
  const canvas = bloco.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const botoes = bloco.querySelectorAll(".botao");
  const inputs = bloco.querySelectorAll(".inputs input");

  let tipoAtual = "pizza";

  function getDados() {
    return Array.from(inputs).map(input => parseFloat(input.value) || 0);
  }

  function desenharGrafico(tipo) {
    let dados = getDados();
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

  botoes.forEach(botao => {
    botao.addEventListener("click", () => {
      botoes.forEach(b => b.classList.remove("ativo"));
      botao.classList.add("ativo");
      let novoTipo = botao.getAttribute("data-tipo");
      desenharGrafico(novoTipo);
    });
  });

  inputs.forEach(input => {
    input.addEventListener("input", () => {
      desenharGrafico(tipoAtual);
    });
  });

  desenharGrafico(tipoAtual);
}

function inicializarBlocoAnual() {
  const canvas = document.getElementById("graficoAnual");
  const ctx = canvas.getContext("2d");
  const inputsDiv = document.getElementById("inputsAnual");

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const cores = ["green","red"];

  meses.forEach((mes) => {
    inputsDiv.innerHTML += `
      <label>${mes} Ganhos: <input type="number" value="1000"></label>
      <label>${mes} Gastos: <input type="number" value="700"></label><br>
    `;
  });
  const inputs = inputsDiv.querySelectorAll("input");

  function getDados() {
    let ganhos = [], gastos = [];
    for (let i = 0; i < inputs.length; i += 2) {
      ganhos.push(parseFloat(inputs[i].value) || 0);
      gastos.push(parseFloat(inputs[i+1].value) || 0);
    }
    return { ganhos, gastos };
  }

  function desenharGridFixo() {
    const linhas = 5;
    const maxValor = 1500;
    const margemTop = 50;
    const margemBottom = 50;
    const alturaGrafico = canvas.height - margemTop - margemBottom;

    ctx.strokeStyle = "#ddd";
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.lineWidth = 1;

    for (let i = 0; i <= linhas; i++) {
      let y = canvas.height - margemBottom - (i * alturaGrafico / linhas);
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 80, y);
      ctx.stroke();
      let valor = Math.round(maxValor / linhas * i);
      ctx.fillText(valor, 5, y + 5);
    }
  }

  function desenharBarrasAnual() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenharGridFixo();

    const { ganhos, gastos } = getDados();
    const larguraBarra = 20;
    const espacamento = 60;
    const baseY = canvas.height - 50;
    const alturaMax = canvas.height - 100;

    meses.forEach((mes, i) => {
      let alturaG = (ganhos[i] / 1500) * alturaMax;
      let alturaC = (gastos[i] / 1500) * alturaMax;

      ctx.fillStyle = "green";
      ctx.fillRect(80 + i * espacamento, baseY - alturaG, larguraBarra, alturaG);

      ctx.fillStyle = "red";
      ctx.fillRect(80 + i * espacamento + larguraBarra + 5, baseY - alturaC, larguraBarra, alturaC);

      ctx.fillStyle = "#000";
      ctx.fillText(mes, 80 + i * espacamento, baseY + 15);
    });

    ctx.fillStyle = "green";
    ctx.fillRect(canvas.width - 120, 30, 15, 15);
    ctx.fillStyle = "#000";
    ctx.fillText("Ganhos", canvas.width - 100, 42);

    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width - 120, 55, 15, 15);
    ctx.fillStyle = "#000";
    ctx.fillText("Gastos", canvas.width - 100, 67);
  }

  inputs.forEach(input => input.addEventListener("input", desenharBarrasAnual));
  desenharBarrasAnual();
}

inicializarBloco("blocoGastos", ["Aluguel","Comida","Transporte","Lazer"], ["#ff6384","#36a2eb","#ffcd56","#4caf50"]);
inicializarBloco("blocoGanhos", ["Salário","Freelance","Investimentos"], ["#4caf50","#36a2eb","#ffcd56"]);
inicializarBlocoAnual();