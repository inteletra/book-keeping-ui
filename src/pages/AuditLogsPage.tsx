import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Shield, Clock, User } from 'lucide-react';
import clsx from 'clsx';

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId: string;
    createdAt: string;
    details: any;
}

export const AuditLogsPage = () => {
    const { t } = useTranslation();
    const { data: logs, isLoading } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            const response = await api.get<AuditLog[]>('/audit');
            return response.data;
        }
    });

    if (isLoading) return <div className="text-white">{t('loading')}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Audit Trail</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-950 text-gray-400 text-sm">
                            <tr>
                                <th className="px-6 py-4 font-medium">Action</th>
                                <th className="px-6 py-4 font-medium">Entity</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Time</th>
                                <th className="px-6 py-4 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {logs?.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2.5 py-1 rounded-full text-xs font-medium",
                                            log.action === 'CREATE' && "bg-green-900/30 text-green-400",
                                            log.action === 'UPDATE' && "bg-blue-900/30 text-blue-400",
                                            log.action === 'DELETE' && "bg-red-900/30 text-red-400",
                                        )}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-gray-500" />
                                            <span>{log.entityType}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{log.entityId}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gray-500" />
                                            <span>{log.userId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-xs font-mono max-w-xs truncate">
                                        {JSON.stringify(log.details)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
