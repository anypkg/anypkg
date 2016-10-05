#!/usr/bin/env node
var program = require('commander')
require('console.table');

var MetaManager = require('./')

var manager = new MetaManager(require('./platformDetector')())

var formatter = function(err, data){
  if(err)
    console.log('ERR - ', JSON.stringify(err))
  else
    if(data instanceof Array)
      console.table(data)
    else
      console.log(data)
}

program
  .version('0.0.1')

program
  .command('list')
  .description('list locally installed meta\'s')
  .action(function() {
    manager.list(formatter)
  });

program
  .command('install <id> [version]')
  .description('install a meta, in specified version if provided')
  .action(function(id, version) {
    manager.install(id, formatter)
  });

program
  .command('remove <ref> [version]')
  .description('remove a or all provided packages')
  .action(function(id, version) {
    manager.remove(id, formatter)
  });

program
  .command('ensure <config>')
  .description('make sure apps in config file are installed')
  .action(function(config) {
    if(!config instanceof Object)
      config = require(config)
    manager.ensure(config, formatter)
  });
program.parse(process.argv);
