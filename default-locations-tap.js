"use strict";
process.env.CONFIG3_TEST = "true";
const fs = require("fs");
const path = require("path");
const rmrf = require("rmrf");
const tap = require("tap");
const config3 = require("./");
/* eslint-disable no-sync */
const TEST_APP_ROOT = path.join(__dirname, "test", "test_app_root");
tap.beforeEach(done => {
  rmrf(TEST_APP_ROOT);
  fs.mkdirSync(TEST_APP_ROOT);
  done();
});

tap.afterEach(done => {
  rmrf(TEST_APP_ROOT);
  done();
});

tap.test("a directory with no package.json and no config files", test => {
  const config = config3(path.join(__dirname, "test", "no_files"));
  test.same(Object.keys(config).length, 0);
  test.end();
});

tap.test("a file that exists but is invalid", test => {
  const testRoot = path.join(__dirname, "test", "invalid");
  try {
    config3(testRoot);
    test.fail("invalid config must throw an error");
  } catch (error) {
    tap.ok(error);
    tap.match(error, { path: `${testRoot}/config.default` });
  }
  test.end();
});

["config.default.js", "config.js", "config.local.js"].forEach(jsPath => {
  tap.test(`a directory with just ${jsPath}`, test => {
    fs.writeFileSync(
      path.join(TEST_APP_ROOT, jsPath),
      "exports.foo = 42;\n",
      "utf8"
    );
    const config = config3(TEST_APP_ROOT);
    tap.match(config, { foo: 42 });
    test.end();
  });
});

["config.default.json", "config.json", "config.local.json"].forEach(jsPath => {
  tap.test(`a directory with just ${  jsPath}`, test => {
    fs.writeFileSync(
      path.join(TEST_APP_ROOT, jsPath),
      JSON.stringify({
        foo: 42
      }),
      "utf8"
    );
    const config = config3(TEST_APP_ROOT);
    test.match(config, { foo: 42 });
    test.end();
  });
});
