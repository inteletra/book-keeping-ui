import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Upload, Download, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export const ImportInvoicesPage = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState('');

    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/invoices/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: (data) => {
            setResults(data);
            setError('');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Failed to import invoices');
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResults(null);
            setError('');
        }
    };

    const handleUpload = () => {
        if (file) {
            uploadMutation.mutate(file);
        }
    };

    const downloadTemplate = () => {
        const csv = `Invoice Number,Client Name,Date,Due Date,Amount,VAT,Total,Status
INV-001,Acme Corp,2025-01-15,2025-02-15,1000,50,1050,PAID
INV-002,Tech Solutions,2025-01-16,2025-02-16,2000,100,2100,PENDING`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/invoices')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Import Invoices</h1>
                    <p className="text-gray-400 mt-1">Bulk import invoices from CSV</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>{error}</div>
                </div>
            )}

            {results && (
                <div className="bg-green-900/20 border border-green-800 text-green-400 p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Import Successful!</p>
                        <p className="text-sm mt-1">
                            Created {results.created} invoices, {results.failed || 0} failed
                        </p>
                        {results.errors && results.errors.length > 0 && (
                            <ul className="text-sm mt-2 list-disc list-inside">
                                {results.errors.map((err: string, i: number) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-medium text-white">Step 1: Download Template</h3>
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        <Download size={18} />
                        <span>Download CSV Template</span>
                    </button>
                </div>

                <div className="border-t border-gray-800 pt-6">
                    <h3 className="font-medium text-white mb-4">Step 2: Upload Your CSV</h3>
                    <div className="space-y-4">
                        <div
                            onClick={() => document.getElementById('file-input')?.click()}
                            className="border-2 border-dashed border-gray-800 hover:border-gray-700 rounded-xl p-12 text-center cursor-pointer transition-colors"
                        >
                            <input
                                id="file-input"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Upload size={48} className="mx-auto mb-4 text-gray-600" />
                            {file ? (
                                <div>
                                    <p className="text-white font-medium">{file.name}</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-white font-medium">Click to select CSV file</p>
                                    <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!file || uploadMutation.isPending}
                            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                        >
                            {uploadMutation.isPending ? 'Importing...' : 'Import Invoices'}
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6">
                    <h3 className="font-medium text-white mb-3">CSV Format Requirements</h3>
                    <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                        <li>First row must be headers</li>
                        <li>Required columns: Invoice Number, Client Name, Date, Total</li>
                        <li>Dates should be in YYYY-MM-DD format</li>
                        <li>Status must be one of: DRAFT, PENDING, PAID, OVERDUE</li>
                        <li>Amounts should be numbers without currency symbols</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
