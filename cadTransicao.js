let cadastro = document.querySelector(".cadastro");
let login = document.querySelector(".logar");
let senha = document.querySelector(".senhaOnOff")

function cadSome() {
    cadastro.classList.remove("AnimacaoEntra");
    cadastro.classList.add("AnimacaoSai");
    cadastro.style.pointerEvents = "none";

    setTimeout(() => {
        login.classList.remove("AnimacaoSai");
        login.classList.add("AnimacaoEntra");
        login.style.pointerEvents = "all";
    }, 1000);
}

function loginSome() {
    login.classList.remove("AnimacaoEntra");
    login.classList.add("AnimacaoSai");
    login.style.pointerEvents = "none";

    setTimeout(() => {
        cadastro.classList.remove("AnimacaoSai");
        cadastro.classList.add("AnimacaoEntra");
        cadastro.style.pointerEvents = "all";
    }, 1000);
}

function mostrarSenha(checkbox) {
    const input = checkbox.closest(".inputCad").querySelector(".senhaOnOff");

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}