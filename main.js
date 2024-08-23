// main.js
const fs = require('fs');
const moment = require('moment-timezone');
const express = require('express');
const cors = require('cors');
const gt = require('./getTareas');
const fa = require('./funcionesAlertas');
const wsp = require('./wspAPi');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todos los orígenes
app.use(cors());

// Zona horaria de Ecuador
const ecuadorTz = 'America/Guayaquil';

// Lista de nombres de grupos
const listaDeGrupos = [
    'Grupo de 9no // Los amantes de jim',
    //'9no Semestre TIC⚡',
    //'TICS 9no semestre C2 💻'
];

// Función para enviar mensajes a la lista de grupos
async function enviarMensajeAGrupos(mensaje) {
    for (const grupo of listaDeGrupos) {
        await wsp.sendMessageToGroup(grupo, mensaje);
    }
}

// Función para notificar cambios
async function notificarCambios() {
    console.log("Notificación de cambios iniciada");

    try {
        await wsp.waitForClientReady();

        let tareas = await gt.obtenerTareas();
        let tareasLocal;
        try {
            tareasLocal = JSON.parse(fs.readFileSync('tareas.json', 'utf-8'));
        } catch (error) {
            tareasLocal = {};
        }

        const cambios = fa.encontrarDiferencias(tareasLocal, tareas);
        fs.writeFileSync('tareas.json', JSON.stringify(tareas, null, 4), 'utf-8');

        if (cambios) {
            console.log('Enviado cambios');
            await enviarMensajeAGrupos(cambios);
        }

        console.log("Notificación de cambios terminada");

    } catch (error) {
        console.error('Error en la notificación de cambios:', error);
    }
}

// Función para las tareas del día
async function tareasDelDia() {
    console.log("Proceso de tareas del día iniciado");

    try {
        await wsp.waitForClientReady();

        let tareas = await gt.obtenerTareas();
        const hoy = moment().tz(ecuadorTz).startOf('day');

        let tareasHoy = false;
        let tareasSemana = false;

        if (hoy.day() === 1) { // Si es lunes
            tareasSemana = fa.tareasProximaSemana(tareas);
        }

        tareasHoy = fa.tareasFinalizanHoy(tareas);

        if (tareasSemana) {
            console.log('Enviada tarea de la semana');
            await enviarMensajeAGrupos(tareasSemana);
        }

        if (tareasHoy) {
            console.log('Enviada tarea de hoy');
            await enviarMensajeAGrupos(tareasHoy);
        }

        console.log("Proceso de tareas del día terminado");

    } catch (error) {
        console.error('Error en el proceso de tareas del día:', error);
    }
}

// Función para manejar la lógica de la notificación semanal
async function notificarTareasSemana() {
    console.log("Notificación de tareas de la semana iniciada");

    try {
        await wsp.waitForClientReady();

        let tareas = await gt.obtenerTareas();
        const tareasSemana = fa.tareasProximaSemana(tareas);

        if (tareasSemana) {
            console.log('Enviada tarea de la semana');
            await enviarMensajeAGrupos(tareasSemana);
        }

        console.log("Notificación de tareas de la semana terminada");

    } catch (error) {
        console.error('Error en la notificación de tareas de la semana:', error);
    }
}

// Rutas para los endpoints de la API
app.get('/', (req, res) => {
    res.send('¡Hola mundo!');
});

app.get('/notificar-cambios', async (req, res) => {
    await notificarCambios();
    res.send('Notificación de cambios ejecutada');
});

app.get('/tareas-hoy', async (req, res) => {
    await tareasDelDia();
    res.send('Tareas del día ejecutadas');
});

app.get('/tareas-semana', async (req, res) => {
    await notificarTareasSemana();
    res.send('Notificación de tareas de la semana ejecutada');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
