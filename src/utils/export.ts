import { Sale, SalesTotals } from '../types/sales';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const createAdvancedExcelTemplate = (includeData: boolean = false, sales: Sale[] = [], totals: SalesTotals | null = null): void => {
  const workbook = XLSX.utils.book_new();
  
  // Dashboard Sheet
  const dashboardWs = XLSX.utils.aoa_to_sheet([
    ['Hilton Sales Performance Dashboard'],
    [''],
    ['Performance Metrics', '', 'Quick Stats'],
    ['Total Volume:', '=SUM(SalesLog!F2:F1000)', 'Active Sales:', '=COUNTIF(SalesLog!N2:N1000,"Active")'],
    ['Total Tours:', '=SUM(SalesLog!D2:D1000)', 'Cancelled Sales:', '=COUNTIF(SalesLog!N2:N1000,"Cancelled")'],
    ['Monthly VPG:', '=IF(B5=0,0,B4/B5)', 'DEED Sales:', '=COUNTIF(SalesLog!M2:M1000,"DEED")'],
    ['Total Commission:', '=SUM(SalesLog!H2:H1000)', 'TRUST Sales:', '=COUNTIF(SalesLog!M2:M1000,"TRUST")'],
    [''],
    ['FDI Summary'],
    ['Total FDI Points:', '=SUM(SalesLog!J2:J1000)'],
    ['Total FDI Given:', '=SUM(SalesLog!K2:K1000)'],
    ['Total FDI Cost:', '=SUM(SalesLog!L2:L1000)'],
  ]);

  // Style the dashboard
  dashboardWs['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Title merge
  ];

  // Sales Log Sheet
  const salesHeaders = [
    'Date',
    'Client Name',
    'Lead Number',
    'Number of Tours',
    'Manager',
    'Sale Amount',
    'Commission %',
    'Commission Amount',
    'Daily VPG',
    'FDI Points',
    'FDI Given',
    'FDI Cost',
    'Sale Type',
    'Status',
    'Notes'
  ];

  // Create the sales worksheet with formulas
  const salesWs = XLSX.utils.aoa_to_sheet([
    salesHeaders,
    [
      format(new Date(), 'MM/dd/yyyy'),
      '',
      '',
      '0',
      '',
      '0',
      '=IF(F2>=50000,6,IF(F2>=20000,5,4))', // Base commission
      '=F2*G2/100', // Commission amount
      '=IF(D2=0,0,F2/D2)', // Daily VPG
      '=F2*0.55', // FDI Points
      '0', // FDI Given
      '=IF(K2>J2,(K2-J2)*0.048,0)', // FDI Cost
      'DEED',
      'Active',
      ''
    ]
  ]);

  // Add data validation for Sale Type and Status
  salesWs['!datavalidation'] = {
    M2: {
      type: 'list',
      operator: 'equal',
      formula1: '"DEED,TRUST"',
      showErrorMessage: true,
      error: 'Please select either DEED or TRUST',
      errorTitle: 'Invalid Sale Type'
    },
    N2: {
      type: 'list',
      operator: 'equal',
      formula1: '"Active,Cancelled"',
      showErrorMessage: true,
      error: 'Please select either Active or Cancelled',
      errorTitle: 'Invalid Status'
    }
  };

  // Add data if requested
  if (includeData && sales.length > 0) {
    const salesData = sales.map(sale => [
      format(new Date(sale.date), 'MM/dd/yyyy'),
      sale.clientLastName,
      sale.leadNumber,
      sale.numberOfTours,
      sale.managerName,
      sale.saleAmount,
      sale.commissionPercentage,
      sale.commissionAmount,
      sale.dailyVPG,
      sale.fdiPoints,
      sale.fdiGivenPoints,
      sale.fdiCost,
      sale.saleType,
      sale.isCancelled ? 'Cancelled' : 'Active',
      sale.notes
    ]);
    
    XLSX.utils.sheet_add_aoa(salesWs, salesData, { origin: -1 });
  }

  // Instructions Sheet
  const instructionsData = [
    ['Hilton Sales Performance Tracker - Instructions'],
    [''],
    ['Quick Start:'],
    ['1. Enter sales data in the "Sales Log" sheet'],
    ['2. Dashboard will automatically update with totals and metrics'],
    ['3. Use dropdown menus for Sale Type (DEED/TRUST) and Status (Active/Cancelled)'],
    [''],
    ['Automatic Calculations:'],
    ['- Commission: Based on sale amount and volume tier'],
    ['- Daily VPG: Sale amount divided by number of tours'],
    ['- FDI Points: Sale amount × 0.55'],
    ['- FDI Cost: (FDI Given - FDI Points) × 0.048'],
    [''],
    ['Tips:'],
    ['- Start with 0 tours for new entries'],
    ['- Use the Dashboard for quick performance overview'],
    ['- All calculations update automatically'],
    ['- Save regularly and keep backups']
  ];

  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);

  // Set column widths
  const wscols = salesHeaders.map(() => ({ wch: 15 }));
  salesWs['!cols'] = wscols;

  // Add sheets to workbook
  XLSX.utils.book_append_sheet(workbook, dashboardWs, 'Dashboard');
  XLSX.utils.book_append_sheet(workbook, salesWs, 'Sales Log');
  XLSX.utils.book_append_sheet(workbook, instructionsWs, 'Instructions');

  // Save the template
  XLSX.writeFile(workbook, 'hilton-sales-tracker.xlsx');
};

// Update the export function to use the new template
export const exportWithTemplate = (
  type: 'excel' | 'pdf',
  includeData: boolean,
  sales: Sale[],
  totals?: SalesTotals
): void => {
  switch (type) {
    case 'excel':
      createAdvancedExcelTemplate(includeData, sales, totals || null);
      break;
    // ... rest of the code remains for PDF
  }
};