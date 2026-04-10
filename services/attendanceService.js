import axios from '../apiClient.js';

export const fetchAttendanceList = () => axios.get('/attendance/GetAttendanceList');
export const addAttendance = (payload) => axios.post('/attendance/addAttendance', payload);
