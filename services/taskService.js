import axios from '../apiClient.js';

export const fetchTaskGroups = () => axios.get('/taskgroup/GetTaskgroupList');
export const addTask = (payload) => axios.post('/task/addTask', payload);
export const fetchTaskById = (taskId) => axios.get(`/task/${taskId}`);
export const updateTask = (taskId, payload) => axios.put(`/task/update/${taskId}`, payload);
export const fetchTasks = () => axios.get('task/GetTaskList');
export const deleteTask = (taskId) => axios.delete(`/task/Delete/${taskId}`);
