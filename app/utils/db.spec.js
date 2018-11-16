const { expect, use } = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const {
  describe, it, after, afterEach, before,
} = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const mysql = require('mysql');
const db = require('./db');

use(sinonChai);
use(chaiAsPromised);

describe('The database utility', () => {
  let createPoolStub;

  before(() => {
    createPoolStub = sinon.stub(mysql, 'createPool');
  });

  after(() => {
    createPoolStub.restore();
  });

  afterEach(() => {
    createPoolStub.reset();
  });

  it('should throw an error when attempting to utilise a connection if it has not been initialised', () => {
    let conn;
    try {
      conn = db.connection();
      expect.fail();
    } catch (e) {
      expect(createPoolStub.called).to.be.false;
      expect(conn).to.be.undefined;
      expect(e).to.not.be.undefined;
      expect(e.message).to.equal('Connection pool not initialised');
    }
  });

  it('should create a connection pool and test the connection', () => {
    createPoolStub.returns({
      on: (event, cb) => {
        if (event === 'connection') {
          cb({ threadId: 1 });
        }
        if (event === 'error') {
          cb(new Error('test'));
        }
      },
      getConnection: (cb) => {
        cb(null, {
          ping: (pcb) => {
            pcb(null);
          },
          release: () => {},
        });
      },
    });

    return db.init().then(() => {
      expect(createPoolStub.calledOnce).to.be.true;
      const conn = db.connection();
      expect(conn).to.be.an('object');
    });
  });


  it('should throw an error when testing the connection if a connection cannot be established', () => {
    createPoolStub.returns({
      on: (event, cb) => {
        if (event === 'connection') {
          cb({ threadId: 1 });
        }
        if (event === 'error') {
          cb(new Error('test'));
        }
      },
      getConnection: (cb) => {
        cb(null, {
          ping: (pcb) => {
            pcb(new Error('connection failed'));
          },
          release: () => {},
        });
      },
    });

    return db.init().catch((err) => {
      expect(createPoolStub.calledOnce).to.be.true;
      expect(err.message).to.equal('connection failed');
    });
  });
});
