import axios from '../apiClient.js';

export const fetchPayments = () => axios.get('/payment_mode/GetPaymentList');
export const fetchPaymentById = (paymentId) => axios.get(`/payment_mode/${paymentId}`);
export const updatePayment = (paymentId, payload) => axios.put(`/payment_mode/update/${paymentId}`, payload);
export const addPayment = (payload) => axios.post('/payment_mode/addPayment', payload);
export const deletePayment = (paymentId) => axios.delete(`/payment_mode/Delete/${paymentId}`);
