const User = require('../models/User');

const register = async (req, res, next) => {
  try {
    const user = new User(req.body.email, req.body.password);
    await user.create();
    await user.authenticate(req.body.password);
    const token = await user.getAccessToken();
    return res.status(200).json({
      message: 'Successfully created new account 👏',
      user: user.toObject(),
      token,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.findByEmail(req.body.email);
    await user.authenticate(req.body.password);
    const token = await user.getAccessToken();
    return res.status(200).json({
      message: 'Successfully logged in 🎉',
      user: user.toObject(),
      token,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
