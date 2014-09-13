'use strict';

var expect = require('chai').expect,
    context = describe,
    configurator;

process.env.PERSON = 'Jon Doe';
process.env.CFG_URL = 'http://localhost:3753';
process.env.TIMEOUT = 4000;

configurator =  require('..');

describe('Configurator', function () {
  /* jshint expr: true */

  context('when not initialized with a base configuration path', function () {
    before(function () {
      configurator.reset();
    });

    it('must throw error if get configuration attempted without callback', function () {
      expect(function () {
        configurator.getConfig('server');
      }).to.throw('Must invoke with a callback');
    });

    it('must throw error if get configuration attempted with callback', function () {
      expect(function () {
        configurator.getConfig('server', function () {});
      }).to.throw('Configurator is not initialized');
    });
  });

  context('when initialized with a base configuration path', function () {

    before(function () {
      configurator.init('./test/fixtures');
    });

    it('must throw error if no base names are specified to get configurations', function () {
      expect(function () {
        configurator.getConfig(function () {});
      }).to.throw('one or more base names must be specified');
    });

    it('must invoke callback with an error if config does not exist', function (done) {
      configurator.getConfig('foo', function (err) {
        expect(err.message).to.be.eq('Unable to find any configuration for \'foo\'');
        done();
      });
    });

    it('must invoke callback with an error if one or more config do not exist', function (done) {
      configurator.getConfig('conf1', 'bar', function (err) {
        expect(err.message).to.be.eq('Unable to find any configuration for \'bar\'');
        done();
      });
    });

    it('must invoke callback with an error if one or more configs are malformed', function (done) {
      configurator.getConfig('conf1', 'conf4', function (err) {
        expect(err.message).to.be.eq('Malformed configuration file "conf4.json": Unexpected token }');
        done();
      });
    });

    it('must invoke callback with the config if found & loaded', function (done) {
      configurator.getConfig('conf2', function (err, config) {
        expect(err).to.be.null;

        expect(config.conf2.baseName).to.be.eq('conf2');
        expect(config.conf2.get('a.b.c')).to.be.eq('Horray!');

        done();
      });
    });

    it('must invoke callback with multiple configs if they are found & loaded', function (done) {
      configurator.getConfig('conf1', 'conf2', function (err, config) {
        expect(err).to.be.null;

        expect(config.conf1.baseName).to.be.eq('conf1');
        expect(config.conf2.baseName).to.be.eq('conf2');
        expect(config.conf2.get('a.b.c')).to.be.eq('Horray!');

        done();
      });
    });

    it('must replace all placeholders in string values with environment variables', function (done) {
      var message = 'Hello Jon Doe!',
          url = 'http://localhost:3753';

      configurator.getConfig('conf3', function (err, config) {
        expect(err).to.be.null;

        expect(config.conf3.get('message')).to.be.eq(message);
        expect(config.conf3.get('cfg1').url).to.be.eq(url);
        expect(config.conf3.get('cfg1.options.timeout')).to.be.eq('4000');

        done();
      });
    });

  });

});
