const express =
    require('express');

const router =
    express.Router();

const db =
    require('../database/db');


// =========================================
// PERFIL DE USUARIO
// =========================================

router.get('/profiles/:id_user', (req, res) => {

    const idUser =
        req.params.id_user;


    const sql = `
        SELECT
            p.id_prof,
            p.id_user,
            u.user_name,
            u.user_mail,
            u.id_role,
            p.prof_avatar,
            p.prof_color,
            p.biography
        FROM profiles AS p
        INNER JOIN users AS u
            ON p.id_user = u.id_user
        WHERE p.id_user = ?
    `;


    db.query(
        sql,
        [idUser],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al consultar perfil:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al consultar perfil'
                });

            }


            if (
                resultados.length === 0
            ) {

                return res.status(404).json({
                    error:
                        'Perfil no encontrado'
                });

            }


            res.json(
                resultados[0]
            );

        }
    );

});


// =========================================
// ACTUALIZAR BIOGRAFÍA DEL PERFIL
// =========================================

router.put('/profiles/:id_user', (req, res) => {

    const idUser =
        req.params.id_user;

    const {
        biography,
        prof_color,
        prof_avatar
    } =
        req.body;


    console.log(
        "Datos recibidos para actualizar perfil:",
        req.body
    );


    const sql = `
        UPDATE profiles
        SET biography = ?, prof_color = ?, prof_avatar = ?
        WHERE id_user = ?
    `;


    console.log(
        "Valores que se enviarán a MySQL:",
        biography,
        prof_color,
        prof_avatar,
        idUser
    );


    db.query(
        sql,
        [
            biography,
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