const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  describe, it, after, before, afterEach,
} = require('mocha');
const server = require('../app/app')();
const db = require('../app/utils/db');
const User = require('../app/models/User');
const Transaction = require('../app/models/Transaction');
const TransactionClassification = require('../app/models/TransactionClassification');

const { expect } = chai;

chai.use(chaiHttp);

const testUser = new User('test@test.com', 'test');
const testTransaction = new Transaction('id', 'account-id', '01-01-2018', 'description', 25, 'currency', 'type', 'category', 'merchant-name');
const TestTransactionClassification1 = new TransactionClassification('id', 'classification-1');
const TestTransactionClassification2 = new TransactionClassification('id', 'classification-2');


let token;

describe('API /api/v1/accounts/:accountId/transactions', () => {
  let connection;
  before(async () => {
    await db.init();
    connection = db.connection();
    await User.createTable();
    await Transaction.createTable();
    await TransactionClassification.createTable();
    await testUser.create();
    await testUser.authenticate('test');
    token = await testUser.getAccessToken();
  });

  after((done) => {
    connection.query('DROP TABLE users', (error) => {
      connection.query('DROP TABLE transactions', (err) => {
        connection.query('DROP TABLE transaction_classifications', (e) => {
          connection.end(done(error || err || e));
        });
      });
    });
  });

  describe('GET: /', () => {
    afterEach((done) => {
      connection.query('DELETE FROM transactions', (err) => {
        done(err);
      });
    });

    it('should return all available transactions on the given account', () => testTransaction
      .create()
      .then(() => TestTransactionClassification1.create())
      .then(() => TestTransactionClassification2.create())
      .then(() => chai
        .request(server)
        .get('/api/v1/accounts/account-id/transactions')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.transactions).to.be.an('array');
          expect(res.body.transactions.length).to.equal(1);
          expect(res.body.transactions[0].id).to.equal('id');
          expect(res.body.transactions[0].classifications).to.be.an('array');
          expect(res.body.transactions[0].classifications.length).to.equal(2);
          expect(res.body.transactions[0].classifications[0].classification).to.equal('classification-1');
        })));

    it('should return 404 when no transactions are available for the given account', () => chai
      .request(server)
      .get('/api/v1/accounts/account-id/transactions')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(404);
      }));

    it('should return 401 when passed an invalid token', () => chai
      .request(server)
      .get('/api/v1/accounts/account-id/transactions')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer fakeToken')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));

    it('should return 401 when not passed a token', () => chai
      .request(server)
      .get('/api/v1/accounts/account-id/transactions')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));
  });
});
