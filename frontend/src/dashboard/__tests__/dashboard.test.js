'use strict';

const dashboard = require('..');
const assert = require('assert').strict;

assert.strictEqual(dashboard(), 'Hello from dashboard');
console.info('dashboard tests passed');
