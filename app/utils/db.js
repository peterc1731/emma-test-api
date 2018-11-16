const mysql = require('mysql');
const config = require('../config');

let pool;

const connection = () => {
  if (pool) return pool;
  console.error('Connection pool not initialised');
  throw new Error('Connection pool not initialised');
};

const checkConnection = () => new Promise((resolve, reject) => {
  pool.getConnection((error, conn) => {
    if (error) return reject(error);
    return conn.ping((err) => {
      if (err) {
        conn.release();
        return reject(err);
      }
      conn.release();
      return resolve(true);
    });
  });
});

const init = () => {
  pool = mysql.createPool({
    connectionLimit: 10,
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
  });

  pool.on('connection', (conn) => {
    console.log(`${(new Date()).toISOString()} New DB connection made: ${conn.threadId}`);
  });

  pool.on('error', (err) => {
    console.log(`${(new Date()).toISOString()} DB connection error: ${err}`);
  });

  return checkConnection();
};

module.exports = { init, connection, checkConnection };
