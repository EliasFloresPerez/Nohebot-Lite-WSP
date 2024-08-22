const fs = require('fs');
const moment = require('moment-timezone');
const schedule = require('node-schedule');
const gt = require('./getTareas');
const fa = require('./funcionesAlertas');
const wsp = require('./wspAPi'); // Asegúrate de que el nombre del archivo coincida
require('dotenv').config();


// Zona horaria de Ecuador
const ecuadorTz = 'America/Guayaquil';

// Lista de nombres de grupos
const listaDeGrupos = [
    'Grupo de 9no // Los amantes de jim',
    '9no Semestre TIC⚡',
    'TICS 9no semestre C2 💻'
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

        if (hoy.day() === 1) {
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
    
    const ahora = moment().tz(ecuadorTz).startOf('day');
    
    
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




schedule.scheduleJob('0 0 6 * * *', notificarCambios);

schedule.scheduleJob('0 0 10 * * *', notificarCambios);

schedule.scheduleJob('0 0 12 * * *', notificarCambios);

schedule.scheduleJob('0 0 16 * * *', notificarCambios);

schedule.scheduleJob('0 0 22 * * *', notificarCambios);


// Programar notificación de tareas del día a las 7:00 AM y 7:00 PM todos los días
schedule.scheduleJob('0 0 7 * * *', tareasDelDia); // 7:00 AM todos los días
schedule.scheduleJob('0 0 19 * * *', tareasDelDia); // 7:00 PM todos los días

//Notificacion los lunes a las 7am
schedule.scheduleJob('0 0 7 * * 1', notificarTareasSemana);


console.log('Programa iniciado y configurado');



console.log('\n\nFecha', moment().tz(ecuadorTz).format('dddd DD [de] MMMM [del] YYYY'));
console.log('Hora', moment().tz(ecuadorTz).format('hh:mm a'));



//Enviarme un mensaje a mi
wsp.sendMessageToNumber(process.env.NUMEROPERSONAL, 'Bot prendido');


//notificarTareasSemana();
//tareasDelDia();
//notificarCambios();

//notificarTareasSemana();