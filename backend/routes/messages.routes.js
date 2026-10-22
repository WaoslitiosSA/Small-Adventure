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

const subirImagen =
    require('../config/upload');


// =========================================
// CONFIGURAR CLOUDINARY
// =========================================

const { v2: cloudinary } =
    require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        AND m.mens_status <> 'eliminado'
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

router.delete(
    '/messages/:id',
    autenticarToken,
    (req, res) => {

    const idMensaje =
        Number(req.params.id);

    // Obtener la identidad del administrador desde el JWT.
    const id_user = req.usuario.id_user;

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
    autenticarToken,
    subirImagen.single('mens_image'),
    async (req, res) => {

        if (req.file && !subirImagen.esImagenReal(req.file.buffer)) {
            return res.status(400).json({ error: 'Solo se permiten archivos de imagen.' });
        }

    const {
        mens_content,
        mens_status,
        id_mens_fath,
        id_chan
    } = req.body;

const textoLimpio =
    typeof mens_content === 'string' ? mens_content.trim() : '';

const canal = Number(id_chan);
const padre = id_mens_fath ? Number(id_mens_fath) : null;

if (
    !Number.isSafeInteger(canal) || canal <= 0 ||
    textoLimpio.length > 2000 ||
    (!textoLimpio && !req.file) ||
    (padre !== null && (!Number.isSafeInteger(padre) || padre <= 0))
) {
    return res.status(400).json({ error: 'Datos del mensaje no válidos' });
}

// La identidad procede del JWT, no del navegador.
const id_user = req.usuario.id_user;

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

            // Guardar el mensaje en MySQL una vez
            // obtenida la URL de Cloudinary.
            function guardarMensaje(mens_image) {

                const sql = `
                    INSERT INTO menssages [
                        id_user,
                        textoLimpio || null,
                        mens_image,
                        'activo',          // usa el valor real que manda hoy tu frontend
                        padre,
                        canal,
                        null               // mens_language: ya no se usa
                    ]
                        
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
                                    'Error al publicar el mensaje',
                                codigo:
                                    'ERROR_INSERTAR_MENSAJE'
                            });
                        }

                        return res.status(201).json({
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

            // Si el mensaje no tiene imagen,
            // guardarlo normalmente.
            if (!req.file) {
                return guardarMensaje(null);
            }

            // =========================================
            // SUBIR IMAGEN A CLOUDINARY
            // =========================================

            const flujoImagen =
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'small-adventure/mensajes',
                        resource_type: 'image'
                    },
                    (error, resultado) => {

                        if (error) {

                            console.error(
                                'Error al subir imagen a Cloudinary:',
                                error.message
                            );

                            return res.status(502).json({
                                error:
                                    'No se pudo almacenar la imagen. Inténtalo nuevamente.',
                                codigo:
                                    'ERROR_CLOUDINARY'
                            });
                        }

                        if (
                            !resultado ||
                            !resultado.secure_url
                        ) {

                            return res.status(502).json({
                                error:
                                    'Cloudinary no devolvió la URL de la imagen.',
                                codigo:
                                    'URL_CLOUDINARY_NO_DISPONIBLE'
                            });
                        }

                        // Guardar la URL HTTPS en MySQL.
                        guardarMensaje(
                            resultado.secure_url
                        );
                    }
                );

            flujoImagen.end(req.file.buffer);
        }
    }
);

module.exports = router;