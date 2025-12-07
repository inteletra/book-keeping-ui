
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { InvoicesPage } from './pages/InvoicesPage';
import { CreateInvoicePage } from './pages/CreateInvoicePage';
import { ChatPage } from './pages/ChatPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from "./pages/RegisterPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { CreateExpensePage } from "./pages/CreateExpensePage";
import { CompaniesPage } from "./pages/CompaniesPage";
import { InboxPage } from "./pages/InboxPage";
import { JournalEntriesPage } from "./pages/JournalEntriesPage";
import { CreateJournalEntryPage } from "./pages/CreateJournalEntryPage";
import { AccountsPage } from "./pages/AccountsPage";
import { CreateAccountPage } from "./pages/CreateAccountPage";
import { GeneralLedgerPage } from "./pages/GeneralLedgerPage";
import { TrialBalancePage } from "./pages/TrialBalancePage";
import { BalanceSheetPage } from "./pages/BalanceSheetPage";
import { ImportInvoicesPage } from "./pages/ImportInvoicesPage";
import { InvoiceCustomizationPage } from "./pages/InvoiceCustomizationPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { CashFlowPage } from "./pages/CashFlowPage";
import { VatReturnPage } from "./pages/VatReturnPage";
import { BankReconciliationPage } from "./pages/BankReconciliationPage";
import { VendorBillsPage } from "./pages/VendorBillsPage";
import { CreateVendorBillPage } from "./pages/CreateVendorBillPage";
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import { SuperAdminLayout } from "./layouts/SuperAdminLayout";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              {/* Tenant User Routes - Must come first to match / for regular users */}
              <Route element={<RoleBasedRoute allowedRoles={['USER', 'ADMIN']} />}>
                <Route path="/" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="invoices" element={<InvoicesPage />} />
                  <Route path="invoices/new" element={<CreateInvoicePage />} />
                  <Route path="invoices/:id/edit" element={<CreateInvoicePage />} />
                  <Route path="invoices/import" element={<ImportInvoicesPage />} />
                  <Route path="invoices/customize" element={<InvoiceCustomizationPage />} />
                  <Route path="inbox" element={<InboxPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="expenses/new" element={<CreateExpensePage />} />
                  <Route path="journal-entries" element={<JournalEntriesPage />} />
                  <Route path="journal-entries/new" element={<CreateJournalEntryPage />} />
                  <Route path="accounts" element={<AccountsPage />} />
                  <Route path="accounts/new" element={<CreateAccountPage />} />
                  <Route path="accounts/:id/edit" element={<CreateAccountPage />} />
                  <Route path="ledger" element={<GeneralLedgerPage />} />
                  <Route path="trial-balance" element={<TrialBalancePage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="reports/balance-sheet" element={<BalanceSheetPage />} />
                  <Route path="reports/cash-flow" element={<CashFlowPage />} />
                  <Route path="reports/vat-return" element={<VatReturnPage />} />
                  <Route path="banking/reconcile" element={<BankReconciliationPage />} />
                  <Route path="vendor-bills" element={<VendorBillsPage />} />
                  <Route path="vendor-bills/new" element={<CreateVendorBillPage />} />
                  <Route path="audit" element={<AuditLogsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* Super Admin Routes - Separate path */}
              <Route element={<RoleBasedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/admin" element={<SuperAdminLayout />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="companies" element={<CompaniesPage />} />
                  <Route path="audit" element={<AuditLogsPage />} />
                  <Route path="settings" element={<div className="text-white">Platform Settings (Coming Soon)</div>} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
