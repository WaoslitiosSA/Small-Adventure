const multer = require('multer');

// =========================================
// VALIDAR TIPO DE ARCHIVO
// =========================================

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];

function filtrarImagen(req, file, cb) {
    if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
        return cb(
            new Error('Solo se permiten archivos de imagen.')
        );
    }

    cb(null, true);
}

// =========================================
// COMPROBAR QUE EL CONTENIDO ES UNA IMAGEN REAL
// =========================================

function esImagenReal(buffer) {
    if (!buffer || buffer.length < 12) return false;

    const esJpeg =
        buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

    const esPng = buffer.slice(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    );

    const esWebp =
        buffer.slice(0, 4).toString() === 'RIFF' &&
        buffer.slice(8, 12).toString() === 'WEBP';

    return esJpeg || esPng || esWebp;
}

// =========================================
// RECIBIR IMÁGENES EN MEMORIA
// CLOUDINARY LAS ALMACENARÁ DESPUÉS
// =========================================

const subirImagen = multer({
    storage: multer.memoryStorage(),
    fileFilter: filtrarImagen,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

subirImagen.esImagenReal = esImagenReal;

module.exports = subirImagen;