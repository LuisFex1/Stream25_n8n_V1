const Plugins = require('./Media/plugins.js');
const fs = require('fs');
let users_mute = JSON.parse(fs.readFileSync('./Files/Json/mute.json'))

global.F = require('./Media/functions');
global.bot = JSON.parse(fs.readFileSync('./Files/Json/config.json'))
global.spamFex = JSON.parse(fs.readFileSync('./Files/Json/spamfex.json'))
global.sms = JSON.parse(fs.readFileSync('./Files/Json/automatic.json'))

global.origen = process.mainModule.path
global.users_mute = users_mute

try {
   global.plugins = []
   const plugin = new Plugins('Message/Plugins')
   plugin.readPlugin(plugin.folder)
} catch (e) {
   F.error('read plugins',e)
}