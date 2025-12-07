import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { expensesService } from '../services/expenses';
import { formatCurrency } from '../utils/format';
import { ExpenseStatus } from '../shared/expenses';
import type { Expense } from '../shared/expenses';
import clsx from 'clsx';

export const ExpensesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ExpenseStatus }) =>
      expensesService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: expensesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const filteredExpenses = expenses.filter((expense: Expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.vendor?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.APPROVED: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case ExpenseStatus.PENDING: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case ExpenseStatus.REJECTED: return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-400">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Expenses</h1>
          <p className="text-gray-400 mt-1">Track and manage company expenses</p>
        </div>
        <Link
          to="/expenses/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>New Expense</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Total Expenses (This Month)</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(12500)}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(3200)}</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Average Expense</p>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(450)}</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value={ExpenseStatus.PENDING}>Pending</option>
              <option value={ExpenseStatus.APPROVED}>Approved</option>
              <option value={ExpenseStatus.REJECTED}>Rejected</option>
            </select>
            <button className="p-2 text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:bg-gray-800">
              <Filter size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white border border-gray-800 rounded-lg hover:bg-gray-800">
              <Download size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-950/50 text-gray-400 text-sm">
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredExpenses.map((expense: Expense) => (
                <tr key={expense.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 text-gray-300">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{expense.description}</div>
                    {expense.vendor && (
                      <div className="text-sm text-gray-500">{expense.vendor}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(expense.status)
                    )}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {expense.status === ExpenseStatus.PENDING && (
                        <>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: expense.id, status: ExpenseStatus.APPROVED })}
                            className="p-1 text-green-400 hover:bg-green-400/10 rounded"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: expense.id, status: ExpenseStatus.REJECTED })}
                            className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(expense.id)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No expenses found. Create one to get started.
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
