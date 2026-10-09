let movimientoX = 0;
let movimientoY = 0;

document.addEventListener("mousemove", function(evento) {

    movimientoX =
        (evento.clientX / window.innerWidth - 0.5) * 30;

    movimientoY =
        (evento.clientY / window.innerHeight - 0.5) * 30;

    document.body.style.setProperty(
        "--parallax-x",
        movimientoX + "px"
    );

    document.body.style.setProperty(
        "--parallax-y",
        movimientoY + "px"
    );

});

document.addEventListener("mouseleave", function() {

    document.body.style.setProperty(
        "--parallax-x",
        "0px"
    );

    document.body.style.setProperty(
        "--parallax-y",
        "0px"
    );

});