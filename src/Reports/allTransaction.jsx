// src/Pages/AllTransaction.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../apiClient.js';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ConfirmModal, EmptyState, Loader, ToastContainer, toast } from '../Components';

// NEW: reusable modal
import TransactionEditModal from '../Components/TransactionEditModal';

const AllTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmState, setConfirmState] = useState({
    open: false,
    mode: null,
    txnId: null,
    count: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadError(null);
      try {
        const [txnRes, custRes] = await Promise.all([
          axios.get('/transaction'),
          axios.get('/customer/GetCustomersList'),
        ]);
        if (txnRes.data?.success) setTransactions(txnRes.data.result || []);
        if (custRes.data?.success) setCustomers(custRes.data.result || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        const message = 'Unable to load transactions. Please try again.';
        setLoadError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    const userGroup = localStorage.getItem('User_group');
    if (userGroup) setUserRole(userGroup);
    fetchData();
  }, []);

  const customerMap = useMemo(() => {
    const map = {};
    for (const c of customers) map[c.Customer_uuid] = c.Customer_name;
    return map;
  }, [customers]);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };

  const filteredEntries = useMemo(() => {
    let grouped = transactions.map((txn) => {
      const credit = txn.Journal_entry?.find((e) => String(e.Type || '').toLowerCase() === 'credit');
      const debit  = txn.Journal_entry?.find((e) => String(e.Type || '').toLowerCase() === 'debit');

      const orderNo =
        txn.Order_number ??
        txn.Order_Number ??
        txn.order_number ??
        txn.orderNo ??
        '';

      return {
        Transaction_id: txn.Transaction_id,
        Transaction_uuid: txn.Transaction_uuid,
        Transaction_date: txn.Transaction_date,
        Order_number: orderNo,
        Description: txn.Description || '',
        CreditAmount: credit?.Amount || 0,
        DebitAmount: debit?.Amount || 0,
        Amount: credit?.Amount || debit?.Amount || 0,
        Credit_id: credit?.Account_id || '',
        Debit_id: debit?.Account_id || '',
      };
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      grouped = grouped.filter((txn) => {
        const creditName = (customerMap[txn.Credit_id] || '').toLowerCase();
        const debitName  = (customerMap[txn.Debit_id]  || '').toLowerCase();
        const orderNo    = String(txn.Order_number || '').toLowerCase();
        return creditName.includes(q) || debitName.includes(q) || orderNo.includes(q);
      });
    }

    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      const to   = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      grouped = grouped.filter((txn) => {
        const txnDate = new Date(txn.Transaction_date);
        return txnDate >= from && txnDate <= to;
      });
    }

    if (sortConfig.key) {
      grouped.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        const isNum = (v) => typeof v === 'number' || (!isNaN(v) && v !== null && v !== '');
        if (isNum(aValue) && isNum(bValue)) {
          const an = Number(aValue);
          const bn = Number(bValue);
          if (an < bn) return sortConfig.direction === 'asc' ? -1 : 1;
          if (an > bn) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        const as = String(aValue || '');
        const bs = String(bValue || '');
        if (as < bs) return sortConfig.direction === 'asc' ? -1 : 1;
        if (as > bs) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return grouped;
  }, [transactions, searchQuery, dateFrom, dateTo, sortConfig, customerMap]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filteredEntries.some((g) => g.Transaction_uuid === id)));
  }, [filteredEntries]);

  const allVisibleSelected = useMemo(
    () => filteredEntries.length > 0 && filteredEntries.every((t) => selectedIds.includes(t.Transaction_uuid)),
    [filteredEntries, selectedIds]
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const exportToExcel = () => {
    const exportRows = filteredEntries.map((txn) => ({
      No: txn.Transaction_uuid,
      'Order No': txn.Order_number || '',
      Date: formatDate(txn.Transaction_date),
      'Credit Name': customerMap[txn.Credit_id] || '-',
      Credit: txn.CreditAmount,
      'Debit Name': customerMap[txn.Debit_id] || '-',
      Debit: txn.DebitAmount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    XLSX.writeFile(wb, 'Transactions.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['No', 'Order No', 'Date', 'Credit Name', 'Credit', 'Debit Name', 'Debit']],
      body: filteredEntries.map((txn) => [
        txn.Transaction_uuid,
        txn.Order_number || '',
        formatDate(txn.Transaction_date),
        customerMap[txn.Credit_id] || '-',
        Number(txn.CreditAmount || 0).toFixed(2),
        customerMap[txn.Debit_id] || '-',
        Number(txn.DebitAmount || 0).toFixed(2),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 125, 50] },
    });
    doc.save('Transactions.pdf');
  };

  const openEdit = (txn) => {
    setEditingTxn({ ...txn });
    setShowEditModal(true);
  };

  // Called by the reusable modal
  const saveEditedTransaction = async (payload) => {
    try {
      const res = await axios.put(
         `/transaction/${payload.Transaction_uuid}`,
        {
          updatedDescription: payload.Description || '',
          updatedAmount: payload.Amount,
          updatedDate: payload.Transaction_date,
          creditAccountId: payload.Credit_id,
          debitAccountId: payload.Debit_id,
        }
      );

      if (res.data?.success) {
        toast.success('Transaction updated successfully');
        setShowEditModal(false);

        // Merge changes locally into original transaction structure
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.Transaction_uuid === payload.Transaction_uuid
              ? {
                  ...txn,
                  Transaction_date: payload.Transaction_date,
                  Description: payload.Description,
                  Journal_entry: (txn.Journal_entry || []).map((e) => {
                    if (String(e.Type || '').toLowerCase() === 'credit') {
                      return { ...e, Account_id: payload.Credit_id, Amount: payload.Amount };
                    }
                    if (String(e.Type || '').toLowerCase() === 'debit') {
                      return { ...e, Account_id: payload.Debit_id, Amount: payload.Amount };
                    }
                    return e;
                  }),
                }
              : txn
          )
        );
      } else {
        toast.error('Unable to update transaction');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to update transaction');
    }
  };

  const deleteTransaction = async (txnId) => {
    try {
      const res = await axios.delete(`/transaction/${txnId}`);
      if (res.data?.success) {
        toast.success('Transaction deleted successfully');
        setTransactions((prev) => prev.filter((txn) => txn.Transaction_uuid !== txnId));
        setSelectedIds((prev) => prev.filter((id) => id !== txnId));
      } else {
        toast.error('Unable to delete transaction');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to delete transaction');
    }
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredEntries.map((t) => t.Transaction_uuid));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const idsToAdd = filteredEntries
        .map((t) => t.Transaction_uuid)
        .filter((id) => !selectedIds.includes(id));
      setSelectedIds((prev) => [...prev, ...idsToAdd]);
    }
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deleteSelectedTransactions = async () => {
    if (selectedIds.length === 0) return;

    try {
      const results = await Promise.allSettled(
        selectedIds.map((id) => axios.delete(`/transaction/${id}`))
      );

      const successCount = results.filter((r) => r.status === 'fulfilled' && r.value?.data?.success).length;
      const failCount = selectedIds.length - successCount;

      if (successCount > 0) {
        setTransactions((prev) => prev.filter((t) => !selectedIds.includes(t.Transaction_uuid)));
        setSelectedIds([]);
        toast.success(`Deleted ${successCount} transaction(s)`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} deletion(s) failed`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to delete selected transactions');
    }
  };

  const requestDelete = (txnId) => {
    setConfirmState({ open: true, mode: 'single', txnId, count: 1 });
  };

  const requestBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({ open: true, mode: 'bulk', txnId: null, count: selectedIds.length });
  };

  const closeConfirmModal = () => {
    setConfirmState({ open: false, mode: null, txnId: null, count: 0 });
  };

  const handleConfirmDelete = async () => {
    if (confirmState.mode === 'single' && confirmState.txnId) {
      await deleteTransaction(confirmState.txnId);
    }
    if (confirmState.mode === 'bulk') {
      await deleteSelectedTransactions();
    }
    closeConfirmModal();
  };

  return (
    <div className="p-4">
      <ToastContainer />

      <div className="mb-4 flex flex-wrap gap-4 justify-between">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search customer or order no"
            className="border p-2 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Export PDF
          </button>

          {userRole === 'Admin User' && (
            <button
              onClick={requestBulkDelete}
              disabled={selectedIds.length === 0}
              className={`px-4 py-2 rounded ${
                selectedIds.length === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-red-700 text-white hover:bg-red-800'
              }`}
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white shadow rounded p-8 flex justify-center">
          <Loader message="Loading transactions..." />
        </div>
      ) : loadError ? (
        <div className="bg-white shadow rounded p-8">
          <EmptyState message={loadError} />
        </div>
      ) : (
        <div className="overflow-auto bg-white shadow rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="px-3 py-2 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                  />
                </th>
                <th onClick={() => handleSort('Transaction_uuid')} className="cursor-pointer px-4 py-2">No</th>
                <th onClick={() => handleSort('Order_number')} className="cursor-pointer px-4 py-2">Order No</th>
                <th onClick={() => handleSort('Transaction_date')} className="cursor-pointer px-4 py-2">Date</th>
                <th onClick={() => handleSort('Credit_id')} className="cursor-pointer px-4 py-2">Credit Name</th>
                <th onClick={() => handleSort('CreditAmount')} className="cursor-pointer px-4 py-2">Credit</th>
                <th onClick={() => handleSort('Debit_id')} className="cursor-pointer px-4 py-2">Debit Name</th>
                <th onClick={() => handleSort('DebitAmount')} className="cursor-pointer px-4 py-2">Debit</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8">
                    <EmptyState
                      message={
                        searchQuery || dateFrom || dateTo
                          ? 'No transactions match the current filters.'
                          : 'No transactions found.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredEntries.map((txn) => (
                  <tr key={txn.Transaction_uuid} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(txn.Transaction_uuid)}
                        onChange={() => toggleRow(txn.Transaction_uuid)}
                      />
                    </td>
                    <td className="px-4 py-2">{txn.Transaction_id}</td>
                    <td className="px-4 py-2">{txn.Order_number || '-'}</td>
                    <td className="px-4 py-2">{formatDate(txn.Transaction_date)}</td>
                    <td className="px-4 py-2">{customerMap[txn.Credit_id] || '-'}</td>
                    <td className="px-4 py-2 text-right text-blue-700">₹{Number(txn.CreditAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2">{customerMap[txn.Debit_id] || '-'}</td>
                    <td className="px-4 py-2 text-right text-red-600">₹{Number(txn.DebitAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      {userRole === 'Admin User' && (
                        <>
                          <button
                            className="text-blue-600 hover:underline mr-2"
                            onClick={() => openEdit(txn)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => requestDelete(txn.Transaction_uuid)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reusable Edit Modal */}
      <TransactionEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={saveEditedTransaction}
        initialData={editingTxn}
        customers={customers}
      />

      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmState.mode === 'bulk' ? 'Delete selected transactions' : 'Delete transaction'}
        message={
          confirmState.mode === 'bulk'
            ? `Are you sure you want to delete ${confirmState.count} selected transaction(s)? This action cannot be undone.`
            : 'Are you sure you want to delete this transaction? This action cannot be undone.'
        }
        onConfirm={handleConfirmDelete}
        onCancel={closeConfirmModal}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClassName="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        cancelButtonClassName="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
        modalClassName="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
        actionsClassName="flex justify-end gap-3 mt-6"
      />
    </div>
  );
};

export default AllTransaction;
