import { format, addDays } from 'date-fns';

export interface Sale {
  id: string;
  date: string;
  clientLastName: string;
  numberOfTours: number;
  managerName: string;
  saleAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  notes: string;
  leadNumber: string;
  fdi: string;
  rank?: number;
  dailyVPG: number;
  isCancelled: boolean;
  saleType: 'DEED' | 'TRUST';
  fdiPoints: number;
  fdiGivenPoints: number;
  fdiCost: number;
}

export type DateRange = 'monthly' | '45day' | '90day' | 'annual';

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  title: string;
}

export interface ReportGroup {
  monthly: ReportPeriod[];
  annual: ReportPeriod[];
  rolling45: ReportPeriod[];
  rolling90: ReportPeriod[];
}

export interface SalesTotals {
  totalTours: number;
  totalVolume: number;
  totalCommission: number;
  activeSales: number;
  cancelledSales: number;
  deedSales: number;
  trustSales: number;
  monthlyVPG: number;
  totalFDIPoints: number;
  totalFDIGivenPoints: number;
  totalFDICost: number;
}

export interface CommissionLevel {
  level: number;
  minAmount: number;
  maxAmount: number;
  additionalCommission: number;
}

export type ManagerName = 
  | 'Lisa'
  | 'Martina'
  | 'Marlene'
  | 'Raymond'
  | 'Kathie'
  | 'Josh'
  | 'Denise'
  | 'Dan';

export const MANAGER_NAMES: ManagerName[] = [
  'Dan',
  'Denise',
  'Josh',
  'Kathie',
  'Lisa',
  'Marlene',
  'Martina',
  'Raymond'
];

export const DEFAULT_COMMISSION_LEVELS: CommissionLevel[] = [
  { level: 1, minAmount: 162500, maxAmount: 243749, additionalCommission: 1 },
  { level: 2, minAmount: 243750, maxAmount: 324999, additionalCommission: 2 },
  { level: 3, minAmount: 325000, maxAmount: 406249, additionalCommission: 3 },
  { level: 4, minAmount: 406250, maxAmount: 487499, additionalCommission: 3.5 },
  { level: 5, minAmount: 487500, maxAmount: 584999, additionalCommission: 4 },
  { level: 6, minAmount: 585000, maxAmount: 682499, additionalCommission: 5 },
  { level: 7, minAmount: 682500, maxAmount: 893749, additionalCommission: 5.5 },
  { level: 8, minAmount: 893750, maxAmount: 999999999, additionalCommission: 6 }
];

export const COMMISSION_LEVELS = [...DEFAULT_COMMISSION_LEVELS];

export const getBaseCommission = (saleAmount: number, saleType: 'DEED' | 'TRUST'): number => {
  if (saleType === 'TRUST') return 6;
  if (saleAmount >= 50000) return 6;
  if (saleAmount >= 20000) return 5;
  return 4;
};

export const getAdditionalCommission = (totalVolume: number): number => {
  const level = COMMISSION_LEVELS.find(
    level => totalVolume >= level.minAmount && totalVolume <= level.maxAmount
  );
  return level ? level.additionalCommission : 0;
};

export const calculateTotalCommission = (saleAmount: number, totalVolume: number, saleType: 'DEED' | 'TRUST'): number => {
  const baseCommission = getBaseCommission(saleAmount, saleType);
  const additionalCommission = getAdditionalCommission(totalVolume);
  return baseCommission + additionalCommission;
};

export const calculateFDIPoints = (saleAmount: number): number => {
  return Math.round(saleAmount * 0.55 * 100) / 100;
};

export const calculateFDICost = (givenPoints: number, allowedPoints: number): number => {
  if (givenPoints <= allowedPoints) return 0;
  const excessPoints = givenPoints - allowedPoints;
  return Math.round(excessPoints * 0.048 * 100) / 100;
};

export const calculateDailyVPG = (saleAmount: number, tours: number): number => {
  if (tours === 0) return 0;
  return Math.round((saleAmount / tours) * 100) / 100;
};

export const calculateMonthlyVPG = (totalVolume: number, totalTours: number): number => {
  if (totalTours === 0) return 0;
  return Math.round((totalVolume / totalTours) * 100) / 100;
};

export const generateReportPeriods = (baseDate: Date = new Date()): ReportGroup => {
  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();

  const monthly = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(currentYear, index);
    return {
      startDate: new Date(currentYear, index, 1),
      endDate: new Date(currentYear, index + 1, 0),
      title: format(date, 'MMMM yyyy')
    };
  });

  const annual = [{
    startDate: new Date(currentYear, 0, 1),
    endDate: new Date(currentYear, 11, 31),
    title: `Annual Report ${currentYear}`
  }];

  const rolling45 = [{
    startDate: baseDate,
    endDate: addDays(baseDate, 45),
    title: `45-Day Rolling (${format(baseDate, 'MM/dd/yyyy')} - ${format(addDays(baseDate, 45), 'MM/dd/yyyy')})`
  }];

  const rolling90 = [{
    startDate: baseDate,
    endDate: addDays(baseDate, 90),
    title: `90-Day Rolling (${format(baseDate, 'MM/dd/yyyy')} - ${format(addDays(baseDate, 90), 'MM/dd/yyyy')})`
  }];

  return {
    monthly,
    annual,
    rolling45,
    rolling90
  };
};