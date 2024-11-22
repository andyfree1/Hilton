import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { Sale, SalesTotals } from '../types/sales';

interface SalesTableProps {
  sales: Sale[];
  totals: SalesTotals;
  onEditSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onEditNote: (id: string) => void;
  onToggleCancel: (id: string) => void;
}

export default function SalesTable({ 
  sales, 
  totals, 
  onEditSale,
  onDeleteSale,
  onEditNote,
  onToggleCancel
}: SalesTableProps) {
  const formatCurrency = (amount: number) => {
    const roundedAmount = Math.round(amount * 100) / 100;
    return roundedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead #</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Amount</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission %</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission $</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily VPG</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FDI Given</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FDI Available</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">FDI Cost</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className={`hover:bg-gray-50 ${sale.isCancelled ? 'bg-red-50' : ''}`}>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleCancel(sale.id)}
                  className={`${
                    sale.isCancelled 
                      ? 'text-red-600 hover:text-red-900' 
                      : 'text-green-600 hover:text-green-900'
                  }`}
                >
                  {sale.isCancelled ? <XCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </button>
              </td>
              <td className="px-4 py-3 text-sm font-medium">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  sale.saleType === 'DEED' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {sale.saleType}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{formatDate(sale.date)}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{sale.clientLastName}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{sale.leadNumber}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{sale.managerName}</td>
              <td className="px-4 py-3 text-sm text-gray-900">${formatCurrency(sale.saleAmount)}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{sale.commissionPercentage.toFixed(2)}%</td>
              <td className="px-4 py-3 text-sm text-gray-900">${formatCurrency(sale.commissionAmount)}</td>
              <td className="px-4 py-3 text-sm text-gray-900">${formatCurrency(sale.dailyVPG)}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(sale.fdiGivenPoints)}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(sale.fdiPoints)}</td>
              <td className={`px-4 py-3 text-sm ${sale.fdiCost > 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                ${formatCurrency(sale.fdiCost)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                <button
                  onClick={() => onEditNote(sale.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {sale.notes || 'Add note...'}
                </button>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditSale(sale)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteSale(sale.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-semibold">
          <tr>
            <td colSpan={6} className="px-4 py-3 text-sm text-gray-900">Totals</td>
            <td className="px-4 py-3 text-sm text-gray-900">${formatCurrency(totals.totalVolume)}</td>
            <td></td>
            <td className="px-4 py-3 text-sm text-gray-900">${formatCurrency(totals.totalCommission)}</td>
            <td className="px-4 py-3 text-sm text-gray-900">${formatCurrency(totals.monthlyVPG)}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(totals.totalFDIGivenPoints)}</td>
            <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(totals.totalFDIPoints)}</td>
            <td className={`px-4 py-3 text-sm ${totals.totalFDICost > 0 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
              ${formatCurrency(totals.totalFDICost)}
            </td>
            <td colSpan={2}></td>
          </tr>
          <tr>
            <td colSpan={15} className="px-4 py-3 text-sm text-gray-900">
              <div className="flex space-x-6">
                <span>Total Tours: {totals.totalTours}</span>
                <span>Active Sales: {totals.activeSales}</span>
                <span>Cancelled Sales: {totals.cancelledSales}</span>
                <span>DEED Sales: {totals.deedSales}</span>
                <span>TRUST Sales: {totals.trustSales}</span>
                <span>Monthly VPG: ${formatCurrency(totals.monthlyVPG)}</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}