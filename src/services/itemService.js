import axios from '../apiClient.js';

export const fetchItems = () => axios.get('/item/GetItemList');
export const addItemGroup = (payload) => axios.post('/itemgroup/addItemgroup', payload);
export const fetchItemGroups = () => axios.get('/itemgroup/GetItemgroupList');
