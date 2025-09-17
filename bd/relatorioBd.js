const relatorios = [ 
    {
        mes: "Agosto 2025",
        ganhos: [{ categoria: "Salário", valor: 3000 }, { categoria: "Freelance", valor: 800 }],
        gastos: [{ categoria: "Aluguel", valor: 1200 }, { categoria: "Supermercado", valor: 600 }, { categoria: "Transporte", valor: 150 }, { categoria: "Lazer", valor: 200 }],
        investimentos: [{ categoria: "Tesouro Direto", valor: 300 }, { categoria: "Ações", valor: 200 }]
    },
    {
        mes: "Julho 2025",
        ganhos: [{ categoria: "Salário", valor: 3000 }, { categoria: "Freelance", valor: 500 }],
        gastos: [{ categoria: "Aluguel", valor: 1200 }, { categoria: "Supermercado", valor: 700 }, { categoria: "Transporte", valor: 150 }, { categoria: "Lazer", valor: 250 }],
        investimentos: [{ categoria: "Tesouro Direto", valor: 400 }, { categoria: "Ações", valor: 100 }]
    }
];

const container = document.getElementById("containerCartoes");
const modalOverlay = document.getElementById("modalOverlay");
const modalRelatorio = document.getElementById("modalRelatorio");
const btnBaixarModal = document.getElementById("baixarModal");
const btnFecharModal = document.getElementById("fecharModal");

let ultimoPdfUrl = null;
let relatorioAtualIndex = null;

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

    tempDiv.innerHTML += criarSecao("Principais Gastos", relatorio.gastos);
tempDiv.innerHTML += `<canvas id="graficoGastos${index}" width="300" height="150"></canvas>`;

    tempDiv.innerHTML += criarSecao("Principais Ganhos", relatorio.ganhos);
    tempDiv.innerHTML += `<canvas id="graficoGanhos${index}" width="300" height="150"></canvas>`;

    tempDiv.innerHTML += criarSecao("Investimentos", relatorio.investimentos);
    tempDiv.innerHTML += `<canvas id="graficoInvestimentos${index}" width="300" height="150"></canvas>`;

    return tempDiv;
}

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

    const ctx = document.getElementById(`grafico${index}`).getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ganhos', 'Gastos', 'Investimentos'],
            datasets: [{
                data: [
                    relatorio.ganhos.reduce((a, b) => a + b.valor, 0),
                    relatorio.gastos.reduce((a, b) => a + b.valor, 0),
                    relatorio.investimentos.reduce((a, b) => a + b.valor, 0)
                ],
                backgroundColor: ['#4CAF50', '#F44336', '#2196F3']
            }]
        },
        options: { responsive: false, plugins: { legend: { position: 'bottom' } } }
    });

    document.getElementById(`btnVisualizar${index}`).addEventListener("click", () => {
        relatorioAtualIndex = index;
        modalRelatorio.innerHTML = '';
        const conteudo = criarRelatorioDiv(relatorio, index);
        modalRelatorio.appendChild(conteudo);
        modalOverlay.style.display = 'flex';

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

        setTimeout(() => {
            html2pdf().from(conteudo).toPdf().output('blob').then((pdfBlob) => {
                ultimoPdfUrl = URL.createObjectURL(pdfBlob);
            });
        }, 1000); 
    });
});


btnFecharModal.addEventListener("click", () => {
    modalOverlay.style.display = 'none';
});

btnBaixarModal.addEventListener("click", () => {
    if (!ultimoPdfUrl) return alert("Visualize o relatório primeiro!");
    if (relatorioAtualIndex === null) return;

    const link = document.createElement('a');
    link.href = ultimoPdfUrl;
link.download = `relatorio-${relatorios[relatorioAtualIndex].mes.replace(' ', '-')}.pdf`;
    link.click();
});