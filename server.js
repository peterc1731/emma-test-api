const app = require('./app/app')();
const config = require('./app/config');
const db = require('./app/utils/db');
const User = require('./app/models/User');
const Account = require('./app/models/Account');
const Transaction = require('./app/models/Transaction');
const TransactionClassification = require('./app/models/TransactionClassification');

const start = () => db.init()
  .then(() => User.createTable())
  .then(() => Account.createTable())
  .then(() => Transaction.createTable())
  .then(() => TransactionClassification.createTable())
  .then(() => {
    app.listen(config.port, () => {
      console.log(`App listening on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error(`Error starting server: ${err}`);
  });

module.exports = start();
