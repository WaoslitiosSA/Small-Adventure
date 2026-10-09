
require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    }
});

connection.connect((error) => {
    if (error) {
        console.error(
            'Error al conectar con MySQL:',
            error.message
        );
        return;
    }

    console.log('Conexion con MySQL establecida correctamente');
});

module.exports = connection;
