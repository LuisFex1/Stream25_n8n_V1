module.exports = {
   models: ['random'],
   desc: 'Responde cuando no se detecta un comando',
   comand: [],
   isPrivate: false,
   async exec(m, { sendMessage }) {

      console.log('[SINCOMANDO] Mensaje recibido:', m.body);

      // Definir isCmd si no existe (para evitar errores)
      if (typeof m.isCmd === 'undefined') {
         const prefijos = bot.prefijos || ['/'];
         m.isCmd = prefijos.some(prefix => m.body.startsWith(prefix));
         console.log('[SINCOMANDO] isCmd calculado:', m.isCmd);
      }

      if (!m.body.startsWith("/") && !m.isCmd) {
         console.log('[SINCOMANDO] Entrando a respuesta automática...');
         await sendMessage(m.chat, `Hola! Soy *${bot.name}*. Si necesitas ayuda, escribe */menu* para ver mis comandos disponibles.`)
      } else {
         console.log('[SINCOMANDO] No aplica (es comando o tiene prefijo).');
      }
   }
}
