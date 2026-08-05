document
.getElementById("loginForm")
.addEventListener("submit", iniciarSesion);

function iniciarSesion(e){

    e.preventDefault();

    let correo =
    document.getElementById("loginCorreo").value.trim();

    let password =
    document.getElementById("loginPassword").value.trim();

    let usuarios =
    JSON.parse(localStorage.getItem("usuarios")) || [];

    let usuario = usuarios.find(function(u){

        console.log(u.correo, u.password);

        return u.correo===correo &&
               u.password===password;

    });

    if(usuario){

        localStorage.setItem(
            "usuarioActivo",
            JSON.stringify(usuario)
    );

        alert("Bienvenido " + usuario.nombre);

        window.location.href = "Foro SM.html"

    }

    else{

        alert("Correo o contraseña incorrectos.");

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

        alert("No existe una cuenta registrada con ese correo.");

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

        alert("Las contraseñas no coinciden.");

        return;

    }

    usuario.password = nuevaPassword;

    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Contraseña actualizada correctamente.");

}

}


