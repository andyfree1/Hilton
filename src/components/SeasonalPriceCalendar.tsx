import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, DollarSign, Info } from 'lucide-react';
import { format, isWeekend, parseISO, isSameDay, differenceInDays, addDays, isWithinInterval } from 'date-fns';
import { SEASONAL_PRICING, HOLIDAYS, PRICING_FEES, SeasonalPricing, PricingFees } from '../types/sales';

interface SeasonalPriceCalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

interface DailyRate {
  date: Date;
  basePrice: number;
  adjustedPrice: number;
  season: string;
  isWeekend: boolean;
  isHoliday: boolean;
  fees: {
    name: string;
    amount: number;
  }[];
  totalWithFees: number;
}

interface PricingSummary {
  subtotal: number;
  taxes: number;
  fees: {
    name: string;
    amount: number;
  }[];
  total: number;
}

export default function SeasonalPriceCalendar({ selectedDate, onDateChange }: SeasonalPriceCalendarProps) {
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [checkOutDate, setCheckOutDate] = useState(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
  const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
  const [pricingSummary, setPricingSummary] = useState<PricingSummary>({
    subtotal: 0,
    taxes: 0,
    fees: [],
    total: 0
  });

  const getSeasonalPricing = (date: Date): SeasonalPricing | undefined => {
    return SEASONAL_PRICING.find(season => {
      const start = new Date(season.startDate);
      const end = new Date(season.endDate);
      return isWithinInterval(date, { start, end });
    });
  };

  const calculateDailyFees = (basePrice: number, isNightly: boolean): { name: string; amount: number }[] => {
    return PRICING_FEES
      .filter(fee => fee.appliedPer === (isNightly ? 'night' : 'stay'))
      .map(fee => ({
        name: fee.name,
        amount: fee.type === 'percentage' ? (basePrice * fee.amount) / 100 : fee.amount
      }));
  };

  const calculateDailyPrice = (date: Date): DailyRate => {
    const pricing = getSeasonalPricing(date);
    if (!pricing) {
      return {
        date,
        basePrice: 0,
        adjustedPrice: 0,
        season: 'Unknown',
        isWeekend: false,
        isHoliday: false,
        fees: [],
        totalWithFees: 0
      };
    }

    const isHolidayDate = HOLIDAYS.some(holiday => isSameDay(parseISO(holiday), date));
    const isWeekendDate = isWeekend(date);
    let finalPrice = pricing.basePrice;

    if (isWeekendDate) {
      finalPrice *= pricing.weekendMultiplier;
    }
    if (isHolidayDate) {
      finalPrice *= pricing.holidayMultiplier;
    }

    const dailyFees = calculateDailyFees(finalPrice, true);
    const totalWithFees = finalPrice + dailyFees.reduce((sum, fee) => sum + fee.amount, 0);

    return {
      date,
      basePrice: pricing.basePrice,
      adjustedPrice: Math.round(finalPrice),
      season: pricing.season,
      isWeekend: isWeekendDate,
      isHoliday: isHolidayDate,
      fees: dailyFees,
      totalWithFees: Math.round(totalWithFees)
    };
  };

  const calculatePricingSummary = (rates: DailyRate[]) => {
    const subtotal = rates.reduce((sum, rate) => sum + rate.adjustedPrice, 0);
    const stayFees = calculateDailyFees(subtotal, false);
    
    const taxes = rates.reduce((sum, rate) => {
      const taxFees = rate.fees.filter(fee => fee.name.includes('Tax'));
      return sum + taxFees.reduce((taxSum, tax) => taxSum + tax.amount, 0);
    }, 0);

    const fees = [
      ...stayFees,
      ...rates.reduce((acc, rate) => {
        const nonTaxFees = rate.fees.filter(fee => !fee.name.includes('Tax'));
        return [...acc, ...nonTaxFees];
      }, [] as { name: string; amount: number }[])
    ];

    const total = subtotal + taxes + fees.reduce((sum, fee) => sum + fee.amount, 0);

    setPricingSummary({
      subtotal,
      taxes,
      fees,
      total
    });
  };

  useEffect(() => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(checkOutDate);
    const days = differenceInDays(endDate, startDate);
    
    if (days <= 0) {
      setCheckOutDate(format(addDays(startDate, 1), 'yyyy-MM-dd'));
      return;
    }

    const rates: DailyRate[] = [];
    for (let i = 0; i < days; i++) {
      const currentDate = addDays(startDate, i);
      rates.push(calculateDailyPrice(currentDate));
    }
    setDailyRates(rates);
    calculatePricingSummary(rates);
  }, [selectedDate, checkOutDate]);

  const getSeasonClass = (season: string) => {
    switch (season) {
      case 'Value':
        return 'bg-blue-100 text-blue-800';
      case 'Peak':
        return 'bg-amber-100 text-amber-800';
      case 'Holiday':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CalendarIcon className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold">Seasonal Pricing</h2>
        </div>
        {dailyRates[0] && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeasonClass(dailyRates[0].season)}`}>
            {dailyRates[0].season} Season
          </span>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
            <input
              type="date"
              value={checkOutDate}
              min={format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd')}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                ${pricingSummary.total} total
              </div>
              <div className="text-sm text-gray-500">
                ${Math.round(pricingSummary.total / dailyRates.length)}/night avg · {dailyRates.length} night{dailyRates.length !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={() => setShowPriceDetails(!showPriceDetails)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DollarSign className="h-4 w-4 mr-1" />
              {showPriceDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          {showPriceDetails && (
            <div className="space-y-4">
              <div className="border-t border-gray-200 pt-4">
                {dailyRates.map((rate, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        {format(rate.date, 'EEE, MMM d, yyyy')}
                      </span>
                      <span className="font-semibold">${rate.totalWithFees}</span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Base rate</span>
                        <span>${rate.basePrice}</span>
                      </div>
                      {rate.isWeekend && (
                        <div className="flex justify-between text-amber-600">
                          <span>Weekend pricing</span>
                          <span>+${rate.adjustedPrice - rate.basePrice}</span>
                        </div>
                      )}
                      {rate.isHoliday && (
                        <div className="flex justify-between text-red-600">
                          <span>Holiday pricing</span>
                          <span>+${rate.adjustedPrice - (rate.isWeekend ? rate.basePrice * 1.25 : rate.basePrice)}</span>
                        </div>
                      )}
                      {rate.fees.map((fee, feeIndex) => (
                        <div key={feeIndex} className="flex justify-between text-gray-600">
                          <span>{fee.name}</span>
                          <span>+${fee.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${pricingSummary.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxes</span>
                  <span>${pricingSummary.taxes.toFixed(2)}</span>
                </div>
                {pricingSummary.fees.map((fee, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{fee.name}</span>
                    <span>${fee.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-base pt-2 border-t">
                  <span>Total ({dailyRates.length} nights)</span>
                  <span>${pricingSummary.total}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <span className="block text-sm text-blue-600 font-medium">Value Season</span>
            <span className="text-xs text-blue-500">From $299/night</span>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <span className="block text-sm text-amber-600 font-medium">Peak Season</span>
            <span className="text-xs text-amber-500">From $399/night</span>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <span className="block text-sm text-red-600 font-medium">Holiday Season</span>
            <span className="text-xs text-red-500">From $499/night</span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Pricing Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Weekend rates apply Friday & Saturday (+25-50%)</li>
                <li>Holiday rates apply to major holidays (+50-100%)</li>
                <li>Daily resort fee of $35 includes amenities access</li>
                <li>One-time cleaning fee of $150 per stay</li>
                <li>State tax (6.5%) and local tax (5%) apply to room rate</li>
                <li>Service fee (3%) applies to total booking</li>
                <li>Rates vary by season (Value, Peak, Holiday)</li>
                <li>Minimum stay may apply during peak periods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}