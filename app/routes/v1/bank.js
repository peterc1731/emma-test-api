const passport = require('passport');
const bankController = require('../../controllers/bank');

module.exports = (app) => {
  app.get(
    '/api/v1/bank/auth',
    passport.authenticate('jwt', { session: false }),
    bankController.auth,
  );

  app.post(
    '/api/v1/bank/auth',
    bankController.exchange,
  );
};
