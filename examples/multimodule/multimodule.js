'use strict';

var confix = require('../..');

confix.init('./config');

confix.getConfig('module-a', 'module-b', function (err, cfg) {
  if (err) return console.error('Error reading config', err);
  console.dir(cfg);
});
