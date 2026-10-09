const db =
    require('../database/db');


// =========================================
// COMPROBAR PERMISOS DE USUARIO
// =========================================

function comprobarPermiso(
    idUsuario,
    nombrePermiso,
    callback
) {

    const sql = `
        SELECT
            u.id_user,
            u.user_status,
            r.id_role,
            r.role_name,
            p.perm_id,
            p.perm_name
        FROM users AS u

        INNER JOIN roles AS r
            ON u.id_role = r.id_role

        INNER JOIN roles_permissions AS rp
            ON r.id_role = rp.role_id

        INNER JOIN permissions AS p
            ON rp.perm_id = p.perm_id

        WHERE
            u.id_user = ?
            AND u.user_status = 'activo'
            AND p.perm_name = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [idUsuario, nombrePermiso],
        (error, resultados) => {

            if (error) {

                console.error(
                    'Error al comprobar permiso:',
                    error
                );

                return callback(
                    error,
                    false
                );
            }

            // =========================================
            // EL USUARIO TIENE EL PERMISO
            // =========================================

            if (resultados.length > 0) {

                return callback(
                    null,
                    true
                );
            }

            // =========================================
            // EL USUARIO NO TIENE EL PERMISO
            // =========================================

            return callback(
                null,
                false
            );
        }
    );
}


// =========================================
// EXPORTAR
// =========================================

module.exports = {
    comprobarPermiso
};