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

const testUserObj = {
  email: 'test@test.com',
  password: 'test',
};

const testUser = new User('test@test.com', 'test');

describe('API /v1/auth', () => {
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

  describe('POST: /register', () => {
    afterEach((done) => {
      connection.query('DELETE FROM users', (err) => {
        done(err);
      });
    });

    it('should register a user and return a token', () => chai
      .request(server)
      .post('/api/v1/auth/register')
      .send(testUserObj)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.token).to.be.a('string');
        expect(res.body.user).to.be.an('object');
      }));

    it('should return a 400 if required information is missing', () => chai
      .request(server)
      .post('/api/v1/auth/register')
      .send({ ...testUserObj, email: null })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal('Email must be provided');
      }));
  });

  describe('POST: /login', () => {
    it('should login a user and return a token', () => testUser.create()
      .then(() => chai.request(server)
        .post('/api/v1/auth/login')
        .send(testUserObj)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json'))
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.token).to.be.a('string');
        expect(res.body.user).to.be.an('object');
      }));

    it('should return a 400 if required information is missing', () => chai
      .request(server)
      .post('/api/v1/auth/login')
      .send({ ...testUserObj, email: null })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.error).to.equal('Email must be provided');
      }));

    it('should return a 404 if user does not exist', () => chai
      .request(server)
      .post('/api/v1/auth/login')
      .send({ ...testUserObj, email: 'fake@user.com' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(404);
        expect(res.body.error).to.equal('No results found');
      }));
  });
});
