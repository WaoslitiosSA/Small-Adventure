const express =
    require('express');

const router =
    express.Router();

const db =
    require('../database/db');

const {
    comprobarPermiso
} = require('../middleware/permissions');

const {
    autenticarToken
} = require('../middleware/auth');


 // =========================================
 // CONSULTAR HISTORIAL DE MODERACIONES
 // =========================================

router.get(
    '/moderations',
    autenticarToken,
    (req, res) => {

        // La identidad procede del token, no del cliente.
        const idUsuario = req.usuario.id_user;

        // Comprobar que el usuario puede consultar el historial.
        comprobarPermiso(
            idUsuario,
            'gestionar_moderaciones',
            (errorPermiso, tienePermiso) => {

                if (errorPermiso) {
                    console.error(
                        'Error al comprobar permiso de moderación:',
                        errorPermiso
                    );

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
                    ORDER BY m.mode_date DESC
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

                        return res.json(resultados);
                    }
                );
            }
        );
    }
);


// =========================================
// APLICAR CONSECUENCIA DE MODERACIÓN
// =========================================

router.post(
    '/moderations',
    autenticarToken,
    (req, res) => {

    const {
        id_user_affe,
        id_mens,
        mode_action,
        mode_reason
    } = req.body;

    // Identidad del administrador verificada por el servidor.
    const id_user =
        req.usuario.id_user;

    // =========================================
    // VALIDAR DATOS
    // =========================================

    const idUsuarioSolicitado =
        Number(id_user_affe);

    const idMensajeSolicitado =
    id_mens == null || id_mens === ''
        ? null
        : Number(id_mens);

    const accionesPermitidas = [
        'mensaje_eliminado',
        'usuario_silenciado',
        'advertencia',
        'bloqueo_temporal',
        'usuario_eliminado'
    ];

    if (
        !Number.isSafeInteger(idUsuarioSolicitado) ||
        idUsuarioSolicitado <= 0 ||
        (
            mode_action === 'usuario_eliminado'
                ? idMensajeSolicitado !== null &&
                (
                    !Number.isSafeInteger(idMensajeSolicitado) ||
                    idMensajeSolicitado <= 0
                )
                : (
                    !Number.isSafeInteger(idMensajeSolicitado) ||
                    idMensajeSolicitado <= 0
                )
        ) ||
        typeof mode_action !== 'string' ||
        !accionesPermitidas.includes(mode_action) ||
        typeof mode_reason !== 'string' ||
        !mode_reason.trim() ||
        mode_reason.trim().length > 1000
    ) {
        return res.status(400).json({
            error:
                'Los datos de la moderación no son válidos. Comprueba los identificadores, la acción y el motivo.'
        });
    }

    // Evitar que el administrador se aplique una moderación a sí mismo.
    if (idUsuarioSolicitado === id_user) {
        return res.status(400).json({
            error:
                'No puedes aplicar una moderación sobre tu propia cuenta.'
        });
    }

    // Utilizar valores ya validados en las consultas SQL.
    req.body.id_user_affe = idUsuarioSolicitado;
    req.body.id_mens = idMensajeSolicitado;
    req.body.mode_reason = mode_reason.trim();

    // =========================================
    // COMPROBAR PERMISO
    // =========================================

    const permisoRequerido =
        mode_action === 'usuario_eliminado'
            ? 'gestionar_usuarios'
            : 'moderar_mensajes';

    comprobarPermiso(
        id_user,
        permisoRequerido,
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
            // VALIDAR USUARIO Y MENSAJE
            // =========================================

            const sqlValidarModeracion = `
                SELECT
                    u.user_status,
                    m.id_user AS id_propietario_mensaje
                FROM users AS u
                LEFT JOIN menssages AS m
                    ON m.id_mensaje = ?
                WHERE u.id_user = ?
                LIMIT 1
            `;

            db.query(
                sqlValidarModeracion,
                [
                    idMensajeSolicitado,
                    idUsuarioSolicitado
                ],
                (errorValidacion, resultadosValidacion) => {

                    if (errorValidacion) {
                        console.error(
                            'Error al validar usuario y mensaje para moderación:',
                            errorValidacion
                        );

                        return res.status(500).json({
                            error:
                                'No se pudo validar el usuario y el mensaje.'
                        });
                    }

                    if (resultadosValidacion.length === 0) {
                        return res.status(404).json({
                            error:
                                'El usuario afectado no existe.'
                        });
                    }

                    const usuarioValidado =
                        resultadosValidacion[0];

                    if (
                        usuarioValidado.user_status !== 'activo'
                    ) {
                        return res.status(400).json({
                            error:
                                'No se puede moderar una cuenta que no está activa.'
                        });
                    }

                    if (mode_action !== 'usuario_eliminado') {
                        if (!usuarioValidado.id_propietario_mensaje) {
                            return res.status(404).json({
                                error: 'El mensaje indicado no existe.'
                            });
                        }

                        if (
                            Number(usuarioValidado.id_propietario_mensaje)
                            !== idUsuarioSolicitado
                        ) {
                            return res.status(400).json({
                                error: 'El mensaje no pertenece al usuario indicado.'
                            });
                        }
                    }

                    continuarModeracion();

                }
            );

            function continuarModeracion() {

                // =========================================
                // ELIMINAR USUARIO CON TRANSACCIÓN
                // =========================================

                if (mode_action === 'usuario_eliminado') {
                    return eliminarUsuarioConTransaccion();
                }

                function eliminarUsuarioConTransaccion() {

    db.getConnection((errorConexion, conn) => {

        if (errorConexion) {
            console.error('Error al obtener conexión:', errorConexion);
            return res.status(500).json({
                error: 'No se pudo iniciar la operación de eliminación.'
            });
        }

        function terminarConError(mensaje, error, codigo = 500) {
            if (error) {
                console.error(mensaje, error);
            }

            conn.rollback((errorRollback) => {
                if (errorRollback) {
                    console.error('Error al revertir transacción:', errorRollback);
                }

                conn.release();

                if (!res.headersSent) {
                    return res.status(codigo).json({ error: mensaje });
                }
            });
        }

        conn.beginTransaction((errorTransaccion) => {

            if (errorTransaccion) {
                conn.release();
                console.error('Error al iniciar transacción:', errorTransaccion);
                return res.status(500).json({
                    error: 'No se pudo iniciar la operación de eliminación.'
                });
            }

            // 1. Buscar el usuario afectado
            conn.query(
                `SELECT id_user_affe
                 FROM users_affecteds
                 WHERE id_user = ?
                 LIMIT 1`,
                [idUsuarioSolicitado],
                (errorBusqueda, resultados) => {

                    if (errorBusqueda) {
                        return terminarConError(
                            'No se pudo buscar el usuario afectado.',
                            errorBusqueda
                        );
                    }

                        function registrarEliminacion(idUsuarioAfectado) {

                            // 3. Cambiar el estado de la cuenta
                            conn.query(
                                `UPDATE users
                                SET user_status = 'eliminado'
                                WHERE id_user = ?
                                AND user_status = 'activo'`,
                                [idUsuarioSolicitado],
                                (errorEliminar, resultadoEliminar) => {

                                    if (errorEliminar) {
                                        return terminarConError(
                                            'No se pudo actualizar el estado del usuario.',
                                            errorEliminar
                                        );
                                    }

                                    if (resultadoEliminar.affectedRows === 0) {
                                        return terminarConError(
                                            'El usuario ya no existe o no está activo.',
                                            null,
                                            409
                                        );
                                    }

                                    // 4. Registrar la moderación
                                    conn.query(
                                        `INSERT INTO moderations
                                        (id_user_affe, id_mens, mode_action, mode_reason, id_user)
                                        VALUES (?, ?, ?, ?, ?)`,
                                        [
                                            idUsuarioAfectado,
                                            idMensajeSolicitado,
                                            mode_action,
                                            mode_reason,
                                            id_user
                                        ],
                                        (errorModeracion, resultadoModeracion) => {

                                            if (errorModeracion) {
                                                return terminarConError(
                                                    'No se pudo registrar la moderación.',
                                                    errorModeracion
                                                );
                                            }

                                            // 5. Confirmar
                                            conn.commit((errorCommit) => {

                                                if (errorCommit) {
                                                    return terminarConError(
                                                        'No se pudo confirmar la eliminación.',
                                                        errorCommit
                                                    );
                                                }

                                                conn.release();

                                                return res.json({
                                                    mensaje: 'Usuario eliminado y moderación registrada correctamente.',
                                                    id_mode: resultadoModeracion.insertId,
                                                    mode_action: mode_action
                                                });
                                            });
                                        }
                                    );
                                }
                            );
                        }

                        // Si ya existe en users_affecteds, reutilizarlo
                        if (resultados.length > 0) {
                            return registrarEliminacion(resultados[0].id_user_affe);
                        }

                        // 2. Si no existe, crearlo dentro de la misma transacción
                        conn.query(
                            `INSERT INTO users_affecteds (id_user, usaf_name)
                            SELECT id_user, user_name
                            FROM users
                            WHERE id_user = ?
                            AND user_status = 'activo'`,
                            [idUsuarioSolicitado],
                            (errorCrear, resultadoCrear) => {

                                if (errorCrear) {
                                    return terminarConError(
                                        'No se pudo registrar el usuario afectado.',
                                        errorCrear
                                    );
                                }

                                if (resultadoCrear.affectedRows === 0) {
                                    return terminarConError(
                                        'No se encontró un usuario activo para registrar.',
                                        null,
                                        404
                                    );
                                }

                                return registrarEliminacion(resultadoCrear.insertId);
                            }
                        );
                    }
                );
            });
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
                [idUsuarioSolicitado],
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
                        [idUsuarioSolicitado],
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
                                    idUsuarioSolicitado,
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
                        [idMensajeSolicitado],
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
                            idUsuarioSolicitado
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
                            idMensajeSolicitado,
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
                                            idUsuarioSolicitado,
                                            contenido,
                                            idMensajeSolicitado
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
                            idUsuarioSolicitado
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
                        idMensajeSolicitado,
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

    });
});


 // =========================================
// CONSULTAR ADVERTENCIAS DE UN USUARIO
// =========================================

router.get(
    '/moderations/advertencias/:id_user',
    autenticarToken,
    (req, res) => {

        const idSolicitante =
            req.usuario.id_user;

        const idUsuario =
            Number(req.params.id_user);

        // Validar el ID solicitado.
        if (
            !Number.isSafeInteger(idUsuario) ||
            idUsuario <= 0
        ) {
            return res.status(400).json({
                error: 'ID de usuario no válido.'
            });
        }

        // Los usuarios pueden consultar sus propias advertencias.
        // Consultar las de otra persona requiere permiso de moderación.
        function consultarAdvertencias() {

            const sqlAdvertencias = `
                SELECT
                    COUNT(*) AS advertencias
                FROM moderations AS m
                INNER JOIN users_affecteds AS ua
                    ON ua.id_user_affe = m.id_user_affe
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
                        Number(resultados[0].advertencias);

                    return res.json({
                        id_user: idUsuario,
                        advertencias: advertencias,
                        recomendarEliminacion:
                            advertencias >= 10
                    });
                }
            );
        }

        // Consulta propia: no necesita permiso administrativo.
        if (idSolicitante === idUsuario) {
            return consultarAdvertencias();
        }

        // Consulta de otro usuario: comprobar permiso.
        comprobarPermiso(
            idSolicitante,
            'gestionar_moderaciones',
            (errorPermiso, tienePermiso) => {

                if (errorPermiso) {
                    console.error(
                        'Error al comprobar permiso para consultar advertencias:',
                        errorPermiso
                    );

                    return res.status(500).json({
                        error:
                            'No se pudo comprobar el permiso para consultar las advertencias.'
                    });
                }

                if (!tienePermiso) {
                    return res.status(403).json({
                        error:
                            'No tienes permiso para consultar las advertencias de otro usuario.'
                    });
                }

                return consultarAdvertencias();
            }
        );
    }
);

// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports =
    router;