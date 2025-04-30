const fs = require('fs')
module.exports = {
   isMe: true,
   isPrivate: true,
   comand: ['mute', 'unmute'],
   async exec(m , { reply }) {

      let opc = {
         mute: 'Chat muteado exitosamente',
         unmute: 'Chat desmuteado exitosamente',
         yamute: 'Chat ya muteado',
         yaunmute: 'Chat ya desmuteado'
      }

      if (users_mute.includes(m.from) && m.comand === 'mute') {
         await reply(opc['ya' + m.comand])
         return
      } else if(!users_mute.includes(m.from) && m.comand === 'unmute'){
         await reply(opc['ya' + m.comand])
         return
      }

      if (m.comand === 'mute') {
         users_mute.push(m.from)
      } else if (m.comand === 'unmute') {
         let index = users_mute.indexOf(m.from)
         if(index === -1) return
         users_mute.splice(index, 1)
      }
      await F.jsonWrite('./Files/Json/mute.json', users_mute)
      await reply(opc[m.comand])
   }
}