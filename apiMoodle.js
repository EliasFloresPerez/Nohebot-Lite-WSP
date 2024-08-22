const axios = require('axios');

// Función para obtener las materias (cursos) del usuario
async function getMaterias(token, userid, link) {
    const url = `${link}/webservice/rest/server.php`;
    const data = new URLSearchParams({
        moodlewsrestformat: 'json',
        wstoken: token,
        wsfunction: 'core_enrol_get_users_courses',
        userid: userid
    });

    try {
        const res = await axios.post(url, data);
        return res.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Función para obtener las tareas (assignments) del curso
async function getAssignments(token, courseid, link) {
    const url = `${link}/webservice/rest/server.php`;
    const data = new URLSearchParams({
        moodlewsrestformat: 'json',
        wstoken: token,
        wsfunction: 'mod_assign_get_assignments',
        'courseids[0]': courseid
    });

    try {
        const res = await axios.post(url, data);
        return res.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Función para obtener los quizzes del curso
async function getQuizes(token, courseid, link) {
    const url = `${link}/webservice/rest/server.php`;
    const data = new URLSearchParams({
        moodlewsrestformat: 'json',
        wstoken: token,
        wsfunction: 'mod_quiz_get_quizzes_by_courses',
        'courseids[0]': courseid
    });

    try {
        const res = await axios.post(url, data);
        return res.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Función para obtener los foros del curso
async function getForums(token, courseid, link) {
    const url = `${link}/webservice/rest/server.php`;
    const data = new URLSearchParams({
        moodlewsrestformat: 'json',
        wstoken: token,
        wsfunction: 'mod_forum_get_forums_by_courses',
        'courseids[0]': courseid
    });

    try {
        const res = await axios.post(url, data);
        return res.data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

module.exports = {
    getMaterias,
    getAssignments,
    getQuizes,
    getForums
};
