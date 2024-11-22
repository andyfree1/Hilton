import React, { useState, useEffect } from 'react';
import { Cloud, Upload, Download, RefreshCw, File, Image, FileSpreadsheet, Settings, Check } from 'lucide-react';
import { cloudStorage } from '../db/cloudStorage';
import { CLOUD_PROVIDERS, type CloudProvider } from '../types/cloudStorage';

interface CloudStorageProps {
  projectId: string | null;
}

export default function CloudStorage({ projectId }: CloudStorageProps) {
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<any[]>([]);
  const [sharedResources, setSharedResources] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [autoSync, setAutoSync] = useState(false);

  useEffect(() => {
    loadData();
    loadCloudSettings();
  }, [projectId]);

  const loadData = async () => {
    if (projectId) {
      const projectMedia = await cloudStorage.getProjectMedia(projectId);
      setMedia(projectMedia);
    }
    const shared = await cloudStorage.getSharedResources();
    setSharedResources(shared);
  };

  const loadCloudSettings = async () => {
    const settings = await cloudStorage.getCloudSettings();
    if (settings) {
      setSelectedProvider(settings.provider);
      setAutoSync(settings.autoSync);
    }
  };

  const handleProviderSelect = async (provider: CloudProvider) => {
    try {
      await cloudStorage.connectCloudProvider(provider);
      setSelectedProvider(provider);
      await loadData();
    } catch (error) {
      console.error('Failed to connect to cloud provider:', error);
      alert('Failed to connect to cloud provider. Please try again.');
    }
  };

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await cloudStorage.syncData();
      await loadData();
    } finally {
      setSyncStatus('idle');
    }
  };

  const handleAutoSyncToggle = async () => {
    const newAutoSync = !autoSync;
    setAutoSync(newAutoSync);
    await cloudStorage.updateCloudSettings({ autoSync: newAutoSync });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Cloud className="h-6 w-6 text-[#002C51] mr-2" />
          <h2 className="text-xl font-semibold hilton-heading">Cloud Storage</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="hilton-button-secondary"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
          <button
            onClick={handleSync}
            disabled={syncStatus === 'syncing' || !selectedProvider}
            className="hilton-button-secondary"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Cloud Storage Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Cloud Provider</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {CLOUD_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id as CloudProvider)}
                    className={`p-4 rounded-lg border ${
                      selectedProvider === provider.id
                        ? 'border-[#002C51] bg-[#002C51] text-white'
                        : 'border-gray-200 hover:border-[#002C51]'
                    } transition-colors duration-200`}
                  >
                    <div className="flex flex-col items-center">
                      <Cloud className="h-8 w-8 mb-2" style={{ color: provider.color }} />
                      <span className="text-sm font-medium">{provider.name}</span>
                      {selectedProvider === provider.id && (
                        <Check className="h-4 w-4 mt-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Auto-Sync</h4>
                <p className="text-sm text-gray-500">Automatically sync changes every 5 minutes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={handleAutoSyncToggle}
                  className="sr-only peer"
                  disabled={!selectedProvider}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002C51]"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {selectedProvider ? (
        <div className="space-y-6">
          {/* Rest of the cloud storage UI remains the same */}
        </div>
      ) : (
        <div className="text-center py-12">
          <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cloud Provider Selected</h3>
          <p className="text-gray-500 mb-4">Select a cloud storage provider to enable sync and backup</p>
          <button
            onClick={() => setShowSettings(true)}
            className="hilton-button-primary"
          >
            Configure Cloud Storage
          </button>
        </div>
      )}
    </div>
  );
}