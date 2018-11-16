const passport = require('passport');
const transactionController = require('../../controllers/transaction');

module.exports = (app) => {
  app.get(
    '/api/v1/accounts/:accountId/transactions',
    passport.authenticate('jwt', { session: false }),
    transactionController.getTransactions,
  );
};
