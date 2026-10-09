const express =
    require('express');

const router =
    express.Router();

const db =
    require('../database/db');


// =========================================
// OBTENER O CREAR CONVERSACIÓN PRIVADA
// =========================================

router.post('/conversations/private', (req, res) => {

    const {
        id_user_1,
        id_user_2
    } = req.body;


    // =========================================
    // VERIFICAR DATOS
    // =========================================

    if (!id_user_1 || !id_user_2) {

        return res.status(400).json({
            error:
                'Faltan usuarios para crear la conversación'
        });

    }


    // =========================================
    // EVITAR CONVERSACIÓN CONSIGO MISMO
    // =========================================

    if (
        Number(id_user_1) ===
        Number(id_user_2)
    ) {

        return res.status(400).json({
            error:
                'No puedes crear una conversación contigo mismo'
        });

    }


    // =========================================
    // VERIFICAR BLOQUEO TEMPORAL
    // POR MODERACIÓN
    // =========================================

    const sqlBloqueoModeracion = `
        SELECT
            id_interacion,
            usin_date_end
        FROM users_interactions
        WHERE
            id_user_dest = ?
            AND usin_type_inte = 'bloquear'
            AND status = 'activo'
            AND usin_date_end IS NOT NULL
            AND usin_date_end > CURRENT_TIMESTAMP(6)
        LIMIT 1
    `;

    db.query(
        sqlBloqueoModeracion,
        [id_user_1],
        (errorBloqueoModeracion, bloqueosModeracion) => {

            if (errorBloqueoModeracion) {

                console.error(
                    'Error al verificar bloqueo de moderación:',
                    errorBloqueoModeracion
                );

                return res.status(500).json({
                    error:
                        'No se pudo verificar el bloqueo de moderación'
                });

            }


            // =========================================
            // USUARIO BLOQUEADO POR MODERACIÓN
            // =========================================

            if (bloqueosModeracion.length > 0) {

                return res.status(403).json({
                    error:
                        'No puedes enviar mensajes privados porque estás bloqueado temporalmente.',
                    usin_date_end:
                        bloqueosModeracion[0].usin_date_end
                });

            }


            // =========================================
            // CONTINUAR CON BLOQUEO ENTRE USUARIOS
            // =========================================

            verificarBloqueoEntreUsuarios();

        }
    );


    // =========================================
    // VERIFICAR BLOQUEO ENTRE LOS DOS USUARIOS
    // =========================================

    function verificarBloqueoEntreUsuarios() {

        const sqlBloqueo = `
            SELECT
                id_interacion,
                usin_date_end
            FROM users_interactions
            WHERE
                (
                    (
                        id_user_original = ?
                        AND id_user_dest = ?
                    )
                    OR
                    (
                        id_user_original = ?
                        AND id_user_dest = ?
                    )
                )
                AND usin_type_inte = 'bloquear'
                AND status = 'activo'
                AND (
                    usin_date_end IS NULL
                    OR usin_date_end > CURRENT_TIMESTAMP(6)
                )
            LIMIT 1
        `;

        db.query(
            sqlBloqueo,
            [
                id_user_1,
                id_user_2,
                id_user_2,
                id_user_1
            ],
            (error, bloqueos) => {

                if (error) {

                    console.error(
                        'Error al verificar bloqueo:',
                        error
                    );

                    return res.status(500).json({
                        error:
                            'No se pudo verificar el bloqueo'
                    });

                }


                // =========================================
                // SI EXISTE UN BLOQUEO
                // =========================================

                if (bloqueos.length > 0) {

                    return res.status(403).json({
                        error:
                            'No puedes iniciar una conversación con este usuario porque existe un bloqueo.'
                    });

                }


                // =========================================
                // BUSCAR CONVERSACIÓN
                // =========================================

                buscarConversacion();

            }
        );

    }


    // =========================================
    // BUSCAR O CREAR CONVERSACIÓN
    // =========================================

    function buscarConversacion() {

        const sqlBuscar = `
            SELECT
                c.id_conv,
                c.conv_status
            FROM conversations AS c

            INNER JOIN conversations_stakes AS cs1
                ON c.id_conv = cs1.id_conv

            INNER JOIN conversations_stakes AS cs2
                ON c.id_conv = cs2.id_conv

            WHERE cs1.id_user = ?
            AND cs2.id_user = ?
            AND c.conv_status = 'activo'

            LIMIT 1
        `;

        db.query(
            sqlBuscar,
            [
                id_user_1,
                id_user_2
            ],
            (error, resultados) => {

                if (error) {

                    console.error(
                        'Error al buscar conversación:',
                        error
                    );

                    return res.status(500).json({
                        error:
                            'No se pudo buscar la conversación'
                    });

                }


                // =========================================
                // SI YA EXISTE
                // =========================================

                if (resultados.length > 0) {

                    return res.json({
                        id_conv:
                            resultados[0].id_conv,

                        existente:
                            true
                    });

                }


                // =========================================
                // CREAR NUEVA CONVERSACIÓN
                // =========================================

                const sqlCrear = `
                    INSERT INTO conversations
                    (
                        conv_status
                    )
                    VALUES ('activo')
                `;

                db.query(
                    sqlCrear,
                    (error, resultado) => {

                        if (error) {

                            console.error(
                                'Error al crear conversación:',
                                error
                            );

                            return res.status(500).json({
                                error:
                                    'No se pudo crear la conversación'
                            });

                        }

                        const idConv =
                            resultado.insertId;


                        // =========================================
                        // AÑADIR PARTICIPANTES
                        // =========================================

                        const sqlParticipantes = `
                            INSERT INTO conversations_stakes
                            (
                                id_user,
                                id_conv,
                                cost_name
                            )
                            VALUES
                            (?, ?, ?),
                            (?, ?, ?)
                        `;

                        db.query(
                            sqlParticipantes,
                            [
                                id_user_1,
                                idConv,
                                'Participante',

                                id_user_2,
                                idConv,
                                'Participante'
                            ],
                            (error) => {

                                if (error) {

                                    console.error(
                                        'Error al añadir participantes:',
                                        error
                                    );

                                    return res.status(500).json({
                                        error:
                                            'No se pudieron añadir los participantes'
                                    });

                                }

                                res.json({
                                    id_conv:
                                        idConv,

                                    existente:
                                        false
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

router.get('/conversations/:id_conv/messages', (req, res) => {

    const idConv =
        req.params.id_conv;

    const sql = `
        SELECT
            m.id_mens_priv,
            m.id_conv,
            m.id_user,
            u.user_name,
            m.mepr_content,
            m.mepr_date_send,
            m.mepr_status
        FROM menssages_privates AS m

        INNER JOIN users AS u
            ON m.id_user = u.id_user

        WHERE m.id_conv = ?

        ORDER BY m.mepr_date_send ASC
    `;

    db.query(
        sql,
        [idConv],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al obtener mensajes privados:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudieron obtener los mensajes privados'
                });

            }

            res.json(resultados);

        }
    );

});


// =========================================
// ENVIAR MENSAJE PRIVADO
// =========================================

router.post('/conversations/:id_conv/messages', (req, res) => {

    const idConv =
        req.params.id_conv;

    const {
        id_user,
        mepr_content
    } = req.body;


    // =========================================
    // VERIFICAR DATOS
    // =========================================

    if (!id_user || !mepr_content) {

        return res.status(400).json({
            error:
                'Faltan datos para enviar el mensaje'
        });

    }


    // =========================================
    // VERIFICAR BLOQUEO TEMPORAL
    // POR MODERACIÓN
    // =========================================

    const sqlBloqueoModeracion = `
        SELECT
            id_interacion,
            usin_date_end
        FROM users_interactions
        WHERE
            id_user_dest = ?
            AND usin_type_inte = 'bloquear'
            AND status = 'activo'
            AND usin_date_end IS NOT NULL
            AND usin_date_end > CURRENT_TIMESTAMP(6)
        LIMIT 1
    `;

    db.query(
        sqlBloqueoModeracion,
        [id_user],
        (errorBloqueo, bloqueos) => {

            if (errorBloqueo) {

                console.error(
                    'Error al verificar bloqueo de moderación:',
                    errorBloqueo
                );

                return res.status(500).json({
                    error:
                        'No se pudo verificar el bloqueo de moderación'
                });

            }


            // =========================================
            // USUARIO BLOQUEADO
            // =========================================

            if (bloqueos.length > 0) {

                return res.status(403).json({
                    error:
                        'No puedes enviar mensajes privados porque estás bloqueado temporalmente.',

                    usin_date_end:
                        bloqueos[0].usin_date_end
                });

            }


            // =========================================
            // ENVIAR MENSAJE PRIVADO
            // =========================================

            const sql = `
                INSERT INTO menssages_privates
                (
                    id_conv,
                    id_user,
                    mepr_content,
                    mepr_status
                )
                VALUES (?, ?, ?, 'activo')
            `;

            db.query(
                sql,
                [
                    idConv,
                    id_user,
                    mepr_content
                ],
                (error, resultado) => {

                    if (error) {

                        console.error(
                            'Error al enviar mensaje privado:',
                            error
                        );

                        return res.status(500).json({
                            error:
                                'No se pudo enviar el mensaje privado'
                        });

                    }

                    res.json({
                        mensaje:
                            'Mensaje privado enviado correctamente',

                        id_mens_priv:
                            resultado.insertId
                    });

                }
            );

        }
    );

});

// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports =
    router;