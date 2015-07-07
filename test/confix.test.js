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

    it('must throw error if get configuration attempted with callback', function () {
      expect(function () {
        configurator.getConfig('server', function () {});
      }).to.throw('Configurator is not initialized');
    });

    it('must throw error if get configuration sync attempted', function () {
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

    it('must invoke callback with an error if config does not exist', function () {
      expect(function () {
        configurator.getConfig('foo');
      }).to.throw('Unable to find any configuration for \'foo\'')
    });

    it('must invoke callback with an error if one or more config do not exist', function () {
      expect(function () {
        configurator.getConfig('conf1', 'bar');
      }).to.throw('Unable to find any configuration for \'bar\'');
    });

    it('must invoke callback with an error if one or more configs are malformed', function () {
      expect(function () {
        configurator.getConfig('conf1', 'conf4');
      }).to.throw('Malformed configuration file "conf4.json": Unexpected token }');
    });

    it('must invoke callback with the config if found & loaded', function () {
      var config = configurator.getConfig('conf2');

      expect(config.conf2.baseName).to.be.eq('conf2');
      expect(config.conf2.at('a.b.c')).to.be.eq('Horray!');
    });

    it('must invoke callback with multiple configs if they are found & loaded', function () {
      var config = configurator.getConfig('conf1', 'conf2');

      expect(config.conf1.baseName).to.be.eq('conf1');
      expect(config.conf2.baseName).to.be.eq('conf2');
      expect(config.conf2.at('a.b.c')).to.be.eq('Horray!');
    });

    it('must replace all placeholders in string values with environment variables', function () {
      var message = 'Hello Jon Doe!',
          url = 'http://localhost:3753',
          config = configurator.getConfig('conf3');

      expect(config.conf3.message).to.be.eq(message);
      expect(config.conf3.cfg1.url).to.be.eq(url);
      expect(config.conf3.at('cfg1.options.timeout')).to.be.eq('4000');
    });

  });
});
