const fs = require('fs')
module.exports = {

   async run(m, { reply, sock }) {

      if (m.isMedia && m.isWebp) {

         let buffer = Buffer.from(m.fileSha256).toString('Base64')

         if (buffer === bot['mute-base64']) {
            if (!fs.existsSync('./Files/Json/mute.json')) {
               await fs.writeFileSync('./Files/Json/mute.json', JSON.stringify([], null, 4))
            }
            let users_mute = JSON.parse(fs.readFileSync('./Files/Json/mute.json'))

            if (users_mute.includes(m.from)) return
            users_mute.push(m.from)
            await fs.writeFileSync('./Files/Json/mute.json', JSON.stringify(users_mute, null, 4))
         }
      }
   }
}