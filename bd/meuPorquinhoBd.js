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
const usuario_meta = localStorage.getItem('usuario_meta');

// Variável que armazena o total guardado manualmente (soma feita no frontend)
let totalGuardado = 0;

// Pega os valores iniciais dos inputs da página
let meta = parseFloat(document.getElementById("meta").value);
let prazo = parseInt(document.getElementById("prazo").value);
let mensal = parseFloat(document.getElementById("mensal").value);

window.onload = async function () {
  console.log("Página carregada");

  // Recupera do localStorage
  const metaSalva = localStorage.getItem("meta");
  const prazoSalvo = localStorage.getItem("prazo");
  const mensalSalvo = localStorage.getItem("mensal");

  // Recupera total guardado

  totalGuardado = await pegarTotalCofrinho();
  document.getElementById("totalCofrinho").innerText = 
  "Total guardado: R$ " + totalGuardado.toFixed(2).replace(".", ",");

  if (metaSalva && prazoSalvo && mensalSalvo) {
    // Preenche inputs
    document.getElementById("meta").value = metaSalva;
    document.getElementById("prazo").value = prazoSalvo;
    document.getElementById("mensal").value = mensalSalvo;

    // Deixa readonly
    document.getElementById("meta").setAttribute("readonly", true);
    document.getElementById("prazo").setAttribute("readonly", true);
    document.getElementById("mensal").setAttribute("readonly", true);

    // Mostra cofrinho
    document.querySelector(".cofrinho").style.display = "flex";
    calcular();
    document.getElementById("criarMeta").style.pointerEvents = "none";
    document.getElementById("criarMeta").style.backgroundColor = "#1a353aff";
  }
}
async function pegarTotalCofrinho() {
  const { data, error } = await supabase
    .from("cofre")
    .select("saldo")
    .eq("id_usuario", usuario_id)
    .order("id", { ascending: false })
    .limit(1);
  
  if (error) {
    console.error("Erro ao buscar depósitos:", error);
    return 0;
  }

  // Somatório dos depósitos
  let total = data.reduce((acc, item) => acc + item.valorDeposito, 0);
  console.log(data[0].saldo)
  return data[0].saldo;
}




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
  texto += `<button id="limparCampos">Redefinir meta</button>`;

  // Mostra o resultado no HTML
  document.getElementById("resultado").innerHTML = texto;

  texto += `<br><br><strong>*apenas uma meta pode ser criada por vez.</strong>`;
  document.getElementById("resultado").innerHTML = texto;
  // Botão para criar meta no banco
  document.getElementById("criarMeta").addEventListener("click", function () {
    // torna os inputs somente leitura
    document.getElementById("meta").setAttribute("readonly", true);
    document.getElementById("prazo").setAttribute("readonly", true);
    document.getElementById("mensal").setAttribute("readonly", true);

    // exibe o cofrinho escondido
    document.querySelector(".cofrinho").style.display = "flex";
    localStorage.setItem('meta', meta);
    localStorage.setItem('prazo', prazo);
    localStorage.setItem('mensal', mensal);
    // salva no banco    
    criarMeta(meta, prazo)
    return mostrarAlerta("Meta criada!")
  });

  // Botão para limpar os campos e resetar
  document.getElementById("limparCampos").addEventListener("click", async function () {
    document.getElementById("meta").value = "";
    document.getElementById("prazo").value = "";
    document.getElementById("mensal").value = "";
    document.getElementById("resultado").innerHTML = "";

    localStorage.removeItem("meta");
    localStorage.removeItem("prazo");
    localStorage.removeItem("mensal");
    // localStorage.removeItem("meta");
    document.querySelector(".cofrinho").style.display = "none";

    // remove o readonly dos inputs
    document.getElementById("meta").removeAttribute("readonly", true);
    document.getElementById("prazo").removeAttribute("readonly", false);
    document.getElementById("mensal").removeAttribute("readonly");
    const { data, error } = await supabase
      .from("meta")
      .update({
        ativo: false
      })
      .eq("id_usuario", usuario_id)

    if (error) {
      alert("Erro ao atualizar: " + error.message);
      return;
    }

  });
}


async function verificarMeta() {
  // Função que pega a meta ativa do banco
  let meta;

  const { data, error } = await supabase
    .from("meta")
    .select('*')
    .eq('ativo', true) // busca apenas metas marcadas como ativas
    .eq('id_usuario', usuario_id)

  if (error) {
    console.error("Erro ao recuperar dados:", error);
  } else {
    if (data.length > 0) {
      console.log("Já existe uma meta");
      meta = data[0].meta; // pega o valor da meta
      document.querySelector(".cofrinho").style.display = "flex";
      // meta = 0;
    } else {
      meta = data[0].meta; // pega o valor da meta
      console.log("meta na função" + meta);
      document.querySelector(".meta").style.display = "block";
      return meta
    }
  }

}
// Função que pega a meta ativa do banco
async function pegarMeta() {
  let meta;

  const { data, error } = await supabase
    .from("meta")
    .select('*')
    .eq('ativo', true) // busca apenas metas marcadas como ativas
    .eq('id_usuario', usuario_id)
    .limit(1);

  if (error) {
    console.error("Erro ao recuperar dados:", error);
  } else {
    if (data.length <= 0) {
      console.log("Nenhuma meta cadastrada!");
      meta = 0;
    } else {
      meta = data[0].meta; // pega o valor da meta
      console.log("meta na função" + meta);
      return meta
    }
  }
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
    document.getElementById("criarMeta").style.pointerEvents = "none";
    document.getElementById("criarMeta").style.backgroundColor = "#1a353aff";
    console.log("Meta criada", data);
  }
}

// Função que pega o saldo atual do usuário no banco
async function pegarSaldo() {
  let saldoAtual;

  const { data, error } = await supabase
    .from("cofre")
    .select("saldo")
    .eq("id_usuario", usuario_id)
    .order("id", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Erro ao recuperar dados:", error);
  } else {
    if (data.length <= 0) {
      saldoAtual = 0;
      console.log("Nenhuma saldo!");
    } else {
      saldoAtual = data[0].saldo; // pega o valor de saldo
      console.log(saldoAtual);
    }
    return saldoAtual;
  }
}

async function depositar() {
    let valor = parseFloat(document.getElementById("valorDeposito").value);

    // validação do valor digitado
    if (isNaN(valor) || valor <= 0) {
      mostrarAlerta("Digite um valor válido para depositar!");
      return;
    }

    // chama funções assíncronas que retornam meta e saldo
    let meta = await pegarMeta(); 
    let saldoAtual = await pegarSaldo(); 
    let saldo = saldoAtual + valor; // aqui ocorre erro se for Promise

    // console.log(meta)
    // console.log(saldoAtual)
    // console.log(saldo)
    // console.log('agora vou inserir no banco')

    // insere no banco o depósito feito
    const { data, error } = await supabase
      .from("cofre")
      .insert([{ id_usuario: usuario_id, saldo, tipo: 'deposito', valorDeposito: valor }]);

    // tratamento de erro ou sucesso
    if (error) {
      console.error("Erro ao adicionar:", error);
    }
    else {
      console.log("Deposito efetuado", data);
    }

  // Calcula saldo e total guardado
  // totalGuardado += valor;

  // Atualiza o total na tela
  document.getElementById("totalCofrinho").innerText =
    "Total guardado: R$ " + saldo.toFixed(2).replace(".", ",");

  // Limpa input
  document.getElementById("valorDeposito").value = "";
}

async function retirar() {
    let valor = parseFloat(document.getElementById("valorRetirada").value);

    // validação do valor digitado
    if (isNaN(valor) || valor <= 0) {
      mostrarAlerta("Digite um valor válido para retirar!");
      return;
    }

    // chama funções assíncronas que retornam meta e saldo
    let meta = await pegarMeta(); 
    let saldoAtual = await pegarSaldo(); 
    let saldo = saldoAtual - valor; // aqui ocorre erro se for Promise

    // console.log(meta)
    // console.log(saldoAtual)
    // console.log(saldo)
    // console.log('agora vou inserir no banco')

    // insere no banco o depósito feito
    const { data, error } = await supabase
      .from("cofre")
      .insert([{ id_usuario: usuario_id, saldo, tipo: 'retirada', valorDeposito: valor }]);

    // tratamento de erro ou sucesso
    if (error) {
      console.error("Erro ao retirar:", error);
    }
    else {
      console.log("Retirada efetuada", data);
    }

  // Calcula saldo e total guardado
  // totalGuardado += valor;

  // Atualiza o total na tela
  document.getElementById("totalCofrinho").innerText =
    "Total guardado: R$ " + saldo.toFixed(2).replace(".", ",");

  // Limpa input
  document.getElementById("valorRetirada").value = "";
}