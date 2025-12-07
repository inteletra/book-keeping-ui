import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Trash2, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { inboxService } from '../services/inbox';
import type { InboxItem } from '../services/inbox';
import { formatCurrency } from '../utils/format';
import clsx from 'clsx';

export const InboxPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: inboxService.getAll,
  });

  const uploadMutation = useMutation({
    mutationFn: inboxService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inboxService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbox'] });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      uploadMutation.mutate(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      for (const file of files) {
        uploadMutation.mutate(file);
      }
    }
  };

  const getStatusIcon = (status: InboxItem['status']) => {
    switch (status) {
      case 'READY': return <CheckCircle className="text-green-400" size={18} />;
      case 'PROCESSING': return <Loader2 className="text-blue-400 animate-spin" size={18} />;
      case 'FAILED': return <AlertCircle className="text-red-400" size={18} />;
      default: return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Inbox</h1>
        <p className="text-gray-400 mt-1">Upload and process receipts and invoices</p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
          isDragging
            ? "border-purple-500 bg-purple-500/10"
            : "border-gray-800 hover:border-gray-700 bg-gray-900"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileSelect}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-gray-800 rounded-full text-gray-400">
            <Upload size={32} />
          </div>
          <div>
            <p className="text-lg font-medium text-white">
              {uploadMutation.isPending ? 'Uploading...' : 'Click or drag files to upload'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports JPG, PNG, PDF (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-medium text-white">Uploaded Files ({items.length})</h3>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No files uploaded yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.originalName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(item.size)}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-950 rounded-full border border-gray-800">
                    {getStatusIcon(item.status)}
                    <span className="text-xs font-medium text-gray-300">{item.status}</span>
                  </div>

                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
