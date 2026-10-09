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

let usuarioActivo =
    JSON.parse(localStorage.getItem("usuarioActivo"));


// =========================================
// COMPROBAR SESIÓN
// =========================================

if (!usuarioActivo) {

    window.location.href = "index.html";

}

// =========================================
// CERRAR SESIÓN
// =========================================

function cerrarSesion() {

    // Eliminar solamente la sesión del usuario
    localStorage.removeItem("usuarioActivo");

    // Ir a la pantalla de inicio de sesión
    window.location.href = "index.html";
}

// =========================================
// COMPROBAR ROL
// =========================================

let esAdmin =
    usuarioActivo && usuarioActivo.rol === "admin";

console.log(
    "USUARIO ACTIVO:",
    usuarioActivo
);

console.log(
    "ES ADMIN:",
    esAdmin
);

// =========================================
// MOSTRAR REPORTES
// =========================================

const btnMostrarReportes =
    document.getElementById(
        "btnMostrarReportes"
    );

const listaReportes =
    document.getElementById(
        "listaReportes"
    );

// =========================================
// HISTORIAL DE MODERACIONES
// =========================================

const btnMostrarHistorialModeraciones =
    document.getElementById(
        "btnMostrarHistorialModeraciones"
    );

const historialModeraciones =
    document.getElementById(
        "historialModeraciones"
    );

const listaHistorialModeraciones =
    document.getElementById(
        "listaHistorialModeraciones"
    );

// =========================================
// CERRAR REPORTES E HISTORIAL
// =========================================

if (btnCerrarReportes) {

    btnCerrarReportes.addEventListener(
        "click",
        function() {

            // =========================================
            // CERRAR REPORTES
            // =========================================

            if (listaReportes) {

                listaReportes.innerHTML = "";

            }


            // =========================================
            // CERRAR HISTORIAL DE MODERACIONES
            // =========================================

            if (historialModeraciones) {

                historialModeraciones.style.display =
                    "none";

            }


            // =========================================
            // LIMPIAR HISTORIAL
            // =========================================

            if (listaHistorialModeraciones) {

                listaHistorialModeraciones.innerHTML =
                    "";

            }

        }
    );

}

if (btnMostrarReportes) {

    btnMostrarReportes.addEventListener(
        "click",
        function() {

            cargarReportes();

        }
    );

}

// =========================================
// MOSTRAR HISTORIAL DE MODERACIONES
// =========================================

if (btnMostrarHistorialModeraciones) {

    btnMostrarHistorialModeraciones.addEventListener(
        "click",
        async function() {

            // =========================================
            // MOSTRAR CONTENEDOR
            // =========================================

            if (historialModeraciones) {

                historialModeraciones.style.display =
                    "block";

            }


            // =========================================
            // CARGAR HISTORIAL
            // =========================================

            await cargarHistorialModeraciones();

        }
    );

}

// =========================================
// CARGAR HISTORIAL DE MODERACIONES
// =========================================

async function cargarHistorialModeraciones() {

    try {

        // =========================================
        // COMPROBAR USUARIO ACTIVO
        // =========================================

        if (
            !usuarioActivo ||
            !usuarioActivo.id
        ) {

            console.error(
                "No hay un administrador activo."
            );

            return;

        }


        // =========================================
        // CONSULTAR HISTORIAL
        // =========================================

        const respuesta =
            await fetch(
                "https://small-adventure.onrender.com/api/moderations?id_user=" +
                usuarioActivo.id
            );


        const datos =
            await respuesta.json();


        console.log(
            "Historial de moderaciones recibido:",
            datos
        );


        // =========================================
        // COMPROBAR RESPUESTA
        // =========================================

        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudo cargar el historial de moderaciones."
            );

        }


// =========================================
// GUARDAR HISTORIAL
// =========================================

window.historialModeraciones =
    datos;


// =========================================
// BUSCAR CONTENEDOR
// =========================================

const lista =
    document.getElementById(
        "listaHistorialModeraciones"
    );


if (!lista) {

    console.error(
        "No se encontró listaHistorialModeraciones."
    );

    return;

}


// =========================================
// LIMPIAR HISTORIAL ANTERIOR
// =========================================

lista.innerHTML = "";


// =========================================
// COMPROBAR SI HAY MODERACIONES
// =========================================

if (
    !Array.isArray(datos) ||
    datos.length === 0
) {

    lista.innerHTML =
        "<p>No hay moderaciones registradas.</p>";

    return;

}


// =========================================
// CREAR TARJETAS
// =========================================

datos.forEach(
    function(moderacion) {

        const tarjeta =
            document.createElement(
                "div"
            );

        tarjeta.classList.add(
            "tarjeta-moderacion"
        );


        // =========================================
        // INFORMACIÓN
        // =========================================

        tarjeta.innerHTML =

            "<h4>" +
                "Moderación #" +
                moderacion.id_mode +
            "</h4>" +

            "<p>" +
                "<strong>Usuario afectado:</strong> " +
                (moderacion.usuario_afectado || "Desconocido") +
            "</p>" +

            "<p>" +
                "<strong>ID usuario afectado:</strong> " +
                moderacion.id_usuario_afectado +
            "</p>" +

            "<p>" +
                "<strong>Mensaje:</strong> " +
                moderacion.id_mens +
            "</p>" +

            "<p>" +
                "<strong>Acción:</strong> " +
                moderacion.mode_action +
            "</p>" +

            "<p>" +
                "<strong>Motivo:</strong> " +
                (moderacion.mode_reason || "Sin motivo") +
            "</p>" +

            "<p>" +
                "<strong>Administrador:</strong> " +
                (moderacion.administrador || "Desconocido") +
            "</p>" +

            "<p>" +
                "<strong>Fecha:</strong> " +
                new Date(
                    moderacion.mode_date
                ).toLocaleString(
                    "es-CO"
                ) +
            "</p>";


        // =========================================
        // AGREGAR TARJETA
        // =========================================

        lista.appendChild(
            tarjeta
        );

    }
);


console.log(
    "Historial de moderaciones mostrado:",
    datos.length
);


    }
    catch (error) {

        console.error(
            "Error al cargar historial de moderaciones:",
            error
        );

        mostrarToast(
            "No se pudo cargar el historial de moderaciones.",
            "error"
        );

    }

}

// =========================================
// CARGAR REPORTES DESDE MYSQL
// =========================================

async function cargarReportes() {

    if (!listaReportes) {
        return;
    }


    listaReportes.innerHTML =
        "<p>Cargando reportes...</p>";


    try {

        const respuesta =
            await fetch(
                "https://small-adventure.onrender.com/api/reports?id_user=" +
                usuarioActivo.id
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los reportes"
            );

        }


        const reportes =
            await respuesta.json();


        console.log(
            "Reportes recibidos desde MySQL:",
            reportes
        );


        listaReportes.innerHTML = "";


        // =========================================
        // NO HAY REPORTES
        // =========================================

        if (
            reportes.length === 0
        ) {

            listaReportes.innerHTML =
                "<p>No hay reportes registrados.</p>";

            return;

        }


        // =========================================
        // MOSTRAR REPORTES
        // =========================================
        reportes.forEach(
            function(reporte) {

        const tarjeta =
            document.createElement(
                "div"
            );

        tarjeta.classList.add(
            "tarjeta-reporte"
        );

        tarjeta.setAttribute(
            "data-reporte-id",
            reporte.id_repo
        );

        tarjeta.dataset.usuarioReportado =
            reporte.id_repo_user;

        tarjeta.dataset.mensajeReportado =
            reporte.id_mens;

        tarjeta.dataset.motivoReporte =
            reporte.repo_motive;

        tarjeta.dataset.descripcionReporte =
            reporte.repo_description;

        tarjeta.innerHTML = `

            <h3>
                Reporte #${reporte.id_repo}
            </h3>

            <p>
                <strong>Reportado por:</strong>
                ${reporte.usuario_reporta}
            </p>

            <p>
                <strong>Usuario reportado:</strong>
                ${reporte.usuario_reportado}
            </p>

            <p>
                <strong>Mensaje #${reporte.id_mens}:</strong>
                ${reporte.mens_content}
            </p>

            <p>
                <strong>Motivo:</strong>
                ${reporte.repo_motive}
            </p>

            <p>
                <strong>Descripción:</strong>
                ${reporte.repo_description}
            </p>

            <p>
                <strong>Estado:</strong>
                <span class="estado-reporte">
                    ${reporte.repo_status}
                </span>
            </p>

            <p>
                <strong>Fecha:</strong>
                ${reporte.repo_date}
            </p>

            <div class="acciones-reporte">

            <button
                class="btn-ver-mensaje"
                data-id-mensaje="${reporte.id_mens}"
            >
                Ver mensaje
            </button>

            ${
                reporte.repo_status === "pendiente"
                    ? `
                        <button
                            class="btn-resolver-reporte"
                            data-id-reporte="${reporte.id_repo}"
                        >
                            Resolver
                        </button>

                        <button
                            class="btn-descartar-reporte"
                            data-id-reporte="${reporte.id_repo}"
                        >
                            Descartar
                        </button>
                    `
                    : ""
            }

        </div>

        `;


        listaReportes.appendChild(
            tarjeta
        );

    }
);

    } catch (error) {

        console.error(
            "Error al cargar reportes:",
            error
        );


        listaReportes.innerHTML =
            "<p>No se pudieron cargar los reportes.</p>";

    }

}

// =========================================
// CAMBIAR ESTADO DE UN REPORTE
// =========================================

async function cambiarEstadoReporte(
    idReporte,
    nuevoEstado
) {

    try {

        const respuesta =
            await fetch(
                "https://small-adventure.onrender.com/api/reports/" +
                idReporte,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        repo_status: nuevoEstado,
                        id_user: usuarioActivo.id
                    })
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudo actualizar el reporte"
            );

        }


        console.log(
            "Estado del reporte actualizado:",
            datos
        );


        mostrarToast(
            "Reporte actualizado correctamente.",
            "info"
        );


        // Volver a cargar los reportes
        cargarReportes();


    } catch (error) {

        console.error(
            "Error al cambiar estado del reporte:",
            error
        );


        mostrarToast(
            "No se pudo actualizar el reporte.",
            "error"
        );

    }

}

// =========================================
// BUSCAR Y MOSTRAR MENSAJE REPORTADO
// =========================================

async function verMensajeReportado(idMensaje) {

    console.log(
        "Buscando mensaje reportado:",
        idMensaje
    );


    // =========================================
    // CANALES DEL FORO
    // =========================================

    const canales = [
        {
            nombre: "general",
            id: 1,
            funcion: mostrarGeneral
        },
        {
            nombre: "espanol",
            id: 2,
            funcion: mostrarEspanol
        },
        {
            nombre: "ingles",
            id: 3,
            funcion: mostrarIngles
        },
        {
            nombre: "portugues",
            id: 4,
            funcion: mostrarPortugues
        }
    ];


    // =========================================
    // BUSCAR EL MENSAJE EN CADA CANAL
    // =========================================

    for (
        const canal of canales
    ) {

        try {

            const respuesta =
                await fetch(
                    "https://small-adventure.onrender.com/api/messages?id_chan=" +
                    canal.id
                );


            if (!respuesta.ok) {

                continue;

            }


            const mensajes =
                await respuesta.json();


            const mensajeEncontrado =
                mensajes.find(
                    function(mensaje) {

                        return Number(
                            mensaje.id_mensaje
                        ) === Number(
                            idMensaje
                        );

                    }
                );


            // =========================================
            // SI ENCONTRAMOS EL MENSAJE
            // =========================================

            if (mensajeEncontrado) {

                console.log(
                    "Mensaje encontrado en canal:",
                    canal.nombre
                );


                // =========================================
                // CAMBIAR AL CANAL
                // =========================================

                canal.funcion();


                // =========================================
                // ESPERAR A QUE EL DOM SE ACTUALICE
                // =========================================

                setTimeout(
                    function() {

                        const mensaje =
                            document.querySelector(
                                `.comentario[data-mensaje-id="${idMensaje}"]`
                            );


                        if (!mensaje) {

                            mostrarToast(
                                "El mensaje fue encontrado, pero no se pudo mostrar.",
                                "error"
                            );

                            return;

                        }


                        // =========================================
                        // IR HASTA EL MENSAJE
                        // =========================================

                        mensaje.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });


                        // =========================================
                        // RESALTAR MENSAJE
                        // =========================================

                        mensaje.classList.add(
                            "mensaje-reportado"
                        );


                        setTimeout(
                            function() {

                                mensaje.classList.remove(
                                    "mensaje-reportado"
                                );

                            },
                            3000
                        );


                    },
                    500
                );


                return;

            }

        } catch (error) {

            console.error(
                "Error buscando mensaje en canal " +
                canal.nombre +
                ":",
                error
            );

        }

    }


    // =========================================
    // NO SE ENCONTRÓ
    // =========================================

    mostrarToast(
        "No se encontró el mensaje reportado.",
        "error"
    );


    console.log(
        "No se encontró el mensaje:",
        idMensaje
    );

}

// =========================================
// REPORTE ACTUAL EN MODERACIÓN
// =========================================

let reporteModeracionActual =
    null;

let accionModeracionSeleccionada = null;

// =========================================
// CLICS DE LAS ACCIONES DE REPORTES
// =========================================

document.addEventListener(
    "click",
    async function(event) {

// =========================================
// VER MENSAJE
// =========================================

const botonVerMensaje =
    event.target.closest(
        ".btn-ver-mensaje"
    );


if (botonVerMensaje) {

    const idMensaje =
        Number(
            botonVerMensaje.getAttribute(
                "data-id-mensaje"
            )
        );


    console.log(
        "Ver mensaje reportado:",
        idMensaje
    );


    verMensajeReportado(
        idMensaje
    );


    return;

}

// =========================================
// RESOLVER REPORTE
// =========================================

const botonResolver =
    event.target.closest(
        ".btn-resolver-reporte"
    );


if (botonResolver) {

    const idReporte =
        Number(
            botonResolver.getAttribute(
                "data-id-reporte"
            )
        );


    console.log(
        "Resolver reporte:",
        idReporte
    );


    // =========================================
    // BUSCAR MODAL DE MODERACIÓN
    // =========================================

    const modalModeracion =
        document.getElementById(
            "modalModeracion"
        );


    const infoReporteModeracion =
        document.getElementById(
            "infoReporteModeracion"
        );


    if (!modalModeracion) {

        console.error(
            "No se encontró el modal de moderación."
        );

        return;

    }


    // =========================================
    // GUARDAR ID DEL REPORTE
    // =========================================

    modalModeracion.dataset.idReporte =
        idReporte;

    const tarjetaReporte =
        botonResolver.closest(
            ".tarjeta-reporte"
        );

    reporteModeracionActual =
    {
        id_repo:
            idReporte,

        id_user_affe:
            Number(
                tarjetaReporte?.dataset
                    .usuarioReportado
            ),

        id_mens:
            Number(
                tarjetaReporte?.dataset
                    .mensajeReportado
            ),

        mode_reason:
            tarjetaReporte?.dataset
                .motivoReporte,

        descripcion:
            tarjetaReporte?.dataset
                .descripcionReporte
    };

console.log(
    "Reporte completo para moderación:",
    reporteModeracionActual
);


    console.log(
        "Reporte guardado para moderación:",
        reporteModeracionActual
    );

// =========================================
// MOSTRAR INFORMACIÓN
// =========================================

if (infoReporteModeracion) {

    infoReporteModeracion.textContent =
        "Reporte #" +
        idReporte +
        " seleccionado. Consultando advertencias...";

}


// =========================================
// CONSULTAR ADVERTENCIAS DEL USUARIO
// =========================================

try {

    const respuestaAdvertencias =
        await fetch(
            `https://small-adventure.onrender.com/api/moderations/advertencias/${reporteModeracionActual.id_user_affe}`
        );


    const datosAdvertencias =
        await respuestaAdvertencias.json();


    console.log(
        "Advertencias del usuario reportado:",
        datosAdvertencias
    );


    if (!respuestaAdvertencias.ok) {

        throw new Error(
            datosAdvertencias.error ||
            "No se pudieron consultar las advertencias."
        );

    }


    if (infoReporteModeracion) {

        if (
            datosAdvertencias.recomendarEliminacion
        ) {

            infoReporteModeracion.innerHTML =
                "Reporte #" +
                idReporte +
                " seleccionado.<br><br>" +

                "⚠️ <strong>Advertencias acumuladas:</strong> " +
                datosAdvertencias.advertencias +
                "<br><br>" +

                "🗑️ <strong>Se recomienda revisar la eliminación de esta cuenta.</strong>";

        }

        else {

            infoReporteModeracion.innerHTML =
                "Reporte #" +
                idReporte +
                " seleccionado.<br><br>" +

                "⚠️ <strong>Advertencias acumuladas:</strong> " +
                datosAdvertencias.advertencias +
                "<br><br>" +

                "Elige una consecuencia de moderación.";

        }

    }


}
catch (error) {

    console.error(
        "Error al consultar advertencias:",
        error
    );


    if (infoReporteModeracion) {

        infoReporteModeracion.textContent =
            "Reporte #" +
            idReporte +
            " seleccionado. No se pudo consultar el número de advertencias. Elige una consecuencia.";

    }

}


    // =========================================
    // ABRIR MODAL
    // =========================================

    modalModeracion.style.display =
        "flex";


    console.log(
        "Modal de moderación abierto para el reporte:",
        idReporte
    );


    return;

}

        // =========================================
        // DESCARTAR REPORTE
        // =========================================

        const botonDescartar =
            event.target.closest(
                ".btn-descartar-reporte"
            );


        if (botonDescartar) {

            const idReporte =
                Number(
                    botonDescartar.getAttribute(
                        "data-id-reporte"
                    )
                );


            cambiarEstadoReporte(
                idReporte,
                "descartado"
            );


            return;

        }

    }
);

// =========================================
// SELECCIONAR CONSECUENCIA DE MODERACIÓN
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

// =========================================
// CERRAR MODAL DE MODERACIÓN
// =========================================

const botonCerrarModeracion =
    document.getElementById(
        "cerrarModalModeracion"
    );

const botonCancelarModeracion =
    document.getElementById(
        "cancelarModeracion"
    );


function cerrarModalModeracion() {

    const modal =
        document.getElementById(
            "modalModeracion"
        );


    // =========================================
    // CERRAR MODAL
    // =========================================

    if (modal) {

        modal.style.display =
            "none";

    }


    // =========================================
    // LIMPIAR CONSECUENCIA SELECCIONADA
    // =========================================

    accionModeracionSeleccionada =
        null;


    document
        .querySelectorAll(
            ".opcion-moderacion"
        )
        .forEach(
            function(opcion) {

                opcion.classList.remove(
                    "seleccionada"
                );

            }
        );


    // =========================================
    // DESHABILITAR BOTÓN APLICAR
    // =========================================

    const botonAplicar =
        document.getElementById(
            "aplicarModeracion"
        );


    if (botonAplicar) {

        botonAplicar.disabled =
            true;

    }


    // =========================================
    // LIMPIAR REPORTE ACTUAL
    // =========================================

    reporteModeracionActual =
        null;


    console.log(
        "Modal de moderación cerrado."
    );

}


// =========================================
// BOTÓN X
// =========================================

if (botonCerrarModeracion) {

    botonCerrarModeracion.addEventListener(
        "click",
        cerrarModalModeracion
    );

}


// =========================================
// BOTÓN CANCELAR
// =========================================

if (botonCancelarModeracion) {

    botonCancelarModeracion.addEventListener(
        "click",
        cerrarModalModeracion
    );

}

const opcionesModeracion =
    document.querySelectorAll(
        ".opcion-moderacion"
    );





opcionesModeracion.forEach(
    function(opcion) {

        opcion.addEventListener(
            "click",
            function() {

                // =========================================
                // QUITAR SELECCIÓN ANTERIOR
                // =========================================

                opcionesModeracion.forEach(
                    function(otraOpcion) {

                        otraOpcion.classList.remove(
                            "seleccionada"
                        );

                    }
                );


                // =========================================
                // SELECCIONAR OPCIÓN
                // =========================================

                opcion.classList.add(
                    "seleccionada"
                );


                accionModeracionSeleccionada =
                    opcion.getAttribute(
                        "data-accion"
                    );


                console.log(
                    "Consecuencia seleccionada:",
                    accionModeracionSeleccionada
                );


                // =========================================
                // HABILITAR BOTÓN APLICAR
                // =========================================

                const botonAplicar =
                    document.getElementById(
                        "aplicarModeracion"
                    );


                if (botonAplicar) {

                    botonAplicar.disabled =
                        false;

                }

            }
        );

    }
);

// =========================================
// APLICAR MODERACIÓN
// =========================================

console.log(
    "BUSCANDO BOTÓN APLICAR:",
    document.getElementById("aplicarModeracion")
);

const botonAplicarModeracion =
    document.getElementById("aplicarModeracion");

if (!botonAplicarModeracion) {
    console.error("No se encontró el botón aplicarModeracion.");
    return;
}

console.log("Botón Aplicar moderación encontrado.");

botonAplicarModeracion.addEventListener(
    "click",
    async function() {

        console.log("CLICK EN APLICAR MODERACIÓN");

        if (
            !reporteModeracionActual ||
            !accionModeracionSeleccionada
        ) {
            mostrarToast(
                "Selecciona una consecuencia de moderación.",
                "error"
            );
            return;
        }

        console.log("=================================");
        console.log(
            "APLICANDO MODERACIÓN"
        );
        console.log(
            "Reporte:",
            reporteModeracionActual.id_repo
        );
        console.log(
            "Usuario afectado:",
            reporteModeracionActual.id_user_affe
        );
        console.log(
            "Mensaje:",
            reporteModeracionActual.id_mens
        );
        console.log(
            "Acción:",
            accionModeracionSeleccionada
        );
        console.log(
            "Motivo:",
            reporteModeracionActual.mode_reason
        );
        console.log("=================================");

        try {

                        // =========================================
            // ELIMINAR USUARIO
            // =========================================

            if (
                accionModeracionSeleccionada ===
                "usuario_eliminado"
            ) {

                console.log(
                    "ELIMINACIÓN DE USUARIO"
                );

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/moderations",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                id_user_affe:
                                    reporteModeracionActual.id_user_affe,

                                id_mens:
                                    reporteModeracionActual.id_mens,

                                id_user:
                                    usuarioActivo.id,

                                mode_action:
                                    "usuario_eliminado",

                                mode_reason:
                                    reporteModeracionActual.mode_reason

                            })
                        }
                    );

                const datos =
                    await respuesta.json();

                console.log(
                    "Respuesta de eliminación:",
                    datos
                );

                if (!respuesta.ok) {

                    throw new Error(
                        datos.error ||
                        "No se pudo eliminar el usuario."
                    );

                }

                mostrarToast(
                    "Usuario eliminado correctamente.",
                    "info"
                );

            }

            // =========================================
            // RESTO DE MODERACIONES
            // =========================================

            else {

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/moderations",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                id_user_affe:
                                    reporteModeracionActual.id_user_affe,

                                id_mens:
                                    reporteModeracionActual.id_mens,

                                id_user:
                                    usuarioActivo.id,

                                mode_action:
                                    accionModeracionSeleccionada,

                                mode_reason:
                                    reporteModeracionActual.mode_reason
                            })
                        }
                    );

                const datos =
                    await respuesta.json();

                console.log(
                    "Respuesta de moderación:",
                    datos
                );

                if (!respuesta.ok) {
                    throw new Error(
                        datos.error ||
                        "No se pudo aplicar la moderación."
                    );
                }

                // =========================================
                // COMPROBAR RECOMENDACIÓN DE ELIMINACIÓN
                // =========================================

                if (
                    accionModeracionSeleccionada ===
                    "advertencia"
                ) {

                    console.log(
                        "Cantidad de advertencias:",
                        datos.advertencias
                    );

                    if (
                        datos.recomendarEliminacion
                    ) {

                        mostrarToast(
                            "El usuario ha alcanzado 10 advertencias. Se recomienda su eliminación.",
                            "info"
                        );

                        console.log(
                            "RECOMENDACIÓN: ELIMINAR USUARIO"
                        );
                    }
                    else {

                        mostrarToast(
                            "Advertencia registrada correctamente.",
                            "info"
                        );
                    }

                }
                else {

                    mostrarToast(
                        "Moderación aplicada correctamente.",
                        "info"
                    );
                }

            }


            // =========================================
            // CERRAR MODAL
            // =========================================

            document.getElementById(
                "modalModeracion"
            ).style.display = "none";


            accionModeracionSeleccionada = null;


            document
                .querySelectorAll(
                    ".opcion-moderacion"
                )
                .forEach(
                    function(opcion) {

                        opcion.classList.remove(
                            "seleccionada"
                        );

                    }
                );


            botonAplicarModeracion.disabled = true;


            // =========================================
            // MARCAR REPORTE COMO RESUELTO
            // =========================================

            await cambiarEstadoReporte(
                reporteModeracionActual.id_repo,
                "resuelto"
            );


            reporteModeracionActual = null;


        } catch (error) {

            console.error(
                "Error al aplicar moderación:",
                error
            );

            mostrarToast(
                error.message ||
                "No se pudo aplicar la moderación.",
                "error"
            );

        }

    }
);    

}
);

// =========================================
// MOSTRAR INFORMACIÓN DEL USUARIO
// =========================================

if (usuarioActivo) {

    const usuarioTitulo =
        document.getElementById("entradaUsuario");


    if (esAdmin) {

        usuarioTitulo.innerHTML =
            "👑" +
            usuarioActivo.nombre +
            " <span style='color:gold;'>(Administrador)</span>";

    } else {

        usuarioTitulo.textContent =
            "Bienvenido " +
            usuarioActivo.nombre;

    }


    document.getElementById("bienvenidaUsuario").textContent =
        "Hola " +
        usuarioActivo.nombre +
        ", disfruta del foro.";

}

// =========================================
// VARIABLES DEL FORO
// =========================================

let categoriaActual = "general";

let usuariosBD = [];

// =========================================
// CREAR BUSCADOR DE USUARIOS
// =========================================

function crearBuscadorUsuarios() {

    const contenedor =
        document.getElementById(
            "usuariosDisponibles"
        );

    if (!contenedor) {

        console.error(
            "No existe usuariosDisponibles para crear el buscador."
        );

        return;

    }

    // =========================================
    // EVITAR DUPLICAR BUSCADOR
    // =========================================

    if (
        document.getElementById(
            "buscadorUsuarios"
        )
    ) {

        return;

    }

    // =========================================
    // CONTENEDOR DEL BUSCADOR
    // =========================================

    const contenedorBusqueda =
        document.createElement("div");

    contenedorBusqueda.id =
        "contenedorBusquedaUsuarios";

    // =========================================
    // INPUT
    // =========================================

    const input =
        document.createElement("input");

    input.type =
        "search";

    input.id =
        "buscadorUsuarios";

    input.placeholder =
        "Buscar usuario...";

    input.autocomplete =
        "off";

    // =========================================
    // INSERTAR
    // =========================================

    contenedorBusqueda.appendChild(
        input
    );

    contenedor.parentNode.insertBefore(
        contenedorBusqueda,
        contenedor
    );

    // =========================================
    // CONTROLAR BÚSQUEDA
    // =========================================

    let temporizadorBusqueda =
        null;

    input.addEventListener(
        "input",
        function() {

            const texto =
                input.value.trim();

            clearTimeout(
                temporizadorBusqueda
            );

            temporizadorBusqueda =
                setTimeout(
                    function() {

                        buscarUsuariosDesdeBD(
                            texto
                        );

                    },
                    300
                );

        }
    );

}

// =========================================
// USUARIOS SILENCIADOS
// =========================================

let usuariosSilenciados = [];


// =========================================
// USUARIOS BLOQUEADOS
// =========================================

let usuariosBloqueados = [];

// =========================================
// CARGAR USUARIOS SILENCIADOS DESDE BD
// =========================================

async function cargarUsuariosSilenciados() {

    if (!usuarioActivo) {
        return;
    }

    try {

        const respuesta = await fetch(
            "https://small-adventure.onrender.com/api/interactions/silenciados/" +
            usuarioActivo.id
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudieron obtener los usuarios silenciados"
            );

        }

        usuariosSilenciados =
            datos.map(function(interaccion) {

                return Number(
                    interaccion.id_user_dest
                );

            });

        console.log(
            "Usuarios silenciados:",
            usuariosSilenciados
        );

    } catch (error) {

        console.error(
            "Error al cargar usuarios silenciados:",
            error
        );

    }

}

// =========================================
// COMPROBAR SI EL USUARIO ACTUAL ESTÁ
// SANCIONADO POR SILENCIO
// =========================================

async function comprobarSilencioModeracion() {

    if (!usuarioActivo) {
        return {
            silenciado: false,
            usin_date_end: null
        };
    }

    try {

        const respuesta = await fetch(
            "https://small-adventure.onrender.com/api/interactions/silencio/" +
            usuarioActivo.id
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudo comprobar el silencio"
            );

        }

        if (datos.silenciado) {

            console.log(
                "Usuario sancionado por silencio:",
                datos.interaccion
            );

            return {
                silenciado: true,

                usin_date_end:
                    datos.interaccion
                        ? datos.interaccion.usin_date_end
                        : null
            };

        }

        return {
            silenciado: false,
            usin_date_end: null
        };

    } catch (error) {

        console.error(
            "Error al comprobar silencio de moderación:",
            error
        );

        return {
            silenciado: false,
            usin_date_end: null
        };

    }

}

// =========================================
// CARGAR USUARIOS BLOQUEADOS DESDE BD
// =========================================

async function cargarUsuariosBloqueados() {

    if (!usuarioActivo) {
        return;
    }

    try {

        const respuesta = await fetch(
            "https://small-adventure.onrender.com/api/interactions/bloqueados/" +
            usuarioActivo.id
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudieron obtener los usuarios bloqueados"
            );

        }

        usuariosBloqueados =
            datos.map(function(interaccion) {

                return Number(
                    interaccion.id_user_dest
                );

            });

        console.log(
            "Usuarios bloqueados:",
            usuariosBloqueados
        );

    } catch (error) {

        console.error(
            "Error al cargar usuarios bloqueados:",
            error
        );

    }

}


// =========================================
// COMPROBAR SI UN USUARIO ESTÁ BLOQUEADO
// =========================================

async function obtenerEstadoBloqueo(idUsuario) {

    if (!usuarioActivo || !usuarioActivo.id) {
        return false;
    }

    if (!idUsuario) {
        return false;
    }


    // =========================================
    // COMPROBAR PRIMERO LA LISTA LOCAL
    // =========================================

    if (
        Array.isArray(usuariosBloqueados) &&
        usuariosBloqueados.some(
            function(id) {

                return Number(id) ===
                    Number(idUsuario);

            }
        )
    ) {

        return true;

    }


    // =========================================
    // CONSULTAR BASE DE DATOS
    // =========================================

    try {

        const respuesta =
            await fetch(
                `https://small-adventure.onrender.com/api/interactions/bloqueados/${usuarioActivo.id}`
            );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            console.error(
                "Error al obtener usuarios bloqueados:",
                datos
            );

            return false;
        }


        // =========================================
        // ACTUALIZAR LISTA LOCAL
        // =========================================

        usuariosBloqueados =
            Array.isArray(datos)
                ? datos.map(
                    function(interaccion) {

                        return Number(
                            interaccion.id_user_dest
                        );

                    }
                )
                : [];


        // =========================================
        // COMPROBAR USUARIO
        // =========================================

        return usuariosBloqueados.some(
            function(id) {

                return Number(id) ===
                    Number(idUsuario);

            }
        );

    } catch (error) {

        console.error(
            "Error al comprobar bloqueo:",
            error
        );

        return false;
    }

}

// =========================================
// CARGAR MENSAJES DESDE MYSQL
// =========================================

async function cargarMensajesDesdeBD() {

    try {

        // =========================================
        // DETERMINAR CANAL ACTUAL
        // =========================================

        let idCanal;

        if (categoriaActual === "general") {

            idCanal = 1;

        }

        else if (categoriaActual === "espanol") {

            idCanal = 2;

        }

        else if (categoriaActual === "ingles") {

            idCanal = 3;

        }

        else if (categoriaActual === "portugues") {

            idCanal = 4;

        }


        // =========================================
        // OBTENER MENSAJES DEL CANAL
        // =========================================

        const respuesta =
            await fetch(
                "https://small-adventure.onrender.com/api/messages?id_chan=" +
                idCanal
            );


        if (!respuesta.ok) {

            throw new Error(
                "Error al obtener los mensajes"
            );

        }


        const mensajes =
            await respuesta.json();


        console.log(
            "Mensajes recibidos desde MySQL:",
            mensajes
        );

        console.log("OBJETO COMPLETO DEL MENSAJE:", mensajes[0]);

        
        console.table(mensajes.map(mensaje => ({
            id: mensaje.id_mensaje,
            texto: mensaje.mens_content,
            idioma: mensaje.mens_language
        })));


        mostrarMensajesDesdeBD(
            mensajes
        );


    } catch (error) {

        console.error(
            "Error al cargar mensajes desde MySQL:",
            error
        );

    }

}

/// =========================================
// CARGAR NOTIFICACIONES DESDE MYSQL
// =========================================

async function cargarNotificacionesDesdeBD() {

    if (!usuarioActivo) {
        console.log(
            "No hay usuario activo para cargar notificaciones."
        );
        return;
    }

    try {

        const respuesta =
            await fetch(
                "https://small-adventure.onrender.com/api/notifications/" +
                usuarioActivo.id
            );

        const notificaciones =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                notificaciones.error ||
                "No se pudieron cargar las notificaciones."
            );

        }

        console.log(
            "Notificaciones recibidas desde MySQL:",
            notificaciones
        );


        // =========================================
        // ACTUALIZAR CONTADOR
        // =========================================

        actualizarContadorNotificaciones(
            notificaciones
        );


        return notificaciones;

    } catch (error) {

        console.error(
            "Error al cargar notificaciones:",
            error
        );

        return [];

    }

}

// =========================================
// ACTUALIZAR CONTADOR DE NOTIFICACIONES
// =========================================

function actualizarContadorNotificaciones(
    notificaciones
) {

    const contador =
        document.getElementById(
            "contadorNotificaciones"
        );


    if (!contador) {
        return;
    }


    // =========================================
    // CONTAR NO LEÍDAS
    // =========================================

    const cantidadNoLeidas =
        notificaciones.filter(
            function(notificacion) {

                return (
                    notificacion.noti_status ===
                    "no_leida"
                );

            }
        ).length;


    // =========================================
    // MOSTRAR / OCULTAR CONTADOR
    // =========================================

    if (cantidadNoLeidas > 0) {

        contador.textContent =
            cantidadNoLeidas;

        contador.style.display =
            "inline-block";

    } else {

        contador.textContent =
            "0";

        contador.style.display =
            "none";

    }

}

// =========================================
// OBTENER CONTENEDOR SEGÚN EL CANAL
// =========================================

function obtenerContenedorCanal() {

    let contenedor;

    if (categoriaActual === "general") {

        contenedor =
            document.getElementById(
                "comentariosGeneral"
            );

    }

    else if (categoriaActual === "espanol") {

        contenedor =
            document.getElementById(
                "comentariosEspanol"
            );

    }

    else if (categoriaActual === "ingles") {

        contenedor =
            document.getElementById(
                "comentariosIngles"
            );

    }

    else if (categoriaActual === "portugues") {

        contenedor =
            document.getElementById(
                "comentariosPortugues"
            );

    }

    if (!contenedor) {

        console.error(
            "No se encontró el contenedor del canal:",
            categoriaActual
        );

        return null;

    }

       return contenedor;

}

// =========================================
// MOSTRAR MENSAJES DE MYSQL
// =========================================

function mostrarMensajesDesdeBD(mensajes) {

    const contenedor =
        obtenerContenedorCanal();

    if (!contenedor) {
        return;
    }

    // Limpiar el canal actual
    contenedor.innerHTML = "";

    // Guardar los elementos por ID
    const elementosMensajes = {};


    
    // =========================================
    // CREAR LOS MENSAJES
    // =========================================

    mensajes.forEach(function(mensaje) {

    // =========================================
    // FILTRAR USUARIOS SILENCIADOS
    // =========================================

    if (
        usuariosSilenciados.includes(
            Number(mensaje.id_user)
        )
    ) {

        return;

    }

        const comentario =
            document.createElement("div");

        comentario.classList.add("comentario");

        comentario.dataset.mensajeId =
            mensaje.id_mensaje;

        comentario.dataset.mensajePadre =
            mensaje.id_mens_fath || "";

       
        comentario.dataset.idioma =
            mensaje.mens_language ||
            ({
                2: "es",
                3: "en",
                4: "pt"
            })[Number(mensaje.id_chan)] ||
            "";

        // =========================================
        // NOMBRE DEL USUARIO
        // =========================================

        const nombreUsuario =
            document.createElement("strong");

        nombreUsuario.classList.add(
            "nombre-usuario"
        );

        nombreUsuario.setAttribute(
            "data-usuario-id",
            mensaje.id_user
        );

        nombreUsuario.textContent =
            mensaje.user_name;

        comentario.appendChild(
            nombreUsuario
        );

        // =========================================
        // TEXTO
        // =========================================

       if (mensaje.mens_content) {

        const texto =
            document.createElement("p");

        texto.textContent =
            mensaje.mens_content;

        comentario.appendChild(
            texto
        );

        // =========================================
        // BOTONES DE TRADUCCIÓN
        // =========================================

        const idiomasPorCanal = {
            2: "es",
            3: "en",
            4: "pt"
        };

        const idiomaOriginal =
            mensaje.mens_language ||
            idiomasPorCanal[Number(mensaje.id_chan)] ||
            null;


        console.log("IDIOMA ORIGINAL:", mensaje.mens_language);
        console.log("TEXTO ORIGINAL:", mensaje.mens_content);

        console.log(
            "ID DEL MENSAJE:",
            mensaje.id_mensaje
        );

        const textoOriginal =
            mensaje.mens_content;
        
        const contenedorTraducciones =
            document.createElement("div");

        contenedorTraducciones.classList.add(
            "botones-traduccion"
        );

        // Español → Inglés y Portugués
        if (idiomaOriginal === "es") {

            const botonIngles =
                document.createElement("button");

            botonIngles.type = "button";
            botonIngles.textContent =
                "🇬🇧 English";

            botonIngles.dataset.idiomaDestino =
                "en";

            contenedorTraducciones.appendChild(
                botonIngles
            );

            const botonPortugues =
                document.createElement("button");

            botonPortugues.type = "button";
            botonPortugues.textContent =
                "🇧🇷 Português";

            botonPortugues.dataset.idiomaDestino =
                "pt";

            contenedorTraducciones.appendChild(
                botonPortugues
            );

        }

        // Inglés → Español y Portugués
        else if (idiomaOriginal === "en") {

            const botonEspanol =
                document.createElement("button");

            botonEspanol.type = "button";
            botonEspanol.textContent =
                "🇪🇸 Español";

            botonEspanol.dataset.idiomaDestino =
                "es";

            contenedorTraducciones.appendChild(
                botonEspanol
            );

            const botonPortugues =
                document.createElement("button");

            botonPortugues.type = "button";
            botonPortugues.textContent =
                "🇧🇷 Português";

            botonPortugues.dataset.idiomaDestino =
                "pt";

            contenedorTraducciones.appendChild(
                botonPortugues
            );

        }

        // Portugués → Español y Inglés
        else if (idiomaOriginal === "pt") {

            const botonEspanol =
                document.createElement("button");

            botonEspanol.type = "button";
            botonEspanol.textContent =
                "🇪🇸 Español";

            botonEspanol.dataset.idiomaDestino =
                "es";

            contenedorTraducciones.appendChild(
                botonEspanol
            );

            const botonIngles =
                document.createElement("button");

            botonIngles.type = "button";
            botonIngles.textContent =
                "🇬🇧 English";

            botonIngles.dataset.idiomaDestino =
                "en";

            contenedorTraducciones.appendChild(
                botonIngles
            );

            }

        
        // =========================================
        // ACCIONES DE LOS BOTONES DE TRADUCCIÓN
        // =========================================

        const botonesTraduccion =
            contenedorTraducciones.querySelectorAll(
                "button"
            );

        botonesTraduccion.forEach(
            function (boton) {

                boton.onclick = async function () {

                    const idiomaDestino =
                        boton.dataset.idiomaDestino;

                    if (boton.disabled) {
                        return;
                    }

                    const claveTraduccion =
                        idiomaOriginal + "_" + idiomaDestino;

                    if (!mensaje.traducciones) {
                        mensaje.traducciones = {};
                    }

                    const textoOriginalBoton =
                        boton.textContent;

                    // =========================================
                    // COMPROBAR SI YA EXISTE LA TRADUCCIÓN
                    // =========================================

                    if (
                        mensaje.traducciones[claveTraduccion]
                    ) {

                        mostrarTraduccion(
                            comentario,
                            idiomaDestino,
                            mensaje.traducciones[
                                claveTraduccion
                            ]
                        );

                        return;
                    }

                    // =========================================
                    // SOLICITAR NUEVA TRADUCCIÓN
                    // =========================================

                    boton.disabled = true;
                    boton.textContent = "Traduciendo...";

                    try {

                        const traduccion =
                            await traducirTexto(
                                textoOriginal,
                                idiomaOriginal,
                                idiomaDestino
                            );

                        if (!traduccion) {

                            mostrarToast(
                                "No se pudo traducir el mensaje.",
                                "error"
                            );

                            return;
                        }

                        // =========================================
                        // GUARDAR TRADUCCIÓN EN MEMORIA
                        // =========================================

                        mensaje.traducciones[
                            claveTraduccion
                        ] = traduccion;

                        // =========================================
                        // MOSTRAR TRADUCCIÓN
                        // =========================================

                        mostrarTraduccion(
                            comentario,
                            idiomaDestino,
                            traduccion
                        );

                    }
                    catch (error) {

                        console.error(
                            "Error al traducir el mensaje:",
                            error
                        );

                        mostrarToast(
                            "Ocurrió un error al traducir el mensaje.",
                            "error"
                        );

                    }
                    finally {

                        boton.disabled = false;

                        boton.textContent =
                            textoOriginalBoton;

                    }

                };

            }
        );


        // Solo mostrar el contenedor si tiene botones
        if (contenedorTraducciones.children.length > 0) {

            comentario.appendChild(
                contenedorTraducciones
            );

        }

    }

        // =========================================
        // IMAGEN
        // =========================================

        if (mensaje.mens_image) {

            const imagen =
                document.createElement("img");

            imagen.classList.add(
                "imagen-mensaje"
            );

            imagen.src =
                "https://small-adventure.onrender.com/" +
                mensaje.mens_image;

            imagen.alt =
                "Imagen del mensaje";

            comentario.appendChild(
                imagen
            );

        }

            // =========================================
            // RESPONDER
            // =========================================

            // Se puede responder a mensajes principales
            // y también a otras respuestas.
            {

            // En General solo puede responder el administrador.
            // En los demás canales puede responder cualquier usuario.
            const puedeResponder =
                Number(mensaje.id_chan) !== 1 || esAdmin;

            if (puedeResponder) {

    const botonResponder =
        document.createElement("button");

    botonResponder.textContent =
        "Responder";

    botonResponder.onclick =
        function() {

            // =========================================
            // ACTIVAR MODO RESPUESTA
            // =========================================

            panelEnModoRespuesta =
                true;

            // Guardar mensaje al que se responde
            mensajePadreRespuesta =
                mensaje.id_mensaje;

            // Guardar usuario al que se responde

            usuarioRespuesta =
                mensaje.user_name;

            // =========================================
            // ACTUALIZAR APARIENCIA DEL PANEL
            // =========================================

            actualizarModoPanelEscritura();

            // =========================================
            // MOSTRAR PANEL
            // =========================================

            const contenedorMensajes =
                document.getElementById(
                    "contenedorMensajes"
                );

            if (contenedorMensajes) {

                contenedorMensajes.style.display =
                    "block";

            }

            // =========================================
            // ENFOCAR CAJA DE TEXTO
            // =========================================

            const entrada =
                document.getElementById(
                    "mensaje"
                );

            if (entrada) {

                entrada.focus();

            }

        };

    comentario.appendChild(
        botonResponder
    );

    }

}

// =========================================
// CONTAR RESPUESTAS DIRECTAS
// =========================================

const cantidadRespuestas =
    mensajes.filter(function(respuesta) {

        return Number(
            respuesta.id_mens_fath
        ) === Number(
            mensaje.id_mensaje
        );

    }).length;

// =========================================
// BOTÓN X RESPUESTAS
// =========================================

if (cantidadRespuestas > 0) {

    const botonRespuestas =
        document.createElement("button");

    botonRespuestas.classList.add(
        "boton-respuestas"
    );

    let respuestasExpandidas =
        false;

    botonRespuestas.textContent =
        cantidadRespuestas === 1
            ? "1 respuesta"
            : cantidadRespuestas + " respuestas";

    botonRespuestas.onclick =
        function() {

            respuestasExpandidas =
                !respuestasExpandidas;

            const contenedorRespuestas =
                comentario.querySelector(
                    ":scope > .respuestas"
                );

            if (!contenedorRespuestas) {

                return;

            }

            if (respuestasExpandidas) {

                contenedorRespuestas.style.display =
                    "block";

                botonRespuestas.textContent =
                    cantidadRespuestas === 1
                        ? "Ocultar respuesta"
                        : "Ocultar respuestas";

            } else {

                contenedorRespuestas.style.display =
                    "none";

                botonRespuestas.textContent =
                    cantidadRespuestas === 1
                        ? "1 respuesta"
                        : cantidadRespuestas + " respuestas";

            }

        };

    comentario.appendChild(
        botonRespuestas
    );

}

        // =========================================
        // GUARDAR ELEMENTO
        // =========================================

        elementosMensajes[
            mensaje.id_mensaje
        ] = comentario;

    });

// =========================================
// COLOCAR MENSAJES EN SU LUGAR
// =========================================

mensajes.forEach(function(mensaje) {

    const elemento =
        elementosMensajes[
            mensaje.id_mensaje
        ];

    // =========================================
    // IGNORAR MENSAJES FILTRADOS
    // =========================================

    if (!elemento) {

        return;

    }

    // =========================================
    // MENSAJE PRINCIPAL
    // =========================================

    if (mensaje.id_mens_fath == null) {

        contenedor.appendChild(
            elemento
        );

        return;

    }

    // =========================================
    // RESPUESTA
    // =========================================

    const padre =
        elementosMensajes[
            mensaje.id_mens_fath
        ];

    if (!padre) {

        return;

    }

    // =========================================
    // CONTENEDOR DE RESPUESTAS
    // =========================================

    let respuestas =
        padre.querySelector(
            ":scope > .respuestas"
        );

    if (!respuestas) {

        respuestas =
            document.createElement("div");

        respuestas.classList.add(
            "respuestas"
        );

        // Las respuestas empiezan comprimidas
        respuestas.style.display =
            "none";

        padre.appendChild(
            respuestas
        );

    }

    // =========================================
    // AGREGAR RESPUESTA
    // =========================================

    respuestas.appendChild(
        elemento
    );

});

}

// =========================================
// CARGAR USUARIOS DESDE MYSQL
// =========================================

async function cargarUsuariosDesdeBD() {

    try {

        const respuesta = await fetch(
            'https://small-adventure.onrender.com/api/users'
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                'No se pudieron cargar los usuarios.'
            );

        }

        usuariosBD =
            Array.isArray(datos)
                ? datos.filter(function(usuario) {

                    return (
                        !usuarioActivo ||
                        usuario.id_user !== usuarioActivo.id
                    );

                })
                : [];

        console.log(
            'Usuarios cargados desde MySQL:',
            usuariosBD
        );

        mostrarListaUsuarios();

    } catch (error) {

        console.error(
            'Error al cargar usuarios desde MySQL:',
            error
        );

        usuariosBD = [];

        mostrarListaUsuarios();

    }

}

// =========================================
// BUSCAR USUARIOS DESDE MYSQL
// =========================================

async function buscarUsuariosDesdeBD(
    textoBusqueda = '',
    campoBusqueda = 'nombre'
) {

    try {

        // =========================================
        // LIMPIAR VALORES
        // =========================================

        textoBusqueda =
            textoBusqueda.trim();

        campoBusqueda =
            campoBusqueda.trim().toLowerCase();

        // =========================================
        // VALIDAR CAMPO
        // =========================================

        const camposPermitidos = [
            'nombre',
            'correo',
            'id',
            'rol'
        ];

        if (
            !camposPermitidos.includes(
                campoBusqueda
            )
        ) {

            console.error(
                'Campo de búsqueda no válido:',
                campoBusqueda
            );

            return;

        }

        // =========================================
        // CONSTRUIR URL
        // =========================================

        const parametros =
            new URLSearchParams();

        parametros.set(
            'campo',
            campoBusqueda
        );

        parametros.set(
            'q',
            textoBusqueda
        );

        // =========================================
        // EXCLUIR USUARIO ACTUAL
        // =========================================

        if (usuarioActivo) {

            parametros.set(
                'exclude',
                usuarioActivo.id
            );

        }

        // =========================================
        // CONSULTAR BACKEND
        // =========================================

        const respuesta = await fetch(
            'https://small-adventure.onrender.com/api/users/search?' +
            parametros.toString()
        );

        const datos =
            await respuesta.json();

        // =========================================
        // COMPROBAR RESPUESTA
        // =========================================

        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                'No se pudieron buscar los usuarios.'
            );

        }

        // =========================================
        // GUARDAR RESULTADOS
        // =========================================

        usuariosBD =
            Array.isArray(datos)
                ? datos
                : [];

        console.log(
            'Campo de búsqueda:',
            campoBusqueda
        );

        console.log(
            'Texto buscado:',
            textoBusqueda
        );

        console.log(
            'Resultados de búsqueda:',
            usuariosBD
        );

        

        // =========================================
        // MOSTRAR RESULTADOS
        // =========================================

        mostrarListaUsuarios();

    } catch (error) {

        console.error(
            'Error al buscar usuarios:',
            error
        );

        usuariosBD = [];

        mostrarListaUsuarios();

    }

}

// =========================================
// MOSTRAR RESULTADOS DE USUARIOS
// =========================================

function mostrarListaUsuarios() {

    const contenedor =
        document.getElementById(
            "usuariosDisponibles"
        );

    if (!contenedor) {

        console.error(
            "No existe el contenedor usuariosDisponibles"
        );

        return;

    }

    contenedor.innerHTML = "";

    // =========================================
    // SIN RESULTADOS
    // =========================================

    if (
        usuariosBD.length === 0
    ) {

        const mensaje =
            document.createElement("p");

        mensaje.className =
            "sin-resultados-usuarios";

        mensaje.textContent =
            "No se encontraron usuarios.";

        contenedor.appendChild(
            mensaje
        );

        return;

    }

    // =========================================
    // CREAR TARJETAS
    // =========================================

    usuariosBD.forEach(
        function(usuario) {

            // =========================================
            // TARJETA
            // =========================================

            const tarjeta =
                document.createElement("div");

            tarjeta.classList.add(
                "tarjeta-usuario"
            );

            // =========================================
            // AVATAR
            // =========================================

            const avatar =
                document.createElement("div");

            avatar.classList.add(
                "avatar-usuario"
            );

            if (
                usuario.prof_avatar &&
                usuario.prof_avatar !== "default"
            ) {

                const imagen =
                    document.createElement("img");

                imagen.src =
                    usuario.prof_avatar;

                imagen.alt =
                    "Avatar de " +
                    usuario.user_name;

                avatar.appendChild(
                    imagen
                );

            } else {

                avatar.textContent =
                    usuario.user_name
                        .charAt(0)
                        .toUpperCase();

            }

            // =========================================
            // INFORMACIÓN
            // =========================================

            const informacion =
                document.createElement("div");

            informacion.classList.add(
                "informacion-usuario"
            );

            const nombre =
                document.createElement("h4");

            nombre.textContent =
                usuario.user_name;

            const rol =
                document.createElement("span");

            rol.textContent =
                Number(usuario.id_role) === 1
                    ? "Administrador"
                    : "Usuario";

            informacion.appendChild(
                nombre
            );

            informacion.appendChild(
                rol
            );

            // =========================================
            // COLOR DEL PERFIL
            // =========================================

            if (usuario.prof_color) {

                tarjeta.style.setProperty(
                    "--color-usuario",
                    usuario.prof_color
                );

            }

            // =========================================
            // ABRIR PERFIL
            // =========================================

            tarjeta.addEventListener(
                "click",
                function() {

                    mostrarPerfil(
                        usuario.id_user
                    );

                }
            );

            // =========================================
            // ARMAR TARJETA
            // =========================================

            tarjeta.appendChild(
                avatar
            );

            tarjeta.appendChild(
                informacion
            );

            contenedor.appendChild(
                tarjeta
            );

        }
    );

    console.log(
        "Usuarios mostrados:",
        contenedor.children.length
    );

}

// =========================================
// ABRIR PERFIL POR ID
// =========================================

async function actualizarBotonBloqueo(idUsuario) {

    const boton =
        document.getElementById(
            "accionBloquear"
        );

    if (!boton || !idUsuario) {
        return;
    }

    const estaBloqueado =
        await obtenerEstadoBloqueo(
            idUsuario
        );

    if (estaBloqueado) {

        boton.textContent =
            "🔓 Desbloquear";

    } else {

        boton.textContent =
            "🚫 Bloquear";

    }

}

// =========================================
// CARGAR MENSAJES PRIVADOS
// =========================================

async function cargarMensajesPrivados(idConv) {

    const contenedor =
        document.getElementById(
            "mensajesPrivados"
        );

    if (!contenedor) {

        console.error(
            "No existe el contenedor de mensajes privados."
        );

        return;

    }

    contenedor.innerHTML = "";

    try {

        const respuesta =
            await fetch(
                "https://small-adventure.onrender.com/api/conversations/" +
                idConv +
                "/messages"
            );

        const mensajes =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                mensajes.error ||
                "No se pudieron cargar los mensajes"
            );

        }

        console.log(
            "Mensajes privados recibidos:",
            mensajes
        );

        mensajes.forEach(
    function(mensaje) {

        const elemento =
            document.createElement("div");

        elemento.classList.add(
            "mensaje-privado"
        );

        // Determinar si el mensaje es mío
        if (
            Number(mensaje.id_user) ===
            Number(usuarioActivo.id)
        ) {

            elemento.classList.add(
                "mensaje-mio"
            );

        } else {

            elemento.classList.add(
                "mensaje-otro"
            );
        }

        // NOMBRE DEL USUARIO
        const nombre =
            document.createElement("strong");

        nombre.textContent =
            mensaje.user_name;

        // CONTENIDO
        const contenido =
            document.createElement("span");

        contenido.textContent =
            mensaje.mepr_content;

        elemento.appendChild(
            nombre
        );

        elemento.appendChild(
            contenido
        );

        contenedor.appendChild(
            elemento
        );
        }
    );

        // Ir automáticamente al último mensaje
        contenedor.scrollTop =
            contenedor.scrollHeight;

    } catch (error) {

        console.error(
            "Error al cargar mensajes privados:",
            error
        );

    }

}

// =========================================
// CERRAR CHAT PRIVADO
// =========================================

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.id !==
            "cerrarChatPrivado"
        ) {
            return;
        }

        const chatPrivado =
            document.getElementById(
                "chatPrivado"
            );

        if (chatPrivado) {

            chatPrivado.style.display =
                "none";
        }

        console.log(
            "Chat privado cerrado."
        );
    }
);

// =========================================
// ENVIAR MENSAJE PRIVADO
// =========================================

document.addEventListener(
    "click",
    async function(event) {

        if (
            event.target.id !==
            "enviarMensajePrivado"
        ) {
            return;
        }

        if (!conversacionPrivadaActual) {
            console.error(
                "No hay una conversación privada activa."
            );
            return;
        }

        if (!usuarioActivo) {
            console.error(
                "No hay un usuario activo."
            );
            return;
        }

        const input =
            document.getElementById(
                "mensajePrivado"
            );

        if (!input) {
            console.error(
                "No existe el campo mensajePrivado."
            );
            return;
        }

        const contenido =
            input.value.trim();

        if (!contenido) {
            return;
        }

        try {

            const respuesta =
                await fetch(
                    "https://small-adventure.onrender.com/api/conversations/" +
                    conversacionPrivadaActual +
                    "/messages",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            id_user:
                                usuarioActivo.id,

                            mepr_content:
                                contenido
                        })
                    }
                );

                        const datos =
                await respuesta.json();

            if (!respuesta.ok) {

                let mensajeError =
                    datos.error ||
                    "No se pudo enviar el mensaje";

                if (
                    datos.usin_date_end
                ) {

                    const fechaFin =
                        new Date(
                            datos.usin_date_end
                        );

                    mensajeError +=
                        " Podrás volver a enviar mensajes el " +
                        fechaFin.toLocaleString("es-CO", {
                            dateStyle: "long",
                            timeStyle: "short"
                        }) +
                        ".";

                }

                throw new Error(
                    mensajeError
                );
            }

            console.log(
                "Mensaje privado enviado:",
                datos
            );

            input.value = "";

            await cargarMensajesPrivados(
                conversacionPrivadaActual
            );

        } catch (error) {

            console.error(
                "Error al enviar mensaje privado:",
                error
            );

            mostrarToast(
                error.message,
                "error"
            );
        }
    }
);

// =========================================
// OBTENER ESTADO DE SILENCIAMIENTO
// =========================================

async function obtenerEstadoSilencio(idUsuario) {

    if (!usuarioActivo) {
        return false;
    }

    try {

        const respuesta = await fetch(
            "https://small-adventure.onrender.com/api/interactions/silenciados/" +
            usuarioActivo.id
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                datos.error ||
                "No se pudo consultar el silenciamiento"
            );

        }

        return datos.some(
            function(interaccion) {

                return Number(
                    interaccion.id_user_dest
                ) === Number(idUsuario);

            }
        );

    } catch (error) {

        console.error(
            "Error al consultar estado de silencio:",
            error
        );

        return false;

    }

}

// =========================================
// MOSTRAR PERFIL DE USUARIO
// =========================================

async function mostrarPerfil(idUsuario) {

    try {

        const respuesta = await fetch(
            "https://small-adventure.onrender.com/api/profiles/" + idUsuario
        );

        const datos = await respuesta.json();

        console.log("DATOS DEL PERFIL:", datos);
        console.log("AVATAR DESDE MYSQL:", datos.prof_avatar);

        if (!respuesta.ok) {

            throw new Error(
                datos.error || "No se pudo obtener el perfil"
            );

        }

  const avatarPerfil =
    document.getElementById("avatarPerfil");

// =========================================
// COLOR DEL AVATAR
// =========================================

if (datos.prof_color) {

     avatarPerfil.style.setProperty(
        "background",
        datos.prof_color,
        "important"
    );

}

// =========================================
// MOSTRAR AVATAR
// =========================================

avatarPerfil.innerHTML = "";

if (
    !datos.prof_avatar ||
    datos.prof_avatar === "default"
) {

    avatarPerfil.textContent =
        datos.user_name
            .charAt(0)
            .toUpperCase();

} else {

    const imagenAvatar =
        document.createElement("img");

    imagenAvatar.src =
        datos.prof_avatar;

    imagenAvatar.alt =
        "Avatar de " + datos.user_name;

    avatarPerfil.appendChild(
        imagenAvatar
    );
}


        document.getElementById("nombrePerfil").textContent =
            datos.user_name;

        document.getElementById("idPerfil").textContent =
            datos.id_user;

        document.getElementById("rolPerfil").textContent =
            datos.id_role === 1
                ? "Administrador"
                : "Usuario";

        document.getElementById("biografiaPerfil").textContent =
            datos.biography || "Sin biografía";

        document.getElementById("nuevaBiografia").value =
            datos.biography || "";

        document.getElementById("nuevoColor").value =
            datos.prof_color || "blue";

        document.getElementById("nuevoAvatar").value =
            datos.prof_avatar || "default";

// =========================================
// CONTROLES DEL PERFIL
// =========================================

const botonEditarPerfil =
    document.getElementById(
        "editarPerfil"
    );

const botonSilenciarPerfil =
    document.getElementById(
        "btnSilenciarPerfil"
    );

const formularioEditarPerfil =
    document.getElementById(
        "formularioEditarPerfil"
    );


// =========================================
// COMPROBAR SI ES MI PROPIO PERFIL
// =========================================

const esMiPerfil =
    Number(idUsuario) ===
    Number(usuarioActivo.id);


// =========================================
// MOSTRAR U OCULTAR CONTROLES
// =========================================

if (botonEditarPerfil) {

    botonEditarPerfil.style.display =
        esMiPerfil
            ? "block"
            : "none";

}

if (botonSilenciarPerfil) {

    botonSilenciarPerfil.style.display =
        esMiPerfil
            ? "none"
            : "block";

}

if (
    formularioEditarPerfil &&
    !esMiPerfil
) {

    formularioEditarPerfil.style.display =
        "none";

}
        
// =========================================
// BOTÓN DE SILENCIAR / DEJAR DE SILENCIAR
// =========================================

const btnSilenciarPerfil =
    document.getElementById(
        "btnSilenciarPerfil"
    );

if (btnSilenciarPerfil) {

    const estaSilenciado =
        await obtenerEstadoSilencio(
            idUsuario
        );

    if (estaSilenciado) {

        btnSilenciarPerfil.textContent =
            "🔊 Dejar de silenciar";

    } else {

        btnSilenciarPerfil.textContent =
            "🔇 Silenciar";

    }

}

// =========================================
// BOTÓN DE REPORTAR
// =========================================

const btnReportar =
    document.getElementById(
        "accionReportar"
    );

const modalReporte =
    document.getElementById(
        "modalReporte"
    );

console.log(
    "BOTÓN REPORTAR ENCONTRADO:",
    btnReportar
);

console.log(
    "MODAL REPORTE ENCONTRADO:",
    modalReporte
);


if (
    btnReportar &&
    modalReporte
) {

    btnReportar.addEventListener(
        "click",
        function() {

            console.log(
                "================================="
            );

            console.log(
                "SE PRESIONÓ LA OPCIÓN REPORTAR"
            );

            console.log(
                "Usuario seleccionado:",
                usuarioSeleccionadoId
            );

            console.log(
                "Mensaje seleccionado:",
                mensajeSeleccionadoId
            );

            console.log(
                "================================="
            );


            // =========================================
            // LIMPIAR DATOS ANTERIORES
            // =========================================

            document.getElementById(
                "motivoReporte"
            ).value = "";

            document.getElementById(
                "descripcionReporte"
            ).value = "";


            // =========================================
            // MOSTRAR MODAL
            // =========================================

            modalReporte.style.display =
                "flex";

        }
    );

}

// =========================================
// CERRAR MODAL DE REPORTE
// =========================================

const btnCerrarModalReporte =
    document.getElementById(
        "cerrarModalReporte"
    );

const btnCancelarReporte =
    document.getElementById(
        "cancelarReporte"
    );


function cerrarModalReporte() {

    const modal =
        document.getElementById(
            "modalReporte"
        );

    if (modal) {

        modal.style.display =
            "none";

    }

}


// =========================================
// BOTÓN X
// =========================================

if (btnCerrarModalReporte) {

    btnCerrarModalReporte.addEventListener(
        "click",
        cerrarModalReporte
    );

}


// =========================================
// BOTÓN CANCELAR
// =========================================

if (btnCancelarReporte) {

    btnCancelarReporte.addEventListener(
        "click",
        cerrarModalReporte
    );

}

// =========================================
// ENVIAR REPORTE
// =========================================

const btnEnviarReporte =
    document.getElementById(
        "enviarReporte"
    );

if (btnEnviarReporte) {

    btnEnviarReporte.addEventListener(
        "click",
        async function() {

            console.log(
                "================================="
            );

            console.log(
                "SE PRESIONÓ ENVIAR REPORTE"
            );

            console.log(
                "Usuario que reporta:",
                usuarioActivo.id
            );

            console.log(
                "Usuario reportado:",
                usuarioSeleccionadoId
            );

            console.log(
                "Mensaje reportado:",
                mensajeSeleccionadoId
            );

            console.log(
                "================================="
            );

            const motivo =
                document.getElementById(
                    "motivoReporte"
                ).value;

            const descripcion =
                document.getElementById(
                    "descripcionReporte"
                ).value.trim();


            // VALIDAR MOTIVO
            if (!motivo) {

                mostrarToast(
                    "Selecciona una razón para el reporte.",
                    "error"
                );

                return;

            }


            // VALIDAR DESCRIPCIÓN
            if (!descripcion) {

                mostrarToast(
                    "Escribe una breve descripción del reporte.",
                    "error"
                );

                return;

            }


            try {

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/reports",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                id_user_repo:
                                    usuarioActivo.id,

                                id_repo_user:
                                    usuarioSeleccionadoId,

                                id_mens:
                                    mensajeSeleccionadoId,

                                repo_motive:
                                    motivo,

                                repo_description:
                                    descripcion

                            })
                        }
                    );


                const datos =
                    await respuesta.json();


                console.log(
                    "RESPUESTA DEL REPORTE:",
                    datos
                );


                if (!respuesta.ok) {

                    throw new Error(
                        datos.error ||
                        "No se pudo enviar el reporte."
                    );

                }


                // MOSTRAR CONFIRMACIÓN
                mostrarToast(
                    "Reporte enviado correctamente. Un administrador revisará el reporte.",
                    "info"
                );


                // CERRAR MODAL
                cerrarModalReporte();


                // LIMPIAR CAMPOS
                document.getElementById(
                    "motivoReporte"
                ).value = "";

                document.getElementById(
                    "descripcionReporte"
                ).value = "";


            } catch (error) {

                console.error(
                    "Error al enviar reporte:",
                    error
                );

                mostrarToast(
                    error.message ||
                    "No se pudo enviar el reporte.",
                    "error"
                );

            }

        }
    );

}

// =========================================
// MOSTRAR BOTÓN DE EDITAR PERFIL
// =========================================

const editarPerfil =
    document.getElementById("editarPerfil");

if (editarPerfil) {

    if (Number(idUsuario) === Number(usuarioActivo.id)) {

        editarPerfil.style.display = "block";

    } else {

        editarPerfil.style.display = "none";

    }

}

editarPerfil.onclick = function() {

    document.getElementById(
        "formularioEditarPerfil"
    ).style.display = "block";

};

const guardarBiografia =
    document.getElementById("guardarBiografia");

if (guardarBiografia) {

    guardarBiografia.onclick = async function() {

        const nuevaBiografia =
            document.getElementById(
                "nuevaBiografia"
            ).value.trim();
            
        const nuevoColor =
            document.getElementById(
                "nuevoColor"
            ).value;    

            const nuevoAvatar =
                document.getElementById(
                "nuevoAvatar"
                ).value;

            console.log("Avatar seleccionado:", nuevoAvatar);

        try {

            const respuesta = await fetch(
                "https://small-adventure.onrender.com/api/profiles/" +
                usuarioActivo.id,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        biography: nuevaBiografia,
                        prof_color: nuevoColor,
                        prof_avatar: nuevoAvatar
                    })
                }
            );

            const datos =
                await respuesta.json();

            if (!respuesta.ok) {

                throw new Error(
                    datos.error ||
                    "No se pudo actualizar la biografía"
                );

            }


// =========================================
// ACTUALIZAR AVATAR INMEDIATAMENTE
// =========================================

avatarPerfil.innerHTML = "";

if (
    !nuevoAvatar ||
    nuevoAvatar === "default"
) {

    avatarPerfil.textContent =
        usuarioActivo.user_name
            ? usuarioActivo.user_name
                .charAt(0)
                .toUpperCase()
            : "?";

} else {

    const imagenAvatar =
        document.createElement("img");

    imagenAvatar.src =
        nuevoAvatar;

    imagenAvatar.alt =
        "Avatar de " + usuarioActivo.user_name;

    avatarPerfil.appendChild(
        imagenAvatar
    );
}

// =========================================
// ACTUALIZAR AVATAR DE LA PARTE SUPERIOR
// =========================================

const avatarUsuarioActivo =
    document.getElementById(
        "avatarUsuarioActivo"
    );

if (avatarUsuarioActivo) {

    if (
        !nuevoAvatar ||
        nuevoAvatar === "default"
    ) {

        avatarUsuarioActivo.src =
            "assets/avatars/predeterminado.jpeg";

    } else {

        avatarUsuarioActivo.src =
            nuevoAvatar;

    }

}

            document.getElementById("avatarPerfil").style.setProperty(
                "background",
                nuevoColor,
                "important"
            );

            // Actualizar el texto visible
            document.getElementById(
                "biografiaPerfil"
            ).textContent =
                nuevaBiografia || "Sin biografía";

            // Cerrar formulario
            document.getElementById(
                "formularioEditarPerfil"
            ).style.display = "none";

            mostrarToast(
                "Perfil actualizada correctamente."
            );

        } catch (error) {

            console.error(
                "Error al actualizar la biografía:",
                error
            );

            mostrarToast(
                "No se pudo actualizar la biografía.",
                "error"
            );

        }

    };

}

        document.getElementById("perfilUsuario").style.display =
            "flex";

    } catch (error) {

        console.error(
            "Error al cargar el perfil:",
            error
        );

        mostrarToast(
            "No se pudo cargar el perfil.",
            "error"
        );

    }

}

// =========================================
// CERRAR PERFIL
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const cerrarPerfil =
            document.getElementById("cerrarPerfil");

        if (cerrarPerfil) {

            cerrarPerfil.addEventListener(
                "click",
                function() {

                    document.getElementById("perfilUsuario").style.display =
                        "none";

                }
            );

        }

    }
);

// =========================================
// MENÚ DE ACCIONES DEL USUARIO
// =========================================

let usuarioSeleccionadoId = null;

let conversacionPrivadaActual = null;

let mensajeSeleccionadoId = null;

// =========================================
// CLIC EN NOMBRE DE USUARIO
// =========================================

console.log("LISTENER DE NOMBRE DE USUARIO CARGADO");

document.addEventListener(
    "click",
    function(event) {

        const menu =
            document.getElementById(
                "menuAccionesUsuario"
            );

        if (!menu) {
            return;
        }


        // =========================================
        // SI SE HIZO CLIC DENTRO DEL MENÚ
        // =========================================

        if (
            menu.contains(event.target)
        ) {

            // =========================================
            // BOTÓN REPORTAR
            // =========================================

            const botonReportar =
                event.target.closest(
                    "#accionReportar"
                );

            if (botonReportar) {

                console.log(
                    "SE PRESIONÓ LA OPCIÓN REPORTAR"
                );

                console.log(
                    "Usuario seleccionado:",
                    usuarioSeleccionadoId
                );

                console.log(
                    "Mensaje seleccionado:",
                    mensajeSeleccionadoId
                );


                // =========================================
                // OBTENER USUARIO ACTIVO
                // =========================================

                const usuarioActivoActual =
                    JSON.parse(
                        localStorage.getItem(
                            "usuarioActivo"
                        )
                    );


                if (!usuarioActivoActual) {

                    mostrarToast(
                        "Debes iniciar sesión para reportar.",
                        "error"
                    );

                    return;

                }


                // =========================================
                // VALIDAR USUARIO Y MENSAJE
                // =========================================

                if (
                    !usuarioSeleccionadoId ||
                    !mensajeSeleccionadoId
                ) {

                    mostrarToast(
                        "No se pudo identificar el contenido que deseas reportar.",
                        "error"
                    );

                    return;

                }


                // =========================================
                // OBTENER MODAL DE REPORTE
                // =========================================

                const modalReporte =
                    document.getElementById(
                        "modalReporte"
                    );

                const motivoReporte =
                    document.getElementById(
                        "motivoReporte"
                    );

                const descripcionReporte =
                    document.getElementById(
                        "descripcionReporte"
                    );


                if (
                    !modalReporte ||
                    !motivoReporte ||
                    !descripcionReporte
                ) {

                    console.error(
                        "No se encontró el modal de reporte."
                    );

                    mostrarToast(
                        "No se pudo abrir el formulario de reporte.",
                        "error"
                    );

                    return;

                }


                // =========================================
                // LIMPIAR FORMULARIO
                // =========================================

                motivoReporte.value =
                    "";

                descripcionReporte.value =
                    "";


                // =========================================
                // MOSTRAR MODAL
                // =========================================

                modalReporte.style.display =
                    "flex";


                // =========================================
                // CERRAR MENÚ
                // =========================================

                menu.style.display =
                    "none";


                // =========================================
                // ENFOCAR RAZÓN
                // =========================================

                motivoReporte.focus();

                return;

            }


            // =========================================
            // OTROS BOTONES DEL MENÚ
            // =========================================

            return;

        }


        // =========================================
        // CLIC EN NOMBRE DE USUARIO
        // =========================================

        const nombreUsuario =
            event.target.closest(
                ".nombre-usuario"
            );


        if (!nombreUsuario) {

            // =========================================
            // CUALQUIER OTRO CLIC
            // CERRAR MENÚ
            // =========================================

            menu.style.display =
                "none";

            return;

        }


        // =========================================
        // OBTENER ID DEL USUARIO
        // =========================================

        const idUsuario =
            nombreUsuario.getAttribute(
                "data-usuario-id"
            );


        if (!idUsuario) {
            return;
        }


        usuarioSeleccionadoId =
            Number(idUsuario);


        // =========================================
        // OBTENER ID DEL MENSAJE
        // =========================================

        const comentario =
            nombreUsuario.closest(
                ".comentario"
            );


        if (comentario) {

            mensajeSeleccionadoId =
                Number(
                    comentario.getAttribute(
                        "data-mensaje-id"
                    )
                );

        } else {

            mensajeSeleccionadoId =
                null;

        }


        console.log(
            "Usuario seleccionado:",
            usuarioSeleccionadoId
        );

        console.log(
            "Mensaje seleccionado:",
            mensajeSeleccionadoId
        );


        // =========================================
        // ACTUALIZAR BOTÓN BLOQUEAR
        // =========================================

        actualizarBotonBloqueo(
            usuarioSeleccionadoId
        );


// =========================================
// OBTENER POSICIÓN DEL NOMBRE
// =========================================

const rect =
    nombreUsuario.getBoundingClientRect();


// =========================================
// OBTENER TAMAÑO DEL MENÚ
// =========================================

menu.style.display =
    "block";

const anchoMenu =
    menu.offsetWidth;

const altoMenu =
    menu.offsetHeight;


// =========================================
// POSICIÓN HORIZONTAL
// =========================================

let posicionX =
    rect.left;


// Evitar que el menú salga por la derecha

if (
    posicionX + anchoMenu >
    window.innerWidth
) {

    posicionX =
        window.innerWidth -
        anchoMenu -
        10;

}


// Evitar que salga por la izquierda

if (
    posicionX < 10
) {

    posicionX = 10;

}


// =========================================
// POSICIÓN VERTICAL
// =========================================

let posicionY =
    rect.bottom + 5;


// Si no hay espacio debajo,
// mostrar el menú encima

if (
    posicionY + altoMenu >
    window.innerHeight
) {

    posicionY =
        rect.top -
        altoMenu -
        5;

}


// Si tampoco hay espacio arriba,
// mantenerlo dentro de la pantalla

if (
    posicionY < 10
) {

    posicionY = 10;

}


// =========================================
// APLICAR POSICIÓN
// =========================================

menu.style.left =
    posicionX + "px";

menu.style.top =
    posicionY + "px";


// =========================================
// MOSTRAR MENÚ
// =========================================

menu.style.display =
    "block";


        // =========================================
        // MOSTRAR MENÚ
        // =========================================

            console.log(
                "MENÚ ENCONTRADO:",
                menu
            );

            console.log(
                "DISPLAY ANTES:",
                menu.style.display
            );

            console.log(
                "POSICIÓN:",
                menu.style.left,
                menu.style.top
            );

        menu.style.display =
            "block";

        menu.style.position =
            "fixed";

        menu.style.zIndex =
            "999999";

        menu.style.background =
            "white";

        menu.style.color =
            "black";

        menu.style.border =
            "2px solid black";

    }
);

// =========================================
// ENVIAR REPORTE DESDE EL MODAL
// =========================================

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.id !==
            "enviarReporte"
        ) {
            return;
        }


        // =========================================
        // OBTENER ELEMENTOS
        // =========================================

        const motivoReporte =
            document.getElementById(
                "motivoReporte"
            );

        const descripcionReporte =
            document.getElementById(
                "descripcionReporte"
            );

        const modalReporte =
            document.getElementById(
                "modalReporte"
            );


        if (
            !motivoReporte ||
            !descripcionReporte ||
            !modalReporte
        ) {

            console.error(
                "No se encontraron los elementos del reporte."
            );

            return;

        }


        // =========================================
        // OBTENER DATOS
        // =========================================

        const motivo =
            motivoReporte.value.trim();

        const descripcion =
            descripcionReporte.value.trim();


        // =========================================
        // VALIDAR RAZÓN
        // =========================================

        if (!motivo) {

            mostrarToast(
                "Selecciona una razón para el reporte.",
                "error"
            );

            motivoReporte.focus();

            return;

        }


        // =========================================
        // VALIDAR DESCRIPCIÓN
        // =========================================

        if (!descripcion) {

            mostrarToast(
                "Describe brevemente el motivo del reporte.",
                "error"
            );

            descripcionReporte.focus();

            return;

        }


        // =========================================
        // VALIDAR USUARIO Y MENSAJE
        // =========================================

        if (
            !usuarioSeleccionadoId ||
            !mensajeSeleccionadoId
        ) {

            mostrarToast(
                "No se pudo identificar el contenido que deseas reportar.",
                "error"
            );

            return;

        }


        // =========================================
        // OBTENER USUARIO ACTIVO
        // =========================================

        const usuarioActivoActual =
            JSON.parse(
                localStorage.getItem(
                    "usuarioActivo"
                )
            );


        if (!usuarioActivoActual) {

            mostrarToast(
                "Debes iniciar sesión para reportar.",
                "error"
            );

            return;

        }


        // =========================================
        // ENVIAR AL BACKEND
        // =========================================

        fetch(
            "https://small-adventure.onrender.com/api/reports",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    id_user_repo:
                        Number(
                            usuarioActivoActual.id
                        ),

                    id_repo_user:
                        Number(
                            usuarioSeleccionadoId
                        ),

                    id_mens:
                        Number(
                            mensajeSeleccionadoId
                        ),

                    repo_motive:
                        motivo,

                    repo_description:
                        descripcion

                })

            }
        )

        .then(function(respuesta) {

            return respuesta.json();

        })

        .then(function(datos) {

            console.log(
                "Respuesta del reporte:",
                datos
            );


            if (datos.error) {

                throw new Error(
                    datos.error
                );

            }


            // =========================================
            // CERRAR MODAL
            // =========================================

            modalReporte.style.display =
                "none";


            // =========================================
            // LIMPIAR FORMULARIO
            // =========================================

            motivoReporte.value =
                "";

            descripcionReporte.value =
                "";


            mostrarToast(
                "El reporte fue enviado correctamente y será revisado por los administradores.",
                "info"
            );

        })

        .catch(function(error) {

            console.error(
                "Error al enviar reporte:",
                error
            );

            mostrarToast(
                "No se pudo enviar el reporte.",
                "error"
            );

        });

    }
);

// =========================================
// CERRAR MODAL DE REPORTE
// =========================================

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.id !==
                "cancelarReporte" &&
            event.target.id !==
                "cerrarModalReporte"
        ) {
            return;
        }


        const modalReporte =
            document.getElementById(
                "modalReporte"
            );

        const motivoReporte =
            document.getElementById(
                "motivoReporte"
            );

        const descripcionReporte =
            document.getElementById(
                "descripcionReporte"
            );


        if (modalReporte) {

            modalReporte.style.display =
                "none";

        }


        if (motivoReporte) {

            motivoReporte.value =
                "";

        }


        if (descripcionReporte) {

            descripcionReporte.value =
                "";

        }

    }
);

// =========================================
// ACCIÓN: VER PERFIL
// =========================================

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.id !==
            "accionVerPerfil"
        ) {
            return;
        }

        if (!usuarioSeleccionadoId) {

            console.error(
                "No hay un usuario seleccionado."
            );

            return;
        }

        const menu =
            document.getElementById(
                "menuAccionesUsuario"
            );

        if (menu) {

            menu.style.display =
                "none";

        }

        console.log(
            "Abriendo perfil del usuario:",
            usuarioSeleccionadoId
        );

        mostrarPerfil(
            usuarioSeleccionadoId
        );

    }
);

// =========================================
// ACCIÓN: MENSAJE PRIVADO
// =========================================

document.addEventListener(
    "click",
    async function(event) {

        if (
            event.target.id !==
            "accionMensaje"
        ) {
            return;
        }

        if (!usuarioSeleccionadoId) {

            console.error(
                "No hay un usuario seleccionado."
            );

            return;
        }

        if (!usuarioActivo) {

            console.error(
                "No hay un usuario activo."
            );

            return;
        }

        // =========================================
        // NO PERMITIR MENSAJE A UNO MISMO
        // =========================================

        if (
            Number(usuarioActivo.id) ===
            Number(usuarioSeleccionadoId)
        ) {

            mostrarToast(
                "No puedes enviarte mensajes a ti mismo.",
                "error"
            );

            return;
        }

        // =========================================
        // COMPROBAR SI EL USUARIO ESTÁ BLOQUEADO
        // =========================================

        const estaBloqueado =
            await obtenerEstadoBloqueo(
                usuarioSeleccionadoId
            );

        if (estaBloqueado) {

            mostrarToast(
                "No puedes enviar mensajes a un usuario que has bloqueado.",
                "error"
            );

            return;

        }

        // =========================================
        // CERRAR MENÚ
        // =========================================

        const menu =
            document.getElementById(
                "menuAccionesUsuario"
            );

        if (menu) {

            menu.style.display =
                "none";

        }

        try {

            // =========================================
            // BUSCAR / CREAR CONVERSACIÓN
            // =========================================

            const respuesta =
                await fetch(
                    "https://small-adventure.onrender.com/api/conversations/private",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            id_user_1:
                                usuarioActivo.id,

                            id_user_2:
                                usuarioSeleccionadoId

                        })
                    }
                );

            const datos =
                await respuesta.json();

            if (!respuesta.ok) {

                let mensajeError =
                    datos.error ||
                    "No se pudo abrir la conversación";

                if (
                    datos.usin_date_end
                ) {

                    const fechaFin =
                        new Date(
                            datos.usin_date_end
                        );

                    mensajeError +=
                        " Podrás volver a enviar mensajes el " +
                        fechaFin.toLocaleString("es-CO", {
                            dateStyle: "long",
                            timeStyle: "short"
                        }) +
                        ".";

                }

                throw new Error(
                    mensajeError
                );
            }

            console.log(
                "Conversación privada:",
                datos
            );

            // =========================================
            // GUARDAR CONVERSACIÓN ACTUAL
            // =========================================

            conversacionPrivadaActual =
                datos.id_conv;

            console.log(
                "ID de conversación:",
                datos.id_conv
            );

            // =========================================
            // BUSCAR USUARIO SELECCIONADO
            // =========================================

            const usuario =
                usuariosBD.find(
                    function(usuario) {

                        return Number(
                            usuario.id_user
                        ) === Number(
                            usuarioSeleccionadoId
                        );

                    }
                );

            // =========================================
            // MOSTRAR NOMBRE
            // =========================================

            const chatPrivadoNombre =
                document.getElementById(
                    "chatPrivadoNombre"
                );

            if (
                chatPrivadoNombre &&
                usuario
            ) {

                chatPrivadoNombre.textContent =
                    usuario.user_name;

            }

            // =========================================
            // MOSTRAR AVATAR
            // =========================================

            const chatPrivadoAvatar =
                document.getElementById(
                    "chatPrivadoAvatar"
                );

            if (
                chatPrivadoAvatar &&
                usuario
            ) {

                chatPrivadoAvatar.innerHTML =
                    "";

                if (
                    usuario.prof_avatar &&
                    usuario.prof_avatar !==
                    "default"
                ) {

                    const imagen =
                        document.createElement(
                            "img"
                        );

                    imagen.src =
                        usuario.prof_avatar;

                    imagen.alt =
                        "Avatar de " +
                        usuario.user_name;

                    chatPrivadoAvatar.appendChild(
                        imagen
                    );

                }

            }

            // =========================================
            // ABRIR CHAT PRIVADO
            // =========================================

            const chatPrivado =
                document.getElementById(
                    "chatPrivado"
                );

            if (!chatPrivado) {

                console.error(
                    "No existe el elemento chatPrivado."
                );

                return;

            }

            chatPrivado.style.display =
                "flex";

            setTimeout(
            function() {

                console.log(
                    "VERIFICACIÓN CHAT DESPUÉS DEL CLIC:",
                    chatPrivado.style.display
                );

                console.log(
                    "VISIBILIDAD:",
                    getComputedStyle(chatPrivado).display
                );

                console.log(
                    "CHAT:",
                    chatPrivado
                );

            },
            500
        );

            console.log(
                "CHAT PRIVADO ABIERTO:",
                chatPrivado.style.display
            );

            // =========================================
            // CARGAR MENSAJES
            // =========================================

            await cargarMensajesPrivados(
                datos.id_conv
            );

            // =========================================
            // LIMPIAR CAMPO DE MENSAJE
            // =========================================

            const inputMensaje =
                document.getElementById(
                    "mensajePrivado"
                );

            if (inputMensaje) {

                inputMensaje.value =
                    "";

                inputMensaje.focus();

            }

        } catch (error) {

            console.error(
                "Error al abrir conversación privada:",
                error
            );

            mostrarToast(
                error.message,
                "error"
            );

        }

    }
);

// =========================================
// ACCIÓN: SILENCIAR
// =========================================

document.addEventListener(
    "click",
    async function(event) {

        if (
            event.target.id !==
            "accionSilenciar"
        ) {

            return;

        }

        if (!usuarioSeleccionadoId) {

            console.error(
                "No hay un usuario seleccionado."
            );

            return;

        }

        if (!usuarioActivo) {

            console.error(
                "No hay un usuario activo."
            );

            return;

        }

        try {

            const respuesta =
                await fetch(
                    "https://small-adventure.onrender.com/api/interactions/silenciar",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            id_original_user:
                                usuarioActivo.id,

                            id_user_dest:
                                usuarioSeleccionadoId

                        })
                    }
                );

            const datos =
                await respuesta.json();

            if (!respuesta.ok) {

                throw new Error(
                    datos.error ||
                    "No se pudo silenciar al usuario"
                );

            }


            // =========================================
            // ACTUALIZAR LISTA LOCAL
            // =========================================

            const idUsuario =
                Number(
                    usuarioSeleccionadoId
                );

            if (
                !usuariosSilenciados.includes(
                    idUsuario
                )
            ) {

                usuariosSilenciados.push(
                    idUsuario
                );

            }


            // =========================================
            // CERRAR MENÚ
            // =========================================

            const menu =
                document.getElementById(
                    "menuAccionesUsuario"
                );

            if (menu) {

                menu.style.display =
                    "none";

            }


            console.log(
                "Usuario silenciado:",
                usuarioSeleccionadoId
            );

            console.log(
                "Usuarios silenciados:",
                usuariosSilenciados
            );


            // =========================================
            // RECARGAR MENSAJES
            // =========================================

            await cargarMensajesDesdeBD();


            mostrarToast(
                "Usuario silenciado correctamente."
            );

        } catch (error) {

            console.error(
                "Error al silenciar usuario:",
                error
            );

            mostrarToast(
                error.message,
                "error"
            );

        }

    }
);



// =========================================
// BLOQUEAR / DESBLOQUEAR USUARIO
// =========================================

document.addEventListener(
    "click",
    async function(event) {

        if (
            event.target.id !==
            "accionBloquear"
        ) {
            return;
        }

        if (!usuarioSeleccionadoId) {
            console.error(
                "No hay un usuario seleccionado."
            );
            return;
        }

        if (!usuarioActivo) {
            console.error(
                "No hay un usuario activo."
            );
            return;
        }

        try {

            const estaBloqueado =
                await obtenerEstadoBloqueo(
                    usuarioSeleccionadoId
                );


            // =========================================
            // DESBLOQUEAR
            // =========================================

            if (estaBloqueado) {

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/interactions/bloquear",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                id_user_original:
                                    usuarioActivo.id,

                                id_user_dest:
                                    usuarioSeleccionadoId

                            })
                        }
                    );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    throw new Error(
                        datos.error ||
                        "No se pudo desbloquear al usuario"
                    );

                }

                usuariosBloqueados =
                    usuariosBloqueados.filter(
                        function(id) {

                            return Number(id) !==
                                Number(
                                    usuarioSeleccionadoId
                                );

                        }
                    );

                console.log(
                    "Usuario desbloqueado:",
                    usuarioSeleccionadoId
                );

                mostrarToast(
                    "Usuario desbloqueado correctamente."
                );

            }


            // =========================================
            // BLOQUEAR
            // =========================================

            else {

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/interactions/bloquear",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                id_original_user:
                                    usuarioActivo.id,

                                id_user_dest:
                                    usuarioSeleccionadoId

                            })
                        }
                    );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    throw new Error(
                        datos.error ||
                        "No se pudo bloquear al usuario"
                    );

                }

                usuariosBloqueados.push(
                    Number(
                        usuarioSeleccionadoId
                    )
                );

                console.log(
                    "Usuario bloqueado:",
                    usuarioSeleccionadoId
                );

                mostrarToast(
                    "Usuario bloqueado correctamente."
                );

            }


            // Cerrar menú

            const menu =
                document.getElementById(
                    "menuAccionesUsuario"
                );

            if (menu) {
                menu.style.display = "none";
            }


        } catch (error) {

            console.error(
                "Error al bloquear/desbloquear usuario:",
                error
            );

            mostrarToast(
                error.message,
                "error"
            );

        }

    }
);

// =========================================
// ACCIÓN: SILENCIAR / DEJAR DE SILENCIAR DESDE PERFIL
// =========================================

document.addEventListener(
    "click",
    async function(event) {

        if (
            event.target.id !==
            "btnSilenciarPerfil"
        ) {
            return;
        }

        if (!usuarioSeleccionadoId) {

            console.error(
                "No hay un usuario seleccionado."
            );

            return;

        }

        if (!usuarioActivo) {

            console.error(
                "No hay un usuario activo."
            );

            return;

        }

        try {

            const estaSilenciado =
                await obtenerEstadoSilencio(
                    usuarioSeleccionadoId
                );

            // =========================================
            // DEJAR DE SILENCIAR
            // =========================================

            if (estaSilenciado) {

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/interactions/silenciar",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                id_user_original:
                                    usuarioActivo.id,

                                id_user_dest:
                                    usuarioSeleccionadoId

                            })
                        }
                    );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    throw new Error(
                        datos.error ||
                        "No se pudo dejar de silenciar al usuario"
                    );

                }

                // Actualizar lista local
                usuariosSilenciados =
                    usuariosSilenciados.filter(
                        function(id) {

                            return Number(id) !==
                                Number(usuarioSeleccionadoId);

                        }
                    );

                event.target.textContent =
                    "🔇 Silenciar";

                mostrarToast(
                    "Usuario dejado de silenciar correctamente."
                );

                await cargarMensajesDesdeBD();

            }

            // =========================================
            // SILENCIAR
            // =========================================

            else {

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/interactions/silenciar",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                id_original_user:
                                    usuarioActivo.id,

                                id_user_dest:
                                    usuarioSeleccionadoId

                            })
                        }
                    );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    throw new Error(
                        datos.error ||
                        "No se pudo silenciar al usuario"
                    );

                }

                // Agregar a la lista local
                usuariosSilenciados.push(
                    Number(usuarioSeleccionadoId)
                );

                event.target.textContent =
                    "🔊 Dejar de silenciar";

                mostrarToast(
                    "Usuario silenciado correctamente."
                );

                await cargarMensajesDesdeBD();

            }

        } catch (error) {

            console.error(
                "Error al cambiar estado de silencio:",
                error
            );

            mostrarToast(
                error.message,
                "error"
            );

        }

    }
);

// =========================================
// MOSTRAR CATEGORÍAS
// =========================================

function ocultarTodo() {

    document.getElementById("general").style.display = "none";
    document.getElementById("espanol").style.display = "none";
    document.getElementById("ingles").style.display = "none";
    document.getElementById("portugues").style.display = "none";

}

// =========================================
// MOSTRAR / OCULTAR CAJA DE COMENTARIOS
// =========================================

function controlarCajaComentarios() {

    const caja =
        document.querySelector(".contenedor");

    if (!caja) {
        return;
    }

    // Información General
    // Solo administradores pueden publicar

    if (
        categoriaActual === "general" &&
        !esAdmin
    ) {

        caja.style.display = "none";

    } else {

        caja.style.display = "block";

    }

}

function mostrarGeneral() {

    categoriaActual = "general";

    ocultarTodo();

    document.getElementById("general").style.display = "block";

    controlarCajaComentarios();

    cargarMensajesDesdeBD();

}


function mostrarEspanol() {

    categoriaActual = "espanol";

    ocultarTodo();

    document.getElementById("espanol").style.display = "block";

    controlarCajaComentarios();

    cargarMensajesDesdeBD();

}


function mostrarIngles() {

    categoriaActual = "ingles";

    ocultarTodo();

    document.getElementById("ingles").style.display = "block";

    controlarCajaComentarios();

    cargarMensajesDesdeBD();

}


function mostrarPortugues() {

    categoriaActual = "portugues";

    ocultarTodo();

    document.getElementById("portugues").style.display = "block";

    controlarCajaComentarios();

    cargarMensajesDesdeBD();

}

// =========================================
// OCULTAR NOTIFICACIONES
// =========================================

function ocultarNotificaciones() {

    // Ocultar todos los botones de notificaciones
    // Ocultar el botón de notificaciones

    document
        .querySelectorAll("#btnNotificaciones")
        .forEach(function(boton) {

            boton.style.display = "none";

        });


    // Ocultar panel lateral

    document
        .querySelectorAll("#panelLateralNotificaciones")
        .forEach(function(panel) {

            panel.style.display = "none";

        });


    // Ocultar panel de contenido

    document
        .querySelectorAll("#panelNotificaciones")
        .forEach(function(panel) {

            panel.style.display = "none";

        });

}


// =========================================
// MOSTRAR NOTIFICACIONES
// =========================================

function mostrarNotificaciones() {

    document
        .querySelectorAll("#btnNotificaciones")
        .forEach(function(boton) {

            boton.style.display = "";

        });


    document
        .querySelectorAll("#panelLateralNotificaciones")
        .forEach(function(panel) {

            panel.style.display = "";

        });

}

// =========================================
// ENTRAR AL FORO
// =========================================

function entrarForo() {

    document
        .getElementById("bienvenida")
        .style.display = "none";


    document
        .getElementById("menuForo")
        .style.display = "block";


    document
        .getElementById("contenidoForo")
        .style.display = "block";


    // =========================================
    // MOSTRAR NOTIFICACIONES
    // =========================================

    mostrarNotificaciones();


    // =========================================
    // MOSTRAR CAJA DE MENSAJES
    // =========================================

    const contenedorMensajes =
        document.getElementById(
            "contenedorMensajes"
        );

    if (contenedorMensajes) {

        contenedorMensajes.style.display =
            "block";

    }


    // =========================================
    // MOSTRAR PANEL DE ADMINISTRACIÓN
    // DESPUÉS DE ACEPTAR LAS REGLAS
    // =========================================

    const panelAdmin =
        document.getElementById(
            "panelAdmin"
        );

        if (panelAdmin && esAdmin) {
            console.log("1. Entró al bloque de administrador");

            panelAdmin.style.display = "block";

            const layoutForo = document.getElementById("layoutForo");

            if (layoutForo) {
                layoutForo.classList.add("admin-activo");

                console.log(
                    "2. Clase aplicada:",
                    layoutForo.classList.contains("admin-activo")
                );
            } else {
                console.log("2. No se encontró layoutForo");
            }
        } else {
            console.log("No entró al bloque:", {
                panelAdminEncontrado: !!panelAdmin,
                esAdmin: esAdmin
            });
        }

        console.log(
            "Panel de administración mostrado."
        );

    }


    mostrarGeneral();

    cargarNotificacionesDesdeBD();



// =========================================
// CREAR ADMINISTRADOR
// =========================================

const botonCrearAdministrador =
    document.getElementById(
        "btnCrearAdministrador"
    );

console.log(
    "BOTÓN CREAR ADMINISTRADOR:",
    botonCrearAdministrador
);

const formularioCrearAdministrador =
    document.getElementById(
        "formularioCrearAdministrador"
    );

console.log(
    "FORMULARIO CREAR ADMINISTRADOR:",
    formularioCrearAdministrador
);

const botonCancelarCrearAdministrador =
    document.getElementById(
        "cancelarCrearAdministrador"
    );


const botonGuardarCrearAdministrador =
    document.getElementById(
        "guardarCrearAdministrador"
    );

// =========================================
// ABRIR FORMULARIO
// =========================================

if (botonCrearAdministrador) {

    botonCrearAdministrador.addEventListener(
        "click",
        function() {

            if (!esAdmin) {

                mostrarToast(
                    "No tienes permisos para crear administradores.",
                    "error"
                );

                return;
            }

            if (formularioCrearAdministrador) {

                formularioCrearAdministrador.style.display =
                    "block";

            }

        }
    );

}

// =========================================
// CERRAR FORMULARIO
// =========================================

if (botonCancelarCrearAdministrador) {

    botonCancelarCrearAdministrador.addEventListener(
        "click",
        function() {

            if (formularioCrearAdministrador) {

                formularioCrearAdministrador.style.display =
                    "none";

            }

            const nombre =
                document.getElementById(
                    "nuevoAdminNombre"
                );

            const correo =
                document.getElementById(
                    "nuevoAdminCorreo"
                );

            const password =
                document.getElementById(
                    "nuevoAdminPassword"
                );

            if (nombre) {
                nombre.value = "";
            }

            if (correo) {
                correo.value = "";
            }

            if (password) {
                password.value = "";
            }

        }
    );

}

// =========================================
// GUARDAR ADMINISTRADOR
// =========================================

if (botonGuardarCrearAdministrador) {

    botonGuardarCrearAdministrador.addEventListener(
        "click",
        async function() {

            // =========================================
            // COMPROBAR SESIÓN
            // =========================================

            if (
                !usuarioActivo ||
                !usuarioActivo.id
            ) {

                mostrarToast(
                    "No se encontró el usuario administrador activo.",
                    "error"
                );

                return;
            }

            // =========================================
            // OBTENER CAMPOS
            // =========================================

            const nombre =
                document.getElementById(
                    "nuevoAdminNombre"
                );

            const correo =
                document.getElementById(
                    "nuevoAdminCorreo"
                );

            const password =
                document.getElementById(
                    "nuevoAdminPassword"
                );

            if (
                !nombre ||
                !correo ||
                !password
            ) {

                mostrarToast(
                    "No se encontraron los campos del formulario.",
                    "error"
                );

                return;
            }

            // =========================================
            // VALIDAR CAMPOS VACÍOS
            // =========================================

            if (
                nombre.value.trim() === "" ||
                correo.value.trim() === "" ||
                password.value.trim() === ""
            ) {

                mostrarToast(
                    "Todos los campos son obligatorios.",
                    "error"
                );

                return;
            }

            // =========================================
            // ENVIAR AL BACKEND
            // =========================================

            try {

                const respuesta =
                    await fetch(
                        "https://small-adventure.onrender.com/api/admin/users",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                user_name:
                                    nombre.value.trim(),

                                user_mail:
                                    correo.value.trim(),

                                user_password:
                                    password.value,

                                id_user:
                                    usuarioActivo.id

                            })

                        }
                    );

                const datos =
                    await respuesta.json();

                console.log(
                    "Respuesta al crear administrador:",
                    datos
                );

                // =========================================
                // ERROR DEL SERVIDOR
                // =========================================

                if (!respuesta.ok) {

                    throw new Error(
                        datos.error ||
                        "No se pudo crear el administrador."
                    );

                }

                // =========================================
                // ÉXITO
                // =========================================

                mostrarToast(
                    "Administrador creado correctamente.",
                    "info"
                );

                // =========================================
                // LIMPIAR FORMULARIO
                // =========================================

                nombre.value = "";
                correo.value = "";
                password.value = "";

                // =========================================
                // CERRAR FORMULARIO
                // =========================================

                if (formularioCrearAdministrador) {

                    formularioCrearAdministrador.style.display =
                        "none";

                }

            } catch (error) {

                console.error(
                    "Error al crear administrador:",
                    error
                );

                mostrarToast(
                    error.message ||
                    "No se pudo crear el administrador.",
                    "error"
                );

            }

        }
    );

}

// =========================================
// MOSTRAR / OCULTAR NOTIFICACIONES
// =========================================

document.addEventListener(
    "click",
    async function(event) {

        const boton =
            event.target.closest(
                "#btnNotificaciones"
            );

        if (!boton) {
            return;
        }


        const panel =
            document.getElementById(
                "panelNotificaciones"
            );

        const lista =
            document.getElementById(
                "listaNotificaciones"
            );


        if (!panel || !lista) {
            return;
        }


        // =========================================
        // OCULTAR SI YA ESTÁ ABIERTO
        // =========================================

        if (
            panel.style.display === "block"
        ) {

            panel.style.display = "none";

            return;

        }


        // =========================================
        // CARGAR NOTIFICACIONES
        // =========================================

        const notificaciones =
            await cargarNotificacionesDesdeBD();


        lista.innerHTML = "";


        // =========================================
        // SIN NOTIFICACIONES
        // =========================================

        if (
            !notificaciones ||
            notificaciones.length === 0
        ) {

            lista.innerHTML =
                "<p>No tienes notificaciones.</p>";

            panel.style.display = "block";

            return;

        }


        // =========================================
        // MOSTRAR NOTIFICACIONES
        // =========================================

        notificaciones.forEach(
    function(notificacion) {

        const elemento =
            document.createElement("div");

        elemento.classList.add(
            "notificacion"
        );


        // =========================================
        // GUARDAR ID DE LA NOTIFICACIÓN
        // =========================================

        elemento.setAttribute(
            "data-notificacion-id",
            notificacion.id_notificacion
        );


        // =========================================
        // GUARDAR ESTADO
        // =========================================

        elemento.setAttribute(
            "data-notificacion-status",
            notificacion.noti_status
        );


        // =========================================
        // CLASE PARA NOTIFICACIONES NO LEÍDAS
        // =========================================

        if (
            notificacion.noti_status ===
            "no_leida"
        ) {

            elemento.classList.add(
                "notificacion-no-leida"
            );

        }


        // =========================================
        // CONTENIDO
        // =========================================

        elemento.innerHTML = `
            <strong>
                ${notificacion.noti_type}
            </strong>

            <p>
                ${notificacion.noti_content}
            </p>

            <small>
                ${notificacion.noti_status}
            </small>
        `;


        lista.appendChild(
            elemento
        );

    }
);


        panel.style.display = "block";

    }
);

// =========================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// =========================================

document.addEventListener(
    "click",
    async function(event) {

        const notificacion =
            event.target.closest(
                ".notificacion"
            );


        if (!notificacion) {
            return;
        }


        const estado =
            notificacion.getAttribute(
                "data-notificacion-status"
            );


        // =========================================
        // SI YA ESTÁ LEÍDA, NO HACER NADA
        // =========================================

        if (
            estado !== "no_leida"
        ) {
            return;
        }


        const idNotificacion =
            notificacion.getAttribute(
                "data-notificacion-id"
            );


        if (!idNotificacion) {

            console.error(
                "No se encontró el ID de la notificación."
            );

            return;

        }


        try {

            const respuesta =
                await fetch(
                    "https://small-adventure.onrender.com/api/notifications/" +
                    idNotificacion,
                    {
                        method: "PUT"
                    }
                );


            const datos =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    datos.error ||
                    "No se pudo marcar la notificación como leída."
                );

            }


            // =========================================
            // ACTUALIZAR VISUALMENTE
            // =========================================

            notificacion.classList.remove(
                "notificacion-no-leida"
            );


            notificacion.setAttribute(
                "data-notificacion-status",
                "leida"
            );


            const estadoVisual =
                notificacion.querySelector(
                    "small"
                );


            if (estadoVisual) {

                estadoVisual.textContent =
                    "leida";

            }

            // =========================================
            // ACTUALIZAR CONTADOR
            // =========================================

            cargarNotificacionesDesdeBD();


            console.log(
                "Notificación marcada como leída:",
                idNotificacion
            );


        } catch (error) {

            console.error(
                "Error al marcar notificación como leída:",
                error
            );

        }

    }
);

// =========================================
// AGREGAR COMENTARIOS
// =========================================

async function traducirTexto(
    texto,
    idiomaOrigen,
    idiomaDestino
) {

    try {

        const respuesta =
            await fetch(
                "http://127.0.0.1:5000/translate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        q: texto,
                        source: idiomaOrigen,
                        target: idiomaDestino,
                        format: "text"
                    })
                }
            );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo traducir el texto."
            );

        }

        const datos =
            await respuesta.json();

        return datos.translatedText;

    }
    catch (error) {

        console.error(
            "Error al traducir:",
            error
        );

        return null;

    }

}

function mostrarTraduccion(
    comentario,
    idiomaDestino,
    traduccion
) {

    const traduccionExistente =
        comentario.querySelector(
            ".traduccion-mensaje[data-idioma='" +
            idiomaDestino +
            "']"
        );

    if (traduccionExistente) {
        traduccionExistente.remove();
    }

    const bloqueTraduccion =
        document.createElement("div");

    bloqueTraduccion.classList.add(
        "traduccion-mensaje"
    );

    bloqueTraduccion.dataset.idioma =
        idiomaDestino;

    // =========================================
    // TÍTULO
    // =========================================

    const tituloTraduccion =
        document.createElement("div");

    tituloTraduccion.classList.add(
        "titulo-traduccion"
    );

    if (idiomaDestino === "es") {

        tituloTraduccion.textContent =
            "🌐 Traducción · Español";

    }
    else if (idiomaDestino === "en") {

        tituloTraduccion.textContent =
            "🌐 Traducción · English";

    }
    else if (idiomaDestino === "pt") {

        tituloTraduccion.textContent =
            "🌐 Traducción · Português";

    }

    // =========================================
    // BOTÓN CERRAR
    // =========================================

    const botonCerrarTraduccion =
        document.createElement("button");

    botonCerrarTraduccion.type = "button";

    botonCerrarTraduccion.textContent =
        "✕";

    botonCerrarTraduccion.classList.add(
        "boton-cerrar-traduccion"
    );

    botonCerrarTraduccion.onclick =
        function() {

            bloqueTraduccion.remove();

        };

    // =========================================
    // CABECERA
    // =========================================

    const cabeceraTraduccion =
        document.createElement("div");

    cabeceraTraduccion.classList.add(
        "cabecera-traduccion"
    );

    cabeceraTraduccion.appendChild(
        tituloTraduccion
    );

    cabeceraTraduccion.appendChild(
        botonCerrarTraduccion
    );

    bloqueTraduccion.appendChild(
        cabeceraTraduccion
    );

    // =========================================
    // TEXTO TRADUCIDO
    // =========================================

    const textoTraduccion =
        document.createElement("div");

    textoTraduccion.classList.add(
        "texto-traduccion"
    );

    textoTraduccion.textContent =
        traduccion;

    bloqueTraduccion.appendChild(
        textoTraduccion
    );

    // =========================================
    // MOSTRAR TRADUCCIÓN
    // =========================================

    comentario.appendChild(
        bloqueTraduccion
    );
}

async function agregarComentario() {

    usuarioActivo = JSON.parse(
        localStorage.getItem("usuarioActivo")
    );

    let nombre = usuarioActivo.nombre;

    let mensaje =
        document.getElementById("mensaje").value.trim();

// =========================================
// COMPROBAR SILENCIO POR MODERACIÓN
// =========================================

const estadoSilencio =
    await comprobarSilencioModeracion();

if (estadoSilencio.silenciado) {

    let mensajeSilencio =
        "No puedes enviar mensajes porque estás silenciado temporalmente.";

    if (estadoSilencio.usin_date_end) {

        const fechaFin =
            new Date(
                estadoSilencio.usin_date_end
            );

        mensajeSilencio +=
            " Podrás volver a enviar mensajes el " +
            fechaFin.toLocaleString("es-CO", {
                dateStyle: "long",
                timeStyle: "short"
            }) +
            ".";

    }

    mostrarToast(
        mensajeSilencio,
        "error"
    );

    return;

}


// =========================================
// COMPROBAR BLOQUEO TEMPORAL
// POR MODERACIÓN
// =========================================

try {

    const respuestaBloqueo =
        await fetch(
            "https://small-adventure.onrender.com/api/interactions/bloqueo/" +
            usuarioActivo.id
        );

    const datosBloqueo =
        await respuestaBloqueo.json();

    if (!respuestaBloqueo.ok) {

        throw new Error(
            datosBloqueo.error ||
            "No se pudo comprobar el bloqueo"
        );

    }

    if (datosBloqueo.bloqueado) {

        let mensajeBloqueo =
            "No puedes enviar mensajes porque estás bloqueado temporalmente.";

        if (datosBloqueo.interaccion &&
            datosBloqueo.interaccion.usin_date_end) {

            const fechaFin =
                new Date(
                    datosBloqueo.interaccion.usin_date_end
                );

            mensajeBloqueo +=
                " Podrás volver a enviar mensajes el " +
                fechaFin.toLocaleString("es-CO", {
                    dateStyle: "long",
                    timeStyle: "short"
                }) +
                ".";

        }

        mostrarToast(
            mensajeBloqueo,
            "error"
        );

        return;

    }

} catch (error) {

    console.error(
        "Error al comprobar bloqueo de moderación:",
        error
    );

}

    let archivo =
        document.getElementById("imagenMensaje").files[0];


    // =========================================
    // VALIDAR QUE HAYA TEXTO O IMAGEN
    // =========================================

    if (mensaje === "" && !archivo) {

        mostrarToast(
            "Escribe un comentario o selecciona una imagen.",
            "error"
        );

        return;

    }


    try {

        // =========================================
        // CREAR FORM DATA
        // =========================================

        const datosFormulario =
            new FormData();

        datosFormulario.append(
            "id_user",
            usuarioActivo.id
        );

        datosFormulario.append(
            "mens_content",
            mensaje
        );

        datosFormulario.append(
            "mens_status",
            "activo"
        );

        // =========================================
        // MENSAJE PADRE
        // =========================================

        // Si estamos respondiendo,
        // guardar el ID del mensaje al que respondemos.
        // Si es un comentario normal, enviar null.

        datosFormulario.append(
            "id_mens_fath",
            panelEnModoRespuesta
                ? mensajePadreRespuesta
                : ""
        );

// =========================================
// DETERMINAR CANAL ACTUAL
// =========================================

let idCanal;

if (categoriaActual === "general") {

    idCanal = 1;

}

else if (categoriaActual === "espanol") {

    idCanal = 2;

}

else if (categoriaActual === "ingles") {

    idCanal = 3;

}

else if (categoriaActual === "portugues") {

    idCanal = 4;

}


// =========================================
// AGREGAR CANAL AL FORM DATA
// =========================================

datosFormulario.append(
    "id_chan",
    idCanal
);


        // =========================================
        // AGREGAR IMAGEN SI EXISTE
        // =========================================

        if (archivo) {

            datosFormulario.append(
                "mens_image",
                archivo
            );

        }


        // =========================================
        // ENVIAR A MYSQL / BACKEND
        // =========================================

        const respuesta = await fetch(
            "https://small-adventure.onrender.com/api/messages",
            {
                method: "POST",

                body: datosFormulario
            }
        );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo guardar el mensaje"
            );

        }


        const datos =
            await respuesta.json();


        console.log(
            "Mensaje guardado en MySQL:",
            datos
        );


        // =========================================
        // CREAR ELEMENTO DEL MENSAJE
        // =========================================

        let nuevo =
            document.createElement("div");

        nuevo.className =
            "comentario";


        // Guardar ID de MySQL

        nuevo.setAttribute(
            "data-mensaje-id",
            datos.id_mensaje
        );


        // =========================================
        // NOMBRE DEL USUARIO
        // =========================================

        const nombreUsuario =
            document.createElement("strong");

        nombreUsuario.className =
            "nombre-usuario";

        nombreUsuario.setAttribute(
            "data-usuario-id",
            usuarioActivo.id
        );

        nombreUsuario.textContent =
            nombre;


        nuevo.appendChild(
            nombreUsuario
        );


        nuevo.appendChild(
            document.createTextNode(": ")
        );


        // =========================================
        // MOSTRAR TEXTO
        // =========================================

        if (mensaje !== "") {

            nuevo.appendChild(
                document.createTextNode(
                    mensaje
                )
            );

        }


        // =========================================
        // MOSTRAR IMAGEN
        // =========================================

        if (datos.mens_image) {

            const imagen =
                document.createElement("img");

            imagen.src =
                "https://small-adventure.onrender.com/" +
                datos.mens_image;

            imagen.alt =
                "Imagen del mensaje";

            imagen.className =
                "imagen-mensaje";

            nuevo.appendChild(
                document.createElement("br")
            );

            nuevo.appendChild(
                imagen
            );

        }

        // =========================================
        // SELECCIONAR CONTENEDOR
        // =========================================

        let contenedor;


        if (categoriaActual === "general") {

            contenedor =
                document.getElementById(
                    "comentariosGeneral"
                );

        }

        else if (categoriaActual === "espanol") {

            contenedor =
                document.getElementById(
                    "comentariosEspanol"
                );

        }

        else if (categoriaActual === "ingles") {

            contenedor =
                document.getElementById(
                    "comentariosIngles"
                );

        }

        else {

            contenedor =
                document.getElementById(
                    "comentariosPortugues"
                );

        }


        contenedor.appendChild(
            nuevo
        );


// =========================================
// RECARGAR MENSAJES
// =========================================

// Esto vuelve a construir correctamente
// los mensajes principales y sus respuestas.
await cargarMensajesDesdeBD();

// =========================================
// LIMPIAR FORMULARIO
// =========================================

document.getElementById(
    "mensaje"
).value = "";

document.getElementById(
    "imagenMensaje"
).value = "";

// =========================================
// VOLVER AL MODO COMENTARIO
// =========================================

panelEnModoRespuesta =
    false;

mensajePadreRespuesta =
    null;

usuarioRespuesta =
    null;

actualizarModoPanelEscritura();


    } catch (error) {

        console.error(
            "Error al guardar el mensaje en MySQL:",
            error
        );


        mostrarToast(
            "No se pudo guardar el comentario.",
            "error"
        );

        return;

    }

}

// =========================================
// INICIALIZAR FORO
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        // =========================================
        // ELEMENTOS DEL BUSCADOR
        // =========================================

        const campoBusquedaUsuarios =
            document.getElementById(
                'campoBusquedaUsuarios'
            );

        const textoBusquedaUsuarios =
            document.getElementById(
                'textoBusquedaUsuarios'
            );

        const botonBuscarUsuarios =
            document.getElementById(
                'botonBuscarUsuarios'
            );


        // =========================================
        // COMPROBAR ELEMENTOS
        // =========================================

        if (
            !campoBusquedaUsuarios ||
            !textoBusquedaUsuarios ||
            !botonBuscarUsuarios
        ) {

            console.error(
                'No se encontraron los elementos del buscador de usuarios.'
            );

        }


        // =========================================
        // BOTÓN BUSCAR
        // =========================================

        if (
            campoBusquedaUsuarios &&
            textoBusquedaUsuarios &&
            botonBuscarUsuarios
        ) {

            botonBuscarUsuarios.addEventListener(
                'click',
                async function() {

                    const campo =
                        campoBusquedaUsuarios.value;

                    const texto =
                        textoBusquedaUsuarios.value;

                    console.log(
                        'BUSCANDO USUARIOS'
                    );

                    console.log(
                        'Campo:',
                        campo
                    );

                    console.log(
                        'Texto:',
                        texto
                    );

                    await buscarUsuariosDesdeBD(
                        texto,
                        campo
                    );

                }
            );


            // =========================================
            // BUSCAR CON ENTER
            // =========================================

            textoBusquedaUsuarios.addEventListener(
                'keydown',
                async function(evento) {

                    if (
                        evento.key === 'Enter'
                    ) {

                        evento.preventDefault();

                        botonBuscarUsuarios.click();

                    }

                }
            );

        }


        // =========================================
        // CARGAR USUARIOS INICIALES
        // =========================================

        await cargarUsuariosDesdeBD();


        // =========================================
        // CARGAR MODERACIÓN
        // =========================================

        await cargarUsuariosSilenciados();

        await cargarUsuariosBloqueados();

        await comprobarSilencioModeracion();


        // =========================================
        // CARGAR MENSAJES
        // =========================================

        cargarMensajesDesdeBD();


        // =========================================
        // CARGAR AVATAR
        // =========================================

        cargarAvatarUsuarioActivo();


        console.log(
            "EJECUTANDO LISTA DE USUARIOS"
        );

    }
);

// =========================================
// MENÚ DEL USUARIO ACTIVO
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const avatarUsuario =
            document.getElementById(
                "avatarUsuarioActivo"
            );

        menuUsuario =
            document.getElementById(
                "menuUsuario"
            );

        const btnCerrarMenuUsuario =
            document.getElementById(
                "btnCerrarMenuUsuario"
            );

        if (
            avatarUsuario &&
            menuUsuario
        ) {

            avatarUsuario.addEventListener(
                "click",
                function() {

                    if (
                        menuUsuario.style.display ===
                        "block"
                    ) {

                        menuUsuario.style.display =
                            "none";

                    } else {

                        menuUsuario.style.display =
                            "block";

                    }

                }
            );

        }

        if (btnCerrarMenuUsuario) {

            btnCerrarMenuUsuario.addEventListener(
                "click",
                function() {

                    menuUsuario.style.display =
                        "none";

                }
            );

        }

    }
);

// =========================================
// BOTÓN VER PERFIL
// =========================================

const btnVerPerfil =
    document.getElementById(
        "btnVerPerfil"
    );

if (btnVerPerfil) {

    btnVerPerfil.addEventListener(
        "click",
        function() {

            menuUsuario.style.display =
                "none";

            mostrarPerfil(
                usuarioActivo.id
            );

        }
    );

}

// =========================================
// BOTÓN EDITAR PERFIL DESDE EL MENÚ
// =========================================

const btnEditarPerfil =
    document.getElementById(
        "btnEditarPerfil"
    );

if (btnEditarPerfil) {

    btnEditarPerfil.addEventListener(
        "click",
        function() {

            // Cerrar el menú superior
            menuUsuario.style.display =
                "none";

            // Abrir el perfil del usuario activo
            mostrarPerfil(
                usuarioActivo.id
            );

            // Esperar a que el perfil esté visible
            setTimeout(
                function() {

                    const formularioEditarPerfil =
                        document.getElementById(
                            "formularioEditarPerfil"
                        );

                        console.log(
                            "FORMULARIO CREAR ADMINISTRADOR:",
                            formularioCrearAdministrador
                        );

                    if (formularioEditarPerfil) {

                        formularioEditarPerfil.style.display =
                            "block";

                    }

                },
                100
            );

        }
    );

}

// =========================================
// CARGAR AVATAR DEL USUARIO ACTIVO
// =========================================

function cargarAvatarUsuarioActivo() {

    if (!usuarioActivo) {
        return;
    }

    console.log(
    "Usuario activo:",
    usuarioActivo
);

console.log(
    "ID usado para buscar perfil:",
    usuarioActivo.id
);

    const avatar =
        document.getElementById(
            "avatarUsuarioActivo"
        );

    if (!avatar) {
        return;
    }

    fetch(
        "https://small-adventure.onrender.com/api/profiles/" +
        usuarioActivo.id
    )
    .then(function(respuesta) {

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo obtener el perfil"
            );
        }

        return respuesta.json();

    })
    .then(function(perfil) {

        if (perfil.prof_avatar) {

            avatar.src =
                perfil.prof_avatar;

        }

    })
    .catch(function(error) {

        console.error(
            "Error al cargar el avatar:",
            error
        );

    });

}

// =========================================================
// PANEL DE ESCRITURA ARRASTRABLE
// =========================================================

const panelEscritura =
    document.getElementById(
        "panelEscritura"
    );

// =========================================================
// ESTADO DEL PANEL DE ESCRITURA
// =========================================================

// false = comentario normal
// true = respuesta a un mensaje

let panelEnModoRespuesta = false;

// Mensaje al que se responderá
let mensajePadreRespuesta = null;

// Usuario al que se responderá
let usuarioRespuesta = null;

// =========================================================
// CAMBIAR MODO DEL PANEL DE ESCRITURA
// =========================================================

function actualizarModoPanelEscritura() {

    const textoCabecera =
        cabeceraPanelEscritura.querySelector(
            "span"
        );

    const botonPublicar =
        document.getElementById(
            "botonPublicarComentario"
        );

        // =====================================================
        // BOTÓN CANCELAR RESPUESTA
        // =====================================================

        const botonCancelarRespuesta =
            document.getElementById(
                "botonCancelarRespuesta"
            );

        // =========================================================
        // CANCELAR RESPUESTA
        // =========================================================

        botonCancelarRespuesta.onclick =
            function() {

                // Volver al modo comentario
                panelEnModoRespuesta =
                    false;

                // Borrar mensaje padre
                mensajePadreRespuesta =
                    null;

                // Borrar usuario
                usuarioRespuesta =
                    null;

                // Limpiar el texto escrito
                const entrada =
                    document.getElementById(
                        "mensaje"
                    );

                if (entrada) {

                    entrada.value = "";

                }

                // Actualizar apariencia
                actualizarModoPanelEscritura();

                // Volver a enfocar la caja
                if (entrada) {

                    entrada.focus();

                }

            };

    // =====================================================
    // MODO RESPUESTA
    // =====================================================

    if (panelEnModoRespuesta) {

        cabeceraPanelEscritura.classList.add(
            "modo-respuesta"
        );

        if (usuarioRespuesta) {

            textoCabecera.textContent =
                "Responder a @" +
                usuarioRespuesta;

        } else {

            textoCabecera.textContent =
                "Responder";

        }

        botonPublicar.textContent =
            "Publicar respuesta";

        botonCancelarRespuesta.style.display =
            "block";

        return;
    }

    // =====================================================
    // MODO COMENTARIO NORMAL
    // =====================================================

    cabeceraPanelEscritura.classList.remove(
        "modo-respuesta"
    );

    textoCabecera.textContent =
        "Escribir comentario";

    botonPublicar.textContent =
        "Publicar comentario";

    botonCancelarRespuesta.style.display =
        "none";
}

/// =========================================================
// RECUPERAR POSICIÓN DEL PANEL
// =========================================================

const posicionGuardada =
    localStorage.getItem(
        "posicionPanelEscritura"
    );

if (posicionGuardada) {

    const posicion =
        JSON.parse(
            posicionGuardada
        );

    panelEscritura.style.left =
        posicion.left + "px";

    panelEscritura.style.top =
        posicion.top + "px";

    panelEscritura.style.right =
        "auto";

    panelEscritura.style.bottom =
        "auto";
}

const cabeceraPanelEscritura =
    document.getElementById(
        "cabeceraPanelEscritura"
    );

let panelArrastrando = false;

let desplazamientoX = 0;
let desplazamientoY = 0;

// =========================================================
// OBTENER POSICIÓN DEL PUNTERO
// =========================================================

function obtenerPosicionPuntero(evento) {

    if (evento.touches && evento.touches.length > 0) {

        return {
            x: evento.touches[0].clientX,
            y: evento.touches[0].clientY
        };

    }

    return {
        x: evento.clientX,
        y: evento.clientY
    };

}

// =========================================================
// COMENZAR A ARRASTRAR
// =========================================================

function comenzarArrastre(evento) {

    const posicion =
        obtenerPosicionPuntero(evento);

    const rect =
        panelEscritura.getBoundingClientRect();

    panelArrastrando = true;

    desplazamientoX =
        posicion.x - rect.left;

    desplazamientoY =
        posicion.y - rect.top;

}

// =========================================================
// MOVER EL PANEL
// =========================================================

function moverPanel(evento) {

    if (!panelArrastrando) {

        return;

    }

    const posicion =
        obtenerPosicionPuntero(evento);

    let nuevaX =
        posicion.x -
        desplazamientoX;

    let nuevaY =
        posicion.y -
        desplazamientoY;

    const anchoPanel =
        panelEscritura.offsetWidth;

    const altoPanel =
        panelEscritura.offsetHeight;

    const anchoVentana =
        window.innerWidth;

    const altoVentana =
        window.innerHeight;

    const margen = 10;

    const margenPantalla = 10;

    const limiteDerecho =
        anchoVentana - anchoPanel - margenPantalla;

    const limiteInferior =
        altoVentana - altoPanel - margenPantalla;

    nuevaX = Math.max(
        margenPantalla,
        Math.min(nuevaX, limiteDerecho)
    );

    nuevaY = Math.max(
        margenPantalla,
        Math.min(nuevaY, limiteInferior)
    );

    panelEscritura.style.left =
        nuevaX + "px";

    panelEscritura.style.top =
        nuevaY + "px";

    panelEscritura.style.right =
        "auto";

    panelEscritura.style.bottom =
        "auto";

}

// =========================================================
// TERMINAR DE ARRASTRAR
// =========================================================

function terminarArrastre() {

    if (!panelArrastrando) {

        return;

    }

    panelArrastrando = false;

    // =========================================
    // GUARDAR POSICIÓN DEL PANEL
    // =========================================

    const posicionPanel = {

        left:
            panelEscritura.offsetLeft,

        top:
            panelEscritura.offsetTop

    };

    localStorage.setItem(
        "posicionPanelEscritura",
        JSON.stringify(posicionPanel)
    );

}

// =========================================================
// EVENTOS DE MOUSE
// =========================================================

cabeceraPanelEscritura.addEventListener(
    "mousedown",
    comenzarArrastre
);

document.addEventListener(
    "mousemove",
    moverPanel
);

document.addEventListener(
    "mouseup",
    terminarArrastre
);

// =========================================================
// EVENTOS TÁCTILES
// =========================================================

cabeceraPanelEscritura.addEventListener(
    "touchstart",
    comenzarArrastre,
    {
        passive: true
    }
);

document.addEventListener(
    "touchmove",
    moverPanel,
    {
        passive: true
    }
);

document.addEventListener(
    "touchend",
    terminarArrastre
);

// =========================================================
// COMENZAR A ARRASTRAR
// =========================================================

cabeceraPanelEscritura.addEventListener(
    "mousedown",
    function(evento) {

        panelArrastrando = true;

        const rect =
            panelEscritura.getBoundingClientRect();

        desplazamientoX =
            evento.clientX - rect.left;

        desplazamientoY =
            evento.clientY - rect.top;

    }
);

// =========================================================
// MOVER EL PANEL
// =========================================================

document.addEventListener(
    "mousemove",
    function(evento) {

        if (!panelArrastrando) {

            return;

        }

        let nuevaX =
            evento.clientX -
            desplazamientoX;

        let nuevaY =
            evento.clientY -
            desplazamientoY;

        // =========================================
        // EVITAR QUE SALGA DE LA PANTALLA
        // =========================================

        const anchoPanel =
            panelEscritura.offsetWidth;

        const altoPanel =
            panelEscritura.offsetHeight;

        const anchoVentana =
            window.innerWidth;

        const altoVentana =
            window.innerHeight;

        nuevaX =
            Math.max(
                0,
                Math.min(
                    nuevaX,
                    anchoVentana -
                    anchoPanel
                )
            );

        nuevaY =
            Math.max(
                0,
                Math.min(
                    nuevaY,
                    altoVentana -
                    altoPanel
                )
            );

        panelEscritura.style.left =
            nuevaX + "px";

        panelEscritura.style.top =
            nuevaY + "px";

        panelEscritura.style.right =
            "auto";

        panelEscritura.style.bottom =
            "auto";

    }
);

// =========================================================
// TERMINAR DE ARRASTRAR
// =========================================================

document.addEventListener(
    "mouseup",
    function() {

        panelArrastrando = false;

    }
);

// =========================================================
// MINIMIZAR / EXPANDIR PANEL DE ESCRITURA
// =========================================================

const botonMinimizarEscritura =
    document.getElementById(
        "botonMinimizarEscritura"
    );

let panelEscrituraMinimizado =
    false;

botonMinimizarEscritura.addEventListener(
    "click",
    function() {

        panelEscrituraMinimizado =
            !panelEscrituraMinimizado;

        if (panelEscrituraMinimizado) {

            panelEscritura.classList.add(
                "panel-escritura-minimizado"
            );

            botonMinimizarEscritura.textContent =
                "+";

        } else {

            panelEscritura.classList.remove(
                "panel-escritura-minimizado"
            );

            botonMinimizarEscritura.textContent =
                "−";

        }

    }
);

// =========================================
// ESTADO INICIAL
// LAS REGLAS SE MUESTRAN PRIMERO
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        ocultarNotificaciones();

    }
);