const multer = require('multer');

const path = require('path');

// =========================================
// CONFIGURACIÓN PARA SUBIR IMÁGENES
// =========================================

const almacenamiento =
    multer.diskStorage({

        destination: function (
            req,
            file,
            cb
        ) {

            cb(
                null,
                path.join(
                    __dirname,
                    '../uploads/mensajes'
                )
            );

        },

        filename: function (
            req,
            file,
            cb
        ) {

            const nombreUnico =
                Date.now() +
                '-' +
                Math.round(
                    Math.random() * 1E9
                ) +
                path.extname(
                    file.originalname
                );

            cb(
                null,
                nombreUnico
            );

        }

    });

// =========================================
// CREAR MIDDLEWARE MULTER
// =========================================

const subirImagen =
    multer({
        storage: almacenamiento
    });

// =========================================
// EXPORTAR
// =========================================

module.exports = subirImagen;