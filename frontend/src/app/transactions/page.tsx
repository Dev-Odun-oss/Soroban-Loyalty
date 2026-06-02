"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { api, Reward } from "@/lib/api";
import { ExportService, Transaction, DateRange } from "@/lib/export";

export default function TransactionsPage() {
  const { publicKey } = useWallet();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [isPrintView, setIsPrintView] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    api.getUserRewards(publicKey).then((r) => {
      setRewards(r.rewards);
      // Convert rewards to transactions
      const txs: Transaction[] = r.rewards.map(reward => ({
        date: reward.claimed_at,
        campaignName: `Campaign #${reward.campaign_id}`,
        action: reward.redeemed ? 'redeem' : 'claim',
        amount: reward.redeemed ? reward.redeemed_amount : reward.amount,
        transactionHash: reward.id // Using reward ID as placeholder for tx hash
      }));
      setTransactions(txs);
    }).catch(console.error);
  }, [publicKey]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const range = startDate && endDate ? {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      } : undefined;
      
      await ExportService.exportToCSV(transactions, range);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    setIsPrintView(true);
    setTimeout(() => {
      window.print();
      setIsPrintView(false);
    }, 100);
  };

  const applyDateFilter = () => {
    if (startDate && endDate) {
      setDateRange({
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    } else {
      setDateRange(undefined);
    }
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setDateRange(undefined);
  };

  const filteredTransactions = dateRange 
    ? ExportService.filterByDateRange(transactions, dateRange)
    : transactions;

  if (!publicKey) {
    return (
      <div>
        <h1 className="page-title">Transaction History</h1>
        <div className="alert alert-error">Connect your Freighter wallet to view transaction history.</div>
      </div>
    );
  }

  return (
    <div className={isPrintView ? 'print-view' : ''}>
      <h1 className="page-title">Transaction History</h1>

      <div className="no-print" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: '1', minWidth: '200px' }}>
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <button onClick={applyDateFilter} className="btn btn-secondary">
              Apply Filter
            </button>
            <button onClick={clearDateFilter} className="btn btn-outline">
              Clear
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleExport} 
            disabled={exporting || filteredTransactions.length === 0}
            className="btn btn-primary"
          >
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </button>
          <button 
            onClick={handlePrint}
            disabled={filteredTransactions.length === 0}
            className="btn btn-secondary"
          >
            Print View
          </button>
        </div>
      </div>

      {dateRange && (
        <div className="alert alert-success no-print" style={{ marginBottom: '16px' }}>
          Showing transactions from {dateRange.startDate.toLocaleDateString()} to {dateRange.endDate.toLocaleDateString()}
        </div>
      )}

      {filteredTransactions.length === 0 ? (
        <p className="empty-state">No transactions found.</p>
      ) : (
        <div className="transaction-table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Campaign</th>
                <th>Action</th>
                <th>Amount</th>
                <th className="no-print">Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, index) => (
                <tr key={index}>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td>{tx.campaignName}</td>
                  <td>
                    <span className={`badge ${tx.action === 'claim' ? 'badge-claim' : 'badge-redeem'}`}>
                      {tx.action}
                    </span>
                  </td>
                  <td>{tx.amount.toLocaleString()} LYT</td>
                  <td className="no-print mono" style={{ fontSize: '0.85rem' }}>
                    {tx.transactionHash.slice(0, 12)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <div style={{ marginTop: '16px', color: '#64748b', fontSize: '0.875rem' }}>
          Total transactions: {filteredTransactions.length}
        </div>
      )}
    </div>
  );
}
