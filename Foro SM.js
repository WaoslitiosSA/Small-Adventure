// =========================================
// MENSAJE DE BIENVENIDA
// =========================================

function mostrarToast(mensaje,tipo="ok"){
    
    const toast=document.getElementById("toast");
    toast.textContent=mensaje;
    toast.className="";
    toast.classList.add("mostrar");
    if(tipo==="error"){
        toast.classList.add("error");
    }


if(tipo==="info"){
    toast.classList.add("info");
}

setTimeout(function(){
    toast.classList.remove("mostrar");
},3000);
}



// =========================================
// USUARIO ACTIVO
// =========================================

let usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

let esAdmin = usuarioActivo && usuarioActivo.rol === "admin";

if (usuarioActivo) {

    const usuarioTitulo = document.getElementById("entradaUsuario");

    if (esAdmin) {
        usuarioTitulo.innerHTML =
        "👑" + usuarioActivo.nombre + " <span style='color:gold;'>(Administrador)</span>";
    
    } else {

        usuarioTitulo.textContent =
        "Bienvenido " + usuarioActivo.nombre;
    }

    document.getElementById("bienvenidaUsuario").textContent =
        "Hola " + usuarioActivo.nombre + ", disfruta del foro.";

}

// =========================================
// VARIABLES DEL FORO
// =========================================

let categoriaActual = "general";

// =========================================
// MOSTRAR CATEGORÍAS
// =========================================

function ocultarTodo() {

    document.getElementById("general").style.display = "none";
    document.getElementById("espanol").style.display = "none";
    document.getElementById("ingles").style.display = "none";
    document.getElementById("portugues").style.display = "none";

}

function mostrarGeneral() {

    categoriaActual = "general";

    ocultarTodo();

    document.getElementById("general").style.display = "block";

}

function mostrarEspanol() {

    categoriaActual = "espanol";

    ocultarTodo();

    document.getElementById("espanol").style.display = "block";

}

function mostrarIngles() {

    categoriaActual = "ingles";

    ocultarTodo();

    document.getElementById("ingles").style.display = "block";

}

function mostrarPortugues() {

    categoriaActual = "portugues";

    ocultarTodo();

    document.getElementById("portugues").style.display = "block";

}
// =========================================
// ENTRAR AL FORO
// =========================================

function entrarForo() {

    document.getElementById("bienvenida").style.display = "none";

    document.getElementById("menuForo").style.display = "block";

    document.getElementById("contenidoForo").style.display = "block";

    mostrarGeneral();

}

// =========================================
// AGREGAR COMENTARIOS
// =========================================

function agregarComentario() {

    usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    let nombre = usuarioActivo.nombre;

    let mensaje = document.getElementById("mensaje").value.trim();

    if (mensaje === "") {

        mostrarToast("Escribe un comentario.","error");

        return;

    }

    let comentarios = JSON.parse(localStorage.getItem("comentarios")) || [];

    comentarios.push({

        usuario: nombre,
        mensaje: mensaje,
        categoria: categoriaActual

    });

    localStorage.setItem(

        "comentarios",

        JSON.stringify(comentarios)

    );

    let nuevo = document.createElement("div");

    nuevo.className = "comentario";

    nuevo.innerHTML =
        "<strong>" + nombre + ":</strong> " + mensaje;

    if (esAdmin) {

        let boton = document.createElement("button");

        boton.textContent = "Eliminar";

        boton.className = "btnEliminar";

        boton.onclick = function () {

            nuevo.remove();

        };

        nuevo.appendChild(document.createTextNode(" "));

        nuevo.appendChild(boton);

    }

    let contenedor;

    if (categoriaActual === "general") {

        contenedor = document.getElementById("comentariosGeneral");

    }

    else if (categoriaActual === "espanol") {

        contenedor = document.getElementById("comentariosEspanol");

    }

    else if (categoriaActual === "ingles") {

        contenedor = document.getElementById("comentariosIngles");

    }

    else {

        contenedor = document.getElementById("comentariosPortugues");

    }

    contenedor.appendChild(nuevo);

    document.getElementById("mensaje").value = "";

}
// =========================================
// ACTUALIZAR BOTONES ELIMINAR
// =========================================

function actualizarBotonesEliminar() {

    let comentarios = document.querySelectorAll(".comentario");

    comentarios.forEach(function(comentario) {

        if (!comentario.querySelector(".btnEliminar")) {

            let boton = document.createElement("button");

            boton.textContent = "Eliminar";

            boton.className = "btnEliminar";

            boton.onclick = function() {

                comentario.remove();

            };

            comentario.appendChild(document.createTextNode(" "));

            comentario.appendChild(boton);

        }

    });

}

// =========================================
// CERRAR SESIÓN
// =========================================

function cerrarSesion() {

    localStorage.removeItem("usuarioActivo");

    window.location.href = "index.html";

}