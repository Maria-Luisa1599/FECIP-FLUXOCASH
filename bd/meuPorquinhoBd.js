//código incompleto - ajustar


// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// código comentado que faria a conexão com o Supabase usando a biblioteca oficial

// const supabase = createClient(
//   "https://chvaqdzgvfqtcfaccomy.supabase.co",
//   "chave_de_api"
// );
// código comentado que inicializaria o cliente Supabase

// Recupera do localStorage o ID do usuário logado (salvo no login)
const usuario_id = localStorage.getItem("usuario_id");

// Variável que armazena o total guardado manualmente (soma feita no frontend)
let totalGuardado = 0;

// Pega os valores iniciais dos inputs da página
let meta = parseFloat(document.getElementById("meta").value);
let prazo = parseInt(document.getElementById("prazo").value);
let mensal = parseFloat(document.getElementById("mensal").value);

// Função que cria um alerta estilizado na tela
async function mostrarAlerta(mensagem) {
  const overlay = document.createElement("div"); // cria o fundo
  overlay.className = "alert-overlay";

  // estrutura HTML do alerta
  overlay.innerHTML = `
    <div class="alert-card">
      <p>${mensagem}</p>
      <button>OK</button>
    </div>
  `;

  document.body.appendChild(overlay); // adiciona ao corpo do HTML

  // botão OK remove o alerta
  overlay.querySelector("button").addEventListener("click", () => overlay.remove());
}

// Função que calcula se a meta é possível dentro do prazo informado
async function calcular() {

  // Lê os valores dos inputs
  let meta = parseFloat(document.getElementById("meta").value);
  let prazo = parseInt(document.getElementById("prazo").value);
  let mensal = parseFloat(document.getElementById("mensal").value);

  // Verificação de preenchimento correto
  if (isNaN(meta) || isNaN(prazo) || isNaN(mensal) || meta <= 0 || prazo <= 0 || mensal <= 0) {
    document.getElementById("resultado").innerHTML = "⚠️ Preencha todos os campos corretamente.";
    return;
  }

  // Cálculos principais
  let totalPlanejado = mensal * prazo; // quanto será guardado no total
  let mesesNecessarios = Math.ceil(meta / mensal); // em quantos meses atinge a meta

  let texto = "";

  // Caso o planejamento atinja a meta
  if (totalPlanejado >= meta) {
    texto += `✅ Com R$ ${mensal.toFixed(2)} por mês, você alcança a meta em ${mesesNecessarios} meses.<br>`;
  } else {
    // Caso não seja suficiente
    texto += `⚠️ Com R$ ${mensal.toFixed(2)} por mês, em ${prazo} meses você terá R$ ${totalPlanejado.toFixed(2)}, mas não atingirá a meta.<br>`;
    texto += `👉 Para atingir a meta em ${prazo} meses, você precisa guardar R$ ${(meta / prazo).toFixed(2)} por mês.<br>`;
  }

  // Sugestão de aumento de 20% no valor mensal
  let sugestao = mensal + (mensal * 0.2);
  let mesesComSugestao = Math.ceil(meta / sugestao);

  texto += `<br>💡 Se você aumentar para R$ ${sugestao.toFixed(2)} por mês, vai atingir em ${mesesComSugestao} meses. <br>`;
  texto += `<button id="criarMeta" style="margin-right: 30px;">Criar meta</button>`;
  texto += `<button id="limparCampos">Limpar campos</button>`;

  // Mostra o resultado no HTML
  document.getElementById("resultado").innerHTML = texto;

  // Botão para criar meta no banco
  document.getElementById("criarMeta").addEventListener("click", function () {
    // torna os inputs somente leitura
    document.getElementById("meta").setAttribute("readonly", true);
    document.getElementById("prazo").setAttribute("readonly", true);
    document.getElementById("mensal").setAttribute("readonly", true);

    // exibe o cofrinho escondido
    document.querySelector(".cofrinho").style.display = "flex";

    // salva no banco
    criarMeta(meta, prazo)
    return mostrarAlerta("Meta criada!")
  });

  // Botão para limpar os campos e resetar
  document.getElementById("limparCampos").addEventListener("click", function () {
    document.getElementById("meta").value = "";
    document.getElementById("prazo").value = "";
    document.getElementById("mensal").value = "";
    document.getElementById("resultado").innerHTML = "";

    // remove o readonly dos inputs
    document.getElementById("meta").removeAttribute("readonly", true);
    document.getElementById("prazo").removeAttribute("readonly", false);
    document.getElementById("mensal").removeAttribute("readonly");
  });
}

// Função que insere a meta no banco de dados
async function criarMeta(meta, prazo) {
    const { data, error } = await supabase
      .from("meta")
      .insert([{ id_usuario: usuario_id, meta, prazo }]); // insere a meta vinculada ao usuário

    if (error) {
      console.error("Erro ao adicionar:", error);
    }
    else {
      console.log("Meta criada", data);
    }
}

// Função que pega a meta ativa do banco
async function pegarMeta() {
  let meta;
  
  const { data, error } = await supabase
    .from("meta")
    .select('*')
    .eq('ativo', true) // busca apenas metas marcadas como ativas

  if (error) {
    console.error("Erro ao recuperar dados:", error);
  } else {
    if (data.length <= 0) {
      console.log("Nenhuma meta cadastrada!");
      meta = 0;
    } else {
      meta = data[0].meta; // pega o valor da meta
      console.log(meta);
      return meta 
    }
  }
}

// Função que pega o saldo atual do usuário no banco
async function pegarSaldo() {
  let saldoAtual;

  const { data, error } = await supabase
    .from("cofre")
    .select('*')
    .eq('id_usuario', usuario_id) // filtra pelo usuário logado
    .limit(1); // pega apenas 1 registro (o mais recente seria com orderBy + desc)

  if (error) {
    console.error("Erro ao recuperar dados:", error);
  } else {
    if (data.length <= 0) {
      saldoAtual = 0;
      console.log("Nenhuma saldo!");
    } else {
      saldoAtual = data[0].saldo; // pega o valor de saldo
      console.log(saldoAtual);
      return saldoAtual;
    }
  }
}

// Função de depósito no cofrinho
async function depositar() {
    let valor = parseFloat(document.getElementById("valorDeposito").value);

    // validação do valor digitado
    if (isNaN(valor) || valor <= 0) {
      mostrarAlerta("Digite um valor válido para depositar!");
      return;
    }

    // chama funções assíncronas que retornam meta e saldo
    let meta = pegarMeta(); // deveria ser await para funcionar corretamente
    let saldoAtual = pegarSaldo(); // deveria ser await também
    let saldo = saldoAtual + valor; // aqui ocorre erro se for Promise

    console.log(meta)
    console.log(saldoAtual)
    console.log(saldo)
    console.log('agora vou inserir no banco')

    // insere no banco o depósito feito
    const { data, error } = await supabase
      .from("cofre")
      .insert([{ id_usuario: usuario_id, saldo, tipo: 'deposito', valorDeposito: 'valor' }]);
      // ⚠️ aqui o campo valorDeposito está como string 'valor' em vez de variável valor

    // tratamento de erro ou sucesso
    if (error) {
      console.error("Erro ao adicionar:", error);
    }
    else {
      console.log("Deposito efetuado", data);
    }

    // verifica se o saldo atingiu a meta
    if (saldo >= meta) {
      mostrarAlerta('Você atingiu a meta!')
    }
    else {
      mostrarAlerta(`Faltam apenas ${meta-saldo} para você atingir sua meta.`)
    }

    // atualiza o total guardado no frontend
    totalGuardado += valor;
    document.getElementById("totalCofrinho").innerText = "Total guardado: R$ " + totalGuardado.toFixed(2).replace(".", ",");
    document.getElementById("valorDeposito").value = "";
}
