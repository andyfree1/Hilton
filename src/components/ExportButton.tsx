import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { downloadInteractivePDF, previewInteractivePDF } from '../utils/pdfExport';
import { exportWithTemplate } from '../utils/export';
import type { Sale, SalesTotals } from '../types/sales';

interface ExportButtonProps {
  sales: Sale[];
  totals: SalesTotals;
}

export default function ExportButton({ sales, totals }: ExportButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = (type: 'pdf' | 'preview' | 'template-excel' | 'template-pdf' | 'template-excel-data' | 'template-pdf-data') => {
    switch (type) {
      case 'pdf':
      case 'preview':
        downloadInteractivePDF(sales, totals, {
          includeCharts: true,
          includeNotes: true,
          includeTotals: true
        });
        break;
      case 'template-excel':
        exportWithTemplate('excel', false, []);
        break;
      case 'template-pdf':
        exportWithTemplate('pdf', false, []);
        break;
      case 'template-excel-data':
        exportWithTemplate('excel', true, sales);
        break;
      case 'template-pdf-data':
        exportWithTemplate('pdf', true, sales, totals);
        break;
    }
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Download className="h-5 w-5 mr-2" />
        Export
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu">
            <div className="px-4 py-2 text-xs text-gray-500 border-b">Export Current Data</div>
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF Report
            </button>
            
            <div className="px-4 py-2 text-xs text-gray-500 border-t border-b">Editable Templates</div>
            <button
              onClick={() => handleExport('template-excel')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Blank Excel Template
            </button>
            <button
              onClick={() => handleExport('template-pdf')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Blank PDF Template
            </button>
            <button
              onClick={() => handleExport('template-excel-data')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel Template with Data
            </button>
            <button
              onClick={() => handleExport('template-pdf-data')}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              PDF Template with Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}