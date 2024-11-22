import React from 'react';
import { DollarSign, Users, Percent, Target } from 'lucide-react';
import type { SalesTotals } from '../types/sales';

const formatCurrency = (amount: number, showDecimals: boolean = true) => {
  const roundedAmount = Math.round(amount);
  return roundedAmount.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });
};

export default function SalesMetrics({
  totalTours,
  totalVolume,
  totalCommission,
  activeSales,
  cancelledSales,
  deedSales,
  trustSales,
  monthlyVPG,
  totalFDIPoints,
  totalFDIGivenPoints,
  totalFDICost
}: SalesTotals) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="hilton-card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Users className="h-6 w-6 text-[#002C51]" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h3 className="hilton-heading text-base">Tours</h3>
            <p className="text-xl font-semibold text-[#002C51] mt-1 tabular-nums truncate">
              {totalTours.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      <div className="hilton-card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <DollarSign className="h-6 w-6 text-[#002C51]" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h3 className="hilton-heading text-base">Volume</h3>
            <p className="text-xl font-semibold text-[#002C51] mt-1 tabular-nums truncate">
              ${formatCurrency(totalVolume, false)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="hilton-card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Target className="h-6 w-6 text-[#002C51]" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h3 className="hilton-heading text-base">Daily VPG</h3>
            <p className="text-xl font-semibold text-[#002C51] mt-1 tabular-nums truncate">
              ${formatCurrency(monthlyVPG, false)}
            </p>
          </div>
        </div>
      </div>

      <div className="hilton-card p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Percent className="h-6 w-6 text-[#002C51]" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <h3 className="hilton-heading text-base">Commission</h3>
            <p className="text-xl font-semibold text-[#002C51] mt-1 tabular-nums truncate">
              ${formatCurrency(totalCommission, true)}
            </p>
          </div>
        </div>
      </div>

      <div className="col-span-4 hilton-card p-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="block text-sm text-gray-600 mb-1">Active Sales</span>
            <p className="text-lg font-semibold text-[#002C51] tabular-nums truncate">
              {activeSales.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="block text-sm text-gray-600 mb-1">Cancelled</span>
            <p className="text-lg font-semibold text-red-600 tabular-nums truncate">
              {cancelledSales.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="block text-sm text-gray-600 mb-1">DEED Sales</span>
            <p className="text-lg font-semibold text-[#002C51] tabular-nums truncate">
              {deedSales.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="block text-sm text-gray-600 mb-1">TRUST Sales</span>
            <p className="text-lg font-semibold text-[#002C51] tabular-nums truncate">
              {trustSales.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <span className="block text-sm text-gray-600 mb-1">Monthly VPG</span>
            <p className="text-lg font-semibold text-[#002C51] tabular-nums truncate">
              ${formatCurrency(monthlyVPG, false)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}