
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

    if (
        typeof user_mail !== 'string' ||
        typeof user_password !== 'string' ||
        user_mail.length === 0 || user_mail.length > 100 ||
        user_password.length === 0 || user_password.length > 72
    ) {
        return res.status(400).json({
            error: 'Correo y contraseña son obligatorios.'
        });
    }

    // =========================================
    // COMPROBAR CONFIGURACIÓN JWT
    // =========================================

    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        console.error('Falta configurar JWT_SECRET.');

        return res.status(500).json({
            error: 'El servidor no tiene configurada la autenticación.'
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
                    error: 'Error al iniciar sesión.'
                });
            }

            // =========================================
            // USUARIO NO EXISTE
            // =========================================

            if (resultados.length === 0) {
                return res.status(401).json({
                    error: 'Correo o contraseña incorrectos.'
                });
            }

            const usuario = resultados[0];

            // =========================================
            // COMPARAR CONTRASEÑA CON BCRYPT
            // =========================================

            try {
                const contrasenaCorrecta = await bcrypt.compare(
                    user_password,
                    usuario.user_password
                );

                if (!contrasenaCorrecta) {
                    return res.status(401).json({
                        error: 'Correo o contraseña incorrectos.'
                    });
                }

                if (usuario.user_status !== 'activo') {
                    return res.status(403).json({
                        error: 'Esta cuenta no está activa.'
                    });
                }

                // =========================================
                // GENERAR TOKEN JWT
                // =========================================

                const idUsuario = Number(usuario.id_user);

                if (
                    !Number.isSafeInteger(idUsuario) ||
                    idUsuario <= 0
                ) {
                    console.error(
                        'El ID del usuario no es un entero seguro.'
                    );

                    return res.status(500).json({
                        error: 'No se pudo completar la autenticación.'
                    });
                }

                const token = jwt.sign(
                    {
                        id_user: idUsuario
                    },
                    secreto,
                    {
                        algorithm: 'HS256',
                        expiresIn: '1h'
                    }
                );

               return res.json({
                token,

                // Nivel superior: es lo que lee login SM.js
                id_user: idUsuario,
                user_name: usuario.user_name,
                user_mail: usuario.user_mail,
                id_role: Number(usuario.id_role),

                // Mismos datos agrupados, por si algún script los usa así
                usuario: {
                    id: idUsuario,
                    id_user: idUsuario,
                    nombre: usuario.user_name,
                    user_name: usuario.user_name,
                    rol: Number(usuario.id_role) === 1 ? 'admin' : 'usuario',
                    id_role: Number(usuario.id_role)
                }
            });

            } catch (error) {

                console.error(
                    'Error durante la autenticación:',
                    error
                );

                return res.status(500).json({
                    error: 'Error al iniciar sesión.'
                });
            }
        }
    );
});

// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports = router;