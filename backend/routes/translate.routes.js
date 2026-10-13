
const express = require('express');
const router = express.Router();

const API_URL = 'https://api.mymemory.translated.net/get';

const IDIOMAS_PERMITIDOS = new Set(['es', 'en', 'pt']);

router.post('/translate', async (req, res) => {
    const { q, source, target } = req.body || {};

    // Validar los datos recibidos.
    if (
        typeof q !== 'string' ||
        !q.trim() ||
        typeof source !== 'string' ||
        typeof target !== 'string'
    ) {
        return res.status(400).json({
            error: 'Debes proporcionar el texto y los idiomas.'
        });
    }

    // Evitar idiomas no admitidos por el foro.
    if (
        !IDIOMAS_PERMITIDOS.has(source) ||
        !IDIOMAS_PERMITIDOS.has(target)
    ) {
        return res.status(400).json({
            error: 'Idioma de origen o destino no admitido.'
        });
    }

    if (source === target) {
        return res.json({ translatedText: q.trim() });
    }

    const texto = q.trim();

    // MyMemory admite hasta 500 bytes por solicitud.
    if (Buffer.byteLength(texto, 'utf8') > 500) {
        return res.status(413).json({
            error: 'El texto supera el límite de 500 bytes de MyMemory.'
        });
    }

    try {
        const parametros = new URLSearchParams({
            q: texto,
            langpair: `${source}|${target}`,
            mt: '1'
        });

        const respuesta = await fetch(
            `${API_URL}?${parametros.toString()}`,
            {
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                signal: AbortSignal.timeout(15000)
            }
        );

        if (!respuesta.ok) {
            console.error(
                'MyMemory respondió con HTTP:',
                respuesta.status
            );

            return res.status(502).json({
                error: 'El proveedor de traducción no está disponible.'
            });
        }

        const datos = await respuesta.json();

        if (
            datos.responseStatus !== 200 ||
            typeof datos.responseData?.translatedText !== 'string' ||
            !datos.responseData.translatedText.trim()
        ) {
            console.error(
                'Respuesta no válida de MyMemory:',
                datos.responseStatus,
                datos.responseDetails
            );

            return res.status(502).json({
                error: 'MyMemory no pudo traducir el texto.'
            });
        }

        return res.json({
            translatedText: datos.responseData.translatedText
        });

    } catch (error) {
        console.error('Error al traducir con MyMemory:', error.message);

        return res.status(502).json({
            error: 'No se pudo conectar con el servicio de traducción.'
        });
    }
});

module.exports = router;
