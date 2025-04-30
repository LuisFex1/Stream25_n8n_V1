const express = require('express');
const F = require('./functions.js');
const { spawn } = require('child_process');
const fs = require('fs');
const { leerTextoDeImagen } = require('../ocrReader'); // ✅ OCR desde raíz

const app = express();
const port = 8080;

app.use(express.json({ limit: '50mb' }));

app.post('/send', validar, async (req, res) => {
   const { number, message, path, base64, type , ...mess} = req.body;

   const id = number.endsWith('@g.us') ? number :
              number.endsWith('.net') ? number :
              number + '@s.whatsapp.net';

   try {
      if (type === 'voice') {
         await sock.sendPresenceUpdate('recording', id);
      } else {
         await sock.sendPresenceUpdate('composing', id);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (['poll', 'encuesta'].includes(type)) {
         await sock.sendMessage(id, {
            poll: {
               name: message.name,
               values: message.opc,
               selectableCount: 1
            }
         });
      } else if (type === 'media') {
         if (base64) {
            const buffer = Buffer.from(base64, 'base64');
            await sock.sendMessage(id, {
               image: buffer,
               caption: message || '',
               mimetype: 'image/jpeg'
            });
         } else {
            await sock.sendFile(id, path, message);
         }
      } else if (['video', 'mp4'].includes(type)) {
         await sock.sendMessage(id, {
            video: base64 ? Buffer.from(base64, 'base64') : { url: path },
            mimetype: 'video/mp4',
            caption: message || ''
         });
      } else if (type === 'voice') {
         const buffer = Buffer.from(base64, 'base64');
         await sock.sendMessage(id, {
            audio: buffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
         });
      } else if (type === 'text') {
         await sock.reply(id, message);
      } else if (['loc', 'location'].includes(type)) {
         const { lat, long, name, desc } = message;
         await sock.sendLoc(id, lat, long, { name, desc });
      } else {
         return res.json({ success: false, message: 'Tipo de mensaje no soportado' });
      }
      
      if('mute' in mess){
         users_mute.push(mess.mute.id || id)
         fs.writeFileSync('./Files/Json/mute.json',JSON.stringify(users_mute,null,4))
      }
      
      if('unmute' in mess){
         let index = users_mute.indexOf(mess.unmute.id || id)
         if(index === -1) return
         users_mute.splice(index,1)
         fs.writeFileSync('./Files/Json/mute.json',JSON.stringify(users_mute,null,4))
      }
      
      res.json({
         success: true,
         message: '✅ Mensaje enviado exitosamente'
      });
   } catch (e) {
      console.error('Error al enviar mensaje:', e);
      res.json({
         success: false,
         message: e.message
      });
   }
});

async function validar(req, res, next) {
   try {
      const { number, message, path, base64, type } = req.body;

      if (!number) return res.json({ status: false, message: 'Error @number requerido' });
      if (!type) return res.json({ status: false, message: 'Error @type no definido' });

      switch (type) {
         case 'media': {
            if (!base64) {
               const { isFile } = await F.getFile(path);
               if (!path || !isFile) {
                  return res.json({ status: false, message: 'Type @media requiere @path válido o @base64' });
               }
            }
            break;
         }
         case 'video':
         case 'mp4': {
            if (!path && !base64) {
               return res.json({ status: false, message: 'Requiere @path o @base64 para video' });
            }
            break;
         }
         case 'voice': {
            if (!base64) {
               return res.json({ status: false, message: 'Type @voice requiere @base64' });
            }
            break;
         }
         case 'loc':
         case 'location': {
            if (!message || !message.name || !message.lat || !message.long || !message.desc) {
               return res.json({ status: false, message: 'Parámetros inválidos para ubicación' });
            }
            break;
         }
         case 'poll':
         case 'encuesta': {
            if (!message || !message.name || !message.opc) {
               return res.json({ status: false, message: 'Parámetros inválidos para encuesta' });
            }
            break;
         }
         case 'text': {
            if (!message) {
               return res.json({ status: false, message: 'Parámetro @message requerido' });
            }
            break;
         }
         default:
            return res.json({ status: false, message: 'Tipo no soportado' });
      }

      next();
   } catch (e) {
      return res.json({ status: false, message: 'Error inesperado: ' + e.message });
   }
}

// ✅ RUTA /transcribir (audios con Python)
app.post('/transcribir', (req, res) => {
   const { audioPath, base64 } = req.body;

   if (!audioPath && !base64) {
      return res.status(400).json({ success: false, message: 'Falta el campo audioPath o base64' });
   }

   let proceso;

   if (base64) {
      console.log('📥 Transcribiendo desde base64');
      const buffer = Buffer.from(base64, 'base64');
      proceso = spawn('python3', ['transcriptor.py', '--stdin']);
      proceso.stdin.write(buffer);
      proceso.stdin.end();
   } else if (audioPath) {
      console.log(`📥 Transcribiendo desde archivo: ${audioPath}`);
      if (!fs.existsSync(audioPath)) {
         return res.status(400).json({ success: false, message: 'Archivo no encontrado' });
      }
      proceso = spawn('python3', ['transcriptor.py', audioPath]);
   }

   let salida = '';
   proceso.stdout.on('data', (chunk) => salida += chunk.toString());
   proceso.stderr.on('data', (err) => console.error('🛑 Error en transcripción:', err.toString()));

   proceso.on('close', (code) => {
      if (code === 0) {
         res.json({ success: true, text: salida.trim() });
      } else {
         res.status(500).json({ success: false, message: 'Error al transcribir el audio' });
      }
   });
});

// ✅ RUTA /ocr (imagen con Tesseract)
app.post('/ocr', async (req, res) => {
   const { imagePath, base64 } = req.body;

   if (!imagePath && !base64) {
      return res.status(400).json({ success: false, message: 'Falta el campo imagePath o base64' });
   }

   let rutaTemp;

   try {
      if (base64) {
         const buffer = Buffer.from(base64, 'base64');
         rutaTemp = `./Media/temp_ocr_${Date.now()}.jpg`;
         fs.writeFileSync(rutaTemp, buffer);
      } else {
         if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
         }
         rutaTemp = imagePath;
      }

      const texto = await leerTextoDeImagen(rutaTemp);

      if (base64 && fs.existsSync(rutaTemp)) fs.unlinkSync(rutaTemp);

      res.json({ success: true, text: texto });

   } catch (e) {
      if (rutaTemp && base64 && fs.existsSync(rutaTemp)) fs.unlinkSync(rutaTemp);
      res.status(500).json({ success: false, message: e.message });
   }
});

module.exports = async () => {
   app.listen(port, () => {
      console.log(`🚀 Servidor HTTP escuchando en http://localhost:${port}`);
   });
};
