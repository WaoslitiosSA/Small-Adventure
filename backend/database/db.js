require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Comprobar la conexión al arrancar
pool.getConnection((error, conn) => {
    if (error) {
        console.error('Error al conectar con MySQL:', error.message);
        return;
    }

    console.log('Conexion con MySQL establecida correctamente');
    conn.release();
});

module.exports = pool;