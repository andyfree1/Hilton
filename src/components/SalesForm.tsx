import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Sale, ManagerName } from '../types/sales';
import { calculateTotalCommission, calculateFDIPoints, calculateFDICost, calculateDailyVPG, MANAGER_NAMES } from '../types/sales';

interface SalesFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sale: Omit<Sale, 'id'>) => void;
  editingSale?: Sale;
  currentTotalVolume: number;
  selectedPeriod?: { startDate: Date; endDate: Date };
}

const initialFormData = {
  date: new Date().toISOString().split('T')[0],
  clientLastName: '',
  leadNumber: '',
  numberOfTours: 0,
  managerName: 'Lisa' as ManagerName,
  saleAmount: '',
  commissionPercentage: '',
  commissionAmount: '',
  fdi: '',
  fdiPoints: 0,
  fdiGivenPoints: 0,
  fdiCost: 0,
  notes: '',
  saleType: 'DEED' as const,
  isCancelled: false,
  pointsInfo: {
    existingTrustPoints: 0,
    newTrustPoints: 0
  }
};

export default function SalesForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingSale,
  currentTotalVolume,
  selectedPeriod
}: SalesFormProps) {
  const [formData, setFormData] = useState(initialFormData);
  const [isNoSale, setIsNoSale] = useState(false);

  useEffect(() => {
    if (selectedPeriod && !editingSale) {
      setFormData(prev => ({
        ...prev,
        date: selectedPeriod.startDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (editingSale) {
      setFormData({
        ...editingSale,
        saleAmount: editingSale.saleAmount.toString(),
        commissionPercentage: editingSale.commissionPercentage.toString(),
        commissionAmount: editingSale.commissionAmount.toString(),
        fdi: editingSale.fdiGivenPoints.toString()
      });
      setIsNoSale(editingSale.clientLastName === 'NO SALE');
    } else {
      setFormData({
        ...initialFormData,
        date: selectedPeriod ? selectedPeriod.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setIsNoSale(false);
    }
  }, [editingSale, selectedPeriod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const saleData: Omit<Sale, 'id'> = {
        projectId: 1, // Default project ID
        date: formData.date,
        clientLastName: isNoSale ? 'NO SALE' : formData.clientLastName,
        leadNumber: formData.leadNumber,
        numberOfTours: formData.numberOfTours,
        managerName: formData.managerName,
        saleAmount: isNoSale ? 0 : (parseFloat(formData.saleAmount) || 0),
        commissionPercentage: isNoSale ? 0 : calculateTotalCommission(parseFloat(formData.saleAmount) || 0, currentTotalVolume, formData.saleType),
        commissionAmount: isNoSale ? 0 : (parseFloat(formData.commissionAmount) || 0),
        fdiPoints: isNoSale ? 0 : calculateFDIPoints(parseFloat(formData.saleAmount) || 0),
        fdiGivenPoints: isNoSale ? 0 : (parseFloat(formData.fdi) || 0),
        fdiCost: isNoSale ? 0 : calculateFDICost(parseFloat(formData.fdi) || 0, calculateFDIPoints(parseFloat(formData.saleAmount) || 0)),
        dailyVPG: isNoSale ? 0 : calculateDailyVPG(parseFloat(formData.saleAmount) || 0, formData.numberOfTours),
        notes: formData.notes,
        saleType: formData.saleType,
        isCancelled: formData.isCancelled,
        rank: 0,
        pointsInfo: formData.pointsInfo
      };

      onSubmit(saleData);
      setFormData({
        ...initialFormData,
        date: selectedPeriod ? selectedPeriod.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
      setIsNoSale(false);
      onClose();
    } catch (error) {
      console.error('Failed to save sale:', error);
      alert('Failed to save sale. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{editingSale ? 'Edit Entry' : 'Add New Entry'}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Tours</label>
              <input
                type="number"
                required
                min="0"
                value={formData.numberOfTours}
                onChange={(e) => setFormData({ ...formData, numberOfTours: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manager (T.O.)</label>
              <select
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value as ManagerName })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
              >
                {MANAGER_NAMES.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Entry Type</label>
              <select
                value={isNoSale ? 'no-sale' : 'sale'}
                onChange={(e) => setIsNoSale(e.target.value === 'no-sale')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
              >
                <option value="sale">Sale</option>
                <option value="no-sale">No Sale</option>
              </select>
            </div>

            {!isNoSale && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Last Name</label>
                  <input
                    type="text"
                    required={!isNoSale}
                    value={formData.clientLastName}
                    onChange={(e) => setFormData({ ...formData, clientLastName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Lead Number</label>
                  <input
                    type="text"
                    required={!isNoSale}
                    value={formData.leadNumber}
                    onChange={(e) => setFormData({ ...formData, leadNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sale Amount</label>
                  <input
                    type="number"
                    required={!isNoSale}
                    min="0"
                    step="0.01"
                    value={formData.saleAmount}
                    onChange={(e) => {
                      const saleAmount = parseFloat(e.target.value) || 0;
                      const totalCommissionPercentage = calculateTotalCommission(saleAmount, currentTotalVolume, formData.saleType);
                      const commissionAmount = Math.round(saleAmount * (totalCommissionPercentage / 100) * 100) / 100;
                      const fdiPoints = calculateFDIPoints(saleAmount);
                      
                      setFormData({
                        ...formData,
                        saleAmount: e.target.value,
                        commissionPercentage: totalCommissionPercentage.toString(),
                        commissionAmount: commissionAmount.toString(),
                        fdiPoints
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Sale Type</label>
                  <select
                    value={formData.saleType}
                    onChange={(e) => setFormData({ ...formData, saleType: e.target.value as 'DEED' | 'TRUST' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                  >
                    <option value="DEED">DEED</option>
                    <option value="TRUST">TRUST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">FDI Points Given</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.fdi}
                    onChange={(e) => {
                      const fdiGivenPoints = parseFloat(e.target.value) || 0;
                      const fdiCost = calculateFDICost(fdiGivenPoints, formData.fdiPoints);
                      setFormData({
                        ...formData,
                        fdi: e.target.value,
                        fdiGivenPoints,
                        fdiCost
                      });
                    }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">FDI Points Available</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.fdiPoints.toFixed(2)}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">FDI Cost</label>
                  <input
                    type="text"
                    readOnly
                    value={`$${formData.fdiCost.toFixed(2)}`}
                    className={`mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm ${
                      formData.fdiCost > 0 ? 'text-red-600 font-medium' : ''
                    }`}
                  />
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002C51]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-[#002C51] border border-transparent rounded-md shadow-sm hover:bg-[#003666] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002C51]"
            >
              {editingSale ? 'Update' : 'Add'} Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}