process.env.CONFIG3_TEST = "true";
var config3 = require("../config3");
var expect = require("chai").expect;
var path = require("path");

describe("a directory with package.json set with a path", function () {
  it("should load that file as a config", function() {
    var config = config3(path.join(__dirname, "config_path"));
    expect(config).to.have.property("foo", "Forty-Two");
  });
});

describe("a directory with package.json set with a an array", function () {
  it("should load and extend those files", function() {
    var config = config3(path.join(__dirname, "config_array"));
    expect(config).to.have.property("one", 1.1);
    expect(config).to.have.property("two", "two");
  });
});

describe("a directory with all possible config files", function () {
  it("should merge things with expected precedence", function() {
    var config = config3(path.join(__dirname, "enchilada"));
    expect(config.fromConfigDefaultJson).to.equal("from config.local.js");
    expect(config.fromConfigDefaultJs).to.equal("from config.local.js");
    expect(config.fromConfigJson).to.equal("from config.local.js");
    expect(config.fromConfigJs).to.equal("from config.local.js");
    expect(config.fromConfigLocalJson).to.equal("from config.local.js");
    expect(config.fromConfigLocalJs).to.deep.equal(["should", "be", "used"]);
  });
});
