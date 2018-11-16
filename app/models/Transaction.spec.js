const { expect, use } = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const {
  describe, it, before, after,
} = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const Transaction = require('./Transaction');
const db = require('../utils/db');

use(sinonChai);
use(chaiAsPromised);

let connectionStub;

describe('The transaction model', () => {
  before(() => {
    connectionStub = sinon.stub(db, 'connection');
  });

  after(() => {
    connectionStub.restore();
  });

  describe('constructor()', () => {
    it('should create a new transaction instance when passed all values', () => {
      const transaction = new Transaction(
        'id',
        'account-id',
        '2018-03-06T00:00:00',
        'description',
        10.53,
        'currency',
        'type',
        'category',
        'merchant-name',
      );
      expect(transaction.id).to.equal('id');
      expect(transaction.accountId).to.equal('account-id');
      expect(transaction.timestamp.toISOString()).to.equal(new Date('2018-03-06T00:00:00').toISOString());
      expect(transaction.description).to.equal('description');
      expect(transaction.amount).to.equal(10.53);
      expect(transaction.currency).to.equal('currency');
      expect(transaction.type).to.equal('type');
      expect(transaction.category).to.equal('category');
      expect(transaction.merchantName).to.equal('merchant-name');
    });
  });

  describe('create()', () => {
    it('should insert an transaction into the DB', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {});
      });
      connectionStub.returns({
        query: queryStub,
      });

      const transaction = new Transaction(
        'id',
        'account-id',
        '2018-03-06T00:00:00',
        'description',
        10.53,
        'currency',
        'type',
        'category',
        'merchant-name',
      );
      await transaction.create();

      expect(queryStub.calledOnce).to.be.true;
      expect(transaction.id).to.equal('id');
    });

    it('should reject with an error when the DB query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let transaction;
      try {
        transaction = new Transaction(
          'id',
          'account-id',
          '2018-03-06T00:00:00',
          'description',
          10.53,
          'currency',
          'type',
          'category',
          'merchant-name',
        );
        await transaction.create();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
      }
    });
  });

  describe('toObject()', () => {
    it('should return any available transaction properties as an object', () => {
      const transaction = new Transaction(
        'id',
        'account-id',
        '2018-03-06T00:00:00',
        'description',
        10.53,
        'currency',
        'type',
        'category',
        'merchant-name',
      );
      const obj = transaction.toObject();

      expect(obj.id).to.equal('id');
      expect(obj.accountId).to.equal('account-id');
      expect(obj.timestamp.toISOString()).to.equal(new Date('2018-03-06T00:00:00').toISOString());
      expect(obj.description).to.equal('description');
      expect(obj.amount).to.equal(10.53);
      expect(obj.currency).to.equal('currency');
      expect(obj.type).to.equal('type');
      expect(obj.category).to.equal('category');
      expect(obj.merchantName).to.equal('merchant-name');
    });
  });

  describe('createTable()', () => {
    it('should successfully create the transactions table in the db', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, cb) => {
        cb(null, { success: true });
      });
      connectionStub.returns({
        query: queryStub,
      });

      const results = await Transaction.createTable();

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
        await Transaction.createTable();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
      }
    });
  });

  describe('findById()', () => {
    it('should successfully return an transaction when given a valid transaction id', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          account_id: 'account-id',
          timestamp: new Date('2018-03-06T00:00:00'),
          description: 'description',
          amount: 10.53,
          currency: 'currency',
          type: 'type',
          category: 'category',
          merchant_name: 'merchant-name',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const transaction = await Transaction.findById('id');

      expect(queryStub.calledOnce).to.be.true;
      expect(transaction instanceof Transaction).to.be.true;
      expect(transaction.id).to.equal('id');
      expect(transaction.accountId).to.equal('account-id');
      expect(transaction.timestamp.toISOString()).to.equal(new Date('2018-03-06T00:00:00').toISOString());
      expect(transaction.description).to.equal('description');
      expect(transaction.amount).to.equal(10.53);
      expect(transaction.currency).to.equal('currency');
      expect(transaction.type).to.equal('type');
      expect(transaction.category).to.equal('category');
      expect(transaction.merchantName).to.equal('merchant-name');
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let transaction;
      try {
        transaction = await Transaction.findById('id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(transaction instanceof Transaction).to.be.false;
      }
    });

    it('should reject with an error if no id is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          account_id: 'account-id',
          timestamp: new Date('2018-03-06T00:00:00'),
          description: 'description',
          amount: 10.53,
          currency: 'currency',
          type: 'type',
          category: 'category',
          merchant_name: 'merchant-name',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let transaction;
      try {
        transaction = await Transaction.findById();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(transaction instanceof Transaction).to.be.false;
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

      let transaction;
      try {
        transaction = await Transaction.findById('id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(transaction instanceof Transaction).to.be.false;
      }
    });
  });

  describe('findByAccountId()', () => {
    it('should successfully return a list of transactions when given a valid account id', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          account_id: 'account-id',
          timestamp: new Date('2018-03-06T00:00:00'),
          description: 'description',
          amount: 10.53,
          currency: 'currency',
          type: 'type',
          category: 'category',
          merchant_name: 'merchant-name',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const transaction = await Transaction.findByAccountId('account-id');

      expect(queryStub.calledOnce).to.be.true;
      expect(transaction.length).to.equal(1);
      expect(transaction[0] instanceof Transaction).to.be.true;
      expect(transaction[0].id).to.equal('id');
      expect(transaction[0].accountId).to.equal('account-id');
      expect(transaction[0].timestamp.toISOString()).to.equal(new Date('2018-03-06T00:00:00').toISOString());
      expect(transaction[0].description).to.equal('description');
      expect(transaction[0].amount).to.equal(10.53);
      expect(transaction[0].currency).to.equal('currency');
      expect(transaction[0].type).to.equal('type');
      expect(transaction[0].category).to.equal('category');
      expect(transaction[0].merchantName).to.equal('merchant-name');
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let transaction;
      try {
        transaction = await Transaction.findByAccountId('account-id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(Array.isArray(transaction)).to.be.false;
      }
    });

    it('should reject with an error if no id is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 'id',
          account_id: 'account-id',
          timestamp: new Date('2018-03-06T00:00:00'),
          description: 'description',
          amount: 10.53,
          currency: 'currency',
          type: 'type',
          category: 'category',
          merchant_name: 'merchant-name',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let transaction;
      try {
        transaction = await Transaction.findByAccountId();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(Array.isArray(transaction)).to.be.false;
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

      let transaction;
      try {
        transaction = await Transaction.findByAccountId('account-id');
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(Array.isArray(transaction)).to.be.false;
      }
    });
  });
});
