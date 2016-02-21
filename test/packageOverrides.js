process.env.CONFIG3_TEST = 'true'
var config3 = require('../config3')
var expect = require('chaimel')
var path = require('path')

describe('a directory with package.json set with a path', function () {
  it('should load that file as a config', function () {
    var config = config3(path.join(__dirname, 'config_path'))
    expect(config).toHaveProperty('foo', 'Forty-Two')
  })
})

describe('a directory with package.json set with a an array', function () {
  it('should load and extend those files', function () {
    var config = config3(path.join(__dirname, 'config_array'))
    expect(config).toHaveProperty('one', 1.1)
    expect(config).toHaveProperty('two', 'two')
  })
})

describe('a directory with all possible config files', function () {
  it('should merge things with expected precedence', function () {
    var config = config3(path.join(__dirname, 'enchilada'))
    expect(config.fromConfigDefaultJson).toEqual('from config.local.js')
    expect(config.fromConfigDefaultJs).toEqual('from config.local.js')
    expect(config.fromConfigJson).toEqual('from config.local.js')
    expect(config.fromConfigJs).toEqual('from config.local.js')
    expect(config.fromConfigLocalJson).toEqual('from config.local.js')
    expect(config.fromConfigLocalJs).toDeepEqual(['should', 'be', 'used'])
  })
})
