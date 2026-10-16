
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// =========================================
// AUTENTICAR SOLICITUDES MEDIANTE JWT
// Y COMPROBAR EL ESTADO ACTUAL DEL USUARIO
// =========================================

function autenticarToken(req, res, next) {

    const encabezado = req.headers.authorization;

    if (
        !encabezado ||
        !encabezado.startsWith('Bearer ')
    ) {
        return res.status(401).json({
            error: 'Debes iniciar sesión para continuar.'
        });
    }

    const token = encabezado.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            error: 'La credencial de acceso no es válida.'
        });
    }

    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        console.error('Falta configurar JWT_SECRET.');

        return res.status(500).json({
            error: 'El servidor no tiene configurada la autenticación.'
        });
    }

    jwt.verify(
        token,
        secreto,
        { algorithms: ['HS256'] },
        (error, datos) => {

            if (error) {
                return res.status(401).json({
                    error: 'La sesión no es válida o ha caducado.'
                });
            }

            if (
                !datos ||
                !Number.isSafeInteger(datos.id_user) ||
                datos.id_user <= 0
            ) {
                return res.status(401).json({
                    error: 'La identidad de la sesión no es válida.'
                });
            }

            const sql = `
                SELECT id_user, user_status
                FROM users
                WHERE id_user = ?
                LIMIT 1
            `;

            db.query(
                sql,
                [datos.id_user],
                (errorBD, resultados) => {

                    if (errorBD) {
                        console.error(
                            'Error al comprobar el estado de la cuenta:',
                            errorBD
                        );

                        return res.status(500).json({
                            error: 'No se pudo verificar el estado de la cuenta.'
                        });
                    }

                    if (resultados.length === 0) {
                        return res.status(401).json({
                            error: 'La cuenta asociada a esta sesión no existe.'
                        });
                    }

                    if (resultados[0].user_status !== 'activo') {
                        return res.status(403).json({
                            error: 'La cuenta no está activa.'
                        });
                    }

                    req.usuario = {
                        id_user: Number(resultados[0].id_user)
                    };

                    next();
                }
            );
        }
    );
}

module.exports = {
    autenticarToken
};
