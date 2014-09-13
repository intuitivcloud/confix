'use strict';

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    async = require('async'),
    utils = require('ic-utils');

_.mixin(utils.mixins);

// we'll only support delimiters with format {<placeholder>}
_.templateSettings.interpolate = /{([\s\S]+?)}/g;

var env = process.env.ENV || 'development',
    machine = process.env.MACHINE,
    envObj = _.merge({}, process.env, {
      ENV: env
    }),
    configPath, configCache = {};

function processValue(v) {
  if (_.isString(v))
    v = _.template(v, envObj);
  return v;
}

function transform(obj) {
  _.each(obj, function (value, key) {
    if (_.isArray(value))
      obj[key] = _.map(value, processValue);
    else if (_.isObject(value))
      obj[key] = transform(value);
    else if (_.isFunction(value))
      return;
    else
      obj[key] = processValue(value);
  });

  return obj;
}

function Configuration(baseName, config) {
  this.baseName = baseName;
  config = transform(config);

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

function getConfigSingle(baseName, callback) {
  if (_.isEmpty(baseName)) throw new Error('base name must be specified');
  if (configCache.hasOwnProperty(baseName))
    return callback(null, configCache[baseName]);

  async.map(buildFileList(baseName), function (filePath, cb) {
    fs.readFile(filePath, 'utf8', function (err, data) {
      // if we have a read error, we ignore and return empty object
      if (err) return cb(null, {});
      cb(null, JSON.parse(data));
    });
  }, function (err, results) {
    var configData, config;

    if (_.isEmpty(results))
      return callback(new Error(_.fmt(
          'Unable to find any configuration for \'%s\'', baseName)));

    results.unshift({});
    configData = _.merge.apply(_, results);

    if (_.isEmpty(configData))
      return callback(new Error(_.fmt(
          'Unable to find any configuration for \'%s\'', baseName)));

    config = new Configuration(baseName, configData);
    configCache[baseName] = config;

    callback(null, config);
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
  var baseNames = _.arrgs(arguments),
      callback = _.isFunction(_.last(baseNames)) ? baseNames.pop() : null;

  if (!callback) throw new Error('Must invoke with a callback');
  if (_.isEmpty(configPath)) throw new Error('Configurator is not initialized');
  if (_.isEmpty(baseNames)) throw new Error('one or more base names must be specified');

  if (baseNames.length === 1) return getConfigSingle(baseNames[0], callback);

  async.map(baseNames, getConfigSingle, function (err, results) {
    if (err) return callback(err);
    callback(null, _.reduce(results, function (r, cfg) {
      r[cfg.baseName] = cfg;
      return r;
    }, {}));
  });
};
