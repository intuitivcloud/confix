'use strict';

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    putty = require('putty');

_.mixin(putty.mixins);

// we'll only support delimiters with format {<placeholder>}
_.templateSettings.interpolate = /{([\s\S]+?)}/g;

var env = process.env.NODE_ENV || 'development',
    machine = process.env.MACHINE,
    envObj = _.merge({}, process.env, {
      NODE_ENV: env
    }),
    configPath, configCache = {};

function processValue(v) {
  if (_.isString(v))
    v = _.template(v)(envObj);
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

  // all config properties are available as members
  _.merge(this, transform(config));
}

Configuration.prototype.at = function (key) {
  return _.at(this, key);
};

function buildFileList(baseName) {
  var cPath = path.resolve(configPath);
  return [
    path.join(cPath, _.fmt('%s.json', baseName)),
    path.join(cPath, _.fmt('%s.%s.json', baseName, env)),
    path.join(cPath, _.fmt('%s.%s.%s.json', baseName, env, machine))
  ];
}

exports.init = function (baseConfigPath) {
  configPath = baseConfigPath;
};

exports.reset = function () {
  configPath = null;
  configCache = {};
};

function getConfigSingle(baseName) {
  var configs, configData;

  if (configCache[baseName])
    return configCache[baseName];

  configs = _.map(buildFileList(baseName), function (filePath) {
      var fileData;
      try {
        fileData = fs.readFileSync(filePath, 'utf8');
      } catch (ex) {
        return {};
      }

      try {
        return JSON.parse(fileData);
      } catch (e) {
        throw new Error(_.fmt('Malformed configuration file "%s":',
              path.basename(filePath), e.message));
      }
    });

  configs.unshift({});
  configData = _.merge.apply(_, configs);

  if (_.isEmpty(configData))
    throw new Error(_.fmt(
      'Unable to find any configuration for \'%s\'', baseName));

  return (configCache[baseName] = new Configuration(baseName, configData));
}

exports.getConfig = function () {
  var baseNames = _.arrgs(arguments);

  if (_.isEmpty(configPath)) throw new Error('Configurator is not initialized');
  if (_.isEmpty(baseNames)) throw new Error('one or more base names must be specified');

  return _.chain(baseNames)
    .map(getConfigSingle)
    .reduce(function (r, cfg) {
      if (baseNames.length === 1)
        return cfg;
      r[cfg.baseName] = cfg;
      return r;
    }, {})
    .value();
};

