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

// =========================================
// PROCESO DE REGISTRO
// =========================================


async function registrar(e) {

    e.preventDefault();

    let correo =
        document.getElementById("registroCorreo").value.trim();

    let nombre =
        document.getElementById("nombre").value.trim();

    let password =
        document.getElementById("registroPassword").value.trim();

    let confirmar =
        document.getElementById("confirmar").value;

    if (password !== confirmar) {

        mostrarToast("Las contraseñas no coinciden.", "error");

        return;

    }

    try {

        const respuesta = await fetch("http://localhost:3000/api/users", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                user_name: nombre,
                user_mail: correo,
                user_password: password

            })

        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            mostrarToast(
                datos.error || "No se pudo registrar el usuario.",
                "error"
            );

            return;

        }

        localStorage.setItem(
            "usuarioActivo",
            JSON.stringify({

                id: datos.id_user,
                nombre: datos.user_name,
                correo: datos.user_mail,
                rol: datos.id_role === 1 ? "admin" : "usuario"

            })
        );

        mostrarToast("Registro exitoso.");

        setTimeout(function () {

            window.location.href = "index.html";

        }, 1200);

    } catch (error) {

        console.error("Error al registrar usuario:", error);

        mostrarToast(
            "No se pudo conectar con el servidor.",
            "error"
        );

    }

}