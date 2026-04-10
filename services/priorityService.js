import axios from '../apiClient.js';

export const fetchPriorities = () => axios.get('/priority/GetPriorityList');
export const deletePriority = (priorityId) => axios.delete(`/priority/Delete/${priorityId}`);
export const fetchPriorityById = (priorityId) => axios.get(`/priority/${priorityId}`);
export const updatePriority = (priorityId, payload) => axios.put(`/priority/update/${priorityId}`, payload);
