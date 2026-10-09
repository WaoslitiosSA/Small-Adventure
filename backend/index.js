const express = require('express');

const path =
    require('path');

const configurarCors =
    require('./config/cors');

const usersRoutes =
    require('./routes/users.routes');

const messagesRoutes =
    require('./routes/messages.routes');

const reportsRoutes =
    require('./routes/reports.routes');

const moderationRoutes =
    require('./routes/moderation.routes');

const notificationsRoutes =
    require('./routes/notifications.routes');

const profilesRoutes =
    require('./routes/profiles.routes');

const interactionsRoutes =
    require('./routes/interactions.routes');

const loginRoutes =
    require('./routes/login.routes');

const passwordRoutes =
    require('./routes/password.routes');

const conversationsRoutes =
    require('./routes/conversations.routes');

// =========================================
// CREAR APLICACIÓN EXPRESS
// =========================================

const app = express();

// =========================================
// CORS
// =========================================

app.use(
    configurarCors
);

// =========================================
// JSON
// =========================================

app.use(
    express.json()
);

app.use(
    '/api',
    usersRoutes
);

app.use(
    '/api',
    messagesRoutes
);

app.use(
    '/api',
    reportsRoutes
);

app.use(
    '/api',
    moderationRoutes
);

app.use(
    '/api',
    notificationsRoutes
);

app.use(
    '/api',
    profilesRoutes
);

app.use(
    '/api',
    interactionsRoutes
);

app.use(
    '/api',
    loginRoutes
);

app.use(
    '/api',
    passwordRoutes
);

app.use(
    '/api',
    conversationsRoutes
);

// =========================================
// ARCHIVOS SUBIDOS
// =========================================

app.use(
    '/uploads',
    express.static(
        path.join(
            __dirname,
            'uploads'
        )
    )
);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Servidor de Small Adventure funcionando');
});



app.listen(PORT, () => {

    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );

});