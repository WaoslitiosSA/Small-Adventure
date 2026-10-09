const express =
    require('express');

const router =
    express.Router();

const db =
    require('../database/db');

const {
    comprobarPermiso
} =
    require('../middleware/permissions');


// =========================================
// CONSULTAR HISTORIAL DE MODERACIONES
// =========================================

router.get('/moderations', (req, res) => {

    const idUsuario =
        Number(req.query.id_user);

    // =========================================
    // VALIDAR ID DEL ADMINISTRADOR
    // =========================================

    if (!idUsuario) {

        return res.status(400).json({
            error:
                'ID de usuario no válido.'
        });

    }


    // =========================================
    // COMPROBAR PERMISO
    // =========================================

    comprobarPermiso(
        idUsuario,
        'gestionar_moderaciones',
        (errorPermiso, tienePermiso) => {

            if (errorPermiso) {

                return res.status(500).json({
                    error:
                        'No se pudo comprobar el permiso para consultar las moderaciones.'
                });

            }


            if (!tienePermiso) {

                return res.status(403).json({
                    error:
                        'No tienes permisos para consultar el historial de moderaciones.'
                });

            }


            // =========================================
            // CONSULTAR MODERACIONES
            // =========================================

            const sqlModeraciones = `
                SELECT

                    m.id_mode,

                    m.id_user_affe,

                    ua.id_user AS id_usuario_afectado,

                    ua.usaf_name AS usuario_afectado,

                    m.id_mens,

                    m.mode_action,

                    m.mode_reason,

                    m.mode_date,

                    m.id_user AS id_administrador,

                    u.user_name AS administrador

                FROM moderations AS m

                INNER JOIN users_affecteds AS ua
                    ON ua.id_user_affe = m.id_user_affe

                INNER JOIN users AS u
                    ON u.id_user = m.id_user

                ORDER BY
                    m.mode_date DESC
            `;


            db.query(
                sqlModeraciones,
                (error, resultados) => {

                    if (error) {

                        console.error(
                            'Error al consultar historial de moderaciones:',
                            error
                        );

                        return res.status(500).json({
                            error:
                                'No se pudo consultar el historial de moderaciones.'
                        });

                    }


                    console.log(
                        'Moderaciones recibidas desde MySQL:',
                        resultados.length
                    );


                    return res.json(
                        resultados
                    );

                }
            );

        }
    );

});


// =========================================
// APLICAR CONSECUENCIA DE MODERACIÓN
// =========================================

router.post('/moderations', (req, res) => {

    const {
        id_user_affe,
        id_mens,
        id_user,
        mode_action,
        mode_reason
    } = req.body;

    // =========================================
    // VALIDAR DATOS
    // =========================================

    if (
        !id_user_affe ||
        !id_mens ||
        !id_user ||
        !mode_action ||
        !mode_reason
    ) {

        return res.status(400).json({
            error:
                'Faltan datos para aplicar la moderación.'
        });

    }


    // =========================================
    // COMPROBAR PERMISO
    // =========================================

    comprobarPermiso(
        id_user,
        'moderar_mensajes',
        (errorPermiso, tienePermiso) => {

            if (errorPermiso) {

                return res.status(500).json({
                    error:
                        'No se pudo comprobar el permiso para moderar mensajes.'
                });

            }


            if (!tienePermiso) {

                return res.status(403).json({
                    error:
                        'No tienes permisos para aplicar moderaciones.'
                });

            }


            // =========================================
            // BUSCAR O CREAR USUARIO AFECTADO
            // =========================================

            const sqlUsuarioAfectado = `
                SELECT
                    id_user_affe
                FROM users_affecteds
                WHERE id_user = ?
                LIMIT 1
            `;

            db.query(
                sqlUsuarioAfectado,
                [id_user_affe],
                (errorUsuario, resultadosUsuario) => {

                    if (errorUsuario) {

                        console.error(
                            'Error al buscar usuario afectado:',
                            errorUsuario
                        );

                        return res.status(500).json({
                            error:
                                'No se pudo buscar el usuario afectado.'
                        });

                    }


                    // =========================================
                    // SI YA EXISTE
                    // =========================================

                    if (resultadosUsuario.length > 0) {

                        const idUsuarioAfectado =
                            resultadosUsuario[0].id_user_affe;

                        aplicarConsecuencia(
                            idUsuarioAfectado
                        );

                        return;
                    }


                    // =========================================
                    // SI NO EXISTE, CREARLO
                    // =========================================

                    const sqlDatosUsuario = `
                        SELECT
                            user_name
                        FROM users
                        WHERE id_user = ?
                        LIMIT 1
                    `;

                    db.query(
                        sqlDatosUsuario,
                        [id_user_affe],
                        (errorDatos, resultadosDatos) => {

                            if (errorDatos) {

                                console.error(
                                    'Error al obtener datos del usuario:',
                                    errorDatos
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudieron obtener los datos del usuario.'
                                });

                            }


                            if (
                                resultadosDatos.length === 0
                            ) {

                                return res.status(404).json({
                                    error:
                                        'El usuario afectado no existe.'
                                });

                            }


                            const nombreUsuario =
                                resultadosDatos[0].user_name;


                            const sqlCrearUsuarioAfectado = `
                                INSERT INTO users_affecteds
                                (
                                    id_user,
                                    usaf_name
                                )
                                VALUES
                                (?, ?)
                            `;

                            db.query(
                                sqlCrearUsuarioAfectado,
                                [
                                    id_user_affe,
                                    nombreUsuario
                                ],
                                (errorCrear, resultadoCrear) => {

                                    if (errorCrear) {

                                        console.error(
                                            'Error al crear usuario afectado:',
                                            errorCrear
                                        );

                                        return res.status(500).json({
                                            error:
                                                'No se pudo registrar el usuario afectado.'
                                        });

                                    }


                                    aplicarConsecuencia(
                                        resultadoCrear.insertId
                                    );

                                }
                            );

                        }
                    );

                }
            );


            // =========================================
            // APLICAR CONSECUENCIA
            // =========================================

            function aplicarConsecuencia(
                idUsuarioAfectado
            ) {

                // =========================================
                // MENSAJE ELIMINADO
                // =========================================

                if (
                    mode_action ===
                    'mensaje_eliminado'
                ) {

                    const sqlMensaje = `
                        UPDATE menssages
                        SET mens_status = 'eliminado'
                        WHERE id_mensaje = ?
                    `;

                    db.query(
                        sqlMensaje,
                        [id_mens],
                        (errorMensaje, resultadoMensaje) => {

                            if (errorMensaje) {

                                console.error(
                                    'Error al eliminar mensaje:',
                                    errorMensaje
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudo eliminar el mensaje.'
                                });

                            }


                            if (
                                resultadoMensaje.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    error:
                                        'Mensaje no encontrado.'
                                });

                            }


                            guardarModeracion(
                                idUsuarioAfectado
                            );

                        }
                    );

                    return;
                }


                // =========================================
                // SILENCIAR USUARIO — 5 HORAS
                // =========================================

                if (
                    mode_action ===
                    'usuario_silenciado'
                ) {

                    const sqlSilenciar = `
                        INSERT INTO users_interactions
                        (
                            id_user_original,
                            id_user_dest,
                            usin_type_inte,
                            usin_date,
                            usin_date_end,
                            status
                        )
                        VALUES
                        (
                            ?,
                            ?,
                            'silenciar',
                            CURRENT_TIMESTAMP(6),
                            DATE_ADD(
                                CURRENT_TIMESTAMP(6),
                                INTERVAL 5 HOUR
                            ),
                            'activo'
                        )
                    `;

                    db.query(
                        sqlSilenciar,
                        [
                            id_user,
                            id_user_affe
                        ],
                        (errorSilenciar) => {

                            if (errorSilenciar) {

                                console.error(
                                    'Error al silenciar usuario:',
                                    errorSilenciar
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudo silenciar al usuario.'
                                });

                            }


                            guardarModeracion(
                                idUsuarioAfectado
                            );

                        }
                    );

                    return;
                }


                // =========================================
                // ADVERTENCIA
                // =========================================

                if (
                    mode_action ===
                    'advertencia'
                ) {

                    const sqlModeracion = `
                        INSERT INTO moderations
                        (
                            id_user_affe,
                            id_mens,
                            mode_action,
                            mode_reason,
                            id_user
                        )
                        VALUES
                        (?, ?, ?, ?, ?)
                    `;

                    db.query(
                        sqlModeracion,
                        [
                            idUsuarioAfectado,
                            id_mens,
                            mode_action,
                            mode_reason,
                            id_user
                        ],
                        (errorModeracion, resultadoModeracion) => {

                            if (errorModeracion) {

                                console.error(
                                    'Error al guardar advertencia:',
                                    errorModeracion
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudo guardar la advertencia.'
                                });

                            }


                            // =========================================
                            // CONTAR ADVERTENCIAS DEL USUARIO
                            // =========================================

                            const sqlContarAdvertencias = `
                                SELECT
                                    COUNT(*) AS advertencias
                                FROM moderations
                                WHERE id_user_affe = ?
                                AND mode_action = 'advertencia'
                            `;

                            db.query(
                                sqlContarAdvertencias,
                                [idUsuarioAfectado],
                                (errorConteo, resultadosConteo) => {

                                    if (errorConteo) {

                                        console.error(
                                            'Error al contar advertencias:',
                                            errorConteo
                                        );

                                        return res.status(500).json({
                                            error:
                                                'La advertencia fue guardada, pero no se pudo comprobar el número de advertencias.'
                                        });

                                    }


                                    const advertencias =
                                        resultadosConteo[0].advertencias;

                                    const recomendarEliminacion =
                                        advertencias >= 10;


                                    // =========================================
                                    // CREAR NOTIFICACIÓN DE ADVERTENCIA
                                    // =========================================

                                    const contenido =
                                        "Has recibido una advertencia de un administrador por incumplir las normas del foro. Motivo: " +
                                        mode_reason;


                                    const sqlNotificacion = `
                                        INSERT INTO notifications
                                        (
                                            id_user,
                                            noti_type,
                                            noti_content,
                                            noti_status,
                                            id_mensaje
                                        )
                                        VALUES
                                        (
                                            ?,
                                            'advertencia',
                                            ?,
                                            'no_leida',
                                            ?
                                        )
                                    `;


                                    db.query(
                                        sqlNotificacion,
                                        [
                                            id_user_affe,
                                            contenido,
                                            id_mens
                                        ],
                                        (errorNotificacion, resultadoNotificacion) => {

                                            if (errorNotificacion) {

                                                console.error(
                                                    'Error al crear notificación de advertencia:',
                                                    errorNotificacion
                                                );

                                                return res.status(500).json({
                                                    error:
                                                        'La advertencia fue guardada, pero no se pudo crear la notificación.'
                                                });

                                            }


                                            console.log(
                                                'Advertencia registrada y notificación creada:',
                                                resultadoModeracion.insertId,
                                                resultadoNotificacion.insertId
                                            );

                                            console.log(
                                                'Total de advertencias del usuario:',
                                                advertencias
                                            );


                                            if (
                                                recomendarEliminacion
                                            ) {

                                                console.log(
                                                    'El usuario ha alcanzado 10 advertencias. Se recomienda revisar la eliminación de la cuenta.'
                                                );

                                            }


                                            return res.json({
                                                mensaje:
                                                    'Advertencia aplicada correctamente.',

                                                id_mode:
                                                    resultadoModeracion.insertId,

                                                id_notificacion:
                                                    resultadoNotificacion.insertId,

                                                mode_action:
                                                    mode_action,

                                                advertencias:
                                                    advertencias,

                                                recomendarEliminacion:
                                                    recomendarEliminacion
                                            });

                                        }
                                    );

                                }
                            );

                        }
                    );

                    return;
                }


                // =========================================
                // BLOQUEO TEMPORAL — 72 HORAS
                // =========================================

                if (
                    mode_action ===
                    'bloqueo_temporal'
                ) {

                    const sqlBloquear = `
                        INSERT INTO users_interactions
                        (
                            id_user_original,
                            id_user_dest,
                            usin_type_inte,
                            usin_date,
                            usin_date_end,
                            status
                        )
                        VALUES
                        (
                            ?,
                            ?,
                            'bloquear',
                            CURRENT_TIMESTAMP(6),
                            DATE_ADD(
                                CURRENT_TIMESTAMP(6),
                                INTERVAL 72 HOUR
                            ),
                            'activo'
                        )
                    `;

                    db.query(
                        sqlBloquear,
                        [
                            id_user,
                            id_user_affe
                        ],
                        (errorBloquear) => {

                            if (errorBloquear) {

                                console.error(
                                    'Error al bloquear usuario:',
                                    errorBloquear
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudo bloquear al usuario.'
                                });

                            }


                            guardarModeracion(
                                idUsuarioAfectado
                            );

                        }
                    );

                    return;
                }


                // =========================================
                // USUARIO ELIMINADO
                // =========================================

                if (
                    mode_action ===
                    'usuario_eliminado'
                ) {

                    // =========================================
                    // ELIMINAR USUARIO LÓGICAMENTE
                    // =========================================

                    const sqlEliminarUsuario = `
                        UPDATE users
                        SET user_status = 'eliminado'
                        WHERE id_user = ?
                    `;

                    db.query(
                        sqlEliminarUsuario,
                        [id_user_affe],
                        (errorEliminar, resultadoEliminar) => {

                            if (errorEliminar) {

                                console.error(
                                    'Error al eliminar usuario:',
                                    errorEliminar
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudo eliminar el usuario.'
                                });

                            }


                            // =========================================
                            // COMPROBAR SI EXISTÍA EL USUARIO
                            // =========================================

                            if (
                                resultadoEliminar.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    error:
                                        'El usuario afectado no existe.'
                                });

                            }


                            // =========================================
                            // REGISTRAR MODERACIÓN
                            // =========================================

                            guardarModeracion(
                                idUsuarioAfectado
                            );

                        }
                    );

                    return;

                }


                // =========================================
                // ACCIÓN NO RECONOCIDA
                // =========================================

                return res.status(400).json({
                    error:
                        'Consecuencia de moderación no válida.'
                });

            }


            // =========================================
            // GUARDAR MODERACIÓN
            // =========================================

            function guardarModeracion(
                idUsuarioAfectado
            ) {

                const sqlModeracion = `
                    INSERT INTO moderations
                    (
                        id_user_affe,
                        id_mens,
                        mode_action,
                        mode_reason,
                        id_user
                    )
                    VALUES
                    (?, ?, ?, ?, ?)
                `;

                db.query(
                    sqlModeracion,
                    [
                        idUsuarioAfectado,
                        id_mens,
                        mode_action,
                        mode_reason,
                        id_user
                    ],
                    (errorModeracion, resultadoModeracion) => {

                        if (errorModeracion) {

                            console.error(
                                'Error al guardar moderación:',
                                errorModeracion
                            );

                            return res.status(500).json({
                                error:
                                    'La consecuencia se aplicó, pero no se pudo guardar la moderación.'
                            });

                        }


                        console.log(
                            'Moderación registrada:',
                            resultadoModeracion.insertId
                        );


                        return res.json({
                            mensaje:
                                'Moderación aplicada correctamente.',

                            id_mode:
                                resultadoModeracion.insertId,

                            mode_action:
                                mode_action
                        });

                    }
                );

            }

        }

    );

});

 // =========================================
 // CONSULTAR ADVERTENCIAS DE UN USUARIO
 // =========================================

router.get(
    '/moderations/advertencias/:id_user',
    (req, res) => {

        const idUsuario =
            Number(req.params.id_user);

        if (!idUsuario) {

            return res.status(400).json({
                error:
                    'ID de usuario no válido.'
            });
        }

        const sqlAdvertencias = `
            SELECT
                COUNT(*) AS advertencias
            FROM moderations m

            INNER JOIN users_affecteds ua
                ON ua.id_user_affe =
                   m.id_user_affe

            WHERE ua.id_user = ?
            AND m.mode_action = 'advertencia'
        `;

        db.query(
            sqlAdvertencias,
            [idUsuario],
            (error, resultados) => {

                if (error) {

                    console.error(
                        'Error al contar advertencias:',
                        error
                    );

                    return res.status(500).json({
                        error:
                            'No se pudieron consultar las advertencias.'
                    });
                }

                const advertencias =
                    Number(
                        resultados[0].advertencias
                    );

                const recomendarEliminacion =
                    advertencias >= 10;

                console.log(
                    'Advertencias del usuario',
                    idUsuario,
                    ':',
                    advertencias
                );

                return res.json({

                    id_user:
                        idUsuario,

                    advertencias:
                        advertencias,

                    recomendarEliminacion:
                        recomendarEliminacion

                });

            }
        );

    }
);

// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports =
    router;