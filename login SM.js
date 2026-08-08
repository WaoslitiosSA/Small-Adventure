document
.getElementById("loginForm")
.addEventListener("submit", iniciarSesion);

//=========================================
// CREAR ADMINISTRADOR SI NO EXISTE
//=========================================

function crearAdministrador() {

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let existeAdmin = usuarios.some(function(usuario) {
        return usuario.rol === "admin";
    });

    if (!existeAdmin) {

        usuarios.push({

            correo: "EdwinBrochacho@smalladventure.com",

            nombre: "ErwinAD",

            password: "SmallAdventure2026",

            rol: "admin"

        });

        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        console.log("Administrador creado.");

    }

}

crearAdministrador();

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

function iniciarSesion(e){

    e.preventDefault();

    let correo =
    document.getElementById("loginCorreo").value.trim();

    let password =
    document.getElementById("loginPassword").value.trim();

    let usuarios =
    JSON.parse(localStorage.getItem("usuarios")) || [];

    let usuario = usuarios.find(function(u){


        return u.correo===correo &&
               u.password===password;

    });

    if(usuario){

        localStorage.setItem(
            "usuarioActivo",
            JSON.stringify(usuario)
    );

        mostrarToast("Bienvenido " + usuario.nombre);
        setTimeout(function(){
            window.location.href="Foro SM.html"

        },1200);

        return;

    }else{

        mostrarToast("Correo o contraseña incorrectos. ", "error")

    }
}

// =========================================
// RECUPERACIÓN DE CONTRASEÑA
// =========================================

const enlaceRecuperar = document.getElementById("enlaceRecuperar");
const recuperacionPassword = document.getElementById("recuperacionPassword");
const cancelarRecuperacion = document.getElementById("cancelarRecuperacion");
const guardarNuevaPassword = document.getElementById("guardarNuevaPassword");


// MOSTRAR FORMULARIO DE RECUPERACIÓN

enlaceRecuperar.addEventListener("click", function(e){

    e.preventDefault();

    recuperacionPassword.classList.add("mostrar");

});


// CANCELAR RECUPERACIÓN

cancelarRecuperacion.addEventListener("click", function(){

    recuperacionPassword.classList.remove("mostrar");

    document.getElementById("recuperarCorreo").value = "";
    document.getElementById("nuevaPassword").value = "";
    document.getElementById("confirmarPassword").value = "";

});


// CAMBIAR CONTRASEÑA

guardarNuevaPassword.addEventListener("click", function(){

    let correo =
        document.getElementById("recuperarCorreo").value.trim();

    let nuevaPassword =
        document.getElementById("nuevaPassword").value.trim();

    let confirmarPassword =
        document.getElementById("confirmarPassword").value.trim();


    // COMPROBAR CAMPOS VACÍOS

    if(
        correo === "" ||
        nuevaPassword === "" ||
        confirmarPassword === ""
    ){

        mostrarToast(
            "Completa todos los campos.",
            "error"
        );

        return;

    }


    // OBTENER USUARIOS

    let usuarios =
        JSON.parse(localStorage.getItem("usuarios")) || [];


    // BUSCAR USUARIO

    let usuario = usuarios.find(function(u){

        return u.correo === correo;

    });


    // COMPROBAR SI EXISTE

    if(!usuario){

        mostrarToast(
            "No existe una cuenta registrada con ese correo.",
            "error"
        );

        return;

    }


    // COMPROBAR CONTRASEÑAS

    if(nuevaPassword !== confirmarPassword){

        mostrarToast(
            "Las contraseñas no coinciden.",
            "error"
        );

        return;

    }


    // COMPROBAR LONGITUD

    if(nuevaPassword.length < 6){

        mostrarToast(
            "La contraseña debe tener mínimo 6 caracteres.",
            "error"
        );

        return;

    }


    // ACTUALIZAR CONTRASEÑA

    usuario.password = nuevaPassword;


    // GUARDAR USUARIOS

    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
    );


    // CERRAR FORMULARIO

    recuperacionPassword.classList.remove("mostrar");


    // LIMPIAR CAMPOS

    document.getElementById("recuperarCorreo").value = "";
    document.getElementById("nuevaPassword").value = "";
    document.getElementById("confirmarPassword").value = "";


    // MOSTRAR MENSAJE

    mostrarToast(
        "Contraseña actualizada correctamente."
    );

});