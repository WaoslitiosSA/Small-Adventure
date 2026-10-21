const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { autenticarToken } = require('../middleware/auth');

// =========================================
// UTILIDADES
// =========================================

function esParticipante(idConv, idUser, callback) {
    db.query(
        `SELECT 1
         FROM conversations_stakes
         WHERE id_conv = ? AND id_user = ?
         LIMIT 1`,
        [idConv, idUser],
        (error, resultados) => {
            if (error) {
                return callback(error, false);
            }
            return callback(null, resultados.length > 0);
        }
    );
}

function bloqueoPorModeracion(idUser, callback) {
    db.query(
        `SELECT usin_date_end
         FROM users_interactions
         WHERE id_user_dest = ?
           AND usin_type_inte = 'bloquear'
           AND status = 'activo'
           AND usin_date_end IS NOT NULL
           AND usin_date_end > CURRENT_TIMESTAMP(6)
         LIMIT 1`,
        [idUser],
        (error, resultados) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, resultados.length > 0 ? resultados[0] : null);
        }
    );
}

// =========================================
// OBTENER O CREAR CONVERSACIÓN PRIVADA
// =========================================

router.post('/conversations/private', autenticarToken, (req, res) => {

    // El usuario 1 siempre es quien tiene la sesión iniciada.
    const id_user_1 = req.usuario.id_user;
    const id_user_2 = Number(req.body.id_user_2);

    if (!Number.isSafeInteger(id_user_2) || id_user_2 <= 0) {
        return res.status(400).json({
            error: 'Faltan usuarios para crear la conversación'
        });
    }

    if (id_user_1 === id_user_2) {
        return res.status(400).json({
            error: 'No puedes crear una conversación contigo mismo'
        });
    }

    // 1. El destinatario debe existir y estar activo
    db.query(
        `SELECT 1 FROM users
         WHERE id_user = ? AND user_status = 'activo'
         LIMIT 1`,
        [id_user_2],
        (errorUsuario, usuarios) => {

            if (errorUsuario) {
                console.error('Error al buscar destinatario:', errorUsuario);
                return res.status(500).json({
                    error: 'No se pudo crear la conversación'
                });
            }

            if (usuarios.length === 0) {
                return res.status(404).json({
                    error: 'El usuario no existe o no está activo'
                });
            }

            // 2. Bloqueo temporal por moderación
            bloqueoPorModeracion(id_user_1, (errorMod, bloqueo) => {

                if (errorMod) {
                    console.error('Error al verificar bloqueo de moderación:', errorMod);
                    return res.status(500).json({
                        error: 'No se pudo verificar el bloqueo de moderación'
                    });
                }

                if (bloqueo) {
                    return res.status(403).json({
                        error: 'No puedes enviar mensajes privados porque estás bloqueado temporalmente.',
                        usin_date_end: bloqueo.usin_date_end
                    });
                }

                verificarBloqueoEntreUsuarios();
            });
        }
    );

    // 3. Bloqueo entre los dos usuarios
    function verificarBloqueoEntreUsuarios() {

        db.query(
            `SELECT id_interacion
             FROM users_interactions
             WHERE (
                    (id_user_original = ? AND id_user_dest = ?)
                    OR
                    (id_user_original = ? AND id_user_dest = ?)
                   )
               AND usin_type_inte = 'bloquear'
               AND status = 'activo'
               AND (usin_date_end IS NULL OR usin_date_end > CURRENT_TIMESTAMP(6))
             LIMIT 1`,
            [id_user_1, id_user_2, id_user_2, id_user_1],
            (error, bloqueos) => {

                if (error) {
                    console.error('Error al verificar bloqueo:', error);
                    return res.status(500).json({
                        error: 'No se pudo verificar el bloqueo'
                    });
                }

                if (bloqueos.length > 0) {
                    return res.status(403).json({
                        error: 'No puedes iniciar una conversación con este usuario porque existe un bloqueo.'
                    });
                }

                buscarConversacion();
            }
        );
    }

    // 4. Buscar la conversación o crearla
    function buscarConversacion() {

        db.query(
            `SELECT c.id_conv
             FROM conversations AS c
             INNER JOIN conversations_stakes AS cs1 ON c.id_conv = cs1.id_conv
             INNER JOIN conversations_stakes AS cs2 ON c.id_conv = cs2.id_conv
             WHERE cs1.id_user = ?
               AND cs2.id_user = ?
               AND c.conv_status = 'activo'
             LIMIT 1`,
            [id_user_1, id_user_2],
            (error, resultados) => {

                if (error) {
                    console.error('Error al buscar conversación:', error);
                    return res.status(500).json({
                        error: 'No se pudo buscar la conversación'
                    });
                }

                if (resultados.length > 0) {
                    return res.json({
                        id_conv: resultados[0].id_conv,
                        existente: true
                    });
                }

                db.query(
                    `INSERT INTO conversations (conv_status) VALUES ('activo')`,
                    (errorCrear, resultado) => {

                        if (errorCrear) {
                            console.error('Error al crear conversación:', errorCrear);
                            return res.status(500).json({
                                error: 'No se pudo crear la conversación'
                            });
                        }

                        const idConv = resultado.insertId;

                        db.query(
                            `INSERT INTO conversations_stakes (id_user, id_conv, cost_name)
                             VALUES (?, ?, ?), (?, ?, ?)`,
                            [
                                id_user_1, idConv, 'Participante',
                                id_user_2, idConv, 'Participante'
                            ],
                            (errorParticipantes) => {

                                if (errorParticipantes) {
                                    console.error('Error al añadir participantes:', errorParticipantes);

                                    // Evitar dejar una conversación sin participantes
                                    return db.query(
                                        'DELETE FROM conversations WHERE id_conv = ?',
                                        [idConv],
                                        () => res.status(500).json({
                                            error: 'No se pudieron añadir los participantes'
                                        })
                                    );
                                }

                                return res.json({
                                    id_conv: idConv,
                                    existente: false
                                });
                            }
                        );
                    }
                );
            }
        );
    }
});

// =========================================
// OBTENER MENSAJES DE UNA CONVERSACIÓN
// =========================================

router.get('/conversations/:id_conv/messages', autenticarToken, (req, res) => {

    const idConv = Number(req.params.id_conv);
    const idUser = req.usuario.id_user;

    if (!Number.isSafeInteger(idConv) || idConv <= 0) {
        return res.status(400).json({ error: 'ID de conversación no válido' });
    }

    esParticipante(idConv, idUser, (errorPart, participa) => {

        if (errorPart) {
            console.error('Error al comprobar participante:', errorPart);
            return res.status(500).json({
                error: 'No se pudieron obtener los mensajes privados'
            });
        }

        if (!participa) {
            return res.status(403).json({
                error: 'No tienes acceso a esta conversación.'
            });
        }

        db.query(
            `SELECT
                m.id_mens_priv,
                m.id_conv,
                m.id_user,
                u.user_name,
                m.mepr_content,
                m.mepr_date_send,
                m.mepr_status
             FROM menssages_privates AS m
             INNER JOIN users AS u ON m.id_user = u.id_user
             WHERE m.id_conv = ?
             ORDER BY m.mepr_date_send ASC`,
            [idConv],
            (error, resultados) => {

                if (error) {
                    console.error('Error al obtener mensajes privados:', error);
                    return res.status(500).json({
                        error: 'No se pudieron obtener los mensajes privados'
                    });
                }

                return res.json(resultados);
            }
        );
    });
});

// =========================================
// ENVIAR MENSAJE PRIVADO
// =========================================

router.post('/conversations/:id_conv/messages', autenticarToken, (req, res) => {

    const idConv = Number(req.params.id_conv);

    // La identidad sale del token, no del cuerpo de la petición
    const id_user = req.usuario.id_user;

    const contenido =
        typeof req.body.mepr_content === 'string'
            ? req.body.mepr_content.trim()
            : '';

    if (
        !Number.isSafeInteger(idConv) || idConv <= 0 ||
        !contenido || contenido.length > 2000
    ) {
        return res.status(400).json({
            error: 'Faltan datos válidos para enviar el mensaje'
        });
    }

    esParticipante(idConv, id_user, (errorPart, participa) => {

        if (errorPart) {
            console.error('Error al comprobar participante:', errorPart);
            return res.status(500).json({
                error: 'No se pudo enviar el mensaje privado'
            });
        }

        if (!participa) {
            return res.status(403).json({
                error: 'No tienes acceso a esta conversación.'
            });
        }

        bloqueoPorModeracion(id_user, (errorMod, bloqueo) => {

            if (errorMod) {
                console.error('Error al verificar bloqueo de moderación:', errorMod);
                return res.status(500).json({
                    error: 'No se pudo verificar el bloqueo de moderación'
                });
            }

            if (bloqueo) {
                return res.status(403).json({
                    error: 'No puedes enviar mensajes privados porque estás bloqueado temporalmente.',
                    usin_date_end: bloqueo.usin_date_end
                });
            }

            db.query(
                `INSERT INTO menssages_privates
                 (id_conv, id_user, mepr_content, mepr_status)
                 VALUES (?, ?, ?, 'activo')`,
                [idConv, id_user, contenido],
                (error, resultado) => {

                    if (error) {
                        console.error('Error al enviar mensaje privado:', error);
                        return res.status(500).json({
                            error: 'No se pudo enviar el mensaje privado'
                        });
                    }

                    return res.json({
                        mensaje: 'Mensaje privado enviado correctamente',
                        id_mens_priv: resultado.insertId
                    });
                }
            );
        });
    });
});

module.exports = router;