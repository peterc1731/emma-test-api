module.exports = {
  env: process.env.NODE_ENV || 'development',
  secret: process.env.SECRET || 'emma-api-secret',
  port: process.env.PORT || '2000',
  dbHost: process.env.DB_HOST || 'localhost',
  dbPort: process.env.DB_PORT || '3306',
  dbUser: process.env.DB_USER || 'test',
  dbPassword: process.env.DB_PASSWORD || 'password',
  dbName: process.env.DB_NAME || 'test',
  tlClientSecret: process.env.TRUELAYER_CLIENT_SECRET || 'secret',
  tlClientId: process.env.TRUELAYER_CLIENT_ID || 'id',
  tlRedirectUri: process.env.TRUELAYER_REDIRECT_URI || 'http://localhost:2000/api/v1/bank/auth',
};
