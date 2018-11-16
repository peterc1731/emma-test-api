const db = require('../utils/db');
const { createError } = require('../utils/errors');

class TransactionClassification {
  constructor(transactionId, classification, id = null) {
    this.id = id;
    this.transactionId = transactionId;
    this.classification = classification;
  }

  create() {
    return new Promise((resolve, reject) => {
      const connection = db.connection();
      return connection.query('INSERT INTO transaction_classifications (transaction_id, classification) VALUES (?, ?)', [
        this.transactionId,
        this.classification,
      ], (error, results) => {
        if (error) return reject(error);
        this.id = results.insertId;
        return resolve(results);
      });
    });
  }

  toObject() {
    return {
      id: this.id,
      transactionId: this.transactionId,
      classification: this.classification,
    };
  }

  static createTable() {
    return new Promise((resolve, reject) => {
      const connection = db.connection();
      connection.query(`
        CREATE TABLE IF NOT EXISTS transaction_classifications (
          id int NOT NULL AUTO_INCREMENT,
          transaction_id varchar(255) NOT NULL,
          classification varchar(255) NOT NULL,
          PRIMARY KEY (id)
        );
      `, (error, results) => {
        if (error) return reject(error);
        console.log('Successfully created table transaction_classifications');
        return resolve(results);
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      if (!id) return reject(createError('An id must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM transaction_classifications WHERE id = ?', [id], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No classifications found', 'NoResultsError'));
        const transactionClassification = new TransactionClassification(
          results[0].transaction_id,
          results[0].classification,
          results[0].id,
        );
        return resolve(transactionClassification);
      });
    });
  }

  static findByTransactionId(transactionId) {
    return new Promise((resolve, reject) => {
      if (!transactionId) return reject(createError('A transaction id must be provided', 'ValidationError'));
      const connection = db.connection();
      return connection.query('SELECT * FROM transaction_classifications WHERE transaction_id = ?', [transactionId], (error, results) => {
        if (error) return reject(error);
        if (!results.length) return reject(createError('No classifications found', 'NoResultsError'));
        const transactionClassifications = results.map(result => new TransactionClassification(
          result.transaction_id,
          result.classification,
          result.id,
        ));
        return resolve(transactionClassifications);
      });
    });
  }
}

module.exports = TransactionClassification;
