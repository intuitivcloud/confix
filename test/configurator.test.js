'use strict';

var _ = require('lodash'),
    expect = require('chai').expect,
    context = describe,
    configurator;

process.env.PERSON = 'Jon Doe';
process.env.CFG_URL = 'http://localhost:3753';
process.env.TIMEOUT = 4000;

configurator =  require('..');

describe('Configurator', function () {

  context('when not initialized with a base configuration path', function () {
    before(function () {
      configurator.reset();
    });

    it('must throw error if get configuration attempted', function () {
      expect(function () {
        configurator.getConfig('server');
      }).to.throw('Configurator is not initialized');
    });
  });

  context('when initialized with a base configuration path', function () {

    before(function () {
      configurator.init('./test/fixtures');
    });

    it('must throw error if no base names are specified to get configurations', function () {
      expect(function () {
        configurator.getConfig();
      }).to.throw('one or more base names must be specified');
    });

    it('must return a promise to load a config and reject if config does not exist', function (done) {
      configurator.getConfig('foo').then(done, function (err) {
        expect(err.message).to.be.eq('Unable to find any configuration for \'foo\'');
        done();
      });
    });

    it('must return a promise to load a config and resolve it if config found & loaded', function (done) {
      configurator.getConfig('conf2').then(function (config) {
        expect(config.baseName).to.be.eq('conf2');
        expect(config.get('a.b.c')).to.be.eq('Horray!');
        done();
      }, done);
    });

    it('must return a promise to load multiple configs and resolve it if some of them found & loaded', function (done) {
      configurator.getConfig('conf1', 'conf2').then(function (config) {
        expect(config.conf1.baseName).to.be.eq('conf1');
        expect(config.conf2.baseName).to.be.eq('conf2');
        expect(config.conf2.get('a.b.c')).to.be.eq('Horray!');
        done();
      }, done);
    });

    it('must replace all placeholders in string values with environment variables', function (done) {
      var message = 'Hello Jon Doe!',
          url = 'http://localhost:3753';

      configurator.getConfig('conf3').then(function (config) {
        expect(config.get('message')).to.be.eq(message);
        expect(config.get('cfg1').url).to.be.eq(url);
        expect(config.get('cfg1.options.timeout')).to.be.eq('4000');

        done();
      }, done);
    });

    it('must memoize configrations already loaded before returning them to caller');

  });

});