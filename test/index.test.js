const chai = require('chai');
const chaiHttp = require('chai-http');
const {
  describe, it, after, before,
} = require('mocha');
const server = require('../app/app')();
const db = require('../app/utils/db');

const { expect } = chai;

chai.use(chaiHttp);

describe('API /', () => {
  let connection;
  before(() => db.init().then(() => {
    connection = db.connection();
  }));

  after(done => connection.end(done));

  it('it should return 200', () => chai
    .request(server)
    .get('/')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .then((res) => {
      expect(res.status).to.equal(200);
    }));

  it("it should return 404 when the route doesn't exist", () => chai
    .request(server)
    .get('/fakeRoute')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .then((res) => {
      expect(res.status).to.equal(404);
    }));
});
