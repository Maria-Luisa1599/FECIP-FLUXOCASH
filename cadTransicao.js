// Seleciona os elementos principais do DOM
let cadastro = document.querySelector(".cadastro"); // container da tela de cadastro
let login = document.querySelector(".logar");       // container da tela de login
let senha = document.querySelector(".senhaOnOff")   // input de senha

// Função que faz a tela de cadastro "sumir" e mostra a tela de login
function cadSome() {
    // Remove a animação de entrada e aplica a de saída
    cadastro.classList.remove("AnimacaoEntra");
    cadastro.classList.add("AnimacaoSai");
    // Impede interação com a tela de cadastro
    cadastro.style.pointerEvents = "none";

    // Aguarda 1 segundo (tempo da animação) para trocar para o login
    setTimeout(() => {
        login.classList.remove("AnimacaoSai");
        login.classList.add("AnimacaoEntra");
        login.style.pointerEvents = "all"; // habilita interação no login
    }, 1000);
}

// Função que faz a tela de login "sumir" e mostra a tela de cadastro
function loginSome() {
    login.classList.remove("AnimacaoEntra");
    login.classList.add("AnimacaoSai");
    login.style.pointerEvents = "none";

    // Aguarda 1 segundo (tempo da animação) para trocar para o cadastro
    setTimeout(() => {
        cadastro.classList.remove("AnimacaoSai");
        cadastro.classList.add("AnimacaoEntra");
        cadastro.style.pointerEvents = "all"; // habilita interação no cadastro
    }, 1000);
}

// Função que mostra ou oculta a senha
function mostrarSenha(checkbox) {
    // Pega o input de senha relacionado ao checkbox clicado
    const input = checkbox.closest(".inputCad").querySelector(".senhaOnOff");

    // Alterna entre tipo "password" e "text"
    if (input.type === "password") {
        input.type = "text";  // mostra a senha
    } else {
        input.type = "password"; // oculta a senha
    }
}
