function direcao(e){
    var direcao = document.getElementById("contentSlide")

if(e == 1){
    //se apertar o botao pra esquerda, o carousel de move -200
    direcao.scrollLeft = direcao.scrollLeft - 200;
}else if(e == 2){
    //se apertar o botao pra direita, o carousel de move +200
    direcao.scrollLeft = direcao.scrollLeft + 200;

}

}