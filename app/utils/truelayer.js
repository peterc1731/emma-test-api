const request = require('axios');
const querystring = require('querystring');
const config = require('../config');

const domain = 'https://api.truelayer.com';
const authDomain = 'https://auth.truelayer.com';

const exchangeAuthCodeForAccessToken = authCode => request
  .post(`${authDomain}/connect/token`, querystring.stringify({
    client_id: config.tlClientId,
    client_secret: config.tlClientSecret,
    code: authCode,
    grant_type: 'authorization_code',
    redirect_uri: config.tlRedirectUri,
  })).then(res => res.data)
  .catch((err) => {
    const error = new Error('Error exchanging auth code for access token');
    error.name = 'TruelayerAPIError';
    error.data = err.response.data;
    error.data.code = err.response.code;
    throw error;
  });

const exchangeRefreshTokenForAccessToken = refreshToken => request
  .post(`${authDomain}/connect/token`, querystring.stringify({
    client_id: config.tlClientId,
    client_secret: config.tlClientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })).then(res => res.data)
  .catch((err) => {
    const error = new Error('Error exchanging refresh token for access token');
    error.name = 'TruelayerAPIError';
    error.data = err.response.data;
    error.data.code = err.response.code;
    throw error;
  });

const getAccounts = accessToken => request
  .get(`${domain}/data/v1/accounts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.data.results)
  .catch((err) => {
    const error = new Error('Error getting accounts');
    error.name = 'TruelayerAPIError';
    error.data = err.response.data;
    error.data.code = err.response.code;
    throw error;
  });

const getAccountsDebug = accessToken => request
  .get(`${domain}/data/v1/accounts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

const getTransactions = (accessToken, accountId) => request
  .get(`${domain}/data/v1/accounts/${accountId}/transactions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => res.data.results)
  .catch((err) => {
    const error = new Error('Error getting transactions');
    error.name = 'TruelayerAPIError';
    error.data = err.response.data;
    error.data.code = err.response.code;
    throw error;
  });

const getTransactionsDebug = (accessToken, accountId) => request
  .get(`${domain}/data/v1/accounts/${accountId}/transactions`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

module.exports = {
  exchangeAuthCodeForAccessToken,
  exchangeRefreshTokenForAccessToken,
  getTransactions,
  getAccounts,
  getAccountsDebug,
  getTransactionsDebug,
};
