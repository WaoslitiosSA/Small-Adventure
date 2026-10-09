const express =
    require('express');

const router =
    express.Router();

const db =
    require('../database/db');


// =========================================
// SILENCIAR USUARIO
// =========================================

router.post('/interactions/silenciar', (req, res) => {

    const {
        id_original_user,
        id_user_dest
    } = req.body;


    // =========================================
    // VERIFICAR DATOS
    // =========================================

    if (
        !id_original_user ||
        !id_user_dest
    ) {

        return res.status(400).json({
            error:
                'Faltan datos para silenciar al usuario'
        });

    }


    // =========================================
    // EVITAR SILENCIARSE A SÍ MISMO
    // =========================================

    if (
        Number(id_original_user) ===
        Number(id_user_dest)
    ) {

        return res.status(400).json({
            error:
                'No puedes silenciarte a ti mismo'
        });

    }


    const sql = `
        INSERT INTO users_interactions
        (
            id_user_original,
            id_user_dest,
            usin_type_inte,
            status
        )
        VALUES (?, ?, 'silenciar', 'activo')
    `;


    db.query(
        sql,
        [
            id_original_user,
            id_user_dest
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al silenciar usuario:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudo silenciar al usuario'
                });

            }


            res.json({
                mensaje:
                    'Usuario silenciado correctamente',

                id_interacion:
                    resultado.insertId
            });

        }
    );

});


// =========================================
// BLOQUEAR USUARIO
// =========================================

router.post('/interactions/bloquear', (req, res) => {

    const {
        id_original_user,
        id_user_dest
    } = req.body;


    // =========================================
    // VERIFICAR DATOS
    // =========================================

    if (
        !id_original_user ||
        !id_user_dest
    ) {

        return res.status(400).json({
            error:
                'Faltan datos para bloquear al usuario'
        });

    }


    // =========================================
    // EVITAR BLOQUEARSE A SÍ MISMO
    // =========================================

    if (
        Number(id_original_user) ===
        Number(id_user_dest)
    ) {

        return res.status(400).json({
            error:
                'No puedes bloquearte a ti mismo'
        });

    }


    const sql = `
        INSERT INTO users_interactions
        (
            id_user_original,
            id_user_dest,
            usin_type_inte,
            status
        )
        VALUES (?, ?, 'bloquear', 'activo')
    `;


    db.query(
        sql,
        [
            id_original_user,
            id_user_dest
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al bloquear usuario:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudo bloquear al usuario'
                });

            }


            res.json({
                mensaje:
                    'Usuario bloqueado correctamente',

                id_interacion:
                    resultado.insertId
            });

        }
    );

});


// =========================================
// DESBLOQUEAR USUARIO
// =========================================

router.put('/interactions/bloquear', (req, res) => {

    const {
        id_user_original,
        id_user_dest
    } = req.body;


    // =========================================
    // VERIFICAR DATOS
    // =========================================

    if (
        !id_user_original ||
        !id_user_dest
    ) {

        return res.status(400).json({
            error:
                'Faltan datos para desbloquear al usuario'
        });

    }


    const sql = `
        UPDATE users_interactions
        SET status = 'inactivo'
        WHERE id_user_original = ?
        AND id_user_dest = ?
        AND usin_type_inte = 'bloquear'
        AND status = 'activo'
    `;


    db.query(
        sql,
        [
            id_user_original,
            id_user_dest
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al desbloquear usuario:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudo desbloquear al usuario'
                });

            }


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    error:
                        'No existe un bloqueo activo'
                });

            }


            res.json({
                mensaje:
                    'Usuario desbloqueado correctamente'
            });

        }
    );

});


// =========================================
// OBTENER USUARIOS BLOQUEADOS
// =========================================

router.get('/interactions/bloqueados/:id_user', (req, res) => {

    const idUser =
        req.params.id_user;


    const sql = `
        SELECT
            id_interacion,
            id_user_original,
            id_user_dest,
            usin_type_inte,
            usin_date,
            status
        FROM users_interactions
        WHERE id_user_original = ?
        AND usin_type_inte = 'bloquear'
        AND status = 'activo'
    `;


    db.query(
        sql,
        [idUser],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al obtener usuarios bloqueados:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudieron obtener los usuarios bloqueados'
                });

            }


            res.json(
                resultados
            );

        }
    );

});


// =========================================
// COMPROBAR BLOQUEO TEMPORAL POR MODERACIÓN
// =========================================

router.get('/interactions/bloqueo/:id_user', (req, res) => {

    const idUser =
        req.params.id_user;


    const sql = `
        SELECT
            id_interacion,
            id_user_original,
            id_user_dest,
            usin_type_inte,
            usin_date,
            usin_date_end,
            status
        FROM users_interactions
        WHERE id_user_dest = ?
        AND usin_type_inte = 'bloquear'
        AND status = 'activo'
        AND usin_date_end IS NOT NULL
        AND usin_date_end > CURRENT_TIMESTAMP(6)
        ORDER BY usin_date_end DESC
        LIMIT 1
    `;


    db.query(
        sql,
        [idUser],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al comprobar bloqueo de moderación:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudo comprobar el bloqueo'
                });

            }


            if (
                resultados.length === 0
            ) {

                return res.json({
                    bloqueado: false,
                    interaccion: null
                });

            }


            res.json({
                bloqueado: true,
                interaccion: resultados[0]
            });

        }
    );

});


// =========================================
// DEJAR DE SILENCIAR USUARIO
// =========================================

router.put('/interactions/silenciar', (req, res) => {

    const {
        id_user_original,
        id_user_dest
    } = req.body;


    // =========================================
    // VERIFICAR DATOS
    // =========================================

    if (
        !id_user_original ||
        !id_user_dest
    ) {

        return res.status(400).json({
            error:
                'Faltan datos para dejar de silenciar al usuario'
        });

    }


    const sql = `
        UPDATE users_interactions
        SET status = 'inactivo'
        WHERE id_user_original = ?
        AND id_user_dest = ?
        AND usin_type_inte = 'silenciar'
        AND status = 'activo'
    `;


    db.query(
        sql,
        [
            id_user_original,
            id_user_dest
        ],
        (error, resultado) => {

            if (error) {

                console.error(
                    'Error al dejar de silenciar usuario:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudo dejar de silenciar al usuario'
                });

            }


            if (
                resultado.affectedRows === 0
            ) {

                return res.status(404).json({
                    error:
                        'No existe un silenciamiento activo'
                });

            }


            res.json({
                mensaje:
                    'Usuario dejado de silenciar correctamente'
            });

        }
    );

});


// =========================================
// OBTENER USUARIOS SILENCIADOS
// =========================================

router.get('/interactions/silenciados/:id_user', (req, res) => {

    const idUser =
        req.params.id_user;


    const sql = `
        SELECT
            id_interacion,
            id_user_original,
            id_user_dest,
            usin_type_inte,
            usin_date,
            status
        FROM users_interactions
        WHERE id_user_original = ?
        AND usin_type_inte = 'silenciar'
        AND status = 'activo'
    `;


    db.query(
        sql,
        [idUser],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al obtener usuarios silenciados:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudieron obtener los usuarios silenciados'
                });

            }


            res.json(
                resultados
            );

        }
    );

});


// =========================================
// COMPROBAR SI UN USUARIO ESTÁ SANCIONADO
// POR SILENCIO
// =========================================

router.get('/interactions/silencio/:id_user', (req, res) => {

    const idUser =
        req.params.id_user;


    const sql = `
        SELECT
            id_interacion,
            id_user_original,
            id_user_dest,
            usin_type_inte,
            usin_date,
            usin_date_end,
            status
        FROM users_interactions
        WHERE id_user_dest = ?
        AND usin_type_inte = 'silenciar'
        AND status = 'activo'
        AND usin_date_end IS NOT NULL
        AND usin_date_end > CURRENT_TIMESTAMP(6)
        ORDER BY usin_date_end DESC
        LIMIT 1
    `;


    db.query(
        sql,
        [idUser],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al comprobar silencio:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudo comprobar el silencio'
                });

            }


            res.json({
                silenciado:
                    resultados.length > 0,

                interaccion:
                    resultados.length > 0
                        ? resultados[0]
                        : null
            });

        }
    );

});


// =========================================
// EXPORTAR RUTAS
// =========================================

module.exports =
    router;