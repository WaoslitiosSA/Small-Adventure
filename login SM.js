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

    
function recuperarPassword(){

    let correo = prompt("Ingrese el correo con el que se registró:");

    if(correo == null){
        return;
    }

    correo = correo.trim();

    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    let usuario = usuarios.find(u => u.correo === correo );

    if(!usuario){

        mostrarToast("No existe una cuenta registrada con ese correo." , "error");

        return;

    }

    let nuevaPassword = prompt("Ingrese la nueva contraseña:");

    if(nuevaPassword == null){
        return;
    }

    let confirmar = prompt("Confirme la nueva contraseña:");

    if(confirmar == null){
        return;
    }

    if(nuevaPassword !== confirmar){

        mostrarToast("Las contraseñas no coinciden." , "error");

        return;

    }

    usuario.password = nuevaPassword;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    mostrarToast("Contraseña actualizada correctamente.");

}




