// =========================================
// CONFIGURACIÓN CORS
// =========================================

function configurarCors(
    req,
    res,
    next
) {

    res.header(
        'Access-Control-Allow-Origin',
        '*'
    );

    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );

    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    // =========================================
    // PETICIONES OPTIONS
    // =========================================

    if (
        req.method === 'OPTIONS'
    ) {

        return res.sendStatus(
            204
        );

    }

    next();

}

module.exports =
    configurarCors;