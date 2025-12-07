import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Plus,
  Upload,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../utils/format';
import { expensesService } from '../services/expenses';
import { invoicesService } from '../services/invoices';

export const Dashboard = () => {
  // Fetch Expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll,
  });

  // Fetch Invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices'],
    queryFn: invoicesService.findAll,
  });

  // Calculate Stats
  const totalRevenue = invoices
    .filter((inv: any) => inv.status === 'PAID')
    .reduce((sum: number, inv: any) => sum + Number(inv.total), 0);

  const totalExpenses = expenses
    .filter((exp: any) => exp.status === 'PENDING' || exp.status === 'APPROVED' || exp.status === 'PAID')
    .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

  const netProfit = totalRevenue - totalExpenses;

  const outstandingInvoices = invoices
    .filter((inv: any) => inv.status === 'SENT' || inv.status === 'OVERDUE' || inv.status === 'PARTIALLY_PAID')
    .reduce((sum: number, inv: any) => sum + Number(inv.balanceDue || inv.total), 0);

  // Prepare Chart Data (Mock data for last 6 months + real current month)
  const chartData = [
    { name: 'Jan', income: 4000, expense: 2400 },
    { name: 'Feb', income: 3000, expense: 1398 },
    { name: 'Mar', income: 2000, expense: 9800 },
    { name: 'Apr', income: 2780, expense: 3908 },
    { name: 'May', income: 1890, expense: 4800 },
    { name: 'Jun', income: 2390, expense: 3800 },
    { name: 'Jul', income: totalRevenue, expense: totalExpenses }, // Current Month (Simplified)
  ];

  // Recent Activity (Merge Invoices and Expenses)
  const recentActivity = [
    ...invoices.map((inv: any) => ({
      id: inv.id,
      type: 'INVOICE',
      date: inv.date,
      description: `Invoice #${inv.invoiceNumber} - ${inv.clientName}`,
      amount: inv.total,
      status: inv.status,
    })),
    ...expenses.map((exp: any) => ({
      id: exp.id,
      type: 'EXPENSE',
      date: exp.date,
      description: exp.description,
      amount: -exp.amount, // Negative for expense
      status: exp.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Financial overview and quick actions</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/expenses/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
          >
            <Upload size={18} />
            <span>Add Expense</span>
          </Link>
          <Link
            to="/invoices/new"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
              +4.2%
            </span>
          </div>
          <p className="text-gray-400 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              +8.1%
            </span>
          </div>
          <p className="text-gray-400 text-sm">Net Profit</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(netProfit)}</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
              <CreditCard size={24} />
            </div>
            <span className="text-xs font-medium text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
              Action Needed
            </span>
          </div>
          <p className="text-gray-400 text-sm">Outstanding Invoices</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(outstandingInvoices)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold text-white mb-6">Income vs Expenses</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="income" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            <Link to="/invoices" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between p-3 bg-gray-950/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.type === 'INVOICE' ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {item.type === 'INVOICE' ? <FileText size={18} /> : <CreditCard size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[150px]">{item.description}</p>
                    <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.amount >= 0 ? 'text-green-400' : 'text-white'}`}>
                    {item.amount >= 0 ? '+' : ''}{formatCurrency(item.amount)}
                  </p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 uppercase">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
