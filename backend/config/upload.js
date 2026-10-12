
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =========================================
// CARPETA PARA GUARDAR LAS IMÁGENES
// =========================================

const carpetaImagenes = path.join(
    __dirname,
    '../uploads/mensajes'
);

// Crear la carpeta si todavía no existe.
fs.mkdirSync(carpetaImagenes, {
    recursive: true
});

// =========================================
// CONFIGURAR ALMACENAMIENTO
// =========================================

const almacenamiento = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, carpetaImagenes);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname)
            .toLowerCase();

        const nombreUnico =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

        cb(null, nombreUnico);
    }
});

// =========================================
// VALIDAR TIPO DE ARCHIVO
// =========================================

function filtrarImagen(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return cb(new Error('Solo se permiten archivos de imagen.'));
    }

    cb(null, true);
}

// =========================================
// CREAR MIDDLEWARE MULTER
// =========================================

const subirImagen = multer({
    storage: almacenamiento,
    fileFilter: filtrarImagen,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = subirImagen;
