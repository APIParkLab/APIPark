'use strict';

const businessEntry = require('..');
const assert = require('assert').strict;

assert.strictEqual(businessEntry(), 'Hello from businessEntry');
console.info('businessEntry tests passed');
