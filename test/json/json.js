'use strict';

/* eslint-disable no-await-in-loop */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {
  pass, fail, skip, total,
} = require('../base');
const {
  Agent,
  Realm,
  AbruptCompletion,
  inspect,
} = require('../../');

const BASE_DIR = path.resolve(__dirname, 'JSONTestSuite');

const agent = new Agent();
agent.enter();

function test(filename) {
  const realm = new Realm();

  const source = fs.readFileSync(filename, 'utf8');

  let result;
  try {
    result = realm.evaluateScript(`
      JSON.parse(${JSON.stringify(source)});
    `);
  } catch {
    // ...
  }

  const testName = path.basename(filename);

  if (!result || result instanceof AbruptCompletion) {
    if (testName.startsWith('n_')) {
      pass();
    } else if (testName.startsWith('i_')) {
      skip();
    } else {
      fail(testName, inspect(realm, result));
    }
  } else {
    if (testName.startsWith('n_')) {
      fail(testName, 'JSON parsed but should have failed!');
    } else {
      pass();
    }
  }
}

const tests = glob.sync(`${path.resolve(BASE_DIR, 'test_parsing')}/**/*.json`)
  .concat(glob.sync(`${path.resolve(BASE_DIR, 'test_transform')}/**/*.json`));

tests.forEach((t) => {
  total();
  test(t);
});
