const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  describe, it, after, before, afterEach,
} = require('mocha');
const server = require('../app/app')();
const db = require('../app/utils/db');
const User = require('../app/models/User');

const { expect } = chai;

chai.use(chaiHttp);

const testUser = new User('test@test.com', 'test');

describe('API /api/v1/bank', () => {
  let connection;
  before(() => db.init().then(() => {
    connection = db.connection();
    return User.createTable();
  }));

  after((done) => {
    connection.query('DROP TABLE users', (err) => {
      connection.end(done(err));
    });
  });

  describe('GET: /auth', () => {
    afterEach((done) => {
      connection.query('DELETE FROM users', (err) => {
        done(err);
      });
    });

    it('should redirect to truelayer and return 200 when passed a valid token', () => testUser.create()
      .then(() => testUser.authenticate('test'))
      .then(() => testUser.getAccessToken())
      .then(token => chai
        .request(server)
        .get('/api/v1/bank/auth')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('object');
          expect(res.body.url).to.include('https://auth.truelayer.com?response_type=code&client_id=emmatest-s4hs');
          expect(res.body.url).to.include('scope=info%20accounts%20balance%20transactions%20cards%20offline_access&redirect_uri=http%3A%2F%2Flocalhost%3A2000%2Fapi%2Fv1%2Fbank%2Fauth&enable_mock=true&enable_oauth_providers=true&enable_open_banking_providers=true&enable_credentials_sharing_providers=true&response_mode=form_post&state=1');
        })));

    it('should return 401 when passed an invalid token', () => chai
      .request(server)
      .get('/api/v1/bank/auth')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer fakeToken')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));

    it('should return 401 when not passed a token', () => chai
      .request(server)
      .get('/api/v1/bank/auth')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));
  });
});
