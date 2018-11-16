const db = require('../utils/db');
const { createError } = require('../utils/errors');

class Account {
  constructor(
    id,
    userId,
    type,
    name,
    currency,
    iban,
    swiftBic,
    accountNumber,
    sortCode,
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.name = name;
    this.currency = currency;
    this.iban = iban;
    this.swiftBic = swiftBic;
    this.accountNumber = accountNumber;
    this.sortCode = sortCode;
  }

  create() {
    return new Promise((resolve, reject) => {
      const connection = db.connection();
      return connection.query('INSERT INTO accounts (id, user_id, type, name, currency, iban, account_number, sort_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        this.id,
        this.userId,
        this.type,
        this.name,
        this.currency,
        this.iban,
        this.swiftBic,
        this.accountNumber,
        this.sortCode,
      ], (error, results) => {
        if (error) return reject(error);
        return resolve(results);
      });
    });
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      name: this.name,
      currency: this.currency,
      iban: this.iban,
      swiftBic: this.swiftBic,
      accountNumber: this.accountNumber,
      sortCode: this.sortCode,
    };
  }

  static createTable() {
    return new Promise((resolve, reject) => {
      const connection = db.connection();
      connection.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id varchar(255) NOT NULL,
          user_id int NOT NULL,
          type varchar(255) NOT NULL,
          name varchar(255) NOT NULL,
          currency varchar(255) NOT NULL,
          iban varchar(255),
          swift_bic varchar(255),
          account_number varchar(255) NOT NULL,
          sort_code varchar(255) NOT NULL,
          PRIMARY KEY (id)
        );
      `, (error, results) => {
        if (error) return reject(error);
        console.log('Successfully created table accounts');
        return resolve(results);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      if (!id) return reject(createError('An id must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM accounts WHERE id = ?', [id], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No account found', 'NoResultsError'));
        const account = new Account(
          results[0].id,
          results[0].user_id,
          results[0].type,
          results[0].name,
          results[0].currency,
          results[0].iban,
          results[0].swift_bic,
          results[0].account_number,
          results[0].sort_code,
        );
        return resolve(account);
      });
    });
  }

  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      if (!userId) return reject(createError('A user id must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM accounts WHERE user_id = ?', [userId], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No accounts found', 'NoResultsError'));
        const accounts = results.map(account => new Account(
          account.id,
          account.user_id,
          account.type,
          account.name,
          account.currency,
          account.iban,
          account.swift_bic,
          account.account_number,
          account.sort_code,
        ));
        return resolve(accounts);
      });
    });
  }
}

module.exports = Account;
