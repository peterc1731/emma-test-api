const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  describe, it, after, before,
} = require('mocha');
const server = require('../app/app')();
const db = require('../app/utils/db');
const User = require('../app/models/User');

const { expect } = chai;

chai.use(chaiHttp);

const testUser = new User('test@test.com', 'test');

describe('API /api/v1/debug/user', () => {
  let connection;
  before(async () => {
    await db.init();
    connection = db.connection();
    await User.createTable();
    await testUser.create();
  });

  after((done) => {
    connection.query('DROP TABLE users', (error) => {
      connection.end(done(error));
    });
  });

  describe('GET: /:userId', () => {
    it('should fail to get debug data from truelayer when the given user has no refresh token', () => chai
      .request(server)
      .get('/api/v1/debug/user/1')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(500);
        expect(res.body.error.data.error).to.equal('invalid_request');
      }));

    it('should return 404 when the given user does not exist', () => chai
      .request(server)
      .get('/api/v1/debug/user/2')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(404);
      }));
  });
});
