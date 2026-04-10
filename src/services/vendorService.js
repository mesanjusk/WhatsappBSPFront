import axios from '../apiClient.js';

const unwrap = (response) => response?.data?.result ?? response?.data ?? [];

export const addVendor = (payload) => axios.post('/vendor/addVendor', payload);

export const fetchVendorMasters = async () => unwrap(await axios.get('/vendors/masters'));
export const createVendorMaster = async (payload) => unwrap(await axios.post('/vendors/masters', payload));
export const updateVendorMaster = async (vendorUuid, payload) => unwrap(await axios.put(`/vendors/masters/${vendorUuid}`, payload));

export const fetchVendorLedger = async (vendorUuid) => {
  const response = await axios.get(`/vendors/ledger/${vendorUuid}`);
  return {
    entries: response?.data?.result ?? [],
    summary: response?.data?.summary ?? {},
  };
};

export const createVendorLedgerEntry = async (payload) => unwrap(await axios.post('/vendors/ledger', payload));
export const fetchProductionJobs = async () => unwrap(await axios.get('/vendors/production-jobs'));
export const createProductionJob = async (payload) => unwrap(await axios.post('/vendors/production-jobs', payload));
export const fetchStockMovements = async () => unwrap(await axios.get('/vendors/stock-movements'));
export const fetchVendorSummary = async () => unwrap(await axios.get('/vendors/reports/summary'));
export const fetchOrderListForAllocation = async () => unwrap(await axios.get('/vendors/orders/list'));

export const fetchWhatsAppAttendanceSettings = async () => unwrap(await axios.get('/vendors/settings/whatsapp-attendance'));
export const saveWhatsAppAttendanceSettings = async (payload) => unwrap(await axios.put('/vendors/settings/whatsapp-attendance', payload));
