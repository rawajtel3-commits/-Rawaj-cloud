import React, { useState, useRef, useEffect } from 'react';
import { StorageProvider, useStorage } from './context/StorageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { FileExplorer } from './components/FileExplorer/FileExplorer';
import { ZeroKnowledgeVault } from './components/Vault/ZeroKnowledgeVault';
import { MediaBackupView } from './components/CameraBackup/MediaBackupView';
import { SelectiveSyncView } from './components/SelectiveSync/SelectiveSyncView';
import { SecuritySessionsView } from './components/Security/SecuritySessionsView';
import { DeveloperApiView } from './components/DeveloperApi/DeveloperApiView';
import { ObservabilityView } from './components/SLA/ObservabilityView';
import { CloudAccountingView } from './components/FinOps/CloudAccountingView';
import { BillingReconciliationModule } from './components/FinOps/BillingReconciliationModule';
import { StorageUsageInsightsView } from './components/Analytics/StorageUsageInsightsView';
import { StorageCleanupView } from './components/Cleanup/StorageCleanupView';
import { MessagesBackupView } from './components/MessagesBackup/MessagesBackupView';
import { UploadManager } from './components/Uploader/UploadManager';
import { HomeHubView } from './components/Home/HomeHubView';
import { MySubscriptionsView } from './components/Subscriptions/MySubscriptionsView';
import { MyActivePlansView } from './components/Subscriptions/MyActivePlansView';
import { AvailablePlansView } from './components/Subscriptions/AvailablePlansView';
import { ServicesCatalogView } from './components/Services/ServicesCatalogView';
import { SocialVerificationView } from './components/Services/SocialVerificationView';
import { AuthView } from './components/Auth/AuthView';
import { ActivityLogView } from './components/Audit/ActivityLogView';
import { CloudToolsView } from './components/CloudTools/CloudToolsView';
import { SubPageBackBar } from './components/SubPageBackBar';
import { PlanManagerModal } from './components/Plans/PlanManagerModal';
import { SecurePaymentGatewayModal } from './components/Plans/SecurePaymentGatewayModal';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { FilePreviewModal } from './components/FileExplorer/FilePreviewModal';
import { ShareFolderModal } from './components/FileExplorer/ShareFolderModal';
import {
  FolderPlus,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Menu,
  MessageCircle,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    lang,
    activeTab,
    notification,
    createNewFolder,
    uploadFiles,
  } = useStorage();

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#0284C7');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);

  const isAr = lang === 'ar';

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeTab]);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createNewFolder(newFolderName.trim(), folderColor);
      setNewFolderName('');
      setFolderModalOpen(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleGlobalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="h-dvh max-h-dvh flex flex-col bg-white dark:bg-slate-950 text-[#1E1E24] dark:text-slate-100 transition-colors overflow-hidden">
      
      {/* Hidden file input for global upload triggers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleGlobalFileChange}
        className="hidden"
      />

      {/* Top Bar Navigation */}
      <Navbar onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

      {/* Main Workspace: Full-bleed Central Viewport + Slide-over Sidebar Drawer */}
      <div className="flex-1 flex-grow flex w-full min-h-0 overflow-hidden">
        
        {/* Slide-over Navigation Sidebar Drawer */}
        <Sidebar
          onNewFolderClick={() => setFolderModalOpen(true)}
          onUploadClick={handleUploadClick}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Central Viewport Router (Single Unified Page Scroll) */}
        <main
          ref={mainScrollRef}
          className="flex-1 flex-grow flex flex-col min-h-0 min-w-0 overflow-y-auto overflow-x-hidden scroll-smooth bg-[#F3F2F5] dark:bg-slate-950"
        >
          <SubPageBackBar />

          {activeTab === 'home' && (
            <HomeHubView
              onUploadClick={handleUploadClick}
              onNewFolderClick={() => setFolderModalOpen(true)}
            />
          )}

          {activeTab === 'files' && (
            <FileExplorer
              onNewFolderClick={() => setFolderModalOpen(true)}
              onUploadClick={handleUploadClick}
            />
          )}

          {activeTab === 'subscriptions' && <MySubscriptionsView />}

          {activeTab === 'my-plans' && <MyActivePlansView />}

          {(activeTab === 'available-plans' || activeTab === 'plans') && <AvailablePlansView />}

          {activeTab === 'services' && <ServicesCatalogView />}
          {activeTab === 'social-verification' && <SocialVerificationView />}

          {activeTab === 'vault' && <ZeroKnowledgeVault />}

          {activeTab === 'media' && <MediaBackupView />}

          {activeTab === 'messages' && <MessagesBackupView />}

          {activeTab === 'sync' && <SelectiveSyncView />}

          {activeTab === 'security' && <SecuritySessionsView />}

          {activeTab === 'developer' && <DeveloperApiView />}

          {activeTab === 'sla' && <ObservabilityView />}

          {activeTab === 'finops' && <CloudAccountingView />}
          {activeTab === 'reconciliation' && <BillingReconciliationModule />}
          {activeTab === 'insights' && <StorageUsageInsightsView />}
          {activeTab === 'cleanup' && <StorageCleanupView />}
          {activeTab === 'auth' && <AuthView />}
          {activeTab === 'activity-log' && <ActivityLogView />}
          {activeTab === 'cloud-tools' && (
            <CloudToolsView onUploadClick={handleUploadClick} />
          )}
        </main>

      </div>

      {/* Enterprise Bottom Footer with Color Palette Coordination */}
      <Footer />

      {/* Bottom Floating Resumable Upload Queue */}
      <UploadManager />

      {/* Pricing & Checkout Modal */}
      <PlanManagerModal />

      {/* Secure Payment Gateway Modal (Credit Card Verification & Instant Upgrade) */}
      <SecurePaymentGatewayModal />

      {/* Onboarding Flow Modal */}
      <OnboardingModal />

      {/* Global Integrated File Preview Modal (PDF, Image, Text/Code, Spreadsheets) */}
      <FilePreviewModal />

      {/* Global Folder Sharing Modal with Permissions & Expiration */}
      <ShareFolderModal />

      {/* New Folder Modal */}
      {folderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? 'إنشاء مجلد جديد' : 'New Folder'}
                </h3>
              </div>
              <button
                onClick={() => setFolderModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
                  {isAr ? 'اسم المجلد:' : 'Folder Name:'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'مثال: العقود الهندسية 2026' : 'e.g. Architectural Projects'}
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1.5 font-medium">
                  {isAr ? 'لون المجلد المخصص:' : 'Folder Accent Color:'}
                </label>
                <div className="flex items-center gap-2">
                  {['#0284C7', '#F97316', '#10B981', '#8B5CF6', '#EC4899', '#EAB308'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFolderColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        folderColor === color ? 'scale-125 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFolderModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-[#6E6A75] dark:text-slate-400 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 font-semibold border border-[#DCD3DF]"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {isAr ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Controls: positioned cleanly above the 72px fixed footer (z-30 stays strictly beneath Footer/Navbar z-40 popovers & Sidebar/Modals z-50) */}
      {!mobileSidebarOpen && (
        <>
          {/* Circular Purple Floating Navigation Menu Button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label={isAr ? 'فتح القائمة الجانبية' : 'Open navigation menu'}
            className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] sm:bottom-[calc(96px+env(safe-area-inset-bottom))] rtl:left-[max(0.875rem,env(safe-area-inset-left))] ltr:right-[max(0.875rem,env(safe-area-inset-right))] sm:rtl:left-5 sm:ltr:right-5 z-30 mb-1 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#5D276E] hover:bg-[#4B1D5A] text-white shadow-xl shadow-[#3B004E]/35 ring-2 ring-white/20 flex items-center justify-center hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
          </button>

          {/* Direct WhatsApp Support Floating Button */}
          <a
            href="https://wa.me/967730005955"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={isAr ? 'تواصل عبر واتساب الدعم المباشر' : 'Contact WhatsApp Support'}
            title={isAr ? 'واتساب الدعم المباشر 24/7' : 'Direct WhatsApp Support 24/7'}
            className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] sm:bottom-[calc(96px+env(safe-area-inset-bottom))] rtl:right-[max(0.875rem,env(safe-area-inset-right))] ltr:left-[max(0.875rem,env(safe-area-inset-left))] sm:rtl:right-5 sm:ltr:left-5 z-30 mb-1 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#25D366] hover:bg-[#1EB958] text-white shadow-lg shadow-emerald-900/25 ring-2 ring-white/85 dark:ring-slate-900/85 flex items-center justify-center hover:-translate-y-0.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white/15" strokeWidth={2.1} />
          </a>
        </>
      )}

      {/* Global Notification Toast positioned cleanly above both footer and floating icons */}
      {notification && (
        <div className="fixed bottom-[calc(156px+env(safe-area-inset-bottom))] sm:bottom-[calc(168px+env(safe-area-inset-bottom))] rtl:right-4 sm:rtl:right-6 ltr:left-4 sm:ltr:left-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 text-xs font-medium">
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {notification.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          <div className="leading-snug">
            {isAr ? notification.messageAr : notification.messageEn}
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <StorageProvider>
      <MainLayout />
    </StorageProvider>
  );
}
