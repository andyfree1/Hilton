import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { RESORTS } from '../types/sales';

interface ResortSelectorProps {
  selectedResort: string;
  onResortChange: (resort: string) => void;
}

export default function ResortSelector({ selectedResort, onResortChange }: ResortSelectorProps) {
  const [showHighlights, setShowHighlights] = useState(false);
  const selectedResortData = RESORTS.find(r => r.id === selectedResort);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center mb-4">
        <Building2 className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Resort Selection</h2>
      </div>
      
      <div className="space-y-4">
        <select
          value={selectedResort}
          onChange={(e) => {
            onResortChange(e.target.value);
            setShowHighlights(true);
          }}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a Resort</option>
          {RESORTS.map(resort => (
            <option key={resort.id} value={resort.id}>
              {resort.name}
            </option>
          ))}
        </select>

        {selectedResortData && showHighlights && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-md">
            <h3 className="font-medium text-indigo-900 mb-2">
              {selectedResortData.name}
            </h3>
            <p className="text-sm text-indigo-700 mb-2">
              {selectedResortData.location}
            </p>
            <ul className="list-disc list-inside text-sm text-indigo-600 space-y-1">
              {selectedResortData.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}