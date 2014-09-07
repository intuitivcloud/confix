'use strict';

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    utils = require('ic-utils'),
    ph = utils.ph;

_.mixin(utils.mixins);

var env = process.env.ENV || 'development',
    machine = process.env.MACHINE,
    configPath, configCache = {};

function Configuration(baseName, config) {
  this.baseName = baseName;
  this.get = function (key) {
    return _.at(config, key);
  };
}

function buildFileList(baseName) {
  var cPath = path.resolve(configPath);
  return [
    path.join(cPath, _.fmt('%s.json', baseName)),
    path.join(cPath, _.fmt('%s.%s.json', baseName, env)),
    path.join(cPath, _.fmt('%s.%s.%s.json', baseName, env, machine))
  ];
}

function getConfigSingle(baseName) {
  if (_.isEmpty(baseName)) throw new Error('base name must be specified');

  var proms = _.map(buildFileList(baseName), function (filePath) {
    return ph.cb2promise(fs.readFile, filePath, 'utf8');
  });

  return ph.makePromise(function (resolve, reject) {
    if (configCache.hasOwnProperty(baseName))
      return resolve(configCache[baseName]);

    ph.allCompleted(proms).then(function (proms) {
      var configData = _(proms).select(ph.isFulfilled).reduce(function (r, p) {
        return _.merge(r, JSON.parse(p.value));
      }, {}), config;

      if (_.isEmpty(configData)) return reject(new Error(
          _.fmt('Unable to find any configuration for \'%s\'', baseName)));

      config = new Configuration(baseName, configData);

      configCache[baseName] = config;

      return resolve(config);
    });
  });
}

exports.init = function (baseConfigPath) {
  configPath = baseConfigPath;
};

exports.reset = function () {
  configPath = null;
  configCache = {};
};

exports.getConfig = function () {
  var baseNames = _.arrgs(arguments);

  if (_.isEmpty(configPath)) throw new Error('Configurator is not initialized');
  if (_.isEmpty(baseNames)) throw new Error('one or more base names must be specified');

  if (baseNames.length === 1) return getConfigSingle(baseNames[0]);

  // return a promise to get all possible configurations
  return ph.makePromise(function (resolve, reject) {

    // try to get all the requested configs
    ph.allCompleted(_.map(baseNames, function (baseName) {
      return getConfigSingle(baseName);
    })).then(function (proms) {

      // select fulfilled promises and create an object
      // with nested configurations
      var result = _(proms).select(ph.isFulfilled).reduce(function (r, p) {
        var cfg = p.value;
        r[cfg.baseName] = cfg;
        return r;
      }, {});

      // if none of the requested configs could be retrieved reject promise
      if (_.isEmpty(result)) return reject(new Error(
          _.fmt('Could not load any of the requested configurations')));

      return resolve(result);
    });
  });
};
