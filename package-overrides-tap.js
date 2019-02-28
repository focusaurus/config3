process.env.CONFIG3_TEST = "true";
const path = require("path");
const tap = require("tap");
const config3 = require("./");

tap.test("a directory with package.json set with a path", test => {
  const config = config3(path.join(__dirname, "test", "config_path"));
  test.match(config, { foo: "Forty-Two" });
  test.end();
});

tap.test("a directory with package.json set with a an array", test => {
  const config = config3(path.join(__dirname, "test", "config_array"));
  test.match(config, { one: 1.1, two: "two" });
  test.end();
});

tap.test("a directory with all possible config files", test => {
  const config = config3(path.join(__dirname, "test", "enchilada"));
  test.same(config.fromConfigDefaultJson, "from config.local.js");
  test.same(config.fromConfigDefaultJs, "from config.local.js");
  test.same(config.fromConfigJson, "from config.local.js");
  test.same(config.fromConfigJs, "from config.local.js");
  test.same(config.fromConfigLocalJson, "from config.local.js");
  test.match(config.fromConfigLocalJs, ["should", "be", "used"]);
  test.end();
});
