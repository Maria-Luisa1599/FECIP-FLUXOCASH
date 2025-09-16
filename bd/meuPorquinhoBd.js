// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const supabase = createClient(
//   "https://chvaqdzgvfqtcfaccomy.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I"
// );
// const usuario_id = localStorage.getItem("usuario_id");

// const btnAdicionarSaldo = document.getElementById("btnAdicionarSaldo");

// async function calcular() {
//     let meta = parseFloat(document.getElementById("meta").value);
//     let prazo = parseInt(document.getElementById("prazo").value);
//     let mensal = parseFloat(document.getElementById("mensal").value);

//     if (isNaN(meta) || isNaN(prazo) || isNaN(mensal) || meta <= 0 || prazo <= 0 || mensal <= 0) {
//         document.getElementById("resultado").innerHTML = "⚠️ Preencha todos os campos corretamente.";
//         return;
//     }

//     let totalPlanejado = mensal * prazo;
//     let mesesNecessarios = Math.ceil(meta / mensal);

//     let texto = "";

//     if (totalPlanejado >= meta) {
//         texto += `✅ Com R$ ${mensal.toFixed(2)} por mês, você alcança a meta em ${mesesNecessarios} meses.<br>`;
//     } else {
//         texto += `⚠️ Com R$ ${mensal.toFixed(2)} por mês, em ${prazo} meses você terá R$ ${totalPlanejado.toFixed(2)}, mas não atingirá a meta.<br>`;
//         texto += `👉 Para atingir a meta em ${prazo} meses, você precisa guardar R$ ${(meta / prazo).toFixed(2)} por mês.<br>`;
//     }

//     let sugestao = mensal + (mensal * 0.2);
//     let mesesComSugestao = Math.ceil(meta / sugestao);

//     texto += `<br>💡 Se você aumentar para R$ ${sugestao.toFixed(2)} por mês, vai atingir em apenas ${mesesComSugestao} meses.`;

//     document.getElementById("resultado").innerHTML = texto;
// }

// btnAdicionarSaldo.addEventListener("click", async (e) => {
//   e.preventDefault();
//     console.log('a')
//     depositar()
// //   let nomeCategoria = inputNovaCategoria.value.trim().toLowerCase();
// //   if (!nomeCategoria) return mostrarAlerta("Digite o nome da categoria!");

// //   const { data: existente } = await supabase
// //     .from("categoria")
// //     .select("id_categoria")
// //     .ilike("tipo", nomeCategoria)
// //     .maybeSingle();

// // if (existente) return mostrarAlerta("Essa categoria já existe!");

// //   const nomeFormatado = nomeCategoria.charAt(0).toUpperCase() + nomeCategoria.slice(1);

// //   const { data: novaCat, error } = await supabase
// //     .from("categoria")
// //     .insert([{ tipo: nomeFormatado, id_usuario: usuario_id}])
// //     .select();

// //   if (error) return alert("Erro ao criar categoria: " + error.message);

// //   carregarCategorias();
// //   inputNovaCategoria.value = "";
// //   cartaoCategoria.style.display = "none";
// //   mostrarAlerta(`Categoria "${nomeFormatado}" adicionada!`);
// });

// async function depositar() {

//     let meta = parseFloat(document.getElementById("meta").value);
//     let prazo = parseInt(document.getElementById("prazo").value);
//     let mensal = parseFloat(document.getElementById("mensal").value);
//     let valor = parseFloat(document.getElementById("valorDeposito").value);

//     if (isNaN(valor) || valor <= 0 || isNaN(meta) || isNaN(prazo) || isNaN(mensal) || meta <= 0 || prazo <= 0 || mensal <= 0) {
//         alert("Digite um valor válido para depositar!");
//         return;
//     }

//       const { error } = await supabase.from("cofre").insert([
//         { meta, prazo, id_usuario, valor}
//   ]);

//   if (error) return alert("Erro ao salvar: " + error.message)
//     else{console.log("deu certo")};


//     totalGuardado += valor;
//     document.getElementById("cofrinho").innerText = "Total guardado: R$ " + totalGuardado.toFixed(2).replace(".", ",");
//     document.getElementById("valorDeposito").value = "";
// }

// async function depositar() {
//     const valor = parseFloat(document.getElementById("valorDeposito").value);
//     console.log(valor);

// }

// // btnAdicionarSaldo.addEventListener("click", async (e) => {
// //   e.preventDefault();

// //   const tipo = tipoSelect.value === "option1" ? "ganho" : "gasto";
// //   const categoriaId = parseInt(categoriaSelect.value);
// //   const data = cartaoTransacao.querySelector("input[name='data']").value;

// //   if (!valor || !tipo || !categoriaId || !data) return mostrarAlerta(`Preencha todos os campos!`);

// //   const { error } = await supabase.from("transacoes").insert([
// //     { valor, tipo, data, fk_categoria_id_categoria: categoriaId, id_usuario: usuario_id}
// //   ]);

// //   if (error) return alert("Erro ao salvar: " + error.message);

// //   carregarTransacoes();

// //   cartaoTransacao.querySelector("input[name='valor']").value = "";
// //   cartaoTransacao.querySelector("input[name='data']").value = "";
// //   tipoSelect.selectedIndex = 0;
// //   categoriaSelect.selectedIndex = 0;
// // });

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