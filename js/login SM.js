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

            id: "usuario_4392712150125",

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

async function iniciarSesion(e) {

    e.preventDefault();

    let correo =
        document.getElementById("loginCorreo").value.trim();

    let password =
        document.getElementById("loginPassword").value.trim();


    // =========================================
    // COMPROBAR CAMPOS VACÍOS
    // =========================================

    if (correo === "" || password === "") {

        mostrarToast(
            "Completa todos los campos.",
            "error"
        );

        return;

    }


    // =========================================
    // INICIAR SESIÓN CON MYSQL
    // =========================================

    try {

        const respuesta = await fetch(
            "https://small-adventure.onrender.com/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    user_mail: correo,

                    user_password: password

                })
            }
        );


        const datos = await respuesta.json();


        // =========================================
        // COMPROBAR RESPUESTA
        // =========================================

        if (!respuesta.ok) {

            mostrarToast(
                datos.error || "Correo o contraseña incorrectos.",
                "error"
            );

            return;

        }


        // =========================================
        // CREAR USUARIO ACTIVO
        // =========================================

        let usuarioActivo = {

            id: datos.id_user,

            nombre: datos.user_name,

            correo: datos.user_mail,

            rol: datos.id_role === 1
                ? "admin"
                : "usuario"

        };


        localStorage.setItem(
            "usuarioActivo",
            JSON.stringify(usuarioActivo)
        );


        // =========================================
        // ENTRAR AL FORO
        // =========================================

        mostrarToast(
            "Bienvenido " + datos.user_name
        );


        setTimeout(function() {

            window.location.href = "Foro SM.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Error al iniciar sesión:",
            error
        );

        mostrarToast(
            "No se pudo conectar con el servidor.",
            "error"
        );

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

guardarNuevaPassword.addEventListener("click", async function(){

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


// ACTUALIZAR CONTRASEÑA EN MYSQL

try {

    const respuesta = await fetch(
        "https://small-adventure.onrender.com/api/password",
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                user_mail: correo,

                user_password: nuevaPassword

            })
        }
    );


    const datos = await respuesta.json();


    // COMPROBAR RESPUESTA

    if(!respuesta.ok){

        mostrarToast(
            datos.error || "No se pudo actualizar la contraseña.",
            "error"
        );

        return;

    }


    console.log(
        "Contraseña actualizada en MySQL:",
        datos
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


} catch(error) {

    console.error(
        "Error al actualizar contraseña:",
        error
    );

    mostrarToast(
        "No se pudo conectar con el servidor.",
        "error"
    );

}


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