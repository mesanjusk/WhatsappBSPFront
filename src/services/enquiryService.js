import axios from '../apiClient.js';

export const addEnquiry = (payload) => axios.post('/enquiry/addEnquiry', payload);
