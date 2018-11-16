const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../utils/db');
const { createError } = require('../utils/errors');

const saltRounds = 10;

class User {
  constructor(email, password = null, hash = null, id = null, tlRefreshToken = null) {
    if (!email) throw createError('Email must be provided', 'ValidationError');
    this.email = email;
    this.password = password;
    this.hash = hash;
    this.id = id;
    this.authenticated = false;
    this.tlRefreshToken = tlRefreshToken;
  }

  createHash() {
    return new Promise((resolve, reject) => {
      if (!this.password) return reject(createError('Missing password', 'MissingPasswordError'));
      return bcrypt.hash(this.password, saltRounds, (err, hash) => {
        if (err) return reject(createError('Unable to hash password. User creation failed.'));
        this.hash = hash;
        return resolve(hash);
      });
    });
  }

  authenticate(password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, this.hash, (err, res) => {
        if (err) return reject(err);
        if (res) {
          this.authenticated = true;
          return resolve(true);
        }
        return resolve(false);
      });
    });
  }

  getAccessToken() {
    return new Promise((resolve, reject) => {
      if (!this.authenticated) return reject(createError('User is not authenticated'));
      if (!this.id) return reject(createError('User id is required'));
      const token = jwt.sign({ id: this.id, email: this.email }, config.secret);
      return resolve(token);
    });
  }

  insert() {
    return new Promise((resolve, reject) => {
      if (!this.hash) return reject(createError('Missing hashed password'));
      const connection = db.connection();
      return connection.query('INSERT INTO users (email, hash) VALUES (?, ?)', [this.email, this.hash], (error, results) => {
        if (error) return reject(error);
        this.id = results.insertId;
        return resolve(results);
      });
    });
  }

  create() {
    return this.createHash().then(() => this.insert());
  }

  updateRefreshToken(token) {
    return new Promise((resolve, reject) => {
      if (!token) return reject(createError('Missing refresh token'));
      const connection = db.connection();
      return connection.query('UPDATE users SET tl_refresh_token = ? WHERE id = ?', [token, this.id], (error, results) => {
        if (error) return reject(error);
        this.tlRefreshToken = token;
        return resolve(results);
      });
    });
  }

  toObject() {
    return {
      id: this.id,
      email: this.email,
    };
  }

  static createTable() {
    return new Promise((resolve, reject) => {
      const connection = db.connection();
      connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id int NOT NULL AUTO_INCREMENT,
          email varchar(255) NOT NULL,
          hash varchar(255) NOT NULL,
          tl_refresh_token varchar(255),
          PRIMARY KEY (id)
        );
      `, (error, results) => {
        if (error) return reject(error);
        console.log('Successfully created table users');
        return resolve(results);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      if (!id) return reject(createError('An id must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No user found', 'NoResultsError'));
        const user = new User(
          results[0].email,
          null,
          results[0].hash,
          results[0].id,
          results[0].tl_refresh_token,
        );
        return resolve(user);
      });
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      if (!email) return reject(createError('Email must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No user found', 'NoResultsError'));
        const user = new User(
          results[0].email,
          null,
          results[0].hash,
          results[0].id,
          results[0].tl_refresh_token,
        );
        return resolve(user);
      });
    });
  }
}

module.exports = User;
