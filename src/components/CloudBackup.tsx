import React, { useState } from 'react';
import { Cloud, Download, Upload, Check } from 'lucide-react';
import { db } from '../db/database';

const CLOUD_PROVIDERS = [
  { id: 'google-drive', name: 'Google Drive', icon: '📁' },
  { id: 'dropbox', name: 'Dropbox', icon: '📦' },
  { id: 'icloud', name: 'iCloud', icon: '☁️' },
  { id: 'onedrive', name: 'OneDrive', icon: '💾' },
  { id: 'amazon', name: 'Amazon Drive', icon: '📀' }
];

export default function CloudBackup() {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [backingUp, setBackingUp] = useState(false);

  const handleBackup = async () => {
    if (!selectedProvider) {
      alert('Please select a cloud provider');
      return;
    }

    setBackingUp(true);
    try {
      const backup = await db.createBackup();
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // In a real app, this would use the cloud provider's API
      // For now, we'll just trigger a download
      const a = document.createElement('a');
      a.href = url;
      a.download = `hilton-sales-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Backup ready for cloud storage');
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to create backup');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Cloud className="h-6 w-6 text-[#002C51] mr-2" />
          <h2 className="text-xl font-semibold hilton-heading">Cloud Backup</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Cloud Provider</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CLOUD_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`p-4 rounded-lg border ${
                  selectedProvider === provider.id
                    ? 'border-[#002C51] bg-[#002C51] text-white'
                    : 'border-gray-200 hover:border-[#002C51]'
                } transition-colors duration-200`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">{provider.icon}</span>
                  <span className="text-sm font-medium">{provider.name}</span>
                  {selectedProvider === provider.id && (
                    <Check className="h-4 w-4 mt-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleBackup}
            disabled={!selectedProvider || backingUp}
            className="hilton-button-primary"
          >
            {backingUp ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Backing up...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Backup to Cloud
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <h3 className="font-medium mb-2">Local Storage Information</h3>
          <ul className="space-y-1 text-gray-600">
            <li>• Auto-saves every minute</li>
            <li>• Keeps last 4 versions locally</li>
            <li>• All data stored in browser storage</li>
            <li>• Use cloud backup for additional safety</li>
          </ul>
        </div>
      </div>
    </div>
  );
}