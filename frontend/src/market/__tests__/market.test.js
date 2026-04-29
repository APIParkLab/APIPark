'use strict';

const market = require('..');
const assert = require('assert').strict;

assert.strictEqual(market(), 'Hello from market');
console.info('market tests passed');
