let cartao = document.querySelector(".add_transacoes");
let btnAdicionar = document.querySelector("#btnAdicionar");
let btnCancelar = document.querySelector("#btnCancelar");

let btnCategoriaEntra = document.querySelector("#btnCategoriaEntra");
let btnCategoriaSai = document.querySelector("#btnCategoriaSai");
let cartaoCategoria = document.querySelector(".add_categoria");

// Mostrar o cartão de transação
function mostrarCartao() {
    cartao.classList.remove("AnimacaoSai");
    cartao.classList.add("AnimacaoEntra");
    cartao.style.pointerEvents = "all";
}

// Esconder o cartão de transação
function esconderCartao() {
    cartao.classList.remove("AnimacaoEntra");
    cartao.classList.add("AnimacaoSai");
    cartao.style.pointerEvents = "none";
}

// Eventos
btnAdicionar.addEventListener("click", mostrarCartao);
btnCancelar.addEventListener("click", esconderCartao);

// Troca para o cartão de categoria
btnCategoriaEntra.addEventListener("click", () => {
    cartao.classList.remove("AnimacaoEntra");
    cartao.classList.add("AnimacaoSai");
    cartao.style.pointerEvents = "none";

    setTimeout(() => {
        cartaoCategoria.classList.remove("AnimacaoSai");
        cartaoCategoria.classList.add("AnimacaoEntra");
        cartaoCategoria.style.pointerEvents = "all";
    }, 200); // tempo da animação CSS
});

// Voltar para o cartão de transação
btnCategoriaSai.addEventListener("click", () => {
    cartaoCategoria.classList.remove("AnimacaoEntra");
    cartaoCategoria.classList.add("AnimacaoSai");
    cartaoCategoria.style.pointerEvents = "none";

    setTimeout(() => {
        cartao.classList.remove("AnimacaoSai");
        cartao.classList.add("AnimacaoEntra");
        cartao.style.pointerEvents = "all";
    }, 200); // tempo da animação CSS
});
