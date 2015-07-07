# confix #

[![npm Version](https://img.shields.io/npm/v/confix.svg)](https://www.npmjs.com/package/confix)
[![Build Status](https://travis-ci.org/intuitivcloud/confix.svg?branch=master)](https://travis-ci.org/intuitivcloud/confix)
[![Dependency Status](https://david-dm.org/intuitivcloud/confix.png)](https://david-dm.org/intuitivcloud/confix)

Common configuration utilities and helpers for applications

## Installation

### Node

```bash
$ npm install --save confix
```

## Defining Your Configuration

### Configuration Files

`confix` requires you to define your configuration in files using the `JSON` format. All files conforming to the `JSON` format are valid configuration files.

### Storing Configuration

Within your application directory structure, designate a sub-directory to hold configuration files. All configuration files must reside within this directory for `confix` to access them.

Each configuration file must have the extension `.json` for confix to read it. The name of the file will be the **baseName** for configuration configuration. For example, naming your configuration file `server.json` would mean the **baseName** for that configuration is `server`.

You may choose to store all configuration values in one configuration file. However we recommend you consider logically split your configuration values baed on your application. For example, we could create configuration for a web-application as follows:

* `server.json` - stores the configuration values for the `express` server.
* `redis.json` - stores the configuration values for `redis` server.
* `db.json` - store configuration values for database connectivity

#### Environment Specific Settings

Every application may have configuration values which vary between different environments. To accomodate this, `confix` supports file-names which contain the name of the environment suffixed to the **baseName**. For example:

* `server.json` - the common configuration available in all environments.
* `server.development.json` - the configuration values for the `development` environment.
* `server.testing.json` - the configuration values for the `testing` environment.
* `server.production.json` - the configuration values for the `production` environment.

Environment labels are not limited to the above examples. You may choose any label for your environment you wish.

`confix` uses the environment variable `NODE_ENV` to detect the environment in which the application is running via `process.env`. If `NODE_ENV` is not set, the environment defaults to `development`.

##### Order of Configuration Overrides

Environment specific configuration files can override common settings. Below is the order `confix` uses to select environment specific settings:

1. First retrieve all configuration values from `<baseName>.json` configuration file.
2. If it exists, retrieve all configuration values from `<baseName>.<environment>.json` configuration file. 
3. Merge configuration values retrieved from `<baseName>.json`, overriding those whose keys are also available in this file.

Therefore the `<baseName>.json` file is a good place to put configuration values common to all environments.

##### Injecting Environment Variables

`confix` also provides the ability to inject system environment variables for configuration values. You can accomplish this by delimiting your configuration values between a pair of `{}`. Example:

```json
{
  "host": "{APP_HOST}",
  "port": 3000
}
```

In the above example, the `host` configuration key will get a value `localhost` if the `APP_HOST` system environment variable is set to the same.

## License

Copyright (c) 2015, intuitivcloud Systems &lt;engineering@intuitivcloud.com&gt;
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of signalman nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 