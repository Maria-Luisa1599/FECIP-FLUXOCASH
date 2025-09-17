let cartao = document.querySelector(".add_transacoes");
let btnAdicionar = document.querySelector("#btnAdicionar");
let btnCancelar = document.querySelector("#btnCancelar");

let btnCategoriaEntra = document.querySelector("#btnCategoriaEntra");
let btnCategoriaSai = document.querySelector("#btnCategoriaSai");
let cartaoCategoria = document.querySelector(".add_categoria");

function mostrarCartao() {
    cartao.classList.remove("AnimacaoSai");
    cartao.classList.add("AnimacaoEntra");
    cartao.style.pointerEvents = "all";
}

function esconderCartao() {
    cartao.classList.remove("AnimacaoEntra");
    cartao.classList.add("AnimacaoSai");
    cartao.style.pointerEvents = "none";
}

btnAdicionar.addEventListener("click", mostrarCartao);
btnCancelar.addEventListener("click", esconderCartao);

btnCategoriaEntra.addEventListener("click", () => {
    cartao.classList.remove("AnimacaoEntra");
    cartao.classList.add("AnimacaoSai");
    cartao.style.pointerEvents = "none";

    setTimeout(() => {
        cartaoCategoria.classList.remove("AnimacaoSai");
        cartaoCategoria.classList.add("AnimacaoEntra");
        cartaoCategoria.style.pointerEvents = "all";
    }, 200); 
});

btnCategoriaSai.addEventListener("click", () => {
    cartaoCategoria.classList.remove("AnimacaoEntra");
    cartaoCategoria.classList.add("AnimacaoSai");
    cartaoCategoria.style.pointerEvents = "none";

    setTimeout(() => {
        cartao.classList.remove("AnimacaoSai");
        cartao.classList.add("AnimacaoEntra");
        cartao.style.pointerEvents = "all";
    }, 200); 
});
