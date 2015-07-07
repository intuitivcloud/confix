'use strict';

var confix = require('../..');

var cfg;

confix.init('./config');

cfg = confix.getConfig('module-a', 'module-b');

console.dir(cfg);

