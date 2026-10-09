const express =
    require('express');

const db =
    require('../database/db');

const {
    comprobarPermiso
} =
    require('../middleware/permissions');

const router =
    express.Router();

const subirImagen =
    require('../config/upload');

const { franc } = require('franc');

// =========================================
// OBTENER MENSAJES POR CANAL
// =========================================

router.get('/messages', (req, res) => {

    const id_chan =
        req.query.id_chan;

    // =========================================
    // VERIFICAR QUE SE INDIQUE EL CANAL
    // =========================================

    if (!id_chan) {

        return res.status(400).json({
            error:
                'Debes indicar el canal.'
        });

    }

    const sql = `
        SELECT
            m.id_mensaje,
            m.id_user,
            u.user_name,
            m.mens_content,
            m.mens_image,
            m.mens_date_publ,
            m.mens_status,
            m.id_mens_fath,
            m.id_chan,
            m.mens_language
        FROM menssages AS m
        INNER JOIN users AS u
            ON m.id_user = u.id_user
        WHERE m.id_chan = ?
        ORDER BY m.mens_date_publ DESC
    `;

    db.query(
        sql,
        [Number(id_chan)],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al consultar mensajes:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al consultar mensajes'
                });

            }

            console.log(
                'Mensajes del canal ' +
                id_chan +
                ':',
                resultados
            );

            return res.json(
                resultados
            );

        }
    );

});

// =========================================
// ELIMINAR MENSAJE
// =========================================

router.delete('/messages/:id', (req, res) => {

    const idMensaje =
        Number(req.params.id);

    const {
        id_user
    } = req.body;


    // =========================================
    // VALIDAR DATOS
    // =========================================

    if (
        !idMensaje ||
        !id_user
    ) {

        return res.status(400).json({
            error:
                'El ID del mensaje y el usuario son obligatorios'
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
                        'No tienes permisos para moderar mensajes.'
                });

            }


            // =========================================
            // ELIMINAR MENSAJE
            // =========================================

            db.query(
                'DELETE FROM menssages WHERE id_mensaje = ?',
                [idMensaje],
                (error, results) => {

                    if (error) {

                        console.error(
                            'Error al eliminar mensaje:',
                            error
                        );

                        return res.status(500).json({
                            error:
                                'Error al eliminar mensaje'
                        });

                    }


                    if (
                        results.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            error:
                                'Mensaje no encontrado'
                        });

                    }


                    return res.json({
                        mensaje:
                            'Mensaje eliminado correctamente',
                        id_mensaje:
                            idMensaje
                    });

                }
            );

        }
    );

});

// =========================================
// MENSAJES PUBLICADOS
// =========================================

router.post(
    '/messages',
    subirImagen.single('mens_image'),
    async (req, res) => {

        const {
            id_user,
            mens_content,
            mens_status,
            id_mens_fath,
            id_chan
        } = req.body;

        

    let mens_language = null;

    // =========================================
    // DETECTAR IDIOMA DEL MENSAJE
    // =========================================

    const idiomasPorCanal = {
        2: 'es',
        3: 'en',
        4: 'pt'
    };

    const textoMensaje =
        typeof mens_content === 'string'
            ? mens_content.trim()
            : '';

    if (textoMensaje.length >= 10) {
        try {
            const { franc } = await import('franc');

            const idiomaDetectado = franc(
                textoMensaje,
                { minLength: 10 }
            );

            const equivalencias = {
                spa: 'es',
                eng: 'en',
                por: 'pt'
            };

            mens_language =
                equivalencias[idiomaDetectado] || null;

            console.log(
                'Idioma detectado por franc:',
                idiomaDetectado
            );

        } catch (error) {
            console.error(
                'Error al detectar idioma:',
                error
            );
        }
    }

    // =========================================
    // RESPALDO SEGÚN EL IDIOMA DEL CANAL
    // =========================================

    if (!mens_language) {
        mens_language =
            idiomasPorCanal[Number(id_chan)] || null;
    }

    console.log('Texto del mensaje:', textoMensaje);
    console.log('Canal del mensaje:', id_chan);
    console.log('Idioma que se guardará:', mens_language);


        // =========================================
        // VERIFICAR SI EL USUARIO ESTÁ
        // SANCIONADO POR SILENCIO
        // =========================================

        const sqlSilencio = `
            SELECT
                id_interacion,
                usin_date_end
            FROM users_interactions
            WHERE id_user_dest = ?
            AND usin_type_inte = 'silenciar'
            AND status = 'activo'
            AND usin_date_end IS NOT NULL
            AND usin_date_end > CURRENT_TIMESTAMP(6)
            LIMIT 1
        `;

        db.query(
            sqlSilencio,
            [id_user],
            (errorSilencio, resultadosSilencio) => {

                if (errorSilencio) {

                    console.error(
                        'Error al verificar silencio:',
                        errorSilencio
                    );

                    return res.status(500).json({
                        error:
                            'Error al verificar permisos de publicación'
                    });
                }

                // Usuario actualmente silenciado

                if (
                    resultadosSilencio.length > 0
                ) {

                    return res.status(403).json({
                        error:
                            'No puedes enviar mensajes porque estás silenciado temporalmente.',
                        usin_date_end:
                            resultadosSilencio[0]
                                .usin_date_end
                    });
                }

                // =========================================
                // VERIFICAR SI EL USUARIO ESTÁ
                // BLOQUEADO TEMPORALMENTE
                // =========================================

                const sqlBloqueo = `
                    SELECT
                        id_interacion,
                        usin_date_end
                    FROM users_interactions
                    WHERE id_user_dest = ?
                    AND usin_type_inte = 'bloquear'
                    AND status = 'activo'
                    AND usin_date_end IS NOT NULL
                    AND usin_date_end > CURRENT_TIMESTAMP(6)
                    LIMIT 1
                `;

                db.query(
                    sqlBloqueo,
                    [id_user],
                    (
                        errorBloqueo,
                        resultadosBloqueo
                    ) => {

                        if (errorBloqueo) {

                            console.error(
                                'Error al verificar bloqueo:',
                                errorBloqueo
                            );

                            return res.status(500).json({
                                error:
                                    'Error al verificar permisos de publicación'
                            });
                        }

                        // Usuario actualmente bloqueado

                        if (
                            resultadosBloqueo.length > 0
                        ) {

                            return res.status(403).json({
                                error:
                                    'No puedes enviar mensajes porque estás bloqueado temporalmente.',
                                usin_date_end:
                                    resultadosBloqueo[0]
                                        .usin_date_end
                            });
                        }

                        // =========================================
                        // VERIFICAR PERMISO PARA INFORMACIÓN GENERAL
                        // =========================================

                        if (Number(id_chan) === 1) {

                            const sqlRol = `
                                SELECT
                                    id_role
                                FROM users
                                WHERE id_user = ?
                            `;

                            db.query(
                                sqlRol,
                                [id_user],
                                (
                                    error,
                                    resultados
                                ) => {

                                    if (error) {

                                        console.error(
                                            'Error al verificar el rol del usuario:',
                                            error
                                        );

                                        return res.status(500).json({
                                            error:
                                                'Error al verificar permisos'
                                        });
                                    }

                                    // Usuario no encontrado

                                    if (
                                        resultados.length === 0
                                    ) {

                                        return res.status(404).json({
                                            error:
                                                'Usuario no encontrado'
                                        });
                                    }

                                    const idRole =
                                        resultados[0]
                                            .id_role;

                                    // Solo administrador puede publicar
                                    // en Información General

                                    if (
                                        Number(idRole) !== 1
                                    ) {

                                        return res.status(403).json({
                                            error:
                                                'Solo los administradores pueden publicar en Información General.'
                                        });
                                    }

                                    // Si es administrador,
                                    // continuar con el mensaje

                                    insertarMensaje();

                                }
                            );

                        } else {

                            // Otros canales funcionan normalmente

                            insertarMensaje();
                        }

                    }
                );
            }
        );

        // =========================================
        // FUNCIÓN PARA INSERTAR EL MENSAJE
        // =========================================

        function insertarMensaje() {

            let mens_image = null;

            if (req.file) {

                mens_image =
                    'uploads/mensajes/' +
                    req.file.filename;
            }

            const sql = `
                INSERT INTO menssages (
                    id_user,
                    mens_content,
                    mens_image,
                    mens_status,
                    id_mens_fath,
                    id_chan,
                    mens_language
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    id_user,
                    mens_content || null,
                    mens_image,
                    mens_status,
                    id_mens_fath || null,
                    id_chan,
                    mens_language
                ],
                (error, resultado) => {

                    if (error) {

                        console.error(
                            'Error al insertar mensaje:',
                            error
                        );

                        return res.status(500).json({
                            error:
                                'Error al publicar el mensaje'
                        });
                    }

                    res.status(201).json({
                    mensaje:
                        'Mensaje creado correctamente',

                    id_mensaje:
                        resultado.insertId,

                    mens_image:
                        mens_image
                });
                }
            );
        }
    }
);

module.exports = router;