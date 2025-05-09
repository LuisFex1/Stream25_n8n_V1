const fs = require('fs')
module.exports = {
   isPrivate: true,
   async run(m) {

      if (!fs.existsSync('./Files/Json/mute.json')) {
         await fs.writeFileSync('./Files/Json/mute.json', JSON.stringify([], null, 4))
      }

      let users_mute = JSON.parse(fs.readFileSync('./Files/Json/mute.json'))

      if ((m.body || '').includes('sss')) {
         users_mute.push(m.from)
         await fs.writeFileSync('./Files/Json/mute.json', JSON.stringify(users_mute, null, 4))
      }
      
   }
}