const passport = require('passport');
const accountController = require('../../controllers/account');

module.exports = (app) => {
  app.get(
    '/api/v1/accounts',
    passport.authenticate('jwt', { session: false }),
    accountController.getAccounts,
  );
};
