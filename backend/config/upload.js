
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

const subirImagen = multer({
    storage: multer.memoryStorage(),
    fileFilter: filtrarImagen,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});


module.exports = subirImagen;
