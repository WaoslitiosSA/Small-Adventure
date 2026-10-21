const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { autenticarToken } = require('../middleware/auth');

// =========================================
// OBTENER NOTIFICACIONES DEL USUARIO
// =========================================

router.get('/notifications/:id_user', autenticarToken, (req, res) => {

    const idSolicitado = Number(req.params.id_user);
    const idUsuario = req.usuario.id_user;

    if (!Number.isSafeInteger(idSolicitado) || idSolicitado <= 0) {
        return res.status(400).json({ error: 'ID de usuario no válido' });
    }

    if (idSolicitado !== idUsuario) {
        return res.status(403).json({
            error: 'No puedes consultar las notificaciones de otro usuario.'
        });
    }

    db.query(
        `SELECT
            id_notificacion,
            id_user,
            noti_type,
            noti_content,
            noti_date,
            noti_status,
            id_mensaje
         FROM notifications
         WHERE id_user = ?
         ORDER BY noti_date DESC
         LIMIT 100`,
        [idUsuario],
        (error, resultados) => {

            if (error) {
                console.error('Error al obtener notificaciones:', error);
                return res.status(500).json({
                    error: 'Error al obtener notificaciones'
                });
            }

            return res.json(resultados);
        }
    );
});

// =========================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// =========================================

router.put('/notifications/:id', autenticarToken, (req, res) => {

    const idNotificacion = Number(req.params.id);
    const idUsuario = req.usuario.id_user;

    if (!Number.isSafeInteger(idNotificacion) || idNotificacion <= 0) {
        return res.status(400).json({ error: 'ID de notificación no válido' });
    }

    // Solo se puede marcar una notificación propia
    db.query(
        `UPDATE notifications
         SET noti_status = 'leida'
         WHERE id_notificacion = ?
           AND id_user = ?`,
        [idNotificacion, idUsuario],
        (error, resultado) => {

            if (error) {
                console.error('Error al actualizar notificación:', error);
                return res.status(500).json({
                    error: 'Error al actualizar notificación'
                });
            }

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Notificación no encontrada'
                });
            }

            return res.json({
                mensaje: 'Notificación marcada como leída',
                id_notificacion: idNotificacion
            });
        }
    );
});

module.exports = router;