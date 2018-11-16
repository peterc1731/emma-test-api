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

describe('API /api/v1/user', () => {
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

  describe('/', () => {
    afterEach((done) => {
      connection.query('DELETE FROM users', (err) => {
        done(err);
      });
    });

    it('should return 200 when passed a valid token', () => testUser.create()
      .then(() => testUser.authenticate('test'))
      .then(() => testUser.getAccessToken())
      .then(token => chai
        .request(server)
        .get('/api/v1/user')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Successfully collected user information');
          expect(res.body.user).to.be.an('object');
        })));

    it('should return 401 when passed an invalid token', () => chai
      .request(server)
      .get('/api/v1/user')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer fakeToken')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));

    it('should return 401 when not passed a token', () => chai
      .request(server)
      .get('/api/v1/user')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(401);
      }));
  });
});
