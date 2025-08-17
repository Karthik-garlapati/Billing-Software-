import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionButton from '../../components/ui/QuickActionButton';
import NotificationBar from '../../components/ui/NotificationBar';
import CompanyInfoSection from './components/CompanyInfoSection';
import ClientSelectionSection from './components/ClientSelectionSection';
import InvoiceDetailsSection from './components/InvoiceDetailsSection';
import LineItemsSection from './components/LineItemsSection';
import InvoicePreview from './components/InvoicePreview';
import ActionButtons from './components/ActionButtons';

import Button from '../../components/ui/Button';

const CreateEditInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams?.get('id');
  const isEditing = Boolean(invoiceId);

  // State management
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Form data states
  const [companyInfo, setCompanyInfo] = useState({
    name: "BillTracker Pro Solutions",
    email: "billing@billtrackerpro.com",
    phone: "+1 (555) 123-4567",
    website: "https://www.billtrackerpro.com",
    address: "123 Business Avenue, Suite 100, Professional City, PC 12345"
  });

  const [selectedClient, setSelectedClient] = useState("");
  
  const [invoiceDetails, setInvoiceDetails] = useState({
    number: "",
    date: new Date()?.toISOString()?.split('T')?.[0],
    dueDate: "",
    paymentTerms: "net-30",
    status: "draft",
    poNumber: "",
    notes: "",
    terms: `Payment is due within 30 days of invoice date.\nLate payments may incur a 1.5% monthly service charge.\nPlease include invoice number with payment.`
  });

  const [lineItems, setLineItems] = useState([
    {
      id: Date.now(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    }
  ]);

  const [taxRate, setTaxRate] = useState(8.25);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (hasUnsavedChanges) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges]);

  // Mark as having unsaved changes when form data changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [companyInfo, selectedClient, invoiceDetails, lineItems, taxRate, discountAmount]);

  // Load existing invoice data if editing
  useEffect(() => {
    if (isEditing && invoiceId) {
      loadInvoiceData(invoiceId);
    }
  }, [isEditing, invoiceId]);

  const loadInvoiceData = (id) => {
    // Mock loading existing invoice data
    const mockInvoiceData = {
      number: "INV-2025-0123",
      date: "2025-01-15",
      dueDate: "2025-02-14",
      paymentTerms: "net-30",
      status: "sent",
      poNumber: "PO-2025-456",
      notes: "Thank you for your business!",
      terms: "Payment is due within 30 days of invoice date."
    };

    setInvoiceDetails(mockInvoiceData);
    setSelectedClient("client-1");
    setLineItems([
      {
        id: 1,
        description: "Web Development Services",
        quantity: 40,
        rate: 125.00,
        amount: 5000.00
      },
      {
        id: 2,
        description: "UI/UX Design Consultation",
        quantity: 20,
        rate: 150.00,
        amount: 3000.00
      }
    ]);
    setTaxRate(8.25);
    setDiscountAmount(200.00);
    setHasUnsavedChanges(false);
  };

  const handleAutoSave = () => {
    console.log('Auto-saving invoice...');
    setHasUnsavedChanges(false);
    
    addNotification({
      id: Date.now(),
      type: 'info',
      message: 'Invoice auto-saved successfully',
      autoHide: true
    });
  };

  const addNotification = (notification) => {
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev?.filter(n => n?.id !== id));
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setHasUnsavedChanges(false);
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Draft Saved',
        message: 'Invoice has been saved as draft successfully',
        autoHide: true
      });
      
      // Navigate back to invoice list after saving
      setTimeout(() => {
        navigate('/invoice-list');
      }, 1000);
      
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save invoice draft. Please try again.',
        autoHide: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndSend = async () => {
    setIsSaving(true);
    
    try {
      // Mock save and send operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHasUnsavedChanges(false);
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Invoice Sent',
        message: 'Invoice has been saved and sent to client successfully',
        actions: [
          { label: 'View Invoice', variant: 'outline' },
          { label: 'Send Another', variant: 'default' }
        ],
        autoHide: false
      });
      
      // Navigate back to invoice list after sending
      setTimeout(() => {
        navigate('/invoice-list');
      }, 2000);
      
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Send Failed',
        message: 'Failed to send invoice. Please check client email and try again.',
        autoHide: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndDownload = async () => {
    setIsSaving(true);
    
    try {
      // Mock save and download operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'PDF Generated',
        message: 'Invoice PDF has been generated and download started',
        autoHide: true
      });
      
      // Mock PDF download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `invoice-${invoiceDetails?.number || 'draft'}.pdf`;
      link?.click();
      
    } catch (error) {
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to generate PDF. Please try again.',
        autoHide: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/invoice-list');
  };

  const handleAddNewClient = () => {
    addNotification({
      id: Date.now(),
      type: 'info',
      title: 'Add New Client',
      message: 'Redirecting to client management...',
      autoHide: true
    });
    
    setTimeout(() => {
      navigate('/client-list?action=add');
    }, 1000);
  };

  const handleDownloadPDF = () => {
    addNotification({
      id: Date.now(),
      type: 'info',
      message: 'Generating PDF preview...',
      autoHide: true
    });
  };

  const handleSendInvoice = () => {
    if (!selectedClient) {
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Client Required',
        message: 'Please select a client before sending the invoice',
        autoHide: true
      });
      return;
    }
    
    handleSaveAndSend();
  };

  const handleUserMenuClick = (action) => {
    switch (action) {
      case 'profile': navigate('/profile');
        break;
      case 'settings': navigate('/settings');
        break;
      case 'logout': navigate('/login');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ name: 'John Doe' }} 
        onUserMenuClick={handleUserMenuClick}
      />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            customItems={[
              { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
              { label: 'Invoices', path: '/invoice-list', icon: 'FileText' },
              { 
                label: isEditing ? `Edit Invoice #${invoiceDetails?.number}` : 'Create New Invoice', 
                path: '/create-edit-invoice', 
                icon: isEditing ? 'Edit' : 'Plus',
                current: true 
              }
            ]}
          />

          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {isEditing 
                    ? 'Update invoice details and send to client' :'Fill in the details below to create a professional invoice'
                  }
                </p>
              </div>

              {/* Mobile Preview Toggle */}
              <div className="mt-4 sm:mt-0 lg:hidden">
                <Button
                  variant="outline"
                  iconName={showPreview ? "Edit" : "Eye"}
                  iconPosition="left"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? 'Edit Invoice' : 'Preview'}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Two Panels */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-8">
            {/* Left Panel - Form (60%) */}
            <div className="lg:col-span-3 space-y-6">
              <CompanyInfoSection
                companyInfo={companyInfo}
                onCompanyInfoChange={setCompanyInfo}
                isEditable={true}
              />

              <ClientSelectionSection
                selectedClient={selectedClient}
                onClientChange={setSelectedClient}
                onAddNewClient={handleAddNewClient}
              />

              <InvoiceDetailsSection
                invoiceDetails={invoiceDetails}
                onInvoiceDetailsChange={setInvoiceDetails}
              />

              <LineItemsSection
                lineItems={lineItems}
                onLineItemsChange={setLineItems}
                taxRate={taxRate}
                discountAmount={discountAmount}
                onTaxRateChange={setTaxRate}
                onDiscountAmountChange={setDiscountAmount}
              />

              <ActionButtons
                onSaveDraft={handleSaveDraft}
                onSaveAndSend={handleSaveAndSend}
                onSaveAndDownload={handleSaveAndDownload}
                onCancel={handleCancel}
                isEditing={isEditing}
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </div>

            {/* Right Panel - Preview (40%) */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <InvoicePreview
                  companyInfo={companyInfo}
                  selectedClient={selectedClient}
                  invoiceDetails={invoiceDetails}
                  lineItems={lineItems}
                  taxRate={taxRate}
                  discountAmount={discountAmount}
                  onDownloadPDF={handleDownloadPDF}
                  onSendInvoice={handleSendInvoice}
                />
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Layout: Stacked */}
          <div className="lg:hidden">
            {!showPreview ? (
              <div className="space-y-6">
                <CompanyInfoSection
                  companyInfo={companyInfo}
                  onCompanyInfoChange={setCompanyInfo}
                  isEditable={true}
                />

                <ClientSelectionSection
                  selectedClient={selectedClient}
                  onClientChange={setSelectedClient}
                  onAddNewClient={handleAddNewClient}
                />

                <InvoiceDetailsSection
                  invoiceDetails={invoiceDetails}
                  onInvoiceDetailsChange={setInvoiceDetails}
                />

                <LineItemsSection
                  lineItems={lineItems}
                  onLineItemsChange={setLineItems}
                  taxRate={taxRate}
                  discountAmount={discountAmount}
                  onTaxRateChange={setTaxRate}
                  onDiscountAmountChange={setDiscountAmount}
                />

                <ActionButtons
                  onSaveDraft={handleSaveDraft}
                  onSaveAndSend={handleSaveAndSend}
                  onSaveAndDownload={handleSaveAndDownload}
                  onCancel={handleCancel}
                  isEditing={isEditing}
                  isSaving={isSaving}
                  hasUnsavedChanges={hasUnsavedChanges}
                />
              </div>
            ) : (
              <InvoicePreview
                companyInfo={companyInfo}
                selectedClient={selectedClient}
                invoiceDetails={invoiceDetails}
                lineItems={lineItems}
                taxRate={taxRate}
                discountAmount={discountAmount}
                onDownloadPDF={handleDownloadPDF}
                onSendInvoice={handleSendInvoice}
              />
            )}
          </div>
        </div>
      </main>
      <QuickActionButton />
      <NotificationBar
        notifications={notifications}
        onDismiss={removeNotification}
        onAction={(notification, actionIndex) => {
          console.log('Notification action:', notification, actionIndex);
          removeNotification(notification?.id);
        }}
      />
    </div>
  );
};

export default CreateEditInvoice;