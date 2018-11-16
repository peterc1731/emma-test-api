const Account = require('../models/Account');

const getAccounts = async (req, res, next) => {
  try {
    const { id } = req.user;
    const accounts = await Account.findByUserId(id);

    return res.status(200).json({
      message: 'Successfully retrieved accounts',
      accounts: accounts.map(acc => acc.toObject()),
    });
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  getAccounts,
};
