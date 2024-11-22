import React, { useState, useEffect, useRef } from 'react';
import { FolderOpen, Cloud, Download, Upload, Folder } from 'lucide-react';
import { hiltonMediaStorage } from '../db/mediaStorage';

interface MediaManagerProps {
  projectId: string | null;
}

export default function MediaManager({ projectId }: MediaManagerProps) {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFiles();
  }, [projectId, currentPath]);

  const loadFiles = async () => {
    if (projectId) {
      const projectFiles = await hiltonMediaStorage.getProjectFiles(projectId);
      setFiles(projectFiles);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId) {
      alert('Please select a project first');
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        await hiltonMediaStorage.addFile(currentPath, file, { projectId });
        await loadFiles();
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload file');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleExportStorage = async () => {
    try {
      await hiltonMediaStorage.exportToFile();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export storage');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FolderOpen className="h-6 w-6 text-[#002C51] mr-2" />
          <h2 className="text-xl font-semibold hilton-heading">Hilton Media Storage</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportStorage}
            className="hilton-button-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <label className="hilton-button-primary cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Upload
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading || !projectId}
            />
          </label>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            <Folder className="h-4 w-4 text-[#002C51]" />
            <span className="font-medium">Current Location:</span>
            <span className="text-gray-600">{currentPath}</span>
          </div>
        </div>

        <div className="divide-y">
          {files.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No files in current location
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  {file.type === 'folder' ? (
                    <Folder className="h-4 w-4 text-[#002C51] mr-2" />
                  ) : (
                    <Cloud className="h-4 w-4 text-[#002C51] mr-2" />
                  )}
                  <span>{file.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {new Date(file.updatedAt).toLocaleDateString()}
                  </span>
                  {file.type === 'file' && (
                    <button
                      onClick={() => window.open(file.content, '_blank')}
                      className="text-[#002C51] hover:text-opacity-80"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4 hilton-heading">Storage Information</h3>
        <div>
          <h4 className="font-medium mb-2">Local Storage</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Files stored in browser storage</li>
            <li>• Automatic backup support</li>
            <li>• Organized folder structure</li>
            <li>• Export functionality for backup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}