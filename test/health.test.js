const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  describe, it, after, before,
} = require('mocha');
const server = require('../app/app')();
const db = require('../app/utils/db');

const { expect } = chai;

chai.use(chaiHttp);

describe('API /health', () => {
  let connection;
  before(() => db.init().then(() => {
    connection = db.connection();
  }));

  after(done => connection.end(done));

  describe('GET: /', () => {
    it('it should return 200 when the application is running', () => chai
      .request(server)
      .get('/health')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.health).to.equal("We're up and running healthy ✅");
      }));

    it('it should return 503 when the database is not connected', () => new Promise((resolve, reject) => {
      connection.end((err) => {
        if (err) return reject(err);
        return resolve();
      });
    }).then(() => chai
      .request(server)
      .get('/health')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then((res) => {
        chai.expect(res.status).to.equal(503);
        expect(res.body.health).to.equal('Database is diconnected! ❌');
      })));
  });
});
