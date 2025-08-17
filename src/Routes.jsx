import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import InvoiceListPage from './pages/invoice-list';
import ClientList from './pages/client-list';
import CreateEditInvoice from './pages/create-edit-invoice';
import Dashboard from './pages/dashboard';
import Reports from './pages/reports';
import ClientProfile from './pages/client-profile';
import Login from './pages/login';
import Signup from './pages/signup';
import ItemManagement from './pages/item-management';
import POSSystem from './pages/pos';
import ReceiptsPage from './pages/receipts';
import SimpleBilling from './pages/simple-billing';
import ReceiptEditor from './pages/receipt-editor';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Main App Routes - Simple Billing as default */}
        <Route path="/" element={<SimpleBilling />} />
        <Route path="/simple-billing" element={<SimpleBilling />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/invoice-list" element={<InvoiceListPage />} />
        <Route path="/client-list" element={<ClientList />} />
        <Route path="/create-edit-invoice" element={<CreateEditInvoice />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/client-profile" element={<ClientProfile />} />
        
        {/* Item Management and POS Routes */}
        <Route path="/item-management" element={<ItemManagement />} />
        <Route path="/pos" element={<POSSystem />} />
        <Route path="/receipts" element={<ReceiptsPage />} />
        <Route path="/receipt-editor" element={<ReceiptEditor />} />
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;