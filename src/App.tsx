import React, { useState, useMemo } from 'react';
import type { Sale, DateRange, ReportPeriod } from './types/sales';
import { calculateMonthlyVPG, generateReportPeriods } from './types/sales';
import SalesTable from './components/SalesTable';
import DateRangeSelector from './components/DateRangeSelector';
import SalesMetrics from './components/SalesMetrics';
import CommissionLevels from './components/CommissionLevels';
import SalesForm from './components/SalesForm';
import ExportButton from './components/ExportButton';
import Header from './components/Header';
import { PlusCircle } from 'lucide-react';
import { db } from './db/database';
import { useLiveQuery } from 'dexie-react-hooks';

function App() {
  const [dateRange, setDateRange] = useState<DateRange>('monthly');
  const [customStartDate, setCustomStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | undefined>();
  
  const reportGroups = useMemo(() => generateReportPeriods(new Date()), []);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>(reportGroups.monthly[new Date().getMonth()]);

  // Restore last selected period from localStorage
  React.useEffect(() => {
    const lastPeriod = localStorage.getItem('lastSelectedPeriod');
    if (lastPeriod) {
      const period = reportGroups.monthly.find(p => p.title === lastPeriod);
      if (period) {
        setSelectedPeriod(period);
      }
    }
  }, []);

  const sales = useLiveQuery(() => db.sales.toArray()) || [];
  
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= selectedPeriod.startDate && saleDate <= selectedPeriod.endDate;
    });
  }, [sales, selectedPeriod]);

  const handleRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    switch (newRange) {
      case 'monthly':
        setSelectedPeriod(reportGroups.monthly[new Date().getMonth()]);
        break;
      case 'annual':
        setSelectedPeriod(reportGroups.annual[0]);
        break;
      case '45day':
        setSelectedPeriod(reportGroups.rolling45[0]);
        break;
      case '90day':
        setSelectedPeriod(reportGroups.rolling90[0]);
        break;
    }
  };

  const activeSales = filteredSales.filter(sale => !sale.isCancelled);
  const cancelledSales = filteredSales.filter(sale => sale.isCancelled);
  
  const totals = activeSales.reduce(
    (acc, sale) => ({
      totalTours: acc.totalTours + (sale.numberOfTours || 0),
      totalVolume: acc.totalVolume + sale.saleAmount,
      totalCommission: acc.totalCommission + sale.commissionAmount,
      activeSales: acc.activeSales + 1,
      cancelledSales: acc.cancelledSales,
      deedSales: acc.deedSales + (sale.saleType === 'DEED' ? 1 : 0),
      trustSales: acc.trustSales + (sale.saleType === 'TRUST' ? 1 : 0),
      monthlyVPG: calculateMonthlyVPG(acc.totalVolume + sale.saleAmount, acc.totalTours + (sale.numberOfTours || 0)),
      totalFDIPoints: acc.totalFDIPoints + sale.fdiPoints,
      totalFDIGivenPoints: acc.totalFDIGivenPoints + sale.fdiGivenPoints,
      totalFDICost: acc.totalFDICost + sale.fdiCost
    }),
    { 
      totalTours: 0, 
      totalVolume: 0, 
      totalCommission: 0,
      activeSales: 0,
      cancelledSales: cancelledSales.length,
      deedSales: 0,
      trustSales: 0,
      monthlyVPG: 0,
      totalFDIPoints: 0,
      totalFDIGivenPoints: 0,
      totalFDICost: 0
    }
  );

  const handleAddSale = async (saleData: Omit<Sale, 'id'>) => {
    try {
      await db.sales.add(saleData as Sale);
      setIsFormOpen(false);
      setEditingSale(undefined);
    } catch (error) {
      console.error('Failed to add sale:', error);
      alert('Failed to add sale. Please try again.');
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setIsFormOpen(true);
  };

  const handleDeleteSale = async (id: string) => {
    if (confirm('Are you sure you want to delete this sale?')) {
      try {
        await db.sales.delete(id);
      } catch (error) {
        console.error('Failed to delete sale:', error);
        alert('Failed to delete sale. Please try again.');
      }
    }
  };

  const handleToggleCancel = async (id: string) => {
    try {
      const sale = await db.sales.get(id);
      if (sale) {
        await db.sales.update(id, { isCancelled: !sale.isCancelled });
      }
    } catch (error) {
      console.error('Failed to toggle sale status:', error);
      alert('Failed to update sale status. Please try again.');
    }
  };

  const handleEditNote = async (id: string) => {
    try {
      const sale = await db.sales.get(id);
      if (sale) {
        const newNote = prompt('Enter new note:', sale.notes);
        if (newNote !== null) {
          await db.sales.update(id, { notes: newNote });
        }
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <ExportButton sales={filteredSales} totals={totals} />
              <button 
                onClick={() => {
                  setEditingSale(undefined);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#002C51] hover:bg-[#003666] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#002C51]"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Add New Entry
              </button>
            </div>
          </div>

          <DateRangeSelector
            selectedRange={dateRange}
            onRangeChange={handleRangeChange}
            customStartDate={customStartDate}
            onCustomStartDateChange={setCustomStartDate}
            reportPeriods={
              dateRange === 'monthly' ? reportGroups.monthly :
              dateRange === 'annual' ? reportGroups.annual :
              dateRange === '45day' ? reportGroups.rolling45 :
              reportGroups.rolling90
            }
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <SalesMetrics {...totals} />
            </div>
            <div>
              <CommissionLevels currentVolume={totals.totalVolume} projectId={1} />
            </div>
          </div>

          <SalesTable
            sales={filteredSales}
            totals={totals}
            onEditSale={handleEditSale}
            onDeleteSale={handleDeleteSale}
            onEditNote={handleEditNote}
            onToggleCancel={handleToggleCancel}
          />

          <SalesForm
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setEditingSale(undefined);
            }}
            onSubmit={handleAddSale}
            editingSale={editingSale}
            currentTotalVolume={totals.totalVolume}
            selectedPeriod={selectedPeriod}
          />
        </div>
      </div>
    </div>
  );
}

export default App;