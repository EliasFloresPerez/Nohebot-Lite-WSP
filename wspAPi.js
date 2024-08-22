const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Configura el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth() // Utiliza la autenticación local para recordar el estado de la sesión
});

let clientReady = false; // Estado para verificar si el cliente está listo
console.log('Valor de clientReady antes de usarlo:', clientReady);


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});


client.on('ready', () => {
    console.log('Cliente listo!');
    clientReady = true;
});

client.on('auth_failure', msg => {
    console.error('Autenticación fallida:', msg);
});

client.on('disconnected', reason => {
    console.log('Cliente desconectado:', reason);
    clientReady = false;
});

// Inicializa el cliente
console.log('Esperando a que el cliente esté listo...');
client.initialize();

// Función para esperar a que el cliente esté listo
function waitForClientReady() {
    return new Promise((resolve) => {
        if (clientReady) {
            resolve();
        } else {
            client.on('ready', resolve);
        }
    });
}

// Función para enviar mensaje a un grupo
async function sendMessageToGroup(groupName, message) {
    try {
        const chats = await client.getChats();
        const groupChat = chats.find(chat => chat.isGroup && chat.name === groupName);

        if (groupChat) {
            await client.sendMessage(groupChat.id._serialized, message);
            console.log(`Mensaje enviado al grupo: ${groupChat.name}`);
        } else {
            console.log('Grupo no encontrado.');
        }
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
}

// Función para enviar un mensaje a un número específico
async function sendMessageToNumber(number, message) {
    try {
        await waitForClientReady(); // Espera a que el cliente esté listo
        const chatId = `${number}@c.us`; // Formato de número de WhatsApp
        await client.sendMessage(chatId, message);
        console.log(`Mensaje enviado al número: ${number}`);
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
    }
}

// Exporta las funciones y el cliente
module.exports = {
    sendMessageToGroup,
    sendMessageToNumber,
    waitForClientReady
};
