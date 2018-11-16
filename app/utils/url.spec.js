const { expect, use } = require('chai');
const { describe, it } = require('mocha');
const chaiAsPromised = require('chai-as-promised');
const { buildUrl } = require('./url');

use(chaiAsPromised);

describe('The url utility', () => {
  describe('buildUrl()', () => {
    it('should build a valid url when given an object of params and a domain', () => {
      const domain = 'http://test.com/test';
      const params = {
        first_param: 'first_val',
        second_param: 'second_val',
      };

      const url = buildUrl(domain, params);

      expect(url).to.be.a('string');
      expect(url).to.equal('http://test.com/test?first_param=first_val&second_param=second_val');
    });

    it('should escape special characters when they are included in any param keys', () => {
      const domain = 'http://test.com/test';
      const params = {
        'first&param': 'first_val',
        'second/param': 'second_val',
      };

      const url = buildUrl(domain, params);

      expect(url).to.be.a('string');
      expect(url).to.equal('http://test.com/test?first%26param=first_val&second%2Fparam=second_val');
    });

    it('should escape special characters when they are included in any param values', () => {
      const domain = 'http://test.com/test';
      const params = {
        first_param: 'first&val',
        second_param: 'second/val',
      };

      const url = buildUrl(domain, params);

      expect(url).to.be.a('string');
      expect(url).to.equal('http://test.com/test?first_param=first%26val&second_param=second%2Fval');
    });

    it('should convert any array param values to a space separated string', () => {
      const domain = 'http://test.com/test';
      const params = {
        first_param: 'first_val',
        second_param: 'second_val',
        array_param: ['first', 'second', 'third'],
      };

      const url = buildUrl(domain, params);

      expect(url).to.be.a('string');
      expect(url).to.equal('http://test.com/test?first_param=first_val&second_param=second_val&array_param=first%20second%20third');
    });
  });
});
