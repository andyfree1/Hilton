import React, { useState, useEffect } from 'react';
import { Target, Edit2, Save, X } from 'lucide-react';
import { CommissionLevel } from '../types/sales';
import { db, updateCommissionLevels } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';

interface CommissionLevelsProps {
  currentVolume: number;
  projectId: number | null;
}

export default function CommissionLevels({ currentVolume, projectId }: CommissionLevelsProps) {
  const project = useLiveQuery(
    () => projectId ? db.projects.get(projectId) : null,
    [projectId]
  );

  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [commissionLevels, setCommissionLevels] = useState<CommissionLevel[]>([]);
  const [editForm, setEditForm] = useState<CommissionLevel | null>(null);

  useEffect(() => {
    if (project?.commissionLevels) {
      setCommissionLevels(project.commissionLevels);
    }
  }, [project]);

  const getCurrentLevel = () => {
    return commissionLevels.find(
      level => currentVolume >= level.minAmount && currentVolume <= level.maxAmount
    );
  };

  const currentLevel = getCurrentLevel();

  const handleEdit = (level: CommissionLevel) => {
    setEditingLevel(level.level);
    setEditForm({ ...level });
  };

  const handleSave = async () => {
    if (!editForm || !projectId) return;

    const updatedLevels = commissionLevels.map(level =>
      level.level === editForm.level ? editForm : level
    );

    // Sort levels by minAmount
    updatedLevels.sort((a, b) => a.minAmount - b.minAmount);

    // Update level numbers
    const sortedLevels = updatedLevels.map((level, index) => ({
      ...level,
      level: index + 1
    }));

    try {
      await updateCommissionLevels(projectId, sortedLevels);
      setCommissionLevels(sortedLevels);
      setEditingLevel(null);
      setEditForm(null);
    } catch (error) {
      console.error('Failed to update commission levels:', error);
      alert('Failed to update commission levels. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingLevel(null);
    setEditForm(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center mb-4">
        <Target className="h-6 w-6 text-[#002C51] mr-2" />
        <h2 className="text-xl font-semibold">Commission Structure</h2>
      </div>

      <div className="mb-6 p-4 bg-[#002C51] bg-opacity-5 rounded-lg border border-[#002C51] border-opacity-10">
        <h3 className="text-lg font-medium text-[#002C51] mb-4">Base Commission Rates</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Under $20,000:</span>
            <span className="font-medium text-[#002C51]">4%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">$20,000 - $49,999:</span>
            <span className="font-medium text-[#002C51]">5%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">$50,000 and above:</span>
            <span className="font-medium text-[#002C51]">6%</span>
          </div>
        </div>

        {currentLevel && (
          <>
            <h3 className="text-lg font-medium text-[#002C51] mb-2">Current Volume Level: {currentLevel.level}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Additional Commission:</span>
                <span className="font-medium text-[#002C51]">+{currentLevel.additionalCommission}%</span>
              </div>
            </div>
            {currentLevel.level < commissionLevels.length && (
              <div className="mt-4 text-sm text-[#002C51]">
                Next level: {formatCurrency(commissionLevels[currentLevel.level].minAmount - currentVolume)} more in sales
              </div>
            )}
          </>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Volume Range</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Additional Commission</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {commissionLevels.map((level) => (
              <tr 
                key={level.level}
                className={currentLevel?.level === level.level ? 'bg-[#002C51] bg-opacity-5' : ''}
              >
                {editingLevel === level.level && editForm ? (
                  <>
                    <td className="px-4 py-2">{level.level}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editForm.minAmount}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            minAmount: parseInt(e.target.value)
                          })}
                          className="w-32 rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={editForm.maxAmount}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            maxAmount: parseInt(e.target.value)
                          })}
                          className="w-32 rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        step="0.5"
                        value={editForm.additionalCommission}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          additionalCommission: parseFloat(e.target.value)
                        })}
                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-[#002C51] focus:ring-[#002C51] sm:text-sm"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 text-sm font-medium">{level.level}</td>
                    <td className="px-4 py-2 text-sm">
                      {formatCurrency(level.minAmount)} - {formatCurrency(level.maxAmount)}
                    </td>
                    <td className="px-4 py-2 text-sm">+{level.additionalCommission}%</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(level)}
                        className="text-[#002C51] hover:text-opacity-80"
                        disabled={!projectId}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}