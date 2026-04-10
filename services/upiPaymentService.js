import axios from '../apiClient';

export function createUpiPaymentAttempt(payload) {
  return axios.post('/api/upi/payments/attempt', payload);
}

export function listUpiPaymentAttempts(params = {}) {
  return axios.get('/api/upi/payments', { params });
}

export function getUpiPaymentAttemptById(attemptId) {
  return axios.get(`/api/upi/payments/${attemptId}`);
}

export function updateUpiPaymentAttemptStatus(attemptId, payload) {
  return axios.patch(`/api/upi/payments/${attemptId}/status`, payload);
}
