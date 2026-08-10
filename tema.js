// =========================================
// SISTEMA GLOBAL DE TEMA
// =========================================

// Obtener el tema guardado
let temaGuardado = localStorage.getItem("tema");

// Si no existe un tema guardado,
// utilizar modo oscuro como tema inicial
if (!temaGuardado) {
    temaGuardado = "oscuro";
    localStorage.setItem("tema", temaGuardado);
}


// =========================================
// APLICAR TEMA
// =========================================

function aplicarTema() {

    document.documentElement.setAttribute(
        "data-tema",
        temaGuardado
    );

 // =========================================
    // ACTUALIZAR BOTÓN DEL TEMA
    // =========================================

    const botonTema =
        document.getElementById("botonTema");

    if (botonTema) {

        if (temaGuardado === "oscuro") {

            botonTema.textContent =
                "☀️ Modo claro";

        } else {

            botonTema.textContent =
                "🌙 Modo oscuro";

        }

    }

}


// Aplicar el tema al cargar la página
aplicarTema();

// =========================================
// CAMBIAR TEMA
// =========================================

function cambiarTema() {

    if (temaGuardado === "oscuro") {
        temaGuardado = "claro";
    } else {
        temaGuardado = "oscuro";
    }

    localStorage.setItem("tema", temaGuardado);

    aplicarTema();
}