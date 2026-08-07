 document
.getElementById("registroForm")
.addEventListener("submit", registrar);

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

        mostrarToast("Las contraseñas no coinciden." , "error");

        return;

    }

    let usuarios =
    JSON.parse(localStorage.getItem("usuarios")) || [];

    let existe = usuarios.find(function(u){

        return u.correo===correo;

    });

    if(existe){

        mostrarToast("Ese correo ya está registrado." , "error");

        return;

    }

    let nuevoUsuario={

        correo:correo,

        nombre:nombre,

        password:password,

        rol: "usuario"

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

    mostrarToast("Registro exitoso.");

    setTimeout(function(){
        window.location.href="index.html";

    },1200);
    
    return;
}