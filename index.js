const os = require('os')
const child = require('child_process')
const shellParser = require('node-shell-parser')
const Pouch = require('pouchdb')

const pkgdb = new Pouch('http://havn.cloudant.com/anypkg')

module.exports = function(platform, options){
  if(!platform)
    switch (os.type()) {
    case 'Windows_NT':
      var platform = require('./platforms/choco')
      break;
    case 'Darwin':
      var platform = require('./platforms/brew')
      break;
    case 'Linux':
      var platform = require('./platforms/apt')
      break;
    default:
      throw 'Unsupported os.type() and no platform specified'
    }
  this.platform = platform

  this.options = options || {}
}

module.exports.prototype.list = function(cb){
  var _this = this;
  var process = child.exec(this.platform.cmd.list, function(err, stdout, stderr){
    if(err || stderr)
      cb(err, stderr)
    else
      cb(null, stdout.split('\n').map(function(item){
        var item = item.split(' ')
        return {
          name: item[0],
          version: item[1]
        }
      }))
  });
}

module.exports.prototype.search = function(pkg_name, cb){
  var platform = this.platform
  var version = 'latest'
  pkgdb.query('packages/byPlatformPkgNameVersion', { include_docs: true, key: [platform.pkg_mgr, pkg_name, version]})
  .then(function(result){
    if(result.rows.length > 1)
      console.error('Multiple matching packages found, aborting', result)
    else {
      var doc = result.rows[0].doc
      var process = child.exec([this.platform.cmd.install, doc.ref].join(' '), function(err, stdout, stderr){
        if(err || stderr)
          cb(err, stderr)
        else
          cb(null, stdout)
      });
    }
  }.bind(this))
  .catch(function(err){
    if(err.status && err.status === 404)
      console.error('Not found:', ref)
    else
      console.error('ERR',err)
  })
}

module.exports.prototype.install = function(ref, cb){
  var platform = this.platform
  var nativeRef = ref
  var version = 'latest'

  pkgdb.query('packages/byPlatformPkgNameVersion', { include_docs: true, key: [platform.pkg_mgr, ref, version]})
  .then(function(result){
    if(result.rows.length > 1)
      console.error('Multiple matching packages found, aborting', result)
    else {
      if(result.rows.length == 0){
        console.info('Not found: ', nativeRef)
        console.info('Trying native package')
        var ref = nativeRef;
      }else{
        console.info('Found: ', result.rows[0].doc)
        var ref = result.rows[0].doc.ref
      }
      var process = child.exec([platform.cmd.install, ref].join(' '), function(err, stdout, stderr){
        if(err || stderr)
          cb(err, stderr)
        else
          cb(null, stdout)
      });
    }
  })
  .catch(function(err){
    console.error('ERR',err)
  })
}

module.exports.prototype.remove = function(ref, cb){

  // FIXME: Lookup PKG from Repo (as back-up)
  var process = child.exec([this.platform.cmd.remove, ref].join(' '), function(err, stdout, stderr){
    if(err || stderr)
      cb(err, stderr)
    else
      cb(null, stdout)
  });
}

module.exports.prototype.ensure = function(packages, cb){
  console.log('ensure packages', packages)
  this.list(function(err, res){
    if(err)
      cb(err)
    else{
      packages.forEach(function(pkg){
        // Check if installed by matching packages[].pkg.name to this.list[].pkg.name
        if(res.find(function(ipkg){ return ipkg.name == pkg.name }))
          console.info(pkg.name, 'already installed')
        else {
          console.info(pkg.name, 'installing')
          // FIXME: Install specified version
          this.install(pkg.name, function(err, res){
            if(err)
              console.error('ERR', err)
            else
              console.info(pkg.name, 'installed')
          })
        }
      }.bind(this))
    }
  }.bind(this))
}
