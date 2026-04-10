import axios from '../apiClient.js';

export const fetchUsers = () => axios.get('/user/GetUserList');
export const deleteUser = (userUuid) => axios.delete(`/user/Delete/${userUuid}`);
