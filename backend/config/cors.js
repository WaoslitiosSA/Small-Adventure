
const ORIGENES_PERMITIDOS = [
    'https://waoslitiossa.github.io',
    'http://127.0.0.1:5500'
];

function configurarCors(req, res, next) {
    const origen = req.headers.origin;

    // Permitir solicitudes sin Origin, como algunas
    // herramientas de servidor y pruebas locales.
    if (!origen) {
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }

        return next();
    }

    // Rechazar orígenes no autorizados.
    if (!ORIGENES_PERMITIDOS.includes(origen)) {
        return res.status(403).json({
            error: 'Origen no permitido.'
        });
    }

    res.setHeader(
        'Access-Control-Allow-Origin',
        origen
    );

    res.setHeader(
        'Vary',
        'Origin'
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    );

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );

    // No habilitamos credenciales mediante cookies
    // hasta verificar el sistema de autenticación.

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }

    next();
}

module.exports = configurarCors;
