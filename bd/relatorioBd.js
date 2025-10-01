// Importa a biblioteca do Supabase diretamente do CDN
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cria o cliente Supabase usando a URL do projeto e a chave pública (anon key)
const supabase = createClient(
  "https://chvaqdzgvfqtcfaccomy.supabase.co", // URL do projeto Supabase
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodmFxZHpndmZxdGNmYWNjb215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU3ODIsImV4cCI6MjA3MDc4MTc4Mn0.0Wosp2gv_RfE1qVj4uClMSX3WmWLvpkqfLhe6Yhbw2I" // chave anon
);

// Recupera o ID do usuário que foi armazenado no navegador (localStorage)
const usuario_id = localStorage.getItem("usuario_id");

// Seleciona os elementos principais da página
const container = document.getElementById("containerCartoes");
const modalOverlay = document.getElementById("modalOverlay");
const modalRelatorio = document.getElementById("modalRelatorio");
const btnBaixarModal = document.getElementById("baixarModal");
const btnFecharModal = document.getElementById("fecharModal");

// Array que guarda os relatórios de cada mês
// Cada relatório contém ganhos, gastos e investimentos com categorias e valores


let ultimoPdfUrl = null; // guarda a URL do último PDF gerado
let relatorioAtualIndex = null; // guarda o índice do relatório atualmente visualizado

async function renderizarRelatorios() {
    const { data: transacoes, error } = await supabase
        .from("transacoes")
        .select("*")
        .eq("id_usuario", usuario_id);

    if (error) {
        console.error("Erro ao carregar transacoes:", error);
        return;
    }

    const { data: categorias, error: errorCategorias } = await supabase
        .from("categoria")
        .select("*")
        .eq("id_usuario", usuario_id);

    if (errorCategorias) {
        console.error("Erro ao carregar categorias:", errorCategorias);
        return;
    }

function criarRelatorioDiv(relatorio, index) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `<h2>Relatório - ${relatorio.mes}</h2>`;

        function criarSecao(titulo, dados) {
            let html = `<h3>${titulo}</h3>`;
            html += `<table><thead><tr><th>Categoria</th><th>Valor (R$)</th></tr></thead><tbody>`;
            dados.forEach(item => html += `<tr><td>${item.categoria}</td><td>${item.valor.toFixed(2)}</td></tr>`);
            html += `</tbody></table>`;
            return html;
        }

        tempDiv.innerHTML += criarSecao("Principais Gasto", relatorio.gastos);
        tempDiv.innerHTML += `<canvas id="graficoGastos${index}" width="300" height="150"></canvas>`;
        tempDiv.innerHTML += criarSecao("Principais Ganho", relatorio.ganhos);
        tempDiv.innerHTML += `<canvas id="graficoGanhos${index}" width="300" height="150"></canvas>`;
        // tempDiv.innerHTML += criarSecao("Investimentos", relatorio.investimentos);
        // tempDiv.innerHTML += `<canvas id="graficoInvestimentos${index}" width="300" height="150"></canvas>`;

        return tempDiv;
    }

function pegarPrincipaisTransacoes(transacoes, categorias, tipoFiltro) {
    // Define a data limite (10 dias atrás)
    const dezDiasAtras = new Date();
    dezDiasAtras.setDate(dezDiasAtras.getDate() - 10);

    // Filtra transações do tipo correto e que ocorreram nos últimos 10 dias
    const transacoesFiltradas = transacoes
        .filter(t => t.tipo === tipoFiltro)
        .filter(t => new Date(t.data) >= dezDiasAtras);

    if (transacoesFiltradas.length === 0) return [];

    // Agrupa as transações por categoria e soma os valores
    const valoresPorCategoria = transacoesFiltradas.reduce((acc, tr) => {
        const categoria = categorias.find(c => c.id_categoria == tr.fk_categoria_id_categoria);
        if (!categoria) return acc;

        if (!acc[categoria.tipo]) acc[categoria.tipo] = 0;
        acc[categoria.tipo] += tr.valor;
        return acc;
    }, {});

    // Converte o objeto em array para exibição no relatório
    const resultado = Object.entries(valoresPorCategoria)
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor); // opcional: ordenar do maior para o menor

    return resultado;
}


const relatorio = {
    mes: "Relatorio Geral",
    ganhos: pegarPrincipaisTransacoes(transacoes, categorias, "ganho"),
    gastos: pegarPrincipaisTransacoes(transacoes, categorias, "gasto"),
    // investimentos: pegarPrincipaisTransacoes(transacoes, categorias, "investimento")
};


    console.log("📊 Relatório pronto:", relatorio);

    // --- Criar cartão e gráficos aqui usando o relatorio ---
    const cartao = document.createElement("div");
    cartao.className = "cartao";
    cartao.innerHTML = `
          <h3>${relatorio.mes}</h3>
          <canvas id="graficoResumo" width="280" height="200"></canvas>
          <div>
            <button class="btnPdf" id="btnVisualizar">Visualizar PDF</button>
          </div>
        `;
    container.appendChild(cartao);

    // Gráfico resumo
    const ctx = document.getElementById(`graficoResumo`).getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ganhos', 'Gastos'],
            datasets: [{
                data: [
                    relatorio.ganhos.reduce((a, b) => a + b.valor, 0),
                    relatorio.gastos.reduce((a, b) => a + b.valor, 0),
                    // relatorio.investimentos.reduce((a, b) => a + b.valor, 0)
                ],
                backgroundColor: ['#4CAF50', '#F44336', '#2196F3']
            }]
        },
        options: { responsive: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Botão PDF
    document.getElementById("btnVisualizar").addEventListener("click", () => {
        relatorioAtualIndex = 0; // só temos 1 relatório
        modalRelatorio.innerHTML = '';
        const conteudo = criarRelatorioDiv(relatorio, 0);
        modalRelatorio.appendChild(conteudo);
        modalOverlay.style.display = 'flex';

        // gráficos detalhados dentro do modal
        new Chart(document.getElementById(`graficoGastos0`), {
            type: 'bar',
            data: {
                labels: relatorio.gastos.map(g => g.categoria),
                datasets: [{ data: relatorio.gastos.map(g => g.valor), backgroundColor: '#F44336' }]
            }
        });

new Chart(document.getElementById(`graficoGanhos0`), {
    type: 'bar',
    data: {
        labels: relatorio.ganhos.map(g => g.categoria),
        datasets: [{ data: relatorio.ganhos.map(g => g.valor), backgroundColor: '#4CAF50' }]
    }
});


        setTimeout(() => {
            html2pdf().from(conteudo).toPdf().output('blob').then((pdfBlob) => {
                ultimoPdfUrl = URL.createObjectURL(pdfBlob);
            });
        }, 1000); 
    });
}

// Fecha modal 
btnFecharModal.addEventListener("click", () => {
    modalOverlay.style.display = 'none';
});

// Baixa PDF 
btnBaixarModal.addEventListener("click", () => {
    if (!ultimoPdfUrl) return alert("Visualize o relatório primeiro!");
    const link = document.createElement('a');
    link.href = ultimoPdfUrl;
    link.download = 'relatorio-geral.pdf';
    link.click();
});

// --- Chama a função ---
renderizarRelatorios();
