function direcao(e){
    var direcao = document.getElementById("contentSlide")

if(e == 1){
    direcao.scrollLeft = direcao.scrollLeft - 200;
}else if(e == 2){
    direcao.scrollLeft = direcao.scrollLeft + 200;

}

}