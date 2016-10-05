var os = require('os')
module.exports = function(){

  // Check os.type
    // If darwin
      // which brew else
        // > Brew
      // which ports
        // > Ports
    // If win32
      // > Choco
    // If linux
      // which apt-get else
        // > apt
      // which yum
        // > yum

  var osType = os.type()
  if(osType === "Darwin")
    return require('./platforms/brew')
  else if(osType === "Windows_NT")
    return require('./platforms/choco')
  else if(osType === "Linux")
    return require('./platforms/apt')
}
