#!/usr/bin/env node
var configExtend = require('config-extend')
var debug = require('debug')('config3')
var path = require('path')
var VError = require('verror')

function load (appRoot, configPath) {
  configPath = path.resolve(appRoot, configPath)
  var quotedPath = "'" + configPath + "'"
  try {
    debug('Loading ' + quotedPath)
    var config = require(configPath)
    debug('Loaded ' + quotedPath)
    return config
  } catch (error) {
    debug('Did not load ' + quotedPath)
    if (error.name === 'SyntaxError') {
      var verror = new VError(error, 'Invalid config file: ' + quotedPath)
      verror.path = configPath
      throw verror
    }
  }
}

function main (appRoot) {
  appRoot = appRoot || path.resolve(path.join(__dirname, '../..'))
  debug("appRoot is '" + appRoot + "'")
  var loadRoot = load.bind(null, appRoot)
  var packageJson = loadRoot('package.json') || {}

  function loadPaths (paths) {
    var configs = paths.map(loadRoot)
    return configExtend.apply(null, configs)
  }

  // If your package.json has "config3Paths": ["./myConfig"]
  // then we load only the files listed there
  if (Array.isArray(packageJson.config3Paths)) {
    return loadPaths(packageJson.config3Paths)
  }

  // If your package.json has "config3Paths": "./myConfig"
  // then we just load that single path
  if (typeof packageJson.config3Paths === 'string') {
    return loadRoot(packageJson.config3Paths)
  }

  // Default and recommended fallback paths for sane people
  // read config.default, config, config.local, /etc/packagename/config
  var defaultPaths = [
    'config.default',
    'config',
    'config.local'
  ]
  if (typeof packageJson.name === 'string') {
    defaultPaths.push(path.join('/etc', packageJson.name, 'config'))
  }
  return loadPaths(defaultPaths)
}

if (process.env.CONFIG3_TEST) {
  module.exports = main
} else {
  module.exports = main()
}

var cliPath = process.argv[2]
if (require.main === module && cliPath) {
  var pathval = require('pathval')
  var value = pathval.get(module.exports, cliPath)
  if (typeof value !== 'undefined') {
    console.log(value)
  }
}
