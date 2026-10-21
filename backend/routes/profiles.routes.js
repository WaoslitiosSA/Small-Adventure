const express =
    require('express');

const router =
    express.Router();

const db =
    require('../database/db');

const { autenticarToken } = require('../middleware/auth');

// Completa con los colores que existan en tu frontend
const COLORES_PERMITIDOS = ['blue', 'purple'];

function avatarValido(url) {
    if (typeof url !== 'string' || url.length > 300) return false;

    // Avatares incluidos en tu proyecto
    if (/^assets\/avatars\/[\w-]+\.(jpe?g|png|webp)$/i.test(url)) return true;

    // Imágenes subidas a tu cuenta de Cloudinary
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    return Boolean(cloud) &&
        url.startsWith(`https://res.cloudinary.com/${cloud}/`) &&
        !/["'<>\s]/.test(url);
}

// =========================================
// PERFIL DE USUARIO
// =========================================

router.get('/profiles/:id_user', (req, res) => {

    const idUser = Number(req.params.id_user);

    if (!Number.isSafeInteger(idUser) || idUser <= 0) {
        return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    const sql = `
        SELECT
            p.id_prof,
            p.id_user,
            u.user_name,
            u.id_role,
            p.prof_avatar,
            p.prof_color,
            p.biography
        FROM profiles AS p
        INNER JOIN users AS u
            ON p.id_user = u.id_user
        WHERE p.id_user = ?
          AND u.user_status = 'activo'
    `;

    db.query(sql, [idUser], (error, resultados) => {

        if (error) {
            console.error('Error al consultar perfil:', error);
            return res.status(500).json({ error: 'Error al consultar perfil' });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ error: 'Perfil no encontrado' });
        }

        res.json(resultados[0]);
    });
});

// =========================================
// ACTUALIZAR BIOGRAFÍA DEL PERFIL
// =========================================

router.put(
    '/profiles/:id_user',
    autenticarToken,
    (req, res) => {

        const idUsuarioAutenticado =
        req.usuario.id_user;

        const idUsuarioSolicitado =
            Number(req.params.id_user);

        if (
            !Number.isSafeInteger(idUsuarioSolicitado) ||
            idUsuarioSolicitado !== idUsuarioAutenticado
        ) {
            return res.status(403).json({
                error: 'No puedes modificar el perfil de otro usuario.'
            });
        }

        const idUser = idUsuarioAutenticado;

    const { biography, prof_color, prof_avatar } = req.body;

const bio = typeof biography === 'string' ? biography.trim() : null;

if (
    bio === null ||
    bio.length > 500 ||
    !COLORES_PERMITIDOS.includes(prof_color) ||
    !avatarValido(prof_avatar)
) {
    return res.status(400).json({
        error: 'Los datos del perfil no son válidos.'
    });
}

    const sql = `
        UPDATE profiles
        SET biography = ?, prof_color = ?, prof_avatar = ?
        WHERE id_user = ?
    `;

    db.query(
        sql,
        [
            bio,
            prof_color,
            prof_avatar,
            idUser
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al actualizar biografía:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al actualizar la biografía'
                });

            }


            res.json({
                mensaje:
                    'Biografía actualizada correctamente'
            });

        }
    );

});


// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports =
    router;