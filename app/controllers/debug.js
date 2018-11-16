const User = require('../models/User');
const { exchangeRefreshTokenForAccessToken, getAccountsDebug, getTransactionsDebug } = require('../utils/truelayer');

const getDebugInfo = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const {
      access_token,
      refresh_token,
    } = await exchangeRefreshTokenForAccessToken(user.tlRefreshToken);
    await user.updateRefreshToken(refresh_token);
    const accountsData = await getAccountsDebug(access_token);
    const transactionsData = await Promise.all(accountsData.data.results
      .map(account => getTransactionsDebug(access_token, account.account_id)));

    const data = {
      accounts: {
        headers: accountsData.headers,
        results: accountsData.data.results.map((account, index) => ({
          account,
          transactions: {
            headers: transactionsData[index].headers,
            results: transactionsData[index].data.results,
          },
        })),
      },
    };
    const processingTime = `${Date.now() - startTime}ms`;
    return res.status(200).json({
      message: 'Successfully collected debug data on truelayer account and transaction requests',
      error: false,
      processingTime,
      data,
    });
  } catch (e) {
    if (e.response) {
      const processingTime = `${Date.now() - startTime}ms`;
      return res.status(200).json({
        message: 'Successfully collected debug data on truelayer account and transaction requests',
        error: true,
        processingTime,
        data: {
          status: e.response.status,
          error: e.response.data,
          headers: e.response.headers,
        },
      });
    }
    return next(e);
  }
};

module.exports = {
  getDebugInfo,
};
