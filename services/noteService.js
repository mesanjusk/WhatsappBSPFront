import axios from '../apiClient.js';

export const addNote = (payload) => axios.post('/note/addNote', payload);
