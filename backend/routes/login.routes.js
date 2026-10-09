const express = require('express');

const bcrypt = require('bcrypt');

const router = express.Router();

const db = require('../database/db');


// =========================================
// LOGIN
// =========================================

router.post('/login', (req, res) => {

    const {
        user_mail,
        user_password
    } = req.body;


    // =========================================
    // COMPROBAR DATOS
    // =========================================

    if (!user_mail || !user_password) {

        return res.status(400).json({
            error:
                'Correo y contraseña son obligatorios'
        });

    }


    // =========================================
    // BUSCAR USUARIO POR CORREO
    // =========================================

    const sql = `
        SELECT
            id_user,
            user_name,
            user_mail,
            user_password,
            id_role,
            user_status
        FROM users
        WHERE user_mail = ?
    `;


    db.query(
        sql,
        [user_mail],
        async (error, resultados) => {

            if (error) {

                console.error(
                    'Error al buscar usuario:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al iniciar sesión'
                });

            }


            // =========================================
            // USUARIO NO EXISTE
            // =========================================

            if (resultados.length === 0) {

                return res.status(401).json({
                    error:
                        'Correo o contraseña incorrectos'
                });

            }


            const usuario =
                resultados[0];


            // =========================================
            // COMPROBAR ESTADO
            // =========================================

            if (
                usuario.user_status !==
                'activo'
            ) {

                return res.status(403).json({
                    error:
                        'Esta cuenta no está activa.'
                });

            }


            // =========================================
            // COMPARAR CONTRASEÑA CON BCRYPT
            // =========================================

            try {

                const contraseñaCorrecta =
                    await bcrypt.compare(
                        user_password,
                        usuario.user_password
                    );


                if (!contraseñaCorrecta) {

                    return res.status(401).json({
                        error:
                            'Correo o contraseña incorrectos'
                    });

                }


                // =========================================
                // LOGIN CORRECTO
                // =========================================

                res.json({

                    id_user:
                        usuario.id_user,

                    user_name:
                        usuario.user_name,

                    user_mail:
                        usuario.user_mail,

                    id_role:
                        usuario.id_role

                });

            } catch (error) {

                console.error(
                    'Error al comprobar contraseña:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al comprobar la contraseña'
                });

            }

        }
    );

});


// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports = router;