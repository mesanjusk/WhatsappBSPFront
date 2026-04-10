import React, { useEffect, useState } from 'react';
import axios from '../apiClient.js';
import * as XLSX from 'xlsx';

const CashLedger = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState('All');
    const [openingBalance, setOpeningBalance] = useState(0);
    const [closingBalance, setClosingBalance] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    const [totalDebit, setTotalDebit] = useState(0);
    const [loading, setLoading] = useState(true);

    const todayStr = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('/transaction');
                if (response.data.success) {
                    const allTransactions = response.data.result || [];
                    const safeTransactions = allTransactions.filter(txn => Array.isArray(txn.Journal_entry));
                    setTransactions(safeTransactions);
                    extractAccountOptions(safeTransactions);
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    useEffect(() => {
        processBalances(transactions, startDate, endDate, selectedAccount);
    }, [transactions, startDate, endDate, selectedAccount]);

    const extractAccountOptions = (data) => {
        const flat = data.flatMap(txn =>
            (txn.Journal_entry || []).map(entry => entry.Account || '')
        );
        const unique = Array.from(new Set(flat)).filter(Boolean);
        setAccountOptions(unique);
    };

    const toFixed = (num) => Number((num || 0).toFixed(2));

    const isInRange = (d, start, end) => {
        const date = new Date(d);
        return date >= new Date(start) && date <= new Date(end);
    };

    const processBalances = (all, startStr, endStr, account) => {
        const flatEntries = all.flatMap(txn =>
            (txn.Journal_entry || []).map(entry => ({
                ...entry,
                Transaction_date: txn.Transaction_date,
                Description: txn.Description
            }))
        );

        const filteredByAccount = account === 'All'
            ? flatEntries
            : flatEntries.filter(entry => entry.Account === account);

        const start = new Date(startStr);
        const end = new Date(endStr);
        const dayBeforeStart = new Date(start);
        dayBeforeStart.setDate(dayBeforeStart.getDate() - 1);

        let prevCredits = 0, prevDebits = 0, rangeCredits = 0, rangeDebits = 0;
        const entriesInRange = [];

        filteredByAccount.forEach(entry => {
            const date = new Date(entry.Transaction_date);

            if (date <= dayBeforeStart) {
                if (entry.Type === 'Credit') prevCredits += entry.Amount || 0;
                if (entry.Type === 'Debit') prevDebits += entry.Amount || 0;
            }

            if (isInRange(date, start, end)) {
                if (entry.Type === 'Credit') rangeCredits += entry.Amount || 0;
                if (entry.Type === 'Debit') rangeDebits += entry.Amount || 0;
                entriesInRange.push(entry);
            }
        });

        const opening = toFixed(prevCredits - prevDebits);
        const closing = toFixed(opening + (rangeCredits - rangeDebits));

        setOpeningBalance(opening);
        setClosingBalance(closing);
        setFilteredEntries(entriesInRange);
        setTotalCredit(toFixed(rangeCredits));
        setTotalDebit(toFixed(rangeDebits));
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet([
            { Header: 'Cash Ledger Export', Date: '', Description: '', Account: '', Credit: '', Debit: '' },
            ...filteredEntries.map(entry => ({
                Date: new Date(entry.Transaction_date).toLocaleDateString(),
                Description: entry.Description,
                Account: entry.Account,
                Credit: entry.Type === 'Credit' ? entry.Amount : '',
                Debit: entry.Type === 'Debit' ? entry.Amount : ''
            }))
        ]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, worksheet, 'Cash Ledger');
        XLSX.writeFile(wb, `CashLedger_${startDate}_to_${endDate}.xlsx`);
    };

    const handlePrint = () => window.print();

    const resetFilters = () => {
        setStartDate(todayStr);
        setEndDate(todayStr);
        setSelectedAccount('All');
    };

    return (
        <>
            <div className="p-4 print:p-0">
                <h2 className="text-2xl font-bold mb-4 print:text-xl">Cash Ledger</h2>

                <div className="bg-white shadow p-4 rounded mb-6 print:shadow-none print:border print:rounded-none">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block font-semibold mb-1">Start Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={todayStr}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                max={todayStr}
                                min={startDate}
                                className="border p-2 rounded w-full"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Account</label>
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="border p-2 rounded w-full"
                            >
                                <option>All</option>
                                {accountOptions.map((acc, idx) => (
                                    <option key={idx} value={acc}>{acc}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button onClick={exportToExcel} className="bg-blue-600 text-white px-4 py-2 rounded">Export</button>
                            <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded">Print</button>
                            <button onClick={resetFilters} className="bg-gray-600 text-white px-4 py-2 rounded">Reset</button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-gray-500 text-center py-10">Loading transactions...</p>
                    ) : (
                        <>
                            <div className="mb-4 space-y-1 print:text-sm">
                                <p><strong>Opening Balance:</strong> ₹{openingBalance}</p>
                                <p><strong>Total Credit:</strong> ₹{totalCredit}</p>
                                <p><strong>Total Debit:</strong> ₹{totalDebit}</p>
                                <p><strong>Closing Balance:</strong> ₹{closingBalance}</p>
                                <p className="text-sm text-gray-500">Showing {filteredEntries.length} entries</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto border-collapse border border-gray-300 print:text-xs">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border px-4 py-2">Date</th>
                                            <th className="border px-4 py-2">Description</th>
                                            <th className="border px-4 py-2">Account</th>
                                            <th className="border px-4 py-2">Credit</th>
                                            <th className="border px-4 py-2">Debit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEntries.length > 0 ? filteredEntries.map((entry, idx) => (
                                            <tr key={idx} className="border hover:bg-gray-50">
                                                <td className="border px-4 py-2">{new Date(entry.Transaction_date).toLocaleDateString()}</td>
                                                <td className="border px-4 py-2">{entry.Description}</td>
                                                <td className="border px-4 py-2">{entry.Account}</td>
                                                <td className="border px-4 py-2 text-blue-600">
                                                    {entry.Type === 'Credit' ? entry.Amount : ''}
                                                </td>
                                                <td className="border px-4 py-2 text-red-600">
                                                    {entry.Type === 'Debit' ? entry.Amount : ''}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-4 text-gray-600">No transactions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CashLedger;
