const express =
    require('express');

const db =
    require('../database/db');

const router =
    express.Router();


// =========================================
// ACTUALIZAR CONTRASEÑA
// =========================================

router.put('/password', (req, res) => {

    const {
        user_mail,
        user_password
    } = req.body;

    if (!user_mail || !user_password) {

        return res.status(400).json({
            error:
                'Correo y nueva contraseña son obligatorios'
        });

    }

    const sql = `
        UPDATE users
        SET user_password = ?
        WHERE user_mail = ?
    `;

    db.query(
        sql,
        [
            user_password,
            user_mail
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al actualizar contraseña:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al actualizar contraseña'
                });

            }

            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    error:
                        'No existe una cuenta registrada con ese correo'
                });

            }

            res.json({
                mensaje:
                    'Contraseña actualizada correctamente'
            });

        }
    );

});


// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports =
    router;