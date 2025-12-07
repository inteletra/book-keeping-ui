import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Receipt, Bot, PieChart, Shield, Menu, X, Inbox, Globe, Settings, BookOpen, Layers, Activity, Landmark } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

interface SidebarItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    onClick?: () => void;
}

const SidebarItem = ({ to, icon: Icon, label, onClick }: SidebarItemProps) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
        >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
        </Link>
    );
};

export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    i18n.language === 'ar' && isSidebarOpen ? "translate-x-0 right-0 left-auto border-l border-r-0" : ""
                )}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
                            B
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            {t('app_name')}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    <SidebarItem to="/" icon={LayoutDashboard} label={t('dashboard')} onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/inbox" icon={Inbox} label="Inbox" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/invoices" icon={FileText} label={t('invoices')} onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/vendor-bills" icon={Receipt} label="Vendor Bills" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/expenses" icon={Receipt} label={t('expenses')} onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/journal-entries" icon={BookOpen} label="Journal Entries" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/accounts" icon={Layers} label="Chart of Accounts" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/ledger" icon={BookOpen} label="General Ledger" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/trial-balance" icon={PieChart} label="Trial Balance" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/chat" icon={Bot} label={t('ai_assistant')} onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/reports" icon={PieChart} label="Profit & Loss" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/reports/balance-sheet" icon={FileText} label="Balance Sheet" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/reports/cash-flow" icon={Activity} label="Cash Flow" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/reports/vat-return" icon={FileText} label="VAT Return" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/banking/reconcile" icon={Landmark} label="Banking" onClick={() => setIsSidebarOpen(false)} />
                    <SidebarItem to="/audit" icon={Shield} label="Audit Trail" onClick={() => setIsSidebarOpen(false)} />
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    >
                        <Globe size={20} />
                        <span className="font-medium">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
                    </button>
                    <SidebarItem to="/settings" icon={Settings} label={t('settings')} onClick={() => setIsSidebarOpen(false)} />
                    <div className="pt-4 mt-4 border-t border-gray-800">
                        <div className="px-4 py-2">
                            <p className="text-sm font-medium text-white">{user?.fullName}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden text-gray-400 hover:text-white p-2"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">
                        {/* Header actions can go here */}
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
