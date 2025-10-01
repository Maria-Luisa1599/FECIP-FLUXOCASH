// Array que guarda os relatórios de cada mês
// Cada relatório contém ganhos, gastos e investimentos com categorias e valores

const relatorios = [ 
    {
        mes: "Relatorio Geral",
        ganhos: [{ categoria: "Salário", valor: 3000 }, { categoria: "Freelance", valor: 800 }],
        gastos: [{ categoria: "Aluguel", valor: 1200 }, { categoria: "Supermercado", valor: 600 }, { categoria: "Transporte", valor: 150 }, { categoria: "Lazer", valor: 200 }],
        investimentos: [{ categoria: "Tesouro Direto", valor: 300 }, { categoria: "Ações", valor: 200 }]
    }
    // {
    //     mes: "Julho 2025",
    //     ganhos: [{ categoria: "Salário", valor: 3000 }, { categoria: "Freelance", valor: 500 }],
    //     gastos: [{ categoria: "Aluguel", valor: 1200 }, { categoria: "Supermercado", valor: 700 }, { categoria: "Transporte", valor: 150 }, { categoria: "Lazer", valor: 250 }],
    //     investimentos: [{ categoria: "Tesouro Direto", valor: 400 }, { categoria: "Ações", valor: 100 }]
    // }
];

// Seleciona os elementos principais da página
const container = document.getElementById("containerCartoes");
const modalOverlay = document.getElementById("modalOverlay");
const modalRelatorio = document.getElementById("modalRelatorio");
const btnBaixarModal = document.getElementById("baixarModal");
const btnFecharModal = document.getElementById("fecharModal");

let ultimoPdfUrl = null; // guarda a URL do último PDF gerado
let relatorioAtualIndex = null; // guarda o índice do relatório atualmente visualizado

// Função que cria a estrutura HTML de um relatório completo
function criarRelatorioDiv(relatorio, index) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = `<h2>Relatório - ${relatorio.mes}</h2>`;

    // Subfunção para criar tabelas de cada seção (ganhos, gastos, investimentos)
    function criarSecao(titulo, dados) {
        let html = `<h3>${titulo}</h3>`;
        html += `<table><thead><tr><th>Categoria</th><th>Valor (R$)</th></tr></thead><tbody>`;
        dados.forEach(item => html += `<tr><td>${item.categoria}</td><td>${item.valor.toFixed(2)}</td></tr>`);
        html += `</tbody></table>`;
        return html;
    }

    // Cria as seções com tabelas e gráficos para cada parte do relatório
    tempDiv.innerHTML += criarSecao("Principais Gastos", relatorio.gastos);
    tempDiv.innerHTML += `<canvas id="graficoGastos${index}" width="300" height="150"></canvas>`;

    tempDiv.innerHTML += criarSecao("Principais Ganhos", relatorio.ganhos);
    tempDiv.innerHTML += `<canvas id="graficoGanhos${index}" width="300" height="150"></canvas>`;

    tempDiv.innerHTML += criarSecao("Investimentos", relatorio.investimentos);
    tempDiv.innerHTML += `<canvas id="graficoInvestimentos${index}" width="300" height="150"></canvas>`;

    return tempDiv; // devolve a div completa com tabelas + gráficos
}

// Para cada relatório, cria um cartão na tela principal
relatorios.forEach((relatorio, index) => {
    const cartao = document.createElement("div");
    cartao.className = "cartao";
    cartao.innerHTML = `
          <h3>${relatorio.mes}</h3>
          <canvas id="grafico${index}" width="280" height="200"></canvas>
          <div>
            <button class="btnPdf" id="btnVisualizar${index}">Visualizar PDF</button>
          </div>
        `;
    container.appendChild(cartao);

    // Gráfico resumo do relatório (doughnut)
    const ctx = document.getElementById(`grafico${index}`).getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ganhos', 'Gastos', 'Investimentos'],
            datasets: [{
                data: [
                    relatorio.ganhos.reduce((a, b) => a + b.valor, 0), // soma todos os ganhos
                    relatorio.gastos.reduce((a, b) => a + b.valor, 0), // soma todos os gastos
                    relatorio.investimentos.reduce((a, b) => a + b.valor, 0) // soma todos os investimentos
                ],
                backgroundColor: ['#4CAF50', '#F44336', '#2196F3']
            }]
        },
        options: { responsive: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Botão de "Visualizar PDF"
    document.getElementById(`btnVisualizar${index}`).addEventListener("click", () => {
        relatorioAtualIndex = index; // marca o relatório atual
        modalRelatorio.innerHTML = ''; // limpa conteúdo do modal
        const conteudo = criarRelatorioDiv(relatorio, index); // cria novo conteúdo
        modalRelatorio.appendChild(conteudo);
        modalOverlay.style.display = 'flex'; // abre modal

        // Cria gráficos detalhados dentro do modal
        new Chart(document.getElementById(`graficoGastos${index}`), {
            type: 'bar',
            data: {
                labels: relatorio.gastos.map(g => g.categoria),
                datasets: [{ data: relatorio.gastos.map(g => g.valor), backgroundColor: '#F44336' }]
            }
        });
        new Chart(document.getElementById(`graficoGanhos${index}`), {
            type: 'bar',
            data: {
                labels: relatorio.ganhos.map(g => g.categoria),
                datasets: [{ data: relatorio.ganhos.map(g => g.valor), backgroundColor: '#4CAF50' }]
            }
        });
        new Chart(document.getElementById(`graficoInvestimentos${index}`), {
            type: 'bar',
            data: {
                labels: relatorio.investimentos.map(g => g.categoria),
                datasets: [{ data: relatorio.investimentos.map(g => g.valor), backgroundColor: '#2196F3' }]
            }
        });

        // Gera um PDF em segundo plano com o html2pdf
        setTimeout(() => {
            html2pdf().from(conteudo).toPdf().output('blob').then((pdfBlob) => {
                ultimoPdfUrl = URL.createObjectURL(pdfBlob); // cria link temporário do PDF
            });
        }, 1000); 
    });
});

// Botão para fechar o modal
btnFecharModal.addEventListener("click", () => {
    modalOverlay.style.display = 'none';
});

// Botão para baixar o PDF
btnBaixarModal.addEventListener("click", () => {
    if (!ultimoPdfUrl) return alert("Visualize o relatório primeiro!"); // garante que o PDF já foi gerado
    if (relatorioAtualIndex === null) return;

    const link = document.createElement('a');
    link.href = ultimoPdfUrl;
    link.download = `relatorio-${relatorios[relatorioAtualIndex].mes.replace(' ', '-')}.pdf`; // nome do arquivo
    link.click(); // dispara o download
});
