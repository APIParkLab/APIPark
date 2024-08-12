'use strict';

const systemRunning = require('..');
const assert = require('assert').strict;

assert.strictEqual(systemRunning(), 'Hello from systemRunning');
console.info('systemRunning tests passed');
