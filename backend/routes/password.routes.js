const express = require('express');
const router = express.Router();

// Recuperacion desactivada temporalmente por seguridad.
router.put('/password', (req, res) => {
    return res.status(503).json({
        error: 'La recuperacion de contrasena esta temporalmente deshabilitada.'
    });
});

module.exports = router;