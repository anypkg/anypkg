module.exports = { cmd: {}, pkg_mgr: 'apt' }
module.exports.cmd.list = 'apt-get list --installed'
module.exports.cmd.install = 'apt-get install -y'
module.exports.cmd.remove = 'apt-get remove --purge -y'
