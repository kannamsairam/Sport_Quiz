import axios from 'axios';

const API_URL = 'https://sport-quiz-backend.onrender.com';

export const getQuestions = async (sport) => {
    try {
        const response = await axios.post(`${API_URL}/quiz/${sport}/start`);
        return response.data;
    } catch (error) {
        console.error("Error fetching questions: ", error);
        throw error; // Rethrow or handle as needed
    }
};

export const submitAnswers = async (sport, sessionId, answers) => {
    try {
        const response = await axios.post(`${API_URL}/quiz/${sport}/answer`, { sessionId, answers });
        return response.data;
    } catch (error) {
        console.error("Error submitting answers: ", error);
        throw error; // Rethrow or handle as needed
    }
};

export const getScore = async () => {
    try {
        const score = await axios.get(`${API_URL}/getScore`);
        return score;
    } catch (error) {
        console.error('Error getting score', error);
        throw error;
    }
}

// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api/quiz';

// export const getQuestions = async () => {
//     const response = await axios.get(`${API_URL}/questions`);
//     return response.data;
// };

// export const submitAnswers = async (answers) => {
//     const response = await axios.post(`${API_URL}/submit`, { answers });
//     return response.data;
// };

// import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';

// export const getQuestions = async () => {
//     try {
//         const response = await axios.get(`${API_URL}/questions`);
//         return response.data;
//     } catch (error) {
//         console.error("Error fetching questions: ", error);
//         throw error; // Rethrow or handle as needed
//     }
// };

// export const submitAnswers = async (answers) => {
//     try {
//         const response = await axios.post(`${API_URL}/submit`, { answers });
//         return response.data;
//     } catch (error) {
//         console.error("Error submitting answers: ", error);
//         throw error; // Rethrow or handle as needed
//     }
// };

