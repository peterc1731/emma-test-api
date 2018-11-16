const db = require('../../utils/db');

module.exports = (app) => {
  app.get(
    '/health',
    (req, res) => db.checkConnection()
      .then(() => res.status(200).json({ health: "We're up and running healthy ✅" }))
      .catch(err => res.status(503).json({ health: 'Database is diconnected! ❌', error: err })),
  );
};
