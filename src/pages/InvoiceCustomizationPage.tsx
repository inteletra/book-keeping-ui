import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Save, Palette, Type } from 'lucide-react';
import { api } from '../services/api';

interface CompanySettings {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    invoiceFooter?: string;
}

export const InvoiceCustomizationPage = () => {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<CompanySettings>({
        primaryColor: '#8B5CF6',
        secondaryColor: '#6366F1',
        invoiceFooter: 'Thank you for your business!',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [success, setSuccess] = useState(false);

    const saveMutation = useMutation({
        mutationFn: async (data: CompanySettings) => {
            const response = await api.patch('/companies/settings', data);
            return response.data;
        },
        onSuccess: () => {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            queryClient.invalidateQueries({ queryKey: ['company-settings'] });
        },
    });

    const uploadLogoMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('logo', file);
            const response = await api.post('/companies/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        },
        onSuccess: (data) => {
            setSettings({ ...settings, logoUrl: data.url });
            setLogoPreview(data.url);
        },
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadLogo = () => {
        if (logoFile) {
            uploadLogoMutation.mutate(logoFile);
        }
    };

    const handleSave = () => {
        saveMutation.mutate(settings);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-white">Invoice Customization</h1>
                <p className="text-gray-400 mt-1">Customize your invoice appearance</p>
            </div>

            {success && (
                <div className="bg-green-900/20 border border-green-800 text-green-400 p-4 rounded-lg">
                    Settings saved successfully!
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settings */}
                <div className="space-y-6">
                    {/* Logo Upload */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Upload size={20} className="text-purple-400" />
                            <h3 className="font-medium text-white">Company Logo</h3>
                        </div>
                        <div className="space-y-4">
                            <div
                                onClick={() => document.getElementById('logo-input')?.click()}
                                className="border-2 border-dashed border-gray-800 hover:border-gray-700 rounded-lg p-8 text-center cursor-pointer transition-colors"
                            >
                                <input
                                    id="logo-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo preview" className="max-h-32 mx-auto" />
                                ) : (
                                    <div>
                                        <Upload size={32} className="mx-auto mb-2 text-gray-600" />
                                        <p className="text-white text-sm">Click to upload logo</p>
                                        <p className="text-gray-500 text-xs mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                )}
                            </div>
                            {logoFile && (
                                <button
                                    onClick={handleUploadLogo}
                                    disabled={uploadLogoMutation.isPending}
                                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    {uploadLogoMutation.isPending ? 'Uploading...' : 'Upload Logo'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Palette size={20} className="text-purple-400" />
                            <h3 className="font-medium text-white">Brand Colors</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Primary Color
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        className="w-16 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.primaryColor}
                                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                        className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white font-mono text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Secondary Color
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={settings.secondaryColor}
                                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                        className="w-16 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings.secondaryColor}
                                        onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                        className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white font-mono text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Text */}
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Type size={20} className="text-purple-400" />
                            <h3 className="font-medium text-white">Invoice Footer</h3>
                        </div>
                        <textarea
                            value={settings.invoiceFooter}
                            onChange={(e) => setSettings({ ...settings, invoiceFooter: e.target.value })}
                            rows={4}
                            placeholder="Add footer text to your invoices..."
                            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white resize-none"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <Save size={18} />
                        <span>{saveMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>

                {/* Preview */}
                <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                    <h3 className="font-medium text-white mb-4">Preview</h3>
                    <div
                        className="bg-white rounded-lg p-8 shadow-xl"
                        style={{ borderTop: `4px solid ${settings.primaryColor}` }}
                    >
                        {logoPreview && (
                            <img src={logoPreview} alt="Logo" className="max-h-16 mb-6" />
                        )}
                        <div className="mb-6">
                            <h4
                                className="text-2xl font-bold mb-2"
                                style={{ color: settings.primaryColor }}
                            >
                                INVOICE
                            </h4>
                            <p className="text-gray-600 text-sm">Invoice #INV-12345</p>
                        </div>
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Bill To:</p>
                                    <p className="font-medium">Acme Corporation</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500">Date:</p>
                                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4 mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Description</th>
                                        <th className="text-right py-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2">Consulting Services</td>
                                        <td className="text-right">$1,000.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="font-medium">Total:</span>
                                <span
                                    className="text-2xl font-bold"
                                    style={{ color: settings.secondaryColor }}
                                >
                                    $1,000.00
                                </span>
                            </div>
                        </div>
                        {settings.invoiceFooter && (
                            <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm text-gray-600 text-center italic">
                                    {settings.invoiceFooter}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
