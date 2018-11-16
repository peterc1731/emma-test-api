const { expect, use } = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const {
  describe, it, before, after,
} = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const User = require('./User');
const db = require('../utils/db');

use(sinonChai);
use(chaiAsPromised);

let connectionStub;

describe('The user model', () => {
  before(() => {
    connectionStub = sinon.stub(db, 'connection');
  });

  after(() => {
    connectionStub.restore();
  });

  describe('constructor()', () => {
    it('should create a new unauthenticated user instance when passed values for email, password, hash and id', () => {
      const user = new User('email', 'password', 'hash', 1);
      expect(user.email).to.equal('email');
      expect(user.password).to.equal('password');
      expect(user.hash).to.equal('hash');
      expect(user.id).to.equal(1);
      expect(user.authenticated).to.be.false;
    });

    it('should create a new unauthenticated user instance with id = null when id value is omitted', () => {
      const user = new User('email', 'password', 'hash');
      expect(user.email).to.equal('email');
      expect(user.password).to.equal('password');
      expect(user.hash).to.equal('hash');
      expect(user.id).to.be.null;
      expect(user.authenticated).to.be.false;
    });

    it('should create a new unauthenticated user instance with hash = null when hash value is omitted', () => {
      const user = new User('email', 'password');
      expect(user.email).to.equal('email');
      expect(user.password).to.equal('password');
      expect(user.hash).to.be.null;
      expect(user.id).to.be.null;
      expect(user.authenticated).to.be.false;
    });

    it('should create a new unauthenticated user instance with password = null when password value is omitted', () => {
      const user = new User('email');
      expect(user.email).to.equal('email');
      expect(user.password).to.be.null;
      expect(user.hash).to.be.null;
      expect(user.id).to.be.null;
      expect(user.authenticated).to.be.false;
    });

    it('should throw an error when attempting to create an empty user', () => {
      let user;
      try {
        user = new User();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(user).to.be.undefined;
      }
    });
  });

  describe('hash()', () => {
    it('should successfully hash the password when a password value is present', async () => {
      const user = new User('email', 'password');
      expect(user.hash).to.be.null;
      await user.createHash();
      expect(user.hash).to.not.be.null;
    });

    it('should reject with an error when a password value is not present', async () => {
      let user;
      try {
        user = new User('email');
        expect(user.hash).to.be.null;
        expect(user.password).to.be.null;
        await user.createHash();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(user.hash).to.be.null;
      }
    });

    it('should reject with an error when unable to hash the password', async () => {
      let user;
      try {
        user = new User('email', 1234);
        expect(user.hash).to.be.null;
        await user.createHash();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(user.hash).to.be.null;
      }
    });
  });

  describe('authenticate()', () => {
    it('should resolve true if the given password matches the hash', async () => {
      const user = new User('email', 'password');
      expect(user.hash).to.be.null;
      await user.createHash();
      expect(user.hash).to.not.be.null;
      const authed = await user.authenticate('password');
      expect(authed).to.be.true;
    });

    it('should resolve false if the given password does not match the hash', async () => {
      const user = new User('email', 'password');
      expect(user.hash).to.be.null;
      await user.createHash();
      expect(user.hash).to.not.be.null;
      const authed = await user.authenticate('different_password');
      expect(authed).to.be.false;
    });

    it('should reject with an error if the given password cannot be compared with the hash', async () => {
      let user;
      try {
        user = new User('email', 'password');
        expect(user.hash).to.be.null;
        await user.createHash();
        expect(user.hash).to.not.be.null;
        await user.authenticate(1234);
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
      }
    });
  });

  describe('getAcessToken()', () => {
    it('should resolve with a token if the user is authenticated and the id and password exist', async () => {
      const user = new User('email', 'password', null, 1);
      await user.createHash();
      await user.authenticate('password');
      const token = await user.getAccessToken();
      expect(token).to.not.be.undefined;
      expect(token).to.be.a('string');
    });

    it('should reject with an error if the user is not authenticated', async () => {
      let user;
      let token;
      try {
        user = new User('email', 'password', null, 1);
        await user.createHash();
        token = await user.getAccessToken();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(token).to.be.undefined;
      }
    });

    it('should reject with an error if the id is not present', async () => {
      let user;
      let token;
      try {
        user = new User('email', 'password');
        await user.createHash();
        await user.authenticate('password');
        token = await user.getAccessToken();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(token).to.be.undefined;
      }
    });
  });

  describe('insert()', () => {
    it('should insert a user into the DB when the user\'s password has been hashed', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {
          insertId: 1,
        });
      });
      connectionStub.returns({
        query: queryStub,
      });

      const user = new User('email', 'password');
      await user.createHash();
      await user.insert();

      expect(queryStub.calledOnce).to.be.true;
      expect(user.id).to.equal(1);
    });

    it('should not insert a user into the DB and reject with an error when the user\'s password has not been hashed', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {
          insertId: 1,
        });
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = new User('email', 'password');
        await user.insert();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.called).to.be.false;
        expect(user.id).to.be.null;
      }
    });

    it('should reject with an error when the DB query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = new User('email', 'password');
        await user.createHash();
        await user.insert();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(user.id).to.be.null;
      }
    });
  });

  describe('create()', () => {
    it('should insert a user into the DB when the user has a password', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {
          insertId: 1,
        });
      });
      connectionStub.returns({
        query: queryStub,
      });

      const user = new User('email', 'password');
      await user.create();

      expect(queryStub.calledOnce).to.be.true;
      expect(user.id).to.equal(1);
    });

    it('should not insert a user into the DB and reject with an error when the user does not have a password', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {
          insertId: 1,
        });
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = new User('email');
        await user.create();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.called).to.be.false;
        expect(user.id).to.be.null;
      }
    });

    it('should reject with an error when the DB query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = new User('email', 'password');
        await user.create();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(user.id).to.be.null;
      }
    });
  });

  describe('updateRefreshToken()', () => {
    it('should update the user row in the db with the given refresh token', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {});
      });
      connectionStub.returns({
        query: queryStub,
      });

      const user = new User('email', 'password');
      await user.updateRefreshToken('refresh-token');

      expect(queryStub.calledOnce).to.be.true;
      expect(user.tlRefreshToken).to.equal('refresh-token');
    });

    it('should resolve with an error if no token is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{}]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const user = new User('email', 'password');
      try {
        await user.updateRefreshToken();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(user.tlRefreshToken).to.be.null;
      }
    });

    it('should resolve with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const user = new User('email', 'password');
      try {
        await user.updateRefreshToken('refresh-token');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(user.tlRefreshToken).to.be.null;
      }
    });
  });

  describe('toObject()', () => {
    it('should return any available non-sensitive user properties as an object', () => {
      const user = new User('email', 'password', 'hash', 1);
      const obj = user.toObject();

      expect(obj.email).to.equal('email');
      expect(obj.id).to.equal(1);
    });
  });

  describe('createTable()', () => {
    it('should successfully create the users table in the db', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, cb) => {
        cb(null, { success: true });
      });
      connectionStub.returns({
        query: queryStub,
      });

      const results = await User.createTable();

      expect(queryStub.calledOnce).to.be.true;
      expect(results.success).to.be.true;
    });

    it('should reject with an error if the table creation fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, cb) => {
        cb(new Error('creation failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      try {
        await User.createTable();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
      }
    });
  });

  describe('findById()', () => {
    it('should successfully return a user without password when given a valid id', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          email: 'email',
          hash: 'hash',
          password: 'password',
          id: values[0],
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const user = await User.findById(1);

      expect(queryStub.calledOnce).to.be.true;
      expect(user instanceof User).to.be.true;
      expect(user.email).to.equal('email');
      expect(user.password).to.be.null;
      expect(user.hash).to.equal('hash');
      expect(user.id).to.equal(1);
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = await User.findById(1);
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(user instanceof User).to.be.false;
      }
    });

    it('should reject with an error if no id is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          email: 'email',
          hash: 'hash',
          password: 'password',
          id: values[0],
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = await User.findById();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(user instanceof User).to.be.false;
      }
    });

    it('should reject with an error if no results are found', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, []);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = await User.findById(1);
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(user instanceof User).to.be.false;
      }
    });
  });

  describe('findByEmail()', () => {
    it('should successfully return a user without password when given a valid email', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          email: values[0],
          hash: 'hash',
          password: 'password',
          id: 1,
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const user = await User.findByEmail('email');

      expect(queryStub.calledOnce).to.be.true;
      expect(user instanceof User).to.be.true;
      expect(user.email).to.equal('email');
      expect(user.password).to.be.null;
      expect(user.hash).to.equal('hash');
      expect(user.id).to.equal(1);
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = await User.findByEmail('email');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(user instanceof User).to.be.false;
      }
    });

    it('should reject with an error if no email is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = await User.findByEmail();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(user instanceof User).to.be.false;
      }
    });

    it('should reject with an error if no results are found', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, []);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let user;
      try {
        user = await User.findByEmail('email');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(user instanceof User).to.be.false;
      }
    });
  });
});
