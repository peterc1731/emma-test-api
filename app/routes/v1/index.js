const auth = require('./auth');
const health = require('./health');
const index = require('./base');
const user = require('./user');
const bank = require('./bank');
const account = require('./account');
const transaction = require('./transaction');
const debug = require('./debug');
const base = require('./base');

module.exports = (app) => {
  base(app);
  auth(app);
  health(app);
  index(app);
  user(app);
  bank(app);
  account(app);
  transaction(app);
  debug(app);
};
