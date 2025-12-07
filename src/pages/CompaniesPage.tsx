import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Globe, Building2, Mail, Phone, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/format';

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  trn?: string;
  address?: string;
  currency: string;
  createdAt: string;
}

export const CompaniesPage = () => {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  const filteredCompanies = companies.filter((company: Company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Companies</h1>
          <p className="text-gray-400 mt-1">Manage tenant companies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          <Plus size={20} />
          <span>New Company</span>
        </button>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-950/50 text-gray-400 text-sm">
                <th className="px-6 py-3 font-medium">Company Name</th>
                <th className="px-6 py-3 font-medium">Contact Info</th>
                <th className="px-6 py-3 font-medium">TRN / Currency</th>
                <th className="px-6 py-3 font-medium">Created At</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCompanies.map((company: Company) => (
                <tr key={company.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-white">{company.name}</div>
                        {company.website && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Globe size={12} />
                            {company.website}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {company.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail size={14} />
                          {company.email}
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone size={14} />
                          {company.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">{company.trn || '-'}</div>
                    <div className="text-xs text-gray-500">{company.currency}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteMutation.mutate(company.id)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
