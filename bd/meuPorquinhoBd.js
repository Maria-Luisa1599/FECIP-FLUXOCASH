// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const supabase = createClient(
//   "https://chvaqdzgvfqtcfaccomy.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I"
// );
// const usuario_id = localStorage.getItem("usuario_id");

let totalGuardado = 0;

let meta = parseFloat(document.getElementById("meta").value);
let prazo = parseInt(document.getElementById("prazo").value);
let mensal = parseFloat(document.getElementById("mensal").value);

async function mostrarAlerta(mensagem) {
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

async function calcular() {
    
    let meta = parseFloat(document.getElementById("meta").value);
    let prazo = parseInt(document.getElementById("prazo").value);
    let mensal = parseFloat(document.getElementById("mensal").value);

    if (isNaN(meta) || isNaN(prazo) || isNaN(mensal) || meta <= 0 || prazo <= 0 || mensal <= 0) {
        document.getElementById("resultado").innerHTML = "⚠️ Preencha todos os campos corretamente.";
        return;
    }

    let totalPlanejado = mensal * prazo;
    let mesesNecessarios = Math.ceil(meta / mensal);

    let texto = "";

    if (totalPlanejado >= meta) {
        texto += `✅ Com R$ ${mensal.toFixed(2)} por mês, você alcança a meta em ${mesesNecessarios} meses.<br>`;
    } else {
        texto += `⚠️ Com R$ ${mensal.toFixed(2)} por mês, em ${prazo} meses você terá R$ ${totalPlanejado.toFixed(2)}, mas não atingirá a meta.<br>`;
        texto += `👉 Para atingir a meta em ${prazo} meses, você precisa guardar R$ ${(meta / prazo).toFixed(2)} por mês.<br>`;
    }

    let sugestao = mensal + (mensal * 0.2);
    let mesesComSugestao = Math.ceil(meta / sugestao);

    texto += `<br>💡 Se você aumentar para R$ ${sugestao.toFixed(2)} por mês, vai atingir em ${mesesComSugestao} meses. <br>`;
    texto += `<button id="criarMeta" style="margin-right: 30px;">Criar meta</button>`;
    texto += `<button id="limparCampos">Limpar campos</button>`;


    document.getElementById("resultado").innerHTML = texto;

 document.getElementById("criarMeta").addEventListener("click", function () {
        document.getElementById("meta").setAttribute("readonly", true);
        document.getElementById("prazo").setAttribute("readonly", true);
        document.getElementById("mensal").setAttribute("readonly", true);

        return mostrarAlerta("Meta criada!")
    });

    document.getElementById("limparCampos").addEventListener("click", function () {
        document.getElementById("meta").value = "";
        document.getElementById("prazo").value = "";
        document.getElementById("mensal").value = "";
        document.getElementById("resultado").innerHTML = "";

        document.getElementById("meta").removeAttribute("readonly", true);
        document.getElementById("prazo").removeAttribute("readonly", false);
        document.getElementById("mensal").removeAttribute("readonly");
    });
}


async function depositar() {
  let valor = parseFloat(document.getElementById("valorDeposito").value);

  if (isNaN(valor) || valor <= 0) {
    mostrarAlerta("Digite um valor válido para depositar!");
    return;
  }

  totalGuardado += valor;
  document.getElementById("totalCofrinho").innerText = "Total guardado: R$ " + totalGuardado.toFixed(2).replace(".", ",");
  document.getElementById("valorDeposito").value = "";
}