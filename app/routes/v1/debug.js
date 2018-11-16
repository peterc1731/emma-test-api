const debugController = require('../../controllers/debug');

module.exports = (app) => {
  app.get(
    '/api/v1/debug/user/:userId',
    debugController.getDebugInfo,
  );
};
