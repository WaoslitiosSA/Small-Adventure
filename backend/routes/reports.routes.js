const express =
    require('express');

const db =
    require('../database/db');

const {
    comprobarPermiso
} =
    require('../middleware/permissions');

const {
    autenticarToken
} = require('../middleware/auth');

const router =
    express.Router();

const rateLimit = require('express-rate-limit');

const limiteReportes = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => String(req.usuario.id_user),
    message: { error: 'Has enviado demasiados reportes. Intenta más tarde.' }
});

// =========================================
// OBTENER REPORTES
// =========================================


router.get(
    '/reports',
    autenticarToken,
    (req, res) => {

        // Identidad obtenida del token JWT.
        const idUsuario =
            req.usuario.id_user;

        comprobarPermiso(
            idUsuario,
            'ver_reportes',
            (errorPermiso, tienePermiso) => {

                if (errorPermiso) {
                    return res.status(500).json({
                        error:
                            'No se pudo comprobar el permiso para ver reportes.'
                    });
                }

                if (!tienePermiso) {
                    return res.status(403).json({
                        error:
                            'No tienes permisos para ver los reportes.'
                    });
                }

                const sql = `
                    SELECT
                        r.id_repo,
                        r.id_user_repo,
                        reporter.user_name AS usuario_reporta,
                        r.id_repo_user,
                        reported.user_name AS usuario_reportado,
                        r.id_mens,
                        r.repo_motive,
                        r.repo_description,
                        r.repo_date,
                        r.repo_status,
                        m.mens_content
                    FROM reports AS r

                    INNER JOIN users AS reporter
                        ON r.id_user_repo = reporter.id_user

                    INNER JOIN users AS reported
                        ON r.id_repo_user = reported.id_user

                    INNER JOIN menssages AS m
                        ON r.id_mens = m.id_mensaje

                    ORDER BY r.id_repo DESC
                    LIMIT 200
                `;

                db.query(
                    sql,
                    (error, resultados) => {

                        if (error) {
                            console.error(
                                'Error al obtener reportes:',
                                error
                            );

                            return res.status(500).json({
                                error:
                                    'Error al obtener reportes'
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
// CREAR REPORTE
// =========================================

router.post('/reports', autenticarToken, limiteReportes, (req, res) => {

        const {
            id_repo_user,
            id_mens,
            repo_motive,
            repo_description
        } = req.body;

        // La identidad del autor procede del JWT.
        const id_user_repo =
            req.usuario.id_user;


        // =========================================
        // VERIFICAR DATOS OBLIGATORIOS
        // =========================================

        const motivo = typeof repo_motive === 'string' ? repo_motive.trim() : '';
        const descripcion = typeof repo_description === 'string' ? repo_description.trim() : '';

        if (
            !Number.isInteger(id_user_repo) ||
            id_user_repo <= 0 ||
            !Number.isInteger(Number(id_repo_user)) ||
            Number(id_repo_user) <= 0 ||
            !Number.isInteger(Number(id_mens)) ||
            Number(id_mens) <= 0 ||
            !motivo || motivo.length > 100 ||
            !descripcion || descripcion.length > 1000
        ) {
            return res.status(400).json({
                error: 'Faltan datos válidos para crear el reporte'
            });
        }

        // Normalizar los IDs para las consultas SQL.
        const idUsuarioReportado =
            Number(id_repo_user);

        const idMensajeReportado =
            Number(id_mens);

        if (idUsuarioReportado === id_user_repo) {
            return res.status(400).json({ error: 'No puedes reportarte a ti mismo.' });
        }

    // =========================================
    // COMPROBAR ROL Y PROPIETARIO DEL MENSAJE
    // =========================================

    const sqlRol = `
        SELECT
            u.id_role,
            m.id_user AS id_propietario_mensaje
        FROM users AS u
        INNER JOIN menssages AS m
            ON m.id_mensaje = ?
        WHERE u.id_user = ?
    `;

    db.query(
        sqlRol,
        [
            idMensajeReportado,
            id_user_repo
        ],
        (error, resultadosRol) => {

            if (error) {

                console.error(
                    'Error al comprobar el usuario y el mensaje:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al comprobar los datos del reporte'
                });
            }

            if (resultadosRol.length === 0) {

                return res.status(404).json({
                    error:
                        'El usuario o el mensaje no existe'
                });
            }

            // Comprobar que el mensaje pertenece
            // al usuario que se intenta reportar.
            if (
                Number(
                    resultadosRol[0].id_propietario_mensaje
                ) !== idUsuarioReportado
            ) {

                return res.status(400).json({
                    error:
                        'El usuario reportado no es el propietario del mensaje'
                });
            }

            const esAdmin =
                Number(resultadosRol[0].id_role) === 1;


            // =========================================
            // GUARDAR EL REPORTE
            // =========================================

        const sqlReporte = `
            INSERT INTO reports
            (
                id_user_repo,
                id_repo_user,
                id_mens,
                repo_motive,
                repo_description,
                repo_status
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

            db.query(
                sqlReporte,
                [
                    id_user_repo,
                    idUsuarioReportado,
                    idMensajeReportado,
                    repo_motive,
                    repo_description,
                    'pendiente'
                ],
                (error, resultadoReporte) => {

                    if (error) {

                        console.error(
                            'Error al crear reporte:',
                            error
                        );

                        return res.status(500).json({
                            error:
                                'Error al crear reporte'
                        });

                    }

                    const idReporte =
                        resultadoReporte.insertId;


                    // =========================================
                    // NOTIFICACIÓN AL USUARIO REPORTADO
                    // =========================================

                    const sqlNotificacionUsuario = `
                        INSERT INTO notifications
                        (
                            id_user,
                            noti_type,
                            noti_content,
                            id_mensaje
                        )
                        VALUES (?, ?, ?, ?)
                    `;

                    const contenidoUsuario =
                        'Has recibido un reporte sobre uno de tus mensajes.';

                    db.query(
                        sqlNotificacionUsuario,
                        [
                            idUsuarioReportado,
                            'reporte',
                            contenidoUsuario,
                            idMensajeReportado
                        ],
                        (error) => {

                            if (error) {

                                console.error(
                                    'Error al notificar al usuario reportado:',
                                    error
                                );

                                return res.status(500).json({
                                    error:
                                        'Reporte creado, pero hubo un error al notificar al usuario reportado'
                                });

                            }


                            // =========================================
                            // SI ES ADMINISTRADOR
                            // =========================================

                            if (esAdmin) {

                                return res.status(201).json({
                                    mensaje:
                                        'Reporte creado correctamente',
                                    id_reporte:
                                        idReporte
                                });

                            }


                            // =========================================
                            // OBTENER ADMINISTRADORES
                            // =========================================

                            const sqlAdministradores = `
                                SELECT id_user
                                FROM users 
                                WHERE id_role = 1 
                                AND user_status = 'activo'
                            `;

                            db.query(
                                sqlAdministradores,
                                (error, administradores) => {

                                    if (error) {

                                        console.error(
                                            'Error al obtener administradores:',
                                            error
                                        );

                                        return res.status(500).json({
                                            error:
                                                'Reporte creado, pero hubo un error al obtener administradores'
                                        });

                                    }


                                    if (
                                        administradores.length === 0
                                    ) {

                                        return res.status(201).json({
                                            mensaje:
                                                'Reporte creado correctamente, pero no hay administradores para notificar',
                                            id_reporte:
                                                idReporte
                                        });

                                    }


                                    let notificacionesPendientes =
                                        administradores.length;

                                    let huboError =
                                        false;


                                    administradores.forEach(
                                        admin => {

                                            const contenidoAdmin =
                                                'Un usuario ha realizado un reporte que requiere revisión.';

                                            db.query(
                                                sqlNotificacionUsuario,
                                                [
                                                    admin.id_user,
                                                    'reporte',
                                                    contenidoAdmin,
                                                    idMensajeReportado
                                                ],
                                                (error) => {

                                                    if (error) {

                                                        console.error(
                                                            'Error al notificar al administrador:',
                                                            error
                                                        );

                                                        huboError =
                                                            true;

                                                    }


                                                    notificacionesPendientes--;


                                                    if (
                                                        notificacionesPendientes === 0
                                                    ) {

                                                        if (
                                                            huboError
                                                        ) {

                                                            return res.status(500).json({
                                                                error:
                                                                    'Reporte creado, pero hubo un error al notificar a uno o más administradores'
                                                            });

                                                        }


                                                        return res.status(201).json({
                                                            mensaje:
                                                                'Reporte creado y notificaciones enviadas correctamente',
                                                            id_reporte:
                                                                idReporte
                                                        });

                                                    }

                                                }
                                            );

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


// =========================================
// ACTUALIZAR ESTADO DE UN REPORTE
// =========================================


router.put(
    '/reports/:id',
    autenticarToken,
    (req, res) => {

        const idReporte =
            Number(req.params.id);

        const {
            repo_status
        } = req.body;

        // La identidad del autor procede del JWT.
        const id_user_repo =
            req.usuario.id_user;

        // No confiamos en un ID enviado por el navegador.
        const id_user =
            req.usuario.id_user;


        // =========================================
        // VALIDAR DATOS
        // =========================================

        if (
            !Number.isInteger(idReporte) ||
            idReporte <= 0 ||
            !repo_status
        ) {
            return res.status(400).json({
                error:
                    "El ID del reporte y el estado son obligatorios y deben ser válidos."
            });
        }


        // =========================================
        // ESTADOS PERMITIDOS
        // =========================================

        const estadosPermitidos = [
            "pendiente",
            "resuelto",
            "descartado"
        ];

        if (
            !estadosPermitidos.includes(
                repo_status
            )
        ) {
            return res.status(400).json({
                error:
                    "Estado de reporte no válido"
            });
        }


        // =========================================
        // COMPROBAR PERMISO
        // =========================================

        comprobarPermiso(
            id_user,
            'gestionar_reportes',
            (errorPermiso, tienePermiso) => {

                if (errorPermiso) {
                    return res.status(500).json({
                        error:
                            "No se pudo comprobar el permiso para gestionar reportes."
                    });
                }

                if (!tienePermiso) {
                    return res.status(403).json({
                        error:
                            "No tienes permisos para gestionar los reportes."
                    });
                }

            // =========================================
            // BUSCAR EL REPORTE
            // =========================================

            const sqlReporte = `
                SELECT
                    id_repo,
                    id_mens
                FROM reports
                WHERE id_repo = ?
            `;

            db.query(
                sqlReporte,
                [idReporte],
                (error, reportes) => {

                    if (error) {

                        console.error(
                            "Error al buscar reporte:",
                            error
                        );

                        return res.status(500).json({
                            error:
                                "Error al buscar reporte"
                        });

                    }


                    if (
                        reportes.length === 0
                    ) {

                        return res.status(404).json({
                            error:
                                "No se encontró el reporte"
                        });

                    }


                    const reporte =
                        reportes[0];


                    // =========================================
                    // BUSCAR USUARIO DEL MENSAJE
                    // =========================================

                    const sqlMensaje = `
                        SELECT
                            id_user
                        FROM menssages
                        WHERE id_mensaje = ?
                    `;

                    db.query(
                        sqlMensaje,
                        [reporte.id_mens],
                        (error, mensajes) => {

                            if (error) {

                                console.error(
                                    "Error al buscar mensaje:",
                                    error
                                );

                                return res.status(500).json({
                                    error:
                                        "Error al buscar mensaje"
                                });

                            }


                            if (
                                mensajes.length === 0
                            ) {

                                return res.status(404).json({
                                    error:
                                        "No se encontró el mensaje reportado"
                                });

                            }


                            const idUsuarioReportado =
                                mensajes[0].id_user;


                            // =========================================
                            // ACTUALIZAR ESTADO DEL REPORTE
                            // =========================================

                            const sqlActualizar = `
                                UPDATE reports
                                SET repo_status = ?
                                WHERE id_repo = ?
                            `;

                            db.query(
                                sqlActualizar,
                                [
                                    repo_status,
                                    idReporte
                                ],
                                (error) => {

                                    if (error) {

                                        console.error(
                                            "Error al actualizar reporte:",
                                            error
                                        );

                                        return res.status(500).json({
                                            error:
                                                "Error al actualizar reporte"
                                        });

                                    }


                                    // =========================================
                                    // DETERMINAR MENSAJE
                                    // =========================================

                                    let contenido;


                                    if (
                                        repo_status === "resuelto"
                                    ) {

                                        contenido =
                                            "Un administrador ha revisado y resuelto un reporte relacionado con uno de tus mensajes.";

                                    }
                                    else if (
                                        repo_status === "descartado"
                                    ) {

                                        contenido =
                                            "Un administrador ha revisado y descartado un reporte relacionado con uno de tus mensajes.";

                                    }


                                    // =========================================
                                    // CREAR NOTIFICACIÓN
                                    // =========================================

                                    if (
                                        contenido
                                    ) {

                                        const sqlNotificacion = `
                                            INSERT INTO notifications
                                            (
                                                id_user,
                                                noti_type,
                                                noti_content,
                                                noti_status,
                                                id_mensaje
                                            )
                                            VALUES (?, 'reporte', ?, 'no_leida', ?)
                                        `;

                                        db.query(
                                            sqlNotificacion,
                                            [
                                                idUsuarioReportado,
                                                contenido,
                                                reporte.id_mens
                                            ],
                                            (error) => {

                                                if (error) {

                                                    console.error(
                                                        "Error al crear notificación:",
                                                        error
                                                    );

                                                    return res.status(500).json({
                                                        error:
                                                            "El reporte fue actualizado, pero no se pudo crear la notificación"
                                                    });

                                                }


                                                console.log(
                                                    "Reporte actualizado y notificación creada:",
                                                    idReporte,
                                                    repo_status
                                                );


                                                return res.json({
                                                    mensaje:
                                                        "Reporte actualizado y notificación creada correctamente"
                                                });

                                            }
                                        );


                                        return;

                                    }


                                    // =========================================
                                    // ESTADO PENDIENTE
                                    // =========================================

                                    return res.json({
                                        mensaje:
                                            "Reporte actualizado correctamente"
                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});


module.exports = router;