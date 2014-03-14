var path = require("path");
var debug = require("debug")("config3");
var configExtend = require("config-extend");

function load(appRoot, configPath) {
  configPath = path.resolve(appRoot, configPath);
  var quotedPath = "'" + configPath + "'";
  try {
    debug("Loading " + quotedPath);
    var config = require(configPath);
    debug("Loaded " + quotedPath);
    return config;
  } catch (exception) {
    debug("Did not load " + quotedPath);
  }
}

function main(appRoot) {
  appRoot = appRoot || path.resolve(path.join(__dirname, "..", ".."));
  debug("appRoot is '" + appRoot + "'");
  var _load = load.bind(null, appRoot);
  var packageJson = _load("package.json") || {};

  function loadPaths(paths) {
    var configs = paths.map(_load);
    return configExtend.apply(null, configs);
  }

  //If your package.json has "config3Paths": ["./myConfig"]
  //then we load only the files listed there
  if (Array.isArray(packageJson.config3Paths)) {
    return loadPaths(packageJson.config3Paths);
  }

  //If your package.json has "config3Paths": "./myConfig"
  //then we just load that single path
  if (typeof packageJson.config3Paths === "string") {
    return _load(packageJson.config3Paths);
  }

  //Default and recommended fallback paths for sane people
  //read config.default, config, config.local, /etc/packagename/config
  var defaultPaths = [
    "config.default",
    "config",
    "config.local"
  ];
  if (typeof packageJson.name === "string") {
    defaultPaths.push(path.join("/etc", packageJson.name, "config"));
  }
  return loadPaths(defaultPaths);
}

if (process.env.CONFIG3_TEST) {
  module.exports = main;
} else {
  module.exports = main();
}
