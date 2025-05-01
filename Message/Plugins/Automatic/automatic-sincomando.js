const axios = require('axios');

// URL del Webhook en n8n
const webhookURL = 'https://luisoff.app.n8n.cloud/webhook/6391dc7e-a525-4e3d-bf3e-ee4f8a791c02';

module.exports = {
    isPrivate: true,
    
    async run(m, { sock }) {
        // Solo procesar si es un número individual, no un grupo
        if (m.isGroup) return;
        if(m.isMe) return 
        const numero = m.chat.split('@')[0]; // Obtener el número del remitente
        let dataToSend = {
            messages: [
                {
                    text: {
                        body: m.body?.trim() || null // Si no hay texto, poner null
                    },
                    audio: null, // Inicializar como null
                    image: null, // Inicializar como null
                    document: null, // Inicializar como null
                    sender: numero // Incluir el número del remitente
                }
            ]
        };

        // Procesar medios
        const mediaTypes = ['image', 'audio', 'video', 'application']; // tipos de medios que manejamos
        const mediaHandler = {
            image: 'image',
            audio: 'audio',
            video: 'video',
            application: 'document'
        };

        // Comprobar si el mensaje es un tipo de media y procesarlo
        for (let type of mediaTypes) {
            const isMedia = m.isMedia && m.mimetype?.startsWith(type);
            if (isMedia) {
                try {
                    // Descargar el archivo
                    const buffer = await sock.downloadMedia(m.msg, m.type.replace('Message', ''));
                    const base64 = buffer.toString('base64'); // Convertir a Base64

                    // Asignar el archivo Base64 al campo correspondiente
                    dataToSend.messages[0][mediaHandler[type]] = base64;

                    console.log(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} convertido a Base64 y enviado al Webhook`);
                } catch (e) {
                    console.error(`[Webhook] ❌ Error al manejar ${type}:`, e.message);
                }
            }
        }

        // Enviar el JSON con el mensaje al Webhook
        try {
            console.log('[Webhook] Enviando datos al Webhook...');
            const response = await axios.post(webhookURL, dataToSend);
            console.log('[Webhook] ✅ Respuesta del Webhook:', response.data);
        } catch (error) {
            console.error('[Webhook] ❌ Error al enviar al Webhook:', error.message);
        }
    }
};