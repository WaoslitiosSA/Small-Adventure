const express =
    require('express');

const router =
    express.Router();

const db =
    require('../database/db');


// =========================================
// CREAR NOTIFICACIÓN
// =========================================

router.post('/notifications', (req, res) => {

    const {
        id_user,
        noti_type,
        noti_content,
        id_mensaje
    } = req.body;


    // =========================================
    // VALIDAR DATOS OBLIGATORIOS
    // =========================================

    if (
        !id_user ||
        !noti_type ||
        !noti_content
    ) {

        return res.status(400).json({
            error:
                'Faltan datos para crear la notificación'
        });

    }


    const sql = `
        INSERT INTO notifications
        (
            id_user,
            noti_type,
            noti_content,
            id_mensaje
        )
        VALUES (?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            id_user,
            noti_type,
            noti_content,
            id_mensaje || null
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al crear notificación:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al crear notificación'
                });

            }


            res.status(201).json({

                mensaje:
                    'Notificación creada correctamente',

                id_notificacion:
                    resultado.insertId

            });

        }
    );

});


// =========================================
// OBTENER NOTIFICACIONES DE UN USUARIO
// =========================================

router.get('/notifications/:id_user', (req, res) => {

    const idUsuario =
        Number(req.params.id_user);


    // =========================================
    // VALIDAR ID
    // =========================================

    if (!idUsuario) {

        return res.status(400).json({
            error:
                'ID de usuario no válido'
        });

    }


    // =========================================
    // CONSULTAR NOTIFICACIONES
    // =========================================

    const sql = `
        SELECT
            id_notificacion,
            id_user,
            noti_type,
            noti_content,
            noti_date,
            noti_status,
            id_mensaje
        FROM notifications
        WHERE id_user = ?
        ORDER BY noti_date DESC
    `;


    db.query(
        sql,
        [idUsuario],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al obtener notificaciones:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al obtener notificaciones'
                });

            }


            console.log(
                'Notificaciones del usuario:',
                idUsuario,
                resultados
            );


            res.json(
                resultados
            );

        }
    );

});


// =========================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// =========================================

router.put('/notifications/:id', (req, res) => {

    const idNotificacion =
        req.params.id;


    const sql = `
        UPDATE notifications
        SET noti_status = 'leida'
        WHERE id_notificacion = ?
    `;


    db.query(
        sql,
        [idNotificacion],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al actualizar notificación:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al actualizar notificación'
                });

            }


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    error:
                        'Notificación no encontrada'
                });

            }


            res.json({

                mensaje:
                    'Notificación marcada como leída',

                id_notificacion:
                    idNotificacion

            });

        }
    );

});


// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports =
    router;