#!/usr/bin/env node
const configExtend = require("config-extend");
const debug = require("debug")("config3");
const path = require("path");
const VError = require("verror");

function load(appRoot, configPathArg) {
  const configPath = path.resolve(appRoot, configPathArg);
  const quotedPath = `'${configPath}'`;
  try {
    debug(`Loading ${quotedPath}`);
    // eslint-disable-next-line import/no-dynamic-require
    const config = require(configPath);
    debug(`Loaded ${quotedPath}`);
    return config;
  } catch (error) {
    debug(`Did not load ${quotedPath}`);
    if (error.name === "SyntaxError") {
      const verror = new VError(error, `Invalid config file: ${quotedPath}`);
      verror.path = configPath;
      throw verror;
    }
    return null;
  }
}

function main(appRootArg) {
  const appRoot = appRootArg || path.resolve(path.join(__dirname, "../.."));
  debug(`appRoot is '${appRoot}'`);
  const loadRoot = load.bind(null, appRoot);
  const packageJson = loadRoot("package.json") || {};

  function loadPaths(paths) {
    const configs = paths.map(loadRoot);
    return configExtend(...configs);
  }

  // If your package.json has "config3Paths": ["./myConfig"]
  // then we load only the files listed there
  if (Array.isArray(packageJson.config3Paths)) {
    return loadPaths(packageJson.config3Paths);
  }

  // If your package.json has "config3Paths": "./myConfig"
  // then we just load that single path
  if (typeof packageJson.config3Paths === "string") {
    return loadRoot(packageJson.config3Paths);
  }

  // Default and recommended fallback paths for fans of simplicity
  // read config.default, config, config.local, /etc/packagename/config
  const defaultPaths = ["config.default", "config", "config.local"];
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

const cliPath = process.argv[2];
if (require.main === module && cliPath) {
  const pathval = require("pathval");
  const value = pathval.get(module.exports, cliPath);
  if (typeof value !== "undefined") {
    // eslint-disable-next-line no-console
    console.log(value);
  }
}
