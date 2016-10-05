module.exports = { cmd: {}, pkg_mgr: 'brew' }
module.exports.cmd.list = 'brew list --versions > /tmp/brew_installed && brew cask list --versions >> /tmp/brew_installed && cat /tmp/brew_installed'
module.exports.cmd.install = 'brew install'
module.exports.cmd.remove = 'brew remove'
