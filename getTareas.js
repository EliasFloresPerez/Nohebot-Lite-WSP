const fs = require('fs');
const api = require('./apiMoodle'); // Asegúrate de que este archivo tenga el nombre correcto
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

// Datos privados desde variables de entorno
const link = process.env.LINK;
const token = process.env.TOKEN;
const userId = process.env.USER_ID;

// Obtener materias y tareas
async function obtenerTareas() {
    try {
        const materias = await api.getMaterias(token, userId, link);

        let output = {};

        for (const materia of materias) {
            const nombreMateria = materia.fullname.split('-')[0];
            output[nombreMateria] = {};

            // Obtener tareas del curso
            const tareasData = await api.getAssignments(token, materia.id, link);
            const tareas = tareasData.courses[0].assignments;

            for (const tarea of tareas) {
                // Fecha de entrega
                output[nombreMateria][tarea.name] = tarea.duedate;
            }

            // Obtener quizzes del curso
            const quizesData = await api.getQuizes(token, materia.id, link);
            const quizes = quizesData.quizzes;

            for (const quiz of quizes) {
                // Fecha de cierre
                output[nombreMateria][quiz.name] = quiz.timeclose;
            }

            // Obtener foros del curso
            const forosData = await api.getForums(token, materia.id, link);

            for (const foro of forosData) {
                if (foro.duedate) {
                    // Fecha de cierre del foro
                    output[nombreMateria][foro.name] = foro.cutoffdate;
                }
            }
        }

        return output;
    } catch (error) {
        console.error('Error al obtener tareas:', error);
    }
}

module.exports = {
    obtenerTareas
};
