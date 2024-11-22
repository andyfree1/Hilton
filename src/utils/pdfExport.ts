import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sale, SalesTotals } from '../types/sales';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

export const createInteractivePDF = (
  sales: Sale[], 
  totals: SalesTotals,
  options: { includeCharts?: boolean; includeNotes?: boolean; includeTotals?: boolean } = {}
) => {
  const doc = new jsPDF('landscape', 'pt', 'letter');
  
  // Add title
  doc.setFontSize(18);
  doc.text('Hilton Sales Performance Report', 40, 40);
  
  // Add generation date
  doc.setFontSize(12);
  doc.text(`Generated on ${format(new Date(), 'MM/dd/yyyy HH:mm')}`, 40, 60);

  // Add summary section
  doc.setFontSize(14);
  doc.text('Performance Summary', 40, 90);

  const summaryData = [
    ['Total Volume:', `$${totals.totalVolume.toFixed(2)}`, 'Active Sales:', totals.activeSales.toString()],
    ['Total Tours:', totals.totalTours.toString(), 'Cancelled Sales:', totals.cancelledSales.toString()],
    ['Monthly VPG:', `$${totals.monthlyVPG.toFixed(2)}`, 'Total Commission:', `$${totals.totalCommission.toFixed(2)}`]
  ];

  autoTable(doc, {
    startY: 100,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 12 },
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { fontStyle: 'bold' } }
  });

  // Add detailed sales table
  doc.setFontSize(14);
  doc.text('Detailed Sales', 40, doc.lastAutoTable.finalY + 30);

  const tableHeaders = [
    'Date',
    'Client',
    'Sale Amount',
    'Daily VPG',
    'FDI Cost',
    'Status',
    options.includeNotes ? 'Notes' : ''
  ].filter(Boolean);

  const tableData = sales.map(sale => [
    format(new Date(sale.date), 'MM/dd/yyyy'),
    sale.clientLastName,
    `$${sale.saleAmount.toFixed(2)}`,
    `$${sale.dailyVPG.toFixed(2)}`,
    `$${sale.fdiCost.toFixed(2)}`,
    sale.isCancelled ? 'Cancelled' : 'Active',
    options.includeNotes ? (sale.notes || '') : ''
  ].filter((_, index) => index < tableHeaders.length));

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 40,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [69, 78, 89] }
  });

  // Add form fields
  if (options.includeTotals) {
    doc.setFontSize(14);
    doc.text('Additional Notes', 40, doc.lastAutoTable.finalY + 30);
    
    // Add form field
    doc.rect(40, doc.lastAutoTable.finalY + 40, 700, 80);
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 20,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadInteractivePDF = (
  sales: Sale[],
  totals: SalesTotals,
  options = {}
) => {
  const doc = createInteractivePDF(sales, totals, options);
  const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
  saveAs(pdfBlob, 'sales-report-interactive.pdf');
};

export const previewInteractivePDF = (
  sales: Sale[],
  totals: SalesTotals,
  options = {}
) => {
  const doc = createInteractivePDF(sales, totals, options);
  const pdfBlob = new Blob([doc.output('blob')], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(pdfBlob);
  
  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = 'sales-report-preview.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(pdfUrl);
};