const fs = require('fs')
let users_mute = JSON.parse(fs.readFileSync('./Files/Json/mute.json'))

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
      await fs.writeFileSync('./Files/Json/mute.json',JSON.stringify(users_mute,null,4))
      await reply(opc[m.comand])
   }
}