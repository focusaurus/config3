process.env.CONFIG3_TEST = "true";
var assert = require("assert");
var config3 = require("../config3");
var expect = require("chaimel");
var fs = require("fs");
var path = require("path");
var rmrf = require("rmrf");

var TEST_APP_ROOT = path.join(__dirname, "test_app_root");

before(function() {
  rmrf(TEST_APP_ROOT);
  fs.mkdirSync(TEST_APP_ROOT);
});

describe("a directory with no package.json and no config files", function() {
  it("should get an empty object for a config", function() {
    var config = config3(path.join(__dirname, "no_files"));
    expect(config).toBeEmpty();
  });
});

describe("a file that exists but is invalid", function() {
  it("should throw an error", function() {
    var testRoot = path.join(__dirname, "invalid");
    try {
      config3(testRoot);
    } catch (error) {
      expect(error).toExist();
      expect(error).toHaveProperty("path", testRoot + "/config.default");
      return;
    }
    assert.fail("invalid config must throw an error");
  });
});
["config.default.js", "config.js", "config.local.js"].forEach(function(jsPath) {
  describe("a directory with just " + jsPath, function() {
    it("should load that config", function() {
      fs.writeFileSync(
        path.join(TEST_APP_ROOT, jsPath), "exports.foo = 42;\n", "utf8"
      );
      var config = config3(TEST_APP_ROOT);
      expect(config).toHaveProperty("foo", 42);
    });
  });
});

[
  "config.default.json",
  "config.json",
  "config.local.json"
].forEach(function(jsPath) {
  describe("a directory with just " + jsPath, function() {
    it("should load that config", function() {
      fs.writeFileSync(
        path.join(TEST_APP_ROOT, jsPath), JSON.stringify({
          foo: 42
        }), "utf8"
      );
      var config = config3(TEST_APP_ROOT);
      expect(config).toHaveProperty("foo", 42);
    });
  });
});

after(function() {
  rmrf(TEST_APP_ROOT);
});
