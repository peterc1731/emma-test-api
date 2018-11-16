const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('./utils/passport');
const routes = require('./routes/v1');
const { handleErrors } = require('./utils/errors');

const app = express();

module.exports = () => {
  app.use(cors());
  app.use(compression());
  app.use(passport.initialize());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  routes(app);

  app.get('*', (req, res) => res.status(404).json({
    message: "Seems like the endpoint you're looking for doesn't exist 🤔",
  }));

  app.use(handleErrors);

  app.use((err, req, res, next) => {
    if (err) {
      console.error('There was an error 😲', err.stack);
      throw err;
    }

    next();
  });

  app.use(morgan('common'));

  return app;
};
