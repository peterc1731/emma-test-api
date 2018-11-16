const { expect, use } = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const {
  describe, it, before, after,
} = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const TransactionClassification = require('./TransactionClassification');
const db = require('../utils/db');

use(sinonChai);
use(chaiAsPromised);

let connectionStub;

describe('The transaction classification model', () => {
  before(() => {
    connectionStub = sinon.stub(db, 'connection');
  });

  after(() => {
    connectionStub.restore();
  });

  describe('constructor()', () => {
    it('should create a new transaction classification instance when passed a transaction id and classification', () => {
      const classification = new TransactionClassification(
        'transaction-id',
        'classification',
      );
      expect(classification.id).to.be.null;
      expect(classification.transactionId).to.equal('transaction-id');
      expect(classification.classification).to.equal('classification');
    });
  });

  describe('create()', () => {
    it('should insert a transaction classification into the DB', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, {
          insertId: 1,
        });
      });
      connectionStub.returns({
        query: queryStub,
      });

      const classification = new TransactionClassification('transaction-id', 'classification');
      await classification.create();

      expect(queryStub.calledOnce).to.be.true;
      expect(classification.id).to.equal(1);
    });

    it('should reject with an error when the DB query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let classification;
      try {
        classification = new TransactionClassification('transaction-id', 'classification');
        await classification.create();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
      }
    });
  });

  describe('toObject()', () => {
    it('should return any available classification properties as an object', () => {
      const classification = new TransactionClassification('transaction-id', 'classification');
      const obj = classification.toObject();

      expect(obj.id).to.be.null;
      expect(obj.transactionId).to.equal('transaction-id');
      expect(obj.classification).to.equal('classification');
    });
  });

  describe('createTable()', () => {
    it('should successfully create the transaction classifications table in the db', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, cb) => {
        cb(null, { success: true });
      });
      connectionStub.returns({
        query: queryStub,
      });

      const results = await TransactionClassification.createTable();

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
        await TransactionClassification.createTable();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
      }
    });
  });

  describe('findById()', () => {
    it('should successfully return a classification when given a valid classification id', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 1,
          transaction_id: 'transaction-id',
          classification: 'classification',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const classification = await TransactionClassification.findById(1);

      expect(queryStub.calledOnce).to.be.true;
      expect(classification instanceof TransactionClassification).to.be.true;
      expect(classification.id).to.equal(1);
      expect(classification.transactionId).to.equal('transaction-id');
      expect(classification.classification).to.equal('classification');
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let classification;
      try {
        classification = await TransactionClassification.findById(1);
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(classification instanceof TransactionClassification).to.be.false;
      }
    });

    it('should reject with an error if no id is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 1,
          transaction_id: 'transaction-id',
          classification: 'classification',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let classification;
      try {
        classification = await TransactionClassification.findById();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(classification instanceof TransactionClassification).to.be.false;
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

      let classification;
      try {
        classification = await TransactionClassification.findById(1);
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(classification instanceof TransactionClassification).to.be.false;
      }
    });
  });

  describe('findByTransactionId()', () => {
    it('should successfully return a list of classifications when given a valid transaction id', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 1,
          transaction_id: 'transaction-id',
          classification: 'classification',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      const classification = await TransactionClassification.findByTransactionId(1);

      expect(queryStub.calledOnce).to.be.true;
      expect(classification.length).to.equal(1);
      expect(classification[0] instanceof TransactionClassification).to.be.true;
      expect(classification[0].id).to.equal(1);
      expect(classification[0].transactionId).to.equal('transaction-id');
      expect(classification[0].classification).to.equal('classification');
    });

    it('should reject with an error if the query fails', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(new Error('query failed'), null);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let classification;
      try {
        classification = await TransactionClassification.findByTransactionId(1);
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(Array.isArray(classification)).to.be.false;
      }
    });

    it('should reject with an error if no id is provided', async () => {
      const queryStub = sinon.stub();
      queryStub.callsFake((query, values, cb) => {
        cb(null, [{
          id: 1,
          transaction_id: 'transaction-id',
          classification: 'classification',
        }]);
      });
      connectionStub.returns({
        query: queryStub,
      });

      let classification;
      try {
        classification = await TransactionClassification.findByTransactionId();
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.false;
        expect(Array.isArray(classification)).to.be.false;
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

      let classification;
      try {
        classification = await TransactionClassification.findByTransactionId(1);
        expect.fail();
      } catch (e) {
        expect(e).to.not.be.undefined;
        expect(queryStub.calledOnce).to.be.true;
        expect(Array.isArray(classification)).to.be.false;
      }
    });
  });
});
