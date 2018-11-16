const handleErrors = (err, req, res, next) => {
  if (err.name && err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'There was an issue with your request',
      error: err.message,
    });
  }

  // Authentication errors
  if (err.name === 'UserExistsError') {
    return res.status(422).json({
      message: 'There was an issue with your request',
      errors: {
        email: {
          message: 'Email already in use',
        },
      },
    });
  } if (err.name === 'MissingUsernameError') {
    return res.status(400).json({
      message: 'There was an issue with your request',
      errors: {
        email: {
          message: 'Email is required',
        },
      },
    });
  } if (err.name === 'MissingPasswordError') {
    return res.status(400).json({
      message: 'There was an issue with your request',
      errors: {
        password: {
          message: 'Password is required',
        },
      },
    });
  }

  if (err.name === 'NoResultsError') {
    return res.status(404).json({
      message: 'There was an issue with your request',
      error: 'No results found',
    });
  }

  if (err.name === 'TruelayerAPIError') {
    return res.status(500).json({
      message: 'There was an issue communicating with truelayer',
      error: err,
    });
  }

  if (err instanceof Error) {
    return res.status(422).json({
      message: 'There was an issue with your request',
      error: err.message,
    });
  }

  res.status(500).json({
    message: 'An error occurred 😲',
    error: err,
  });

  return next(err);
};

const createError = (message, name = null) => {
  const error = new Error(message);
  if (name) { error.name = name; }
  return error;
};

module.exports = {
  handleErrors,
  createError,
};
