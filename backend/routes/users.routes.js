const express =
    require('express');

const db =
    require('../database/db');

const router =
    express.Router();

const bcrypt =
    require('bcrypt');

const {
    autenticarToken
} =
    require('../middleware/auth');

const {
    comprobarPermiso
} = require('../middleware/permissions');

// =========================================
// OBTENER USUARIOS
// =========================================

router.get('/users', autenticarToken, (req, res) => {

    const sql = `
        SELECT
            u.id_user,
            u.user_name,
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

router.get('/users/search', autenticarToken, (req, res) => {

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

        const idUsuarioActual = req.usuario.id_user;

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

        parametros.push(`%${textoBusqueda.replace(/[\\%_]/g, '\\$&')}%`);

    }

    // =========================================
    // BÚSQUEDA POR CORREO
    // =========================================

    else if (campo === 'correo') {

        sql += `
            AND u.user_mail = ?
        `;

        parametros.push(textoBusqueda);

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

    const nombre =
        typeof user_name === 'string' ? user_name.trim() : '';

    const correo =
        typeof user_mail === 'string' ? user_mail.trim() : '';

    if (
        typeof user_password !== 'string' ||
        !/^[\p{L}\p{N}_ .-]{3,30}$/u.test(nombre) ||
        correo.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
        user_password.length < 8 ||
        Buffer.byteLength(user_password) > 72
    ) {
        return res.status(400).json({
            error:
                'Datos inválidos. El nombre debe tener de 3 a 30 caracteres, el correo debe ser válido y la contraseña debe tener entre 8 y 72 caracteres.'
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

                if (error.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({
                        error: 'Ese correo ya está registrado.'
                    });
                }

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
                    nombre,
                    correo,
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
                                    nombre,

                                user_mail:
                                    correo,

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


router.post('/admin/users', autenticarToken, (req, res) => {

    const idAdministrador = req.usuario.id_user;

    const {
        user_name,
        user_mail,
        user_password
    } = req.body;

    if (
        typeof user_name !== 'string' ||
        typeof user_mail !== 'string' ||
        typeof user_password !== 'string' ||
        !user_name.trim() ||
        !user_mail.trim() ||
        !user_password
    ) {
        return res.status(400).json({
            error: 'Todos los campos son obligatorios y deben ser válidos.'
        });
    }

    comprobarPermiso(
        idAdministrador,
        'gestionar_administradores',
        (errorPermiso, tienePermiso) => {

            if (errorPermiso) {
                console.error('Error al comprobar permiso:', errorPermiso);
                return res.status(500).json({
                    error: 'No se pudo comprobar el permiso del administrador.'
                });
            }

            if (!tienePermiso) {
                return res.status(403).json({
                    error: 'No tienes permisos para crear administradores.'
                });
            }

            bcrypt.hash(
                user_password,
                12,
                (errorHash, passwordHash) => {

                    if (errorHash) {
                        console.error('Error al proteger la contraseña:', errorHash);
                        return res.status(500).json({
                            error: 'No se pudo proteger la contraseña.'
                        });
                    }

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
                            user_name.trim(),
                            user_mail.trim(),
                            passwordHash,
                            1
                        ],
                        (errorUsuario, resultadoUsuario) => {

                            if (errorUsuario) {
                                console.error('Error al crear administrador:', errorUsuario);
                                return res.status(500).json({
                                    error: 'No se pudo crear el administrador.'
                                });
                            }

                            const nuevoIdUsuario = resultadoUsuario.insertId;

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
                                        console.error('Error al crear perfil del administrador:', errorPerfil);
                                        return res.status(500).json({
                                            error: 'El administrador fue creado, pero no se pudo crear su perfil.'
                                        });
                                    }

                                    return res.status(201).json({
                                        mensaje: 'Administrador creado correctamente.',
                                        id_user: nuevoIdUsuario,
                                        id_prof: resultadoPerfil.insertId,
                                        user_name: user_name.trim(),
                                        user_mail: user_mail.trim(),
                                        id_role: 1
                                    });
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