
const multer = require('multer');

// =========================================
// VALIDAR TIPO DE ARCHIVO
// =========================================

function filtrarImagen(req, file, cb) {
    if (
        !file.mimetype ||
        !file.mimetype.startsWith('image/')
    ) {
        return cb(
            new Error('Solo se permiten archivos de imagen.')
        );
    }

    cb(null, true);
}

// =========================================
// RECIBIR IMÁGENES EN MEMORIA
// CLOUDINARY LAS ALMACENARÁ DESPUÉS
// =========================================

const subirImagen = multer({
    storage: multer.memoryStorage(),
    fileFilter: filtrarImagen,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = subirImagen;
