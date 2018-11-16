const { expect, use } = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const {
  describe, it, before, after,
} = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const Account = require('./Account');
const db = require('../utils/db');

use(sinonChai);
use(chaiAsPromised);

let connectionStub;

describe('The account model', () => {
  before(() => {
    connectionStub = sinon.stub(db, 'connection');
  });

  after(() => {
    connectionStub.restore();
  });

  describe('constructor()', () => {
    it('should create a new account instance when passed all values', () => {
      const account = new Account('id', 'user-id', 'type', 'name', 'currency', 'iban', 'swift-bic', 'account-number', 'sort-code');
      expect(account.id).to.equal('id');
      expect(account.userId).to.equal('user-id');
      expect(account.type).to.equal('type');
      expect(account.name).to.equal('name');
      expect(account.currency).to.equal('currency');
      expect(account.iban).to.equal('iban');
      expect(account.swiftBic).to.equal('swift-bic');
      expect(account.accountNumber).to.equal('account-number');
      expect(account.sortCode).to.equal('sort-code');
    });
  });

  describe('create()', () => {
    it('should insert an account into the DB', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {});
      });
      connectionStub.returns({
        query: queryStub,
      });

      const account = new Account('id', 'user_id', 'type', 'name', 'currency', 'iban', 'swift-bic', 'account-number', 'sort-code');
      await account.create();

      expect(queryStub.calledOnce).to.be.true;
      expect(account.id).to.equal('id');
    });

    it('should reject with an error when the DB query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let account;
      try {
        account = new Account('id', 'user-id', 'type', 'name', 'currency', 'iban', 'swift-bic', 'account-number', 'sort-code');
        await account.create();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
      }
    });
  });

  describe('toObject()', () => {
    it('should return any available account properties as an object', () => {
      const account = new Account('id', 'user-id', 'type', 'name', 'currency', 'iban', 'swift-bic', 'account-number', 'sort-code');
      const obj = account.toObject();

      expect(obj.id).to.equal('id');
      expect(account.userId).to.equal('user-id');
      expect(obj.type).to.equal('type');
      expect(obj.name).to.equal('name');
      expect(obj.currency).to.equal('currency');
      expect(obj.iban).to.equal('iban');
      expect(account.swiftBic).to.equal('swift-bic');
      expect(obj.accountNumber).to.equal('account-number');
      expect(obj.sortCode).to.equal('sort-code');
    });
  });

  describe('createTable()', () => {
    it('should successfully create the accounts table in the db', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, cb) => {
        cb(null, { success: true });
      });
      connectionStub.returns({
        query: queryStub,
      });

      const results = await Account.createTable();

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
        await Account.createTable();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
      }
    });
  });

  describe('findById()', () => {
    it('should successfully return an account when given a valid account id', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          user_id: 'user-id',
          type: 'type',
          name: 'name',
          currency: 'currency',
          iban: 'iban',
          swift_bic: 'swift-bic',
          account_number: 'account-number',
          sort_code: 'sort-code',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const account = await Account.findById('id');

      expect(queryStub.calledOnce).to.be.true;
      expect(account instanceof Account).to.be.true;
      expect(account.id).to.equal('id');
      expect(account.userId).to.equal('user-id');
      expect(account.type).to.equal('type');
      expect(account.name).to.equal('name');
      expect(account.currency).to.equal('currency');
      expect(account.iban).to.equal('iban');
      expect(account.swiftBic).to.equal('swift-bic');
      expect(account.accountNumber).to.equal('account-number');
      expect(account.sortCode).to.equal('sort-code');
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let account;
      try {
        account = await Account.findById('id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(account instanceof Account).to.be.false;
      }
    });

    it('should reject with an error if no id is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          user_id: 'user-id',
          type: 'type',
          name: 'name',
          currency: 'currency',
          iban: 'iban',
          swift_bic: 'swift-bic',
          account_number: 'account-number',
          sort_code: 'sort-code',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let account;
      try {
        account = await Account.findById();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(account instanceof Account).to.be.false;
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

      let account;
      try {
        account = await Account.findById('id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(account instanceof Account).to.be.false;
      }
    });
  });

  describe('findByUserId()', () => {
    it('should successfully return a list of accounts when given a valid user id', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          user_id: 'user-id',
          type: 'type',
          name: 'name',
          currency: 'currency',
          iban: 'iban',
          swift_bic: 'swift-bic',
          account_number: 'account-number',
          sort_code: 'sort-code',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const accounts = await Account.findByUserId('user-id');

      expect(queryStub.calledOnce).to.be.true;
      expect(accounts.length).to.equal(1);
      expect(accounts[0] instanceof Account).to.be.true;
      expect(accounts[0].id).to.equal('id');
      expect(accounts[0].userId).to.equal('user-id');
      expect(accounts[0].type).to.equal('type');
      expect(accounts[0].name).to.equal('name');
      expect(accounts[0].currency).to.equal('currency');
      expect(accounts[0].iban).to.equal('iban');
      expect(accounts[0].swiftBic).to.equal('swift-bic');
      expect(accounts[0].accountNumber).to.equal('account-number');
      expect(accounts[0].sortCode).to.equal('sort-code');
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let accounts;
      try {
        accounts = await Account.findByUserId('user-id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(Array.isArray(accounts)).to.be.false;
      }
    });

    it('should reject with an error if no id is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          user_id: 'user-id',
          type: 'type',
          name: 'name',
          currency: 'currency',
          iban: 'iban',
          swift_bic: 'swift-bic',
          account_number: 'account-number',
          sort_code: 'sort-code',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let accounts;
      try {
        accounts = await Account.findByUserId();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(Array.isArray(accounts)).to.be.false;
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

      let accounts;
      try {
        accounts = await Account.findByUserId('user-id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(Array.isArray(accounts)).to.be.false;
      }
    });
  });
});
