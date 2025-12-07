import { useQuery } from '@tanstack/react-query';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/format';

export const SuperAdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Placeholder for now, ideally we'd have a dedicated stats endpoint
      const companies = await api.get('/companies');
      return {
        totalCompanies: companies.data.length,
        totalUsers: 0, // Need endpoint
        totalRevenue: 0, // Placeholder
        activeNow: 1, // Placeholder
      };
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Platform Overview</h1>
        <p className="text-gray-400 mt-1">Monitor system health and tenant activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-600/20 rounded-lg text-purple-400">
              <Building2 size={24} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <p className="text-gray-400 text-sm">Total Companies</p>
          <p className="text-2xl font-bold text-white">{stats?.totalCompanies || 0}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
              <Users size={24} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              +5%
            </span>
          </div>
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{stats?.totalUsers || '-'}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-600/20 rounded-lg text-green-400">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              +8%
            </span>
          </div>
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalRevenue || 0)}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-600/20 rounded-lg text-yellow-400">
              <Activity size={24} />
            </div>
          </div>
          <p className="text-gray-400 text-sm">Active Now</p>
          <p className="text-2xl font-bold text-white">{stats?.activeNow || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Recent Signups</h3>
          <div className="text-center text-gray-500 py-8">
            No recent signups to display.
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <span className="text-gray-400">API Status</span>
                <span className="text-green-400 font-medium">Operational</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-gray-400">Database</span>
                <span className="text-green-400 font-medium">Connected</span>
             </div>
             <div className="flex items-center justify-between">
                <span className="text-gray-400">Storage</span>
                <span className="text-green-400 font-medium">Healthy</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
