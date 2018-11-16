const config = require('../config');
const { buildUrl } = require('../utils/url');
const { exchangeAuthCodeForAccessToken, getTransactions, getAccounts } = require('../utils/truelayer');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const TransactionClassification = require('../models/TransactionClassification');

// redirect to truelayer and get auth code
const auth = (req, res) => {
  const { user } = req;

  const domain = 'https://auth.truelayer.com';
  const queryParams = {
    response_type: 'code',
    client_id: config.tlClientId,
    nonce: Math.round(Math.random() * 1e10),
    scope: ['info', 'accounts', 'balance', 'transactions', 'cards', 'offline_access'],
    redirect_uri: config.tlRedirectUri,
    enable_mock: (config.env !== 'production'),
    enable_oauth_providers: true,
    enable_open_banking_providers: true,
    enable_credentials_sharing_providers: true,
    response_mode: 'form_post',
    state: user.id,
  };

  const url = buildUrl(domain, queryParams);

  return res.status(200).json({
    message: 'Successfully generated redirect url',
    url,
  });
};

// exchange auth code for access token and collect account/transaction data
const exchange = async (req, res, next) => {
  const userId = req.body.state;
  const { code, error } = req.body;

  if (error) {
    error.name = 'TruelayerAuthError';
    return next(error);
  }

  try {
    const user = await User.findById(userId);
    const { access_token, refresh_token } = await exchangeAuthCodeForAccessToken(code);
    await user.updateRefreshToken(refresh_token);
    const accounts = await getAccounts(access_token);
    await Promise.all(accounts.map(async (account) => {
      await new Account(
        account.account_id,
        userId,
        account.account_type,
        account.display_name,
        account.currency,
        account.account_number.iban,
        account.account_number.number,
        account.account_number.sort_code,
      ).create();

      const transactions = await getTransactions(access_token, account.account_id);
      await Promise.all(transactions.map(async (transaction) => {
        await new Transaction(
          transaction.transaction_id,
          account.account_id,
          transaction.timestamp,
          transaction.description,
          transaction.amount,
          transaction.currency,
          transaction.transaction_type,
          transaction.transaction_category,
          transaction.merchant_name,
        ).create();


        await Promise.all(transaction.transaction_classification
          .map(classification => new TransactionClassification(
            transaction.transaction_id,
            classification,
          ).create()));
      }));
    }));

    return res.status(200).json({
      message: 'Successfully authorised user and collected transaction data',
    });
  } catch (e) {
    return next(e);
  }
};

module.exports = {
  auth,
  exchange,
};
