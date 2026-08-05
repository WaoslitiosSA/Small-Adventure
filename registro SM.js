 document
.getElementById("registroForm")
.addEventListener("submit", registrar);

function registrar(e){

    e.preventDefault();

    let correo =
    document.getElementById("registroCorreo").value.trim();

    let nombre =
    document.getElementById("nombre").value;

    let password =
    document.getElementById("registroPassword").value.trim();

    let confirmar =
    document.getElementById("confirmar").value;

    if(password!==confirmar){

        alert("Las contraseñas no coinciden.");

        return;

    }

    let usuarios =
    JSON.parse(localStorage.getItem("usuarios")) || [];

    let existe = usuarios.find(function(u){

        return u.correo===correo;

    });

    if(existe){

        alert("Ese correo ya está registrado.");

        return;

    }

    let nuevoUsuario={

        correo:correo,

        nombre:nombre,

        password:password

    };

    usuarios.push(nuevoUsuario);

    localStorage.setItem(

        "usuarios",

        JSON.stringify(usuarios)

    );

    localStorage.setItem(

        "usuarioActivo",

        JSON.stringify(nuevoUsuario)

    );

    alert("Registro exitoso.");

    window.location.href = "login SM.html"

}