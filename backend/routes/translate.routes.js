
const express = require('express');

const router = express.Router();

// =========================================
// TRADUCIR TEXTO
// =========================================

router.post('/translate', async (req, res) => {
    const {
        q,
        source,
        target,
        format = 'text'
    } = req.body || {};

    // =========================================
    // VALIDAR DATOS
    // =========================================

    if (
        typeof q !== 'string' ||
        !q.trim() ||
        typeof source !== 'string' ||
        typeof target !== 'string'
    ) {
        return res.status(400).json({
            error: 'Debes proporcionar el texto y los idiomas de origen y destino.'
        });
    }

    if (q.length > 10000) {
        return res.status(413).json({
            error: 'El texto supera el límite de 10000 caracteres.'
        });
    }

    // =========================================
    // CONFIGURACIÓN DEL SERVICIO EXTERNO
    // =========================================

    const apiUrl = process.env.TRANSLATE_API_URL;
    const apiKey = process.env.TRANSLATE_API_KEY;

    if (!apiUrl) {
        console.error(
            'Falta configurar TRANSLATE_API_URL en el entorno.'
        );

        return res.status(503).json({
            error: 'El servicio de traducción todavía no está configurado.'
        });
    }

    try {
        const datosSolicitud = {
            q: q.trim(),
            source,
            target,
            format
        };

        if (apiKey) {
            datosSolicitud.api_key = apiKey;
        }

        const respuesta = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(datosSolicitud),
            signal: AbortSignal.timeout(20000)
        });

        const respuestaTexto = await respuesta.text();

        let datos;

        try {
            datos = JSON.parse(respuestaTexto);
        } catch {
            datos = {};
        }

        if (!respuesta.ok) {
            console.error(
                'El proveedor de traducción respondió:',
                respuesta.status,
                datos
            );

            return res.status(502).json({
                error: 'El proveedor de traducción rechazó la solicitud.'
            });
        }

        if (
            typeof datos.translatedText !== 'string'
        ) {
            console.error(
                'Respuesta de traducción inesperada:',
                datos
            );

            return res.status(502).json({
                error: 'El proveedor no devolvió una traducción válida.'
            });
        }

        return res.json({
            translatedText: datos.translatedText
        });

    } catch (error) {
        console.error(
            'Error al conectar con el servicio de traducción:',
            error
        );

        return res.status(502).json({
            error: 'No se pudo conectar con el servicio de traducción.'
        });
    }
});

module.exports = router;
