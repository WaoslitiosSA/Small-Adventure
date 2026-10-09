const express =
    require('express');

const db =
    require('../database/db');

const router =
    express.Router();

const bcrypt =
    require('bcrypt');

const {
    comprobarPermiso
} =
    require('../middleware/permissions');

// =========================================
// OBTENER USUARIOS
// =========================================

router.get('/users', (req, res) => {

    const sql = `
        SELECT
            u.id_user,
            u.user_name,
            u.user_mail,
            u.user_date_regi,
            u.id_role,
            p.prof_avatar,
            p.prof_color
        FROM users AS u
        LEFT JOIN profiles AS p
            ON u.id_user = p.id_user
        WHERE u.user_status = 'activo'
    `;

    db.query(
        sql,
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al obtener usuarios:',
                    error
                );

                return res.status(500).json({
                    error:
                        'Error al obtener usuarios'
                });

            }

            return res.json(
                resultados
            );

        }
    );

});

// =========================================
// BUSCAR USUARIOS
// =========================================

router.get('/users/search', (req, res) => {

    const campo =
        typeof req.query.campo === 'string'
            ? req.query.campo.trim().toLowerCase()
            : '';

    const textoBusqueda =
        typeof req.query.q === 'string'
            ? req.query.q.trim()
            : '';

    // =========================================
    // OBTENER ID DEL USUARIO ACTUAL
    // =========================================

    const idUsuarioActual =
        req.query.exclude
            ? Number(req.query.exclude)
            : null;

    // =========================================
    // VALIDAR CAMPO
    // =========================================

    const camposPermitidos = [
        'nombre',
        'correo',
        'id',
        'rol'
    ];

    if (!camposPermitidos.includes(campo)) {

        return res.status(400).json({
            error:
                'El campo de búsqueda no es válido. Usa nombre, correo, id o rol.'
        });

    }

    // =========================================
    // VALIDAR TEXTO
    // =========================================

    if (!textoBusqueda) {

        return res.status(400).json({
            error:
                'Debes proporcionar un texto de búsqueda.'
        });

    }

    if (textoBusqueda.length > 100) {

        return res.status(400).json({
            error:
                'El texto de búsqueda es demasiado largo.'
        });

    }

    // =========================================
    // BUSCAR USUARIOS ACTIVOS
    // =========================================

    let sql = `
        SELECT
            u.id_user,
            u.user_name,
            u.user_mail,
            u.user_date_regi,
            u.id_role,
            r.role_name,
            p.prof_avatar,
            p.prof_color

        FROM users AS u

        LEFT JOIN profiles AS p
            ON u.id_user = p.id_user

        LEFT JOIN roles AS r
            ON u.id_role = r.id_role

        WHERE u.user_status = 'activo'
    `;

    const parametros = [];

    // =========================================
    // EXCLUIR USUARIO ACTUAL
    // =========================================

    if (
        Number.isInteger(idUsuarioActual) &&
        idUsuarioActual > 0
    ) {

        sql += `
            AND u.id_user <> ?
        `;

        parametros.push(
            idUsuarioActual
        );

    }

    // =========================================
    // BÚSQUEDA POR NOMBRE
    // =========================================

    if (campo === 'nombre') {

        sql += `
            AND u.user_name LIKE ?
        `;

        parametros.push(
            `%${textoBusqueda}%`
        );

    }

    // =========================================
    // BÚSQUEDA POR CORREO
    // =========================================

    else if (campo === 'correo') {

        sql += `
            AND u.user_mail LIKE ?
        `;

        parametros.push(
            `%${textoBusqueda}%`
        );

    }

    // =========================================
    // BÚSQUEDA POR ID
    // =========================================

    else if (campo === 'id') {

        const idBuscado =
            Number(textoBusqueda);

        if (
            !Number.isInteger(idBuscado) ||
            idBuscado <= 0
        ) {

            return res.status(400).json({
                error:
                    'El ID debe ser un número entero positivo.'
            });

        }

        sql += `
            AND u.id_user = ?
        `;

        parametros.push(
            idBuscado
        );

    }

    // =========================================
    // BÚSQUEDA POR ROL
    // =========================================

    else if (campo === 'rol') {

        const rolBusqueda =
            textoBusqueda.toLowerCase();

        if (
            rolBusqueda === '1' ||
            rolBusqueda === 'admin' ||
            rolBusqueda === 'administrador'
        ) {

            sql += `
                AND u.id_role = 1
            `;

        }

        else if (
            rolBusqueda === '2' ||
            rolBusqueda === 'normal' ||
            rolBusqueda === 'usuario'
        ) {

            sql += `
                AND u.id_role = 2
            `;

        }

        else {

            return res.status(400).json({
                error:
                    'Rol no válido. Usa admin, administrador, normal, usuario, 1 o 2.'
            });

        }

    }

    // =========================================
    // ORDENAR RESULTADOS
    // =========================================

    sql += `
        ORDER BY
            u.user_name ASC
        LIMIT 30
    `;

    // =========================================
    // EJECUTAR CONSULTA
    // =========================================

    db.query(
        sql,
        parametros,
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al buscar usuarios:',
                    error
                );

                return res.status(500).json({
                    error:
                        'No se pudieron buscar los usuarios.'
                });

            }

            return res.json(
                resultados
            );

        }
    );

});

// =========================================
// ELIMINAR USUARIO LÓGICAMENTE
// =========================================

router.delete('/users/:id', (req, res) => {

    const idUsuario =
        req.params.id;

    const idAdministrador =
        req.body.id_user;


    // =========================================
    // VALIDAR DATOS
    // =========================================

    if (!idAdministrador) {

        return res.status(400).json({
            error:
                'No se indicó el administrador que realiza la acción.'
        });

    }


    // =========================================
    // COMPROBAR ADMINISTRADOR
    // =========================================

    const sqlAdministrador = `
        SELECT
            id_user,
            id_role
        FROM users
        WHERE id_user = ?
        AND user_status = 'activo'
        LIMIT 1
    `;

    db.query(
        sqlAdministrador,
        [idAdministrador],
        (errorAdministrador, resultadosAdministrador) => {

            if (errorAdministrador) {

                console.error(
                    'Error al comprobar administrador:',
                    errorAdministrador
                );

                return res.status(500).json({
                    error:
                        'No se pudo comprobar el administrador.'
                });

            }


            if (
                resultadosAdministrador.length === 0
            ) {

                return res.status(404).json({
                    error:
                        'El administrador no existe o está inactivo.'
                });

            }


            const administrador =
                resultadosAdministrador[0];


            // =========================================
            // COMPROBAR ROL DE ADMINISTRADOR
            // =========================================

            if (
                administrador.id_role !== 1
            ) {

                return res.status(403).json({
                    error:
                        'No tienes permisos para eliminar usuarios.'
                });

            }


            // =========================================
            // COMPROBAR USUARIO OBJETIVO
            // =========================================

            const sqlUsuario = `
                SELECT
                    id_user,
                    user_name,
                    user_status
                FROM users
                WHERE id_user = ?
                LIMIT 1
            `;

            db.query(
                sqlUsuario,
                [idUsuario],
                (errorUsuario, resultadosUsuario) => {

                    if (errorUsuario) {

                        console.error(
                            'Error al buscar usuario:',
                            errorUsuario
                        );

                        return res.status(500).json({
                            error:
                                'No se pudo buscar el usuario.'
                        });

                    }


                    if (
                        resultadosUsuario.length === 0
                    ) {

                        return res.status(404).json({
                            error:
                                'El usuario no existe.'
                        });

                    }


                    const usuario =
                        resultadosUsuario[0];


                    // =========================================
                    // COMPROBAR SI YA ESTÁ ELIMINADO
                    // =========================================

                    if (
                        usuario.user_status ===
                        'eliminado'
                    ) {

                        return res.status(400).json({
                            error:
                                'El usuario ya está eliminado.'
                        });

                    }


                    // =========================================
                    // EVITAR ELIMINAR AL PROPIO ADMINISTRADOR
                    // =========================================

                    if (
                        Number(idUsuario) ===
                        Number(idAdministrador)
                    ) {

                        return res.status(400).json({
                            error:
                                'No puedes eliminar tu propia cuenta desde el panel de moderación.'
                        });

                    }


                    // =========================================
                    // ELIMINACIÓN LÓGICA
                    // =========================================

                    const sqlEliminar = `
                        UPDATE users
                        SET user_status = 'eliminado'
                        WHERE id_user = ?
                    `;

                    db.query(
                        sqlEliminar,
                        [idUsuario],
                        (errorEliminar, resultadoEliminar) => {

                            if (errorEliminar) {

                                console.error(
                                    'Error al eliminar usuario:',
                                    errorEliminar
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudo eliminar el usuario.'
                                });

                            }


                            if (
                                resultadoEliminar.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    error:
                                        'No se pudo encontrar el usuario para eliminar.'
                                });

                            }


                            // =========================================
                            // RESPUESTA
                            // =========================================

                            console.log(
                                'Usuario eliminado lógicamente:',
                                idUsuario
                            );

                            return res.json({
                                mensaje:
                                    'Usuario eliminado correctamente.',
                                id_user:
                                    Number(idUsuario),
                                user_status:
                                    'eliminado'
                            });

                        }
                    );

                }
            );

        }
    );

});

// =========================================
// REGISTRAR USUARIO
// =========================================

router.post('/users', (req, res) => {

    const {
        user_name,
        user_mail,
        user_password
    } = req.body;

    // =========================================
    // VALIDAR DATOS
    // =========================================

    if (
        !user_name ||
        !user_mail ||
        !user_password
    ) {

        return res.status(400).json({
            error:
                'Todos los campos son obligatorios'
        });

    }

    // =========================================
    // PROTEGER CONTRASEÑA
    // =========================================

    bcrypt.hash(
        user_password,
        12,
        (errorHash, passwordHash) => {

            if (errorHash) {

                console.error(
                    'Error al proteger la contraseña:',
                    errorHash
                );

                return res.status(500).json({
                    error:
                        'Error al registrar usuario'
                });

            }

            // =========================================
            // CREAR USUARIO
            // =========================================

            const sqlUsuario = `
                INSERT INTO users
                (
                    user_name,
                    user_mail,
                    user_password,
                    id_role
                )
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sqlUsuario,
                [
                    user_name,
                    user_mail,
                    passwordHash,
                    2
                ],
                (error, resultado) => {

                    if (error) {

                        console.error(
                            'Error al registrar usuario:',
                            error
                        );

                        return res.status(500).json({
                            error:
                                'Error al registrar usuario'
                        });

                    }

                    // =========================================
                    // ID DEL USUARIO CREADO
                    // =========================================

                    const idUsuario =
                        resultado.insertId;

                    // =========================================
                    // CREAR PERFIL DEL USUARIO
                    // =========================================

                    const sqlPerfil = `
                        INSERT INTO profiles
                        (
                            id_user,
                            prof_avatar,
                            prof_color,
                            biography
                        )
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(
                        sqlPerfil,
                        [
                            idUsuario,
                            'assets/avatars/michifu.jpeg',
                            'blue',
                            ''
                        ],
                        (errorPerfil, resultadoPerfil) => {

                            if (errorPerfil) {

                                console.error(
                                    'Error al crear perfil del usuario:',
                                    errorPerfil
                                );

                                return res.status(500).json({
                                    error:
                                        'El usuario fue creado, pero no se pudo crear su perfil.'
                                });

                            }

                            // =========================================
                            // RESPUESTA
                            // =========================================

                            return res.status(201).json({

                                mensaje:
                                    'Usuario registrado correctamente',

                                id_user:
                                    idUsuario,

                                id_prof:
                                    resultadoPerfil.insertId,

                                user_name:
                                    user_name,

                                user_mail:
                                    user_mail,

                                id_role:
                                    2

                            });

                        }
                    );

                }
            );

        }
    );

});

// =========================================
// CREAR ADMINISTRADOR
// =========================================

router.post('/admin/users', (req, res) => {

    const {
        user_name,
        user_mail,
        user_password,
        id_user
    } = req.body;

    // =========================================
    // VALIDAR DATOS
    // =========================================

    if (
        !user_name ||
        !user_mail ||
        !user_password ||
        !id_user
    ) {

        return res.status(400).json({
            error:
                'Todos los campos son obligatorios.'
        });

    }

    // =========================================
    // COMPROBAR ADMINISTRADOR QUE REALIZA
    // LA ACCIÓN
    // =========================================

    const sqlAdministrador = `
        SELECT
            id_user,
            id_role,
            user_status
        FROM users
        WHERE id_user = ?
        LIMIT 1
    `;

    db.query(
        sqlAdministrador,
        [id_user],
        (errorAdministrador, resultadosAdministrador) => {

            if (errorAdministrador) {

                console.error(
                    'Error al comprobar administrador:',
                    errorAdministrador
                );

                return res.status(500).json({
                    error:
                        'No se pudo comprobar el administrador.'
                });

            }

            // =========================================
            // ADMINISTRADOR NO EXISTE
            // =========================================

            if (
                resultadosAdministrador.length === 0
            ) {

                return res.status(404).json({
                    error:
                        'El usuario que realiza la acción no existe.'
                });

            }

            const administrador =
                resultadosAdministrador[0];

            // =========================================
            // COMPROBAR ESTADO
            // =========================================

            if (
                administrador.user_status !==
                'activo'
            ) {

                return res.status(403).json({
                    error:
                        'El administrador no está activo.'
                });

            }

            // =========================================
            // COMPROBAR PERMISO
            // =========================================

            comprobarPermiso(
                id_user,
                'gestionar_administradores',
                (errorPermiso, tienePermiso) => {

                    if (errorPermiso) {

                        console.error(
                            'Error al comprobar permiso:',
                            errorPermiso
                        );

                        return res.status(500).json({
                            error:
                                'No se pudo comprobar el permiso del administrador.'
                        });

                    }

                    if (!tienePermiso) {

                        return res.status(403).json({
                            error:
                                'No tienes permisos para crear administradores.'
                        });

                    }

                    // =========================================
                    // PROTEGER CONTRASEÑA
                    // =========================================

                    bcrypt.hash(
                        user_password,
                        12,
                        (errorHash, passwordHash) => {

                            if (errorHash) {

                                console.error(
                                    'Error al proteger la contraseña del administrador:',
                                    errorHash
                                );

                                return res.status(500).json({
                                    error:
                                        'No se pudo proteger la contraseña del administrador.'
                                });

                            }

                            // =========================================
                            // CREAR NUEVO ADMINISTRADOR
                            // =========================================

                            const sqlUsuario = `
                                INSERT INTO users
                                (
                                    user_name,
                                    user_mail,
                                    user_password,
                                    id_role
                                )
                                VALUES (?, ?, ?, ?)
                            `;

                            db.query(
                                sqlUsuario,
                                [
                                    user_name,
                                    user_mail,
                                    passwordHash,
                                    1
                                ],
                                (errorUsuario, resultadoUsuario) => {

                                    if (errorUsuario) {

                                        console.error(
                                            'Error al crear administrador:',
                                            errorUsuario
                                        );

                                        return res.status(500).json({
                                            error:
                                                'No se pudo crear el administrador.'
                                        });

                                    }

                                    const nuevoIdUsuario =
                                        resultadoUsuario.insertId;

                                    // =========================================
                                    // CREAR PERFIL DEL ADMINISTRADOR
                                    // =========================================

                                    const sqlPerfil = `
                                        INSERT INTO profiles
                                        (
                                            id_user,
                                            prof_avatar,
                                            prof_color,
                                            biography
                                        )
                                        VALUES (?, ?, ?, ?)
                                    `;

                                    db.query(
                                        sqlPerfil,
                                        [
                                            nuevoIdUsuario,
                                            'assets/avatars/the_traveler.jpeg',
                                            'purple',
                                            ''
                                        ],
                                        (errorPerfil, resultadoPerfil) => {

                                            if (errorPerfil) {

                                                console.error(
                                                    'Error al crear perfil del administrador:',
                                                    errorPerfil
                                                );

                                                return res.status(500).json({
                                                    error:
                                                        'El administrador fue creado, pero no se pudo crear su perfil.'
                                                });

                                            }

                                            // =========================================
                                            // RESPUESTA
                                            // =========================================

                                            return res.status(201).json({

                                                mensaje:
                                                    'Administrador creado correctamente.',

                                                id_user:
                                                    nuevoIdUsuario,

                                                id_prof:
                                                    resultadoPerfil.insertId,

                                                user_name:
                                                    user_name,

                                                user_mail:
                                                    user_mail,

                                                id_role:
                                                    1

                                            });

                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

module.exports = router;