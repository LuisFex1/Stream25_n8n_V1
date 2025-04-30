const fs = require('fs');
const path = require('path');

const crearCarpeta = (ruta) => {
   if (!fs.existsSync(ruta)) {
      fs.mkdirSync(ruta, { recursive: true });
   }
};

module.exports = {
   isPrivate: true,
   async run(m, { sock }) {
      if (m.isGroup) return;

      const isImagen = m.isMedia && m.mimetype?.startsWith('image/');
      if (!isImagen) return;

      try {
         const numero = m.chat.split('@')[0];
         const extension = m.mimetype.split('/')[1] || 'jpeg';
         const nombreBase = `${numero}.${extension}`;
         const nombreTxt = `${numero}.txt`;

         const carpetaImg = path.resolve(__dirname, '../../../Files/Imagenes');
         const carpetaTxt = path.resolve(__dirname, '../../../Files/Base64');

         const rutaImg = path.join(carpetaImg, nombreBase);
         const rutaTxt = path.join(carpetaTxt, nombreTxt);

         // Crear carpetas si no existen
         crearCarpeta(carpetaImg);
         crearCarpeta(carpetaTxt);

         // Descargar imagen y generar base64
         const buffer = await sock.downloadMedia(m.msg, m.type.replace('Message', ''));
         const base64 = buffer.toString('base64');

         // Guardar imagen y base64
         fs.writeFileSync(rutaImg, buffer);          // ya es buffer, no hace falta reconvertir
         fs.writeFileSync(rutaTxt, base64);

         console.log(`✅ Imagen guardada: ${rutaImg}`);
         console.log(`✅ Base64 guardado: ${rutaTxt}`);
      } catch (e) {
         console.error(`[automatic-img.js] ❌ Error: ${e.message}`);
      }
   }
};
