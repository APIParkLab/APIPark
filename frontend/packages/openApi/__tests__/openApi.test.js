'use strict';

const openApi = require('..');
const assert = require('assert').strict;

assert.strictEqual(openApi(), 'Hello from openApi');
console.info('openApi tests passed');
