const moment = require('moment-timezone');

// Zona horaria de Ecuador
const ecuadorTz = 'America/Guayaquil';

// Función para ver qué tareas finalizan hoy del diccionario que está en epoch
function tareasFinalizanHoy(diccionario) {
    const hoy = moment().tz(ecuadorTz).startOf('day');
    //hoy.add(1, 'days');
    let tareasHoy = {};
    let mensajeFinal = "\n\t*_Nohebot Lite_* *XoXo* _MXCA_\n\n🚨 ACTIVIDADES QUE FINALIZAN HOY 🔧\n";
    let bandera = false;

    let nombreMateria = "";
    let nombreTarea = "";

    for (const materia in diccionario) {
        nombreMateria = materia.trim();

        for (const tarea in diccionario[materia]) {
            nombreTarea = tarea.trim();

            const fechaTarea = moment.unix(diccionario[materia][tarea]).tz(ecuadorTz).startOf('day');
            if (fechaTarea.isSame(hoy)) {
                bandera = true;
                mensajeFinal += `\n- La tarea *${nombreTarea}* de la materia *${nombreMateria}* finaliza hoy a las ${fechaTarea.format('hh:mm a')} \n`;
                tareasHoy[tarea] = diccionario[materia][tarea];
            }
        }
    }

    return bandera ? mensajeFinal : false;
}

// Función que transforma de epoch a fecha local de Guayaquil en texto
function epochToDate(epoch) {
    
    moment.locale('es');

    // Convierte el epoch a la fecha local y formatea en español
    const localTime = moment.unix(epoch).tz(ecuadorTz);
    return localTime.format('dddd DD [de] MMMM [a las] hh:mm a');
}

// Función para ver las tareas en los próximos 7 días
function tareasProximaSemana(diccionario) {
    const hoy = moment().tz(ecuadorTz).startOf('day');
    let tareasProximos7Dias = {};
    let mensajeFinal = "\n\t*_Nohebot Lite_* *XoXo* _MXCA_\n\n ⚙️ ACTIVIDADES QUE FINALIZAN ESTA SEMANA 🦠\n\n";
    let bandera = false;
    let nombreMateria = "";
    let nombreTarea = "";

    for (const materia in diccionario) {
        nombreMateria = materia.trim();

        for (const tarea in diccionario[materia]) {
            
            nombreTarea = tarea.trim();

            const tareaFecha = moment.unix(diccionario[materia][tarea]).tz(ecuadorTz).startOf('day');
            const diasParaTarea = tareaFecha.diff(hoy, 'days');

            if (diasParaTarea <= 7 && diasParaTarea >= 0) {
                bandera = true;
                tareasProximos7Dias[tarea] = diccionario[materia][tarea];
                mensajeFinal += `- *${nombreTarea}* de *${nombreMateria}* : ${epochToDate(diccionario[materia][tarea])}\n\n`;
            }
        }
    }

    return bandera ? mensajeFinal : "No hay tareas para esta semana ? 🤔";
}

// Función para encontrar diferencias entre diccionario viejo y nuevo
function encontrarDiferencias(diccionarioViejo, diccionarioNuevo) {
    let tareasModificadas = "\n\t*_Nohebot Lite_* *XoXo* _MXCA_\n\n📍 NOTIFICADOR DE CAMBIOS 🎁\n";
    let bandera = false;

    nombreMateria = "";
    nombreTarea = "";

    for (const materia in diccionarioNuevo) {
        nombreMateria = materia.trim();

        if (diccionarioViejo[materia]) {
            const tareasViejas = diccionarioViejo[materia];

            for (const tarea in diccionarioNuevo[materia]) {

                nombreTarea = tarea.trim();

                const fechaNueva = diccionarioNuevo[materia][tarea];

                if (!tareasViejas[tarea]) {
                    bandera = true;
                    tareasModificadas += `\n- *NUEVA TAREA* en *${nombreMateria}* : *${nombreTarea}* para el ${epochToDate(fechaNueva)}\n`;
                } else if (tareasViejas[tarea] !== fechaNueva) {
                    bandera = true;
                    tareasModificadas += `\n- La tarea *${nombreTarea}* de *${nombreMateria}* ha cambiado de fecha de entrega de ${epochToDate(tareasViejas[tarea])} a ${epochToDate(fechaNueva)}\n`;
                }
            }
        }
    }

    return bandera ? tareasModificadas : false;
}

module.exports = {
    tareasFinalizanHoy,
    epochToDate,
    tareasProximaSemana,
    encontrarDiferencias
};
