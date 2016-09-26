# config3 - Get Your Settings, Minus Insanity

## How to Use It

- Define your default configuration in `<app_root>/config.default.js`
  - This should be a CommonJS module that exports an object which is your application's config values.
  - These should be sensible defaults for local development.
  - You may also use `config.default.json`, which should be a JSON file.
  - You may also use `config.js` or `config.json`
- If necessary, define local or developer-specific overrides in `<app_root>/config.local.js`
  - These will take precedence over the defaults
  - Configurations are merged, so you only need to specify the particular values you want to override, not an entirely new configuration.
  - `config.local.json` or `config.local.js` will both work
  - Include these file paths in your `.gitignore` as these are by definition specific to a particular developer or environment and should not be tracked in source control.
- For deployment, put your configuration overrides in `/etc/<package_name>/config.js`
  - `<package_name>` is your npm package name from your project's `package.json` file
  - `/etc/<package_name>/config.json` will also work
  - Don't store these in git. This is where your secrets like API keys, database credentials, etc go
- In any code that needs configuration, just load it
  - `var config = require("config3");`
  - Your settings will be there.
  -  Things get merged and overridden as you would expect. Arrays get replaced. The [config-extend](https://www.npmjs.org/package/config-extend) module handles this logic for us.
- config files are loaded with regular old `require` which looks for `.js` first and falls back to `.json` otherwise.
  - Thus the full resolution order, first to last, with last entry winning is:
  - `config.default.js` OR `config.default.json` (NOT both)
  - `config.js` OR `config.json` (NOT both)
  - `config.local.js` OR `config.local.json` (NOT both)
  - `/etc/<package_name>/config.js` OR `/etc/<package_name>/config.json` (NOT both)

## Example

**<app_root>/config.json**

    {"port": 3000, "dbUrl": "mongodb://localhost/myapp", "fbAppId": "12345"}

**<app_root>/config.local.json**

    {"port": 4500}

**/etc/myapp/config.json**

    {"dbUrl": "mongodb://192.168.1.17/myapp-production", "fbAppId": "REAL_FB_APP_ID"}

## Getting values with the CLI

This module comes with a command line program also called `config3` that takes a property path as the only argument and prints out the corresponding value from your application's configuration. This supports property path notation al la `db.connection.poolSize` via the `pathval` npm package.

This comes in handy for automating stuff during builds and deployments.

## CLI Example

`./node_modules/.bin/config3 'emails.admins[0]'`

Prints out "one@example.com" given a config of `{emails: {admins: ["one@example.com"]}}`


#Motivation and Philosophy

There are many similar modules already written and published to the npm registry. Why yet another? I find problems with most of the existing ones as follows:

- poisoned by the Ruby on Rails notion of `RAILS_ENV=production` (NODE_ENV for us)
  - This whole system is flawed and an antipattern
  - The primary way this screws you is as follows:
    - some module you depend on alters its behavior based on `NODE_ENV`. Typically this might be something like enabling a cache in `production` but disabling it otherwise.
    - Case in point: [express.js will cache views in production only](https://github.com/visionmedia/express/blob/0719e5f402ff4b8129f19fe3d0704b31733f1190/lib/application.js#L76)
    - So you set `NODE_ENV=staging` on your staging system and use one of the npm config packages that loads a `staging.yaml` file. Now your staging server is way out of alignment with production.
  - So I think this entire notion is fundamentally the wrong way to think about configuration code that looks at `NODE_ENV` should be removed in favor of explicit options. Packages in npm should assume production-type configuration by default and should allow appropriate changes for development when passed explicit granular options to do development things like enabling source maps, disabling caches, printing debug output, etc.
- Uses YAML configuration files.
  - YAML is just goofy and rubyish and we shouldn't be bringing it along into the node.js ecosystem. It's been involved in many of ruby's security issues. Just keep your configuration simple. If you need 30 key/value pairs or complicated data structures, paragraphs of comments and logic in your configuration, you are probably building a monolithic monster app that should be split into smaller services.
- But what about [12 Factor Apps](http://12factor.net/)?
  - While mostly I think the 12 factors are quite correct and excellent, when it comes to environment variables, I disagree. Flat files on the filesystem are better as per my blog post [Environment Variables Considered Harmful](http://peterlyons.com/problog/2010/02/environment-variables-considered-harmful)
- You should have to read 2 or at most 3 files to figure out which values your running application has loaded, which is why I called this module `config3`

## Debugging

config3 uses the [debug](https://github.com/visionmedia/debug) package by TJ Holowaychuk. Normally, no debug information is output. To have debug statements written to stdout, set the DEBUG environment variable to `config3` or a colon-delimited string containing config3 like `express:config3:socket.io`.

`DEBUG=config3 node myapp.js`


## Notes on Existing Modules
- [config](https://www.npmjs.org/package/config): NODE_ENV, yaml
- [global-config](https://www.npmjs.org/package/global-config): name says it all. Creates global variables. Fail.
- [config-env](https://www.npmjs.org/package/config-env) Do we really need a JS API to define some key/value pairs?
- [env-config](https://www.npmjs.org/package/env-config) Not a bad choice if you like the 12-Factor environment variable thing, but I personally do not. Also, written in CoffeeScript.
- [json-config](https://www.npmjs.org/package/json-config) No way to have defaults and overrides. Author doesn't know `require` can load JSON files directly. Throws exceptions.
- [yaml-config](https://www.npmjs.org/package/yaml-config) YAML. NODE_ENV.
- [feather-config](https://www.npmjs.org/package/feather-config) If you think how your config gets built should be a supremely flexible puzzle that you can solve at 2am when production is down, this one actually looks pretty solid to me. If  I move away from config3, feather-config would probably be my next choice. It's more complicated than we really want/need so I'd rather have a small number of specific, unchangeable file paths to look at not have configuration values possibly come from as many different places as possible.
- [mods-config](https://www.npmjs.org/package/mods-config) No docs. Uses `process.cwd()`.
- [dh-config](https://www.npmjs.org/package/dh-config) `NODE_ENV`
- [lib-config](https://www.npmjs.org/package/lib-config) This is just a library, not a full config system.
- [config-node](https://www.npmjs.org/package/config-node) No docs. Repository URL incorrect.
- [nxt-config](https://www.npmjs.org/package/nxt-config) ini file syntax. Windows. Bitbucket. 2 years stale.
- [config-reader](https://www.npmjs.org/package/config-reader) custom, complex config file format
- [local-config](https://www.npmjs.org/package/local-config) Mostly simple and sane. No override capability.
- [context-config](https://www.npmjs.org/package/context-config) Addressing a much more complex problem.
- [pwf-config](https://www.npmjs.org/package/pwf-config) Not sure what this is.
- [fj-config](https://www.npmjs.org/package/fj-config) Looks incomplete.
- [express-config](https://www.npmjs.org/package/express-config) NODE_ENV. package.json incomplete.
- ...patience ran out

[![Build Status](https://semaphoreci.com/api/v1/focusaurus/config3/branches/master/badge.svg)](https://semaphoreci.com/focusaurus/config3)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
