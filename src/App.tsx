import React, { useState, useRef } from 'react';
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
import { StorageUsageInsightsView } from './components/Analytics/StorageUsageInsightsView';
import { StorageCleanupView } from './components/Cleanup/StorageCleanupView';
import { MessagesBackupView } from './components/MessagesBackup/MessagesBackupView';
import { UploadManager } from './components/Uploader/UploadManager';
import { HomeHubView } from './components/Home/HomeHubView';
import { MySubscriptionsView } from './components/Subscriptions/MySubscriptionsView';
import { MyActivePlansView } from './components/Subscriptions/MyActivePlansView';
import { AvailablePlansView } from './components/Subscriptions/AvailablePlansView';
import { ServicesCatalogView } from './components/Services/ServicesCatalogView';
import { AuthView } from './components/Auth/AuthView';
import { ActivityLogView } from './components/Audit/ActivityLogView';
import { SubPageBackBar } from './components/SubPageBackBar';
import { PlanManagerModal } from './components/Plans/PlanManagerModal';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { FilePreviewModal } from './components/FileExplorer/FilePreviewModal';
import { ShareFolderModal } from './components/FileExplorer/ShareFolderModal';
import {
  FolderPlus,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Mail,
  PhoneCall,
  Headphones,
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
  const [supportMenuOpen, setSupportMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAr = lang === 'ar';

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

      {/* Main Workspace: Sidebar + Central Viewport */}
      <div className="flex-1 flex-grow flex max-w-7xl w-full mx-auto min-h-0 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          onNewFolderClick={() => setFolderModalOpen(true)}
          onUploadClick={handleUploadClick}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        {/* Central Viewport Router */}
        <main className="flex-1 flex-grow flex flex-col min-h-0 min-w-0 overflow-y-auto bg-white dark:bg-slate-950">
          <SubPageBackBar />

          {activeTab === 'home' && <HomeHubView />}

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

          {activeTab === 'vault' && <ZeroKnowledgeVault />}

          {activeTab === 'media' && <MediaBackupView />}

          {activeTab === 'messages' && <MessagesBackupView />}

          {activeTab === 'sync' && <SelectiveSyncView />}

          {activeTab === 'security' && <SecuritySessionsView />}

          {activeTab === 'developer' && <DeveloperApiView />}

          {activeTab === 'sla' && <ObservabilityView />}

          {activeTab === 'finops' && <CloudAccountingView />}
          {activeTab === 'insights' && <StorageUsageInsightsView />}
          {activeTab === 'cleanup' && <StorageCleanupView />}
          {activeTab === 'auth' && <AuthView />}
          {activeTab === 'activity-log' && <ActivityLogView />}
        </main>

      </div>

      {/* Enterprise Bottom Footer with Color Palette Coordination */}
      <Footer />

      {/* Bottom Floating Resumable Upload Queue */}
      <UploadManager />

      {/* Pricing & Checkout Modal */}
      <PlanManagerModal />

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

      {/* Floating Support Hub positioned cleanly above the fixed bottom navigation footer */}
      <div className="fixed bottom-20 sm:bottom-24 rtl:left-4 sm:rtl:left-6 ltr:right-4 sm:ltr:right-6 z-40">
        {/* Support Channels Popup Menu */}
        {supportMenuOpen && (
          <div className="absolute bottom-full mb-3 rtl:left-0 ltr:right-0 w-72 max-w-[calc(100vw-2rem)] p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-[#1E1E24] dark:text-white">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCD3DF]/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Headphones className="w-3.5 h-3.5 text-[#1AD062]" />
                <span className="text-xs font-bold text-[#1E1E24] dark:text-white">
                  {isAr ? 'قنوات التواصل المباشر' : 'Direct Contact & Support'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSupportMenuOpen(false)}
                className="p-1 text-[#6E6A75] hover:text-[#1E1E24] dark:hover:text-white rounded-lg hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Customer Service WhatsApp */}
              <a
                href="https://wa.me/967730005955"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSupportMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-[#1AD062]/30 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1AD062]/10 text-[#1AD062] flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-[#1E1E24] dark:text-white group-hover:text-[#1AD062] transition-colors">
                      {isAr ? 'واتساب خدمة العملاء' : 'Customer Support'}
                    </span>
                    <span className="text-[10px] text-[#6E6A75] font-mono" dir="ltr">730005955</span>
                  </div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1AD062]/15 text-[#1AD062] font-bold">24/7</span>
              </a>

              {/* Management WhatsApp */}
              <a
                href="https://wa.me/967770600046"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSupportMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-[#1AD062]/30 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1AD062]/10 text-[#1AD062] flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-[#1E1E24] dark:text-white group-hover:text-[#1AD062] transition-colors">
                      {isAr ? 'واتساب الإدارة' : 'Management WhatsApp'}
                    </span>
                    <span className="text-[10px] text-[#6E6A75] font-mono" dir="ltr">770600046</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#6E6A75] font-semibold">{isAr ? 'مباشر' : 'Direct'}</span>
              </a>

              {/* Management Phone Call */}
              <a
                href="tel:+967780080555"
                onClick={() => setSupportMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-[#A38540]/30 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#A38540]/10 text-[#A38540] flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-[#1E1E24] dark:text-white group-hover:text-[#A38540] transition-colors">
                      {isAr ? 'اتصال الإدارة' : 'Management Call'}
                    </span>
                    <span className="text-[10px] text-[#6E6A75] font-mono" dir="ltr">00967780080555</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#A38540] font-bold">{isAr ? 'هاتف' : 'Call'}</span>
              </a>

              {/* Management Official Email */}
              <a
                href="mailto:saad@rawajye.com"
                onClick={() => setSupportMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-[#4E115A]/30 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F5EFF7] dark:bg-purple-950/60 text-[#4E115A] dark:text-purple-300 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-[#1E1E24] dark:text-white group-hover:text-[#4E115A] transition-colors">
                      {isAr ? 'البريد الإلكتروني للإدارة' : 'Management Email'}
                    </span>
                    <span className="text-[10px] text-[#6E6A75] font-mono" dir="ltr">saad@rawajye.com</span>
                  </div>
                </div>
                <span className="text-[10px] text-[#4E115A] dark:text-purple-300 font-bold">{isAr ? 'إيميل' : 'Email'}</span>
              </a>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          type="button"
          onClick={() => setSupportMenuOpen(!supportMenuOpen)}
          aria-label="Direct Support"
          title={isAr ? 'معلومات التواصل والدعم الفني المباشر' : 'Direct Support & Contact Channels'}
          className="flex items-center justify-center gap-2 w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-full bg-[#1AD062] hover:bg-[#17b856] text-white font-bold text-xs shadow-xl shadow-[#1AD062]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.763.818 2.791.819h.005c3.18 0 5.767-2.586 5.767-5.766.001-3.182-2.585-5.805-5.766-5.805zm3.435 8.232c-.145.409-.838.775-1.164.823-.326.05-.742.062-2.18-.519-1.838-.742-3.023-2.614-3.114-2.735-.091-.121-.745-.989-.745-1.887 0-.898.469-1.34.636-1.521.167-.182.364-.228.486-.228.121 0 .243.002.349.006.111.005.26-.042.406.309.152.364.516 1.261.561 1.352.046.091.076.197.015.318-.06.121-.091.197-.182.304-.091.106-.192.237-.274.318-.091.091-.186.19-.08.372.106.182.471.777 1.01 1.258.694.619 1.28.811 1.462.902.182.091.288.076.395-.046.106-.121.456-.531.577-.713.121-.182.243-.152.409-.091.167.061 1.062.5 1.244.591.182.091.304.137.349.212.046.076.046.439-.099.848zM12 2C6.477 2 2 6.477 2 12c0 1.891.527 3.662 1.445 5.176L2 22l4.981-1.408A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
          <span className="hidden sm:inline font-semibold whitespace-nowrap">{isAr ? 'الدعم والتواصل' : 'Support & Contact'}</span>
        </button>
      </div>

      {/* Global Notification Toast positioned above the bottom footer */}
      {notification && (
        <div className="fixed bottom-20 sm:bottom-24 rtl:right-4 sm:rtl:right-6 ltr:left-4 sm:ltr:left-6 z-50 max-w-[calc(100vw-5.5rem)] sm:max-w-md bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 text-xs font-medium">
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
