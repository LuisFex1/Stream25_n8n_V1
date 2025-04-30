const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

/**
 * Función para extraer texto de una imagen utilizando OCR.
 * @param {string} ruta - Ruta local del archivo de imagen.
 * @param {string} idioma - Idioma OCR, por defecto 'spa' (español).
 * @returns {Promise<string>} Texto extraído o mensaje de error.
 */
async function leerTextoDeImagen(ruta, idioma = 'spa') {
   try {
      if (!fs.existsSync(ruta)) {
         throw new Error(`Archivo no encontrado: ${ruta}`);
      }

      const resultado = await Tesseract.recognize(
         path.resolve(ruta),
         idioma,
         {
            logger: m => {
               if (m.status === 'recognizing text') {
                  process.stdout.write(`🧠 OCR ${Math.floor(m.progress * 100)}%\r`);
               }
            }
         }
      );

      return resultado.data.text.trim();

   } catch (err) {
      return `[OCR-ERROR] ${err.message}`;
   }
}

module.exports = { leerTextoDeImagen };