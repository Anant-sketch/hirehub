const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS !== undefined ? process.env.DB_PASS : '',
    database: process.env.DB_NAME || 'hirehub_db',
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 0
});

// Convert pool to promise-based operations
const promisePool = pool.promise();

// Test connectivity on startup
promisePool.getConnection()
    .then(connection => {
        console.log('[MySQL]: Connection pool initialized successfully.');
        connection.release();
    })
    .catch(error => {
        console.error('\x1b[31m%s\x1b[0m', '[MySQL ERROR]: Failed to connect to database!');
        console.error('\x1b[33m%s\x1b[0m', 'Please ensure:');
        console.error('1. Your MySQL server is running.');
        console.error('2. You created the database using "schema.sql".');
        console.error('3. Credentials in your ".env" file are correct.');
        console.error('Error Details:', error.message);
    });

module.exports = promisePool;
