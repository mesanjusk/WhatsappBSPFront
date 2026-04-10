import axios from '../apiClient.js';

export const fetchSessions = () => axios.get('/whatsapp/sessions');
export const sendTestMessage = (payload) => axios.post('/whatsapp/send-test', payload);
export const resetSession = (sessionId) => axios.post('/whatsapp/reset-session', { sessionId });
export const startSession = (sessionId) => axios.post('/whatsapp/start-session', { sessionId });
export const fetchSessionQr = (sessionId) => axios.get(`/whatsapp/session/${sessionId}/qr`);

// Chat operations
export const fetchWhatsAppStatus = () => axios.get('/api/whatsapp/accounts');
export const fetchChatList = () => axios.get('/chatlist');
export const fetchCustomers = () => axios.get('/customer/GetCustomersList');
export const fetchMessagesByNumber = (number) => axios.get(`/messages/${number}`);
export const fetchCustomerByNumber = (number) => axios.get(`/customer/by-number/${number}`);
export const sendWhatsAppMessage = (payload) => axios.post('/send-message', payload);
