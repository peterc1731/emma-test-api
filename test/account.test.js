const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  describe, it, after, before, afterEach,
} = require('mocha');
const server = require('../app/app')();
const db = require('../app/utils/db');
const User = require('../app/models/User');
const Account = require('../app/models/Account');

const { expect } = chai;

chai.use(chaiHttp);

const testUser = new User('test@test.com', 'test');
const testAccount = new Account('id', 1, 'type', 'name', 'currency', 'iban', 'swift-bic', 'account-number', 'sort-code');

let token;

describe('API /api/v1/accounts', () => {
  let connection;
  before(async () => {
    await db.init();
    connection = db.connection();
    await User.createTable();
    await Account.createTable();
    await testUser.create();
    await testUser.authenticate('test');
    token = await testUser.getAccessToken();
  });

  after((done) => {
    connection.query('DROP TABLE users', (error) => {
      connection.query('DROP TABLE accounts', (err) => {
        connection.end(done(error || err));
      });
    });
  });

  describe('GET: /', () => {
    afterEach((done) => {
      connection.query('DELETE FROM accounts', (err) => {
        done(err);
      });
    });

    it('should return all available accounts owned by the currently authenticated user', () => testAccount
      .create()
      .then(() => chai
        .request(server)
        .get('/api/v1/accounts')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.accounts).to.be.an('array');
          expect(res.body.accounts.length).to.equal(1);
          expect(res.body.accounts[0].id).to.equal('id');
        })));

    it('should return 404 when no accounts are available for the authenticated user', () => chai
      .request(server)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(404);
      }));

    it('should return 401 when passed an invalid token', () => chai
      .request(server)
      .get('/api/v1/accounts')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer fakeToken')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));

    it('should return 401 when not passed a token', () => chai
      .request(server)
      .get('/api/v1/accounts')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));
  });
});
