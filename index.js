var child = require('child_process');
var shellParser = require('node-shell-parser');
var Pouch = require('pouchdb')

var pkgdb = new Pouch('http://havn.cloudant.com/anypkg')

module.exports = function(platform, options){
  if(!platform)
    throw "No platform specified"
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
  pkgdb.query('packages/byPlatformPkgNameVersion', { include_docs: true, key: [this.platform.pkg_mgr, ref, version]})
  .then(function(result){
    if(result.rows.length > 1)
      console.log('Multiple matching packages found, aborting', result)
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
      console.log('Not found:', ref)
    else
      console.log('ERR',err)
  })
}

module.exports.prototype.install = function(ref, cb){
  if(!version)
    var version = 'latest'

  pkgdb.query('packages/byPlatformPkgNameVersion', { include_docs: true, key: [this.platform.pkg_mgr, ref, version]})
  .then(function(result){
    if(result.rows.length > 1)
      console.log('Multiple matching packages found, aborting', result)
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
      console.log('Not found:', ref)
    else
      console.log('ERR',err)
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
  this.list(function(err, res){
    if(err)
      cb(err)
    else{
      packages.forEach(function(pkg){
        // Check if installed
        if(res.find(function(ipkg){
          return ipkg.name == pkg.name
        }))
          // Check if at desired version
          if(res.find(function(ipkg){
            return ipkg.name == pkg.name && ipkg.version == pkg.version
          }))
            console.log(pkg.name, 'already up-to-date')
          else
            // FIXME: Lookup PKG from Repo
            this.install([pkg.name, pkg.version].join('@'), function(err, res){
              if(err)
                console.log('ERR', err)
              else
                console.log(pkg.name, '@', pkg.version, 'installed')
            })
      })
    }
  })
}
