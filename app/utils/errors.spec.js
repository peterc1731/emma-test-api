const { expect, use } = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const {
  describe, it, beforeEach, afterEach,
} = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const errors = require('./errors');

use(sinonChai);
use(chaiAsPromised);

describe('The errors utility', () => {
  describe('handleErrors()', () => {
    const res = {
      status: sinon.stub(),
    };
    const jsonStub = sinon.stub();
    const nextStub = sinon.stub();

    beforeEach(() => {
      res.status.returns({ json: jsonStub });
    });

    afterEach(() => {
      res.status.reset();
      jsonStub.reset();
      nextStub.reset();
    });

    it('should return a 400 when getting a ValidationError', () => {
      const err = new Error('email missing');
      err.name = 'ValidationError';
      errors.handleErrors(err, null, res);

      const argument = jsonStub.getCall(0).args[0];
      expect(res.status.calledWith(400)).to.be.true;
      expect(argument.error).to.equal('email missing');
    });

    it('should return a 500 when getting an error object', () => {
      errors.handleErrors({ message: 'there was an error' }, null, res, nextStub);
      expect(res.status.calledWith(500)).to.be.true;
      expect(nextStub.calledOnce).to.be.true;
    });

    it('should return a 422 when getting a UserExistsError', () => {
      const err = new Error();
      err.name = 'UserExistsError';
      errors.handleErrors(err, null, res);

      const argument = jsonStub.getCall(0).args[0];
      expect(argument.errors.email.message).to.equal('Email already in use');
      expect(res.status.calledWith(422)).to.be.true;
    });

    it('should return a 400 when getting a MissingUsernameError', () => {
      const err = new Error();
      err.name = 'MissingUsernameError';
      errors.handleErrors(err, null, res);
      const argument = jsonStub.getCall(0).args[0];
      expect(argument.errors.email.message).to.equal('Email is required');
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should return a 400 when getting a MissingPasswordError', () => {
      const err = new Error();
      err.name = 'MissingPasswordError';
      errors.handleErrors(err, null, res);
      const argument = jsonStub.getCall(0).args[0];
      expect(argument.errors.password.message).to.equal('Password is required');
      expect(res.status.calledWith(400)).to.be.true;
    });

    it('should return a 422 when getting an unknown error', () => {
      errors.handleErrors(new Error('test message'), null, res);
      const argument = jsonStub.getCall(0).args[0];
      expect(argument.error).to.equal('test message');
      expect(res.status.calledWith(422)).to.be.true;
    });

    it('should return a 500 when getting a TruelayerAPIError', () => {
      const err = new Error('test message');
      err.name = 'TruelayerAPIError';
      errors.handleErrors(err, null, res);
      const argument = jsonStub.getCall(0).args[0];
      expect(argument.error.message).to.equal('test message');
      expect(res.status.calledWith(500)).to.be.true;
    });
  });
});
