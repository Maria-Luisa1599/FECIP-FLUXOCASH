// Seleciona os elementos principais do DOM
let cartao = document.querySelector(".add_transacoes");   // cartão para adicionar transações
let btnAdicionar = document.querySelector("#btnAdicionar"); // botão que abre o cartão de transações
let btnCancelar = document.querySelector("#btnCancelar");   // botão que fecha o cartão de transações

let btnCategoriaEntra = document.querySelector("#btnCategoriaEntra"); // botão que abre o cartão de categorias
let btnCategoriaSai = document.querySelector("#btnCategoriaSai");     // botão que fecha o cartão de categorias
let cartaoCategoria = document.querySelector(".add_categoria");       // cartão de categorias

// Função para mostrar o cartão de transações
function mostrarCartao() {
    cartao.classList.remove("AnimacaoSai");  // remove a classe de saída (caso esteja aplicada)
    cartao.classList.add("AnimacaoEntra");   // aplica a animação de entrada
    cartao.style.pointerEvents = "all";      // permite interação com o cartão
}

// Função para esconder o cartão de transações
function esconderCartao() {
    cartao.classList.remove("AnimacaoEntra"); // remove a classe de entrada
    cartao.classList.add("AnimacaoSai");      // aplica a animação de saída
    cartao.style.pointerEvents = "none";      // bloqueia interação com o cartão
}

// Eventos para abrir/fechar o cartão de transações
btnAdicionar.addEventListener("click", mostrarCartao);
btnCancelar.addEventListener("click", esconderCartao);

// Evento para abrir o cartão de categorias e esconder o de transações
btnCategoriaEntra.addEventListener("click", () => {
    // Esconde o cartão de transações
    cartao.classList.remove("AnimacaoEntra");
    cartao.classList.add("AnimacaoSai");
    cartao.style.pointerEvents = "none";

    // Depois de 200ms (tempo da animação), mostra o cartão de categorias
    setTimeout(() => {
        cartaoCategoria.classList.remove("AnimacaoSai");
        cartaoCategoria.classList.add("AnimacaoEntra");
        cartaoCategoria.style.pointerEvents = "all";
    }, 200); 
});

// Evento para voltar do cartão de categorias para o de transações
btnCategoriaSai.addEventListener("click", () => {
    // Esconde o cartão de categorias
    cartaoCategoria.classList.remove("AnimacaoEntra");
    cartaoCategoria.classList.add("AnimacaoSai");
    cartaoCategoria.style.pointerEvents = "none";

    // Depois de 200ms, mostra novamente o cartão de transações
    setTimeout(() => {
        cartao.classList.remove("AnimacaoSai");
        cartao.classList.add("AnimacaoEntra");
        cartao.style.pointerEvents = "all";
    }, 200); 
});
