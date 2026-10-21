const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const configurarCors = require('./config/cors');

const usersRoutes = require('./routes/users.routes');
const messagesRoutes = require('./routes/messages.routes');
const reportsRoutes = require('./routes/reports.routes');
const moderationRoutes = require('./routes/moderation.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const profilesRoutes = require('./routes/profiles.routes');
const interactionsRoutes = require('./routes/interactions.routes');
const loginRoutes = require('./routes/login.routes');
const passwordRoutes = require('./routes/password.routes');
const conversationsRoutes = require('./routes/conversations.routes');

// =========================================
// CREAR APLICACIÓN EXPRESS
// =========================================

const app = express();

// Render usa un proxy: necesario para que el límite de intentos
// identifique la IP real de cada visitante
app.set('trust proxy', 1);

// =========================================
// SEGURIDAD (antes de las rutas)
// =========================================

app.use(
    helmet({
        // Permite que el frontend (otro dominio) cargue las imágenes de /uploads
        crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
);

// =========================================
// CORS
// =========================================

app.use(configurarCors);

// =========================================
// JSON
// =========================================

app.use(express.json({ limit: '10kb' }));

// =========================================
// LÍMITE DE INTENTOS
// =========================================

// General: protege toda la API
app.use(
    '/api',
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Demasiadas solicitudes. Intenta más tarde.' }
    })
);

// Estricto: login y recuperación de contraseña
const limiteAutenticacion = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiados intentos. Intenta más tarde.' }
});

app.use('/api/login.routes.js', limiteAutenticacion);
app.post('/api/users', limiteAutenticacion);
app.use('/api/password.routes.js', limiteAutenticacion);

// =========================================
// RUTAS
// =========================================

app.use('/api', usersRoutes);
app.use('/api', messagesRoutes);
app.use('/api', reportsRoutes);
app.use('/api', moderationRoutes);
app.use('/api', notificationsRoutes);
app.use('/api', profilesRoutes);
app.use('/api', interactionsRoutes);
app.use('/api', loginRoutes);
app.use('/api', passwordRoutes);
app.use('/api', conversationsRoutes);

// =========================================
// ARCHIVOS SUBIDOS
// =========================================

app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);

app.get('/', (req, res) => {
    res.send('Servidor de Small Adventure funcionando');
});

/* =========================================
   ERRORES DE SUBIDA Y DEL SERVIDOR
========================================= */

app.use((error, req, res, next) => {
    console.error('Error procesando la solicitud:', error);

    if (error instanceof require('multer').MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: 'La imagen supera el límite de 5 MB.'
            });
        }

        return res.status(400).json({
            error: 'No se pudo procesar la imagen subida.'
        });
    }

    if (error.message === 'Solo se permiten archivos de imagen.') {
        return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
        error: 'Se produjo un error interno del servidor.'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});