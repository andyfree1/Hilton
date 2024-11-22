import React, { useState, useEffect } from 'react';
import { History, RotateCcw, Clock } from 'lucide-react';
import { autoSave } from '../db/autoSave';
import { format } from 'date-fns';

interface VersionHistoryProps {
  projectId: string | null;
  onVersionRestore: () => void;
}

export default function VersionHistory({ projectId, onVersionRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    if (projectId) {
      const projectVersions = await autoSave.getVersions(projectId);
      setVersions(projectVersions);
    }
  };

  const handleRestore = async (version: any) => {
    if (!confirm('Are you sure you want to restore this version? Current changes will be lost.')) {
      return;
    }

    setRestoring(true);
    try {
      await autoSave.restoreVersion(version);
      onVersionRestore();
      await loadVersions();
    } catch (error) {
      console.error('Restore failed:', error);
      alert('Failed to restore version');
    } finally {
      setRestoring(false);
    }
  };

  if (!projectId) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <History className="h-6 w-6 text-[#002C51] mr-2" />
          <h2 className="text-xl font-semibold hilton-heading">Version History</h2>
        </div>
        <div className="text-sm text-gray-500">
          Auto-saves every minute, keeps last 4 versions
        </div>
      </div>

      <div className="space-y-4">
        {versions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No versions available yet
          </div>
        ) : (
          versions.map((version) => (
            <div
              key={version.version}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-[#002C51] mr-2" />
                  <span className="font-medium">Version {version.version}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Saved on {format(new Date(version.timestamp), 'MMM d, yyyy HH:mm:ss')}
                </div>
              </div>
              <button
                onClick={() => handleRestore(version)}
                disabled={restoring}
                className="hilton-button-secondary"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}