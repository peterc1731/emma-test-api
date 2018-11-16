const db = require('../utils/db');
const { createError } = require('../utils/errors');

class Transaction {
  constructor(
    id,
    accountId,
    timestamp,
    description,
    amount,
    currency,
    type,
    category,
    merchantName,
  ) {
    this.id = id;
    this.accountId = accountId;
    this.timestamp = new Date(timestamp);
    this.description = description;
    this.amount = amount;
    this.currency = currency;
    this.type = type;
    this.category = category;
    this.merchantName = merchantName;
  }

  create() {
    return new Promise((resolve, reject) => {
      const connection = db.connection();
      return connection.query('INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        this.id,
        this.accountId,
        this.timestamp,
        this.description,
        this.amount,
        this.currency,
        this.type,
        this.category,
        this.merchantName,
      ], (error, results) => {
        if (error) return reject(error);
        return resolve(results);
      });
    });
  }

  toObject() {
    return {
      id: this.id,
      accountId: this.accountId,
      timestamp: this.timestamp,
      description: this.description,
      amount: this.amount,
      currency: this.currency,
      type: this.type,
      category: this.category,
      merchantName: this.merchantName,
    };
  }

  static createTable() {
    return new Promise((resolve, reject) => {
      const connection = db.connection();
      connection.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id varchar(255) NOT NULL,
          account_id varchar(255) NOT NULL,
          timestamp DATETIME NOT NULL,
          description varchar(255),
          amount DECIMAL(12,2) NOT NULL,
          currency varchar(255) NOT NULL,
          type varchar(255) NOT NULL,
          category varchar(255) NOT NULL,
          merchant_name varchar(255),
          PRIMARY KEY (id)
        );
      `, (error, results) => {
        if (error) return reject(error);
        console.log('Successfully created table transactions');
        return resolve(results);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      if (!id) return reject(createError('An id must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM transactions WHERE id = ?', [id], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No transaction found', 'NoResultsError'));
        const transaction = new Transaction(
          results[0].id,
          results[0].account_id,
          results[0].timestamp,
          results[0].description,
          results[0].amount,
          results[0].currency,
          results[0].type,
          results[0].category,
          results[0].merchant_name,
        );
        return resolve(transaction);
      });
    });
  }

  static findByAccountId(accountId) {
    return new Promise((resolve, reject) => {
      if (!accountId) return reject(createError('An account id must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM transactions WHERE account_id = ?', [accountId], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No transactions found', 'NoResultsError'));
        const transactions = results.map(result => new Transaction(
          result.id,
          result.account_id,
          result.timestamp,
          result.description,
          result.amount,
          result.currency,
          result.type,
          result.category,
          result.merchant_name,
        ));
        return resolve(transactions);
      });
    });
  }
}

module.exports = Transaction;
