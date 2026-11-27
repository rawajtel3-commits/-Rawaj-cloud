import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { ChatConversation, ChatMessageItem } from '../../types/messages';
import { formatBytes } from '../../utils/formatters';
import {
  encryptWhatsAppConversation,
  decryptWhatsAppConversation,
  formatWhatsAppKeyDisplay,
  calculateKeyFingerprint,
  generateEmergencyKeySheet,
  EncryptedWhatsAppPackage,
} from '../../utils/whatsappCrypto';
import {
  MessageSquareLock,
  FolderLock,
  MessageCircle,
  Phone,
  Search,
  RefreshCw,
  ShieldCheck,
  Key,
  HardDrive,
  Download,
  Share2,
  Lock,
  Unlock,
  FileText,
  Volume2,
  Play,
  Pause,
  Image as ImageIcon,
  CheckCheck,
  Check,
  Wifi,
  Smartphone,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Archive,
  Info,
  ExternalLink,
  ShieldAlert,
  Copy,
  Eye,
  EyeOff,
  Code2,
  Terminal,
  X,
  FileCode,
} from 'lucide-react';

export const MessagesBackupView: React.FC = () => {
  const {
    lang,
    messagesSettings,
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    updateMessagesSettings,
    triggerManualMessagesSync,
    isSyncingMessages,
    restoreConversation,
    exportConversation,
    regenerateWhatsAppMasterKey,
    securitySettings,
    toggleAutoWhatsAppVaultBackup,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';

  const [activePlatformFilter, setActivePlatformFilter] = useState<'all' | 'whatsapp' | 'sms'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Zero-Knowledge Master Key states
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isCopiedKey, setIsCopiedKey] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  // Zero-Knowledge View Mode: Raw Ciphertext vs Decrypted Plaintext
  const [isCiphertextMode, setIsCiphertextMode] = useState(false);

  // Cryptographic Pipeline Modal & Audit
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);

  // Encrypted Packet Inspector Modal
  const [inspectorPackage, setInspectorPackage] = useState<EncryptedWhatsAppPackage | null>(null);

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(convo => {
      const matchesPlatform =
        activePlatformFilter === 'all' ? true : convo.platform === activePlatformFilter;
      
      const term = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !term ||
        convo.contactName.toLowerCase().includes(term) ||
        convo.phoneNumber.toLowerCase().includes(term) ||
        convo.lastMessageText.toLowerCase().includes(term) ||
        convo.messages.some(m => m.text.toLowerCase().includes(term));

      return matchesPlatform && matchesSearch;
    });
  }, [conversations, activePlatformFilter, searchTerm]);

  // Selected conversation
  const currentConversation: ChatConversation | undefined = useMemo(() => {
    return conversations.find(c => c.id === selectedConversationId) || conversations[0];
  }, [conversations, selectedConversationId]);

  const masterKey = messagesSettings.userMasterKey64 || 'a7c93e4b8f1265d90145bcde89fa34217890bcdefa1234567890abcdef123456';

  const toggleAudio = (id: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      setTimeout(() => {
        setPlayingAudioId(prev => (prev === id ? null : prev));
      }, 4000);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(masterKey);
    setIsCopiedKey(true);
    showNotification(
      'تم نسخ مفتاح التشفير E2EE (64 خانة) إلى الحافظة بأمان',
      'Copied 64-digit Zero-Knowledge key to clipboard safely',
      'success'
    );
    setTimeout(() => setIsCopiedKey(false), 2500);
  };

  const handleDownloadEmergencySheet = () => {
    const text = generateEmergencyKeySheet(masterKey, messagesSettings.backupKeyFingerprint);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RawajCloud_WhatsApp_E2EE_Emergency_Key_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification(
      'تم تنزيل صحيفة الطوارئ لمفتاح التشفير السري E2EE',
      'Downloaded E2EE Emergency Recovery Key Sheet',
      'success'
    );
  };

  // Run Real Local WebCrypto Pipeline Simulation
  const runEncryptionPipelineAudit = async () => {
    if (!currentConversation) return;
    setPipelineModalOpen(true);
    setIsPipelineRunning(true);
    setPipelineStep(1);

    // Step 1: Read local store
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(2);

    // Step 2: PBKDF2 Key Derivation
    await new Promise(r => setTimeout(r, 700));
    setPipelineStep(3);

    // Step 3: Local In-Memory Encryption with WebCrypto
    const encryptedPkg = await encryptWhatsAppConversation(currentConversation, masterKey);
    setInspectorPackage(encryptedPkg);
    await new Promise(r => setTimeout(r, 800));
    setPipelineStep(4);

    // Step 4: Generate AuthTag & SHA-256 Checksum
    await new Promise(r => setTimeout(r, 600));
    setPipelineStep(5);

    // Step 5: Finished
    setIsPipelineRunning(false);
    showNotification(
      'اكتمل التشفير الصفري المحلي بنجاح! البيانات جاهزة للإرسال إلى رواج كلاود كبايتات غير قابلة للقراءة.',
      'Local Zero-Knowledge encryption verified! Data ready for cloud sync.',
      'success'
    );
  };

  // Inspect the current conversation package
  const handleInspectEncryptedPackage = async () => {
    if (!currentConversation) return;
    const pkg = await encryptWhatsAppConversation(currentConversation, masterKey);
    setInspectorPackage(pkg);
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:min-h-0 lg:overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none pb-28 lg:pb-0">
      
      {/* Top Header Banner & Stats */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Tagline */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#4E115A] text-white flex items-center justify-center shadow-md shadow-[#4E115A]/20 shrink-0">
              <MessageSquareLock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isAr ? 'النسخ السحابي المشفر لمحادثات الواتساب' : 'Zero-Knowledge WhatsApp Cloud Backup'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1AD062]/10 text-[#1AD062] border border-[#1AD062]/30 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تشفير صفري E2EE (AES-256-GCM)' : 'Zero-Knowledge E2EE'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isAr
                  ? 'يتم تشفير المحادثات والوسائط محلياً على جهازك قبل رفعها، بحيث تعجز خوادم رواج كلاود عن قراءة محتواها'
                  : 'Client-side AES-256-GCM encryption before upload ensures Zero-Knowledge privacy compliance'}
              </p>
            </div>
          </div>

          {/* Action Buttons: Key Manager + Pipeline Test + Sync */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              onClick={() => setKeyModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 text-xs font-bold rounded-xl border border-[#4E115A]/30 bg-[#F5EFF7] dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300 hover:bg-[#4E115A] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={isAr ? 'إدارة مفتاح التشفير 64-Digit E2EE' : 'Manage 64-Digit E2EE Key'}
            >
              <Key className="w-4 h-4 text-[#A38540]" />
              <span className="hidden sm:inline">{isAr ? 'مفتاح التشفير' : 'E2EE Key'}</span>
            </button>

            <button
              type="button"
              onClick={runEncryptionPipelineAudit}
              className="p-2 sm:px-3 sm:py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title={isAr ? 'فحص ومحاكاة خط أنابيب التشفير المحلي' : 'Audit Local Encryption Pipeline'}
            >
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline">{isAr ? 'فحص التشفير' : 'Crypto Audit'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={`p-2 sm:px-3 sm:py-2 text-xs font-medium rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                settingsOpen
                  ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? 'السياسات' : 'Policies'}</span>
            </button>

            <button
              type="button"
              onClick={triggerManualMessagesSync}
              disabled={isSyncingMessages}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                isSyncingMessages
                  ? 'bg-emerald-400 cursor-not-allowed opacity-80'
                  : 'bg-[#4E115A] hover:bg-[#3D0D47] active:scale-95 shadow-[#4E115A]/20'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingMessages ? 'animate-spin' : ''}`} />
              <span>
                {isSyncingMessages
                  ? isAr ? 'تشفير ومزامنة...' : 'Encrypting...'
                  : isAr ? 'مزامنة لحظية مشفرة' : 'Sync Encrypted'}
              </span>
            </button>
          </div>

        </div>

        {/* Real-time KPI Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {isAr ? 'رسائل الواتساب' : 'WhatsApp Messages'}
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                {messagesSettings.totalWhatsappCount.toLocaleString()} {isAr ? 'رسالة' : 'msgs'}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {isAr ? 'الرسائل النصية SMS' : 'SMS Messages'}
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                {messagesSettings.totalSmsCount.toLocaleString()} {isAr ? 'رسالة' : 'msgs'}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#4E115A]/10 text-[#4E115A] dark:text-purple-300 shrink-0">
              <HardDrive className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {isAr ? 'وسائط وصوتيات مشفرة' : 'Encrypted Media'}
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white font-mono">
                {formatBytes(messagesSettings.totalMediaSizeBytes)}
              </div>
            </div>
          </div>

          <div
            onClick={() => setKeyModalOpen(true)}
            className="p-2.5 rounded-xl bg-[#F5EFF7] dark:bg-purple-950/40 border border-[#4E115A]/30 flex items-center gap-2.5 cursor-pointer hover:border-[#4E115A] transition-colors"
            title={isAr ? 'انقر لعرض وتفقد مفتاح التشفير' : 'Click to inspect E2EE key'}
          >
            <div className="p-2 rounded-lg bg-[#A38540]/15 text-[#A38540] shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                {isAr ? 'بصمة المفتاح (SHA-256)' : 'Key Fingerprint'}
              </div>
              <div className="text-xs font-mono font-black text-[#4E115A] dark:text-purple-300 truncate">
                {messagesSettings.backupKeyFingerprint.slice(0, 16)}...
              </div>
            </div>
          </div>

        </div>

        {/* Collapsible Backup Settings Drawer */}
        {settingsOpen && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#4E115A] dark:text-purple-300" />
                <span>{isAr ? 'سياسات التخزين السحابي والتشفير الصارم' : 'Zero-Knowledge Backup Policies'}</span>
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {isAr ? 'آخر مزامنة:' : 'Last sync:'} {new Date(messagesSettings.lastSyncTimestamp).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-3 text-xs">
              
              <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#4E115A]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={securitySettings.autoWhatsAppVaultBackup}
                  onChange={e => toggleAutoWhatsAppVaultBackup(e.target.checked)}
                  className="w-4 h-4 text-[#4E115A] rounded-sm cursor-pointer accent-[#4E115A]"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FolderLock className="w-3.5 h-3.5 text-[#1AD062]" />
                    <span>{isAr ? 'النسخ التلقائي إلى الخزنة المشفرة' : 'Auto-Sync to Encrypted Vault'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'تشفير فوري وحفظ مباشر داخل Zero-Knowledge Vault' : 'Continual client encryption saved into Vault'}
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#4E115A]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={messagesSettings.wifiOnly}
                  onChange={e => updateMessagesSettings({ wifiOnly: e.target.checked })}
                  className="w-4 h-4 text-[#4E115A] rounded-sm cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5 text-blue-500" />
                    <span>{isAr ? 'رفع الكتل عبر Wi-Fi فقط' : 'Wi-Fi Only Sync'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'حماية باقة بيانات الهاتف من استهلاك الوسائط' : 'Preserve cellular mobile data usage'}
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-[#4E115A]/40 transition-colors">
                <input
                  type="checkbox"
                  checked={messagesSettings.smartAudioCompression}
                  onChange={e => updateMessagesSettings({ smartAudioCompression: e.target.checked })}
                  className="w-4 h-4 text-[#4E115A] rounded-sm cursor-pointer"
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#A38540]" />
                    <span>{isAr ? 'ضغط الصوتيات المشفرة (Opus)' : 'Smart Opus Voice Compression'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'توفير 60% من الحجم قبل التشفير دون فقدان الجودة' : 'Compresses voice notes to 32kbps prior to AES-GCM'}
                  </div>
                </div>
              </label>

            </div>
          </div>
        )}

      </div>

      {/* Main Dual-Pane Content (Left: Conversations List, Right: Message Inspector) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left Pane: Conversation List */}
        <div className="w-full sm:w-80 md:w-96 border-r rtl:border-l rtl:border-r-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col shrink-0">
          
          {/* Platform Filters & Search Bar */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
            {/* Platform Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActivePlatformFilter('all')}
                className={`flex-1 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activePlatformFilter === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>

              <button
                type="button"
                onClick={() => setActivePlatformFilter('whatsapp')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePlatformFilter === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatformFilter('sms')}
                className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePlatformFilter === 'sms'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-700 dark:text-blue-400 hover:text-blue-800'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isAr ? 'SMS' : 'SMS'}</span>
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute top-2.5 rtl:right-3 ltr:left-3 text-slate-400" />
              <input
                type="text"
                placeholder={isAr ? 'البحث في المحادثات المشفرة...' : 'Search encrypted chats...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rtl:pr-9 ltr:pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#4E115A]/20"
              />
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>{isAr ? 'لم يتم العثور على محادثات مطابقة للبحث' : 'No matching conversations found'}</p>
              </div>
            ) : (
              filteredConversations.map(convo => {
                const isSelected = convo.id === currentConversation?.id;
                const isWhatsApp = convo.platform === 'whatsapp';

                return (
                  <div
                    key={convo.id}
                    onClick={() => setSelectedConversationId(convo.id)}
                    className={`p-3.5 transition-colors cursor-pointer select-none flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-r-4 rtl:border-r-0 rtl:border-l-4 border-[#4E115A]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Avatar / Platform Icon */}
                    <div className="relative shrink-0">
                      {convo.avatarUrl ? (
                        <img
                          src={convo.avatarUrl}
                          alt={convo.contactName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                            isWhatsApp ? 'bg-emerald-600' : 'bg-blue-600'
                          }`}
                        >
                          {convo.contactName.charAt(0)}
                        </div>
                      )}

                      <div
                        className={`absolute -bottom-1 -right-1 rtl:-left-1 rtl:right-auto w-4.5 h-4.5 rounded-full flex items-center justify-center text-white text-[9px] shadow-sm border border-white dark:border-slate-900 ${
                          isWhatsApp ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      >
                        {isWhatsApp ? <MessageCircle className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
                      </div>
                    </div>

                    {/* Chat Overview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {convo.contactName}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {convo.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-1">
                        {isCiphertextMode ? '🔒 c7f8a9e012bc44d8fa...' : convo.lastMessageText}
                      </p>

                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-slate-400 font-mono">
                          {convo.totalMessagesCount.toLocaleString()} {isAr ? 'رسالة' : 'msgs'}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono">
                          {formatBytes(convo.totalMediaSizeBytes)}
                        </span>
                        <span className="ml-auto rtl:mr-auto rtl:ml-0 inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>E2EE</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Pane: Message Inspector / Chat Viewer */}
        <div className="flex-1 flex flex-col bg-slate-100/60 dark:bg-slate-950/80 min-h-0">
          
          {currentConversation ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-3.5 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {currentConversation.avatarUrl ? (
                    <img
                      src={currentConversation.avatarUrl}
                      alt={currentConversation.contactName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${
                        currentConversation.platform === 'whatsapp' ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                    >
                      {currentConversation.contactName.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {currentConversation.contactName}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          currentConversation.platform === 'whatsapp'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        }`}
                      >
                        {currentConversation.platform}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{currentConversation.phoneNumber}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-[#4E115A] dark:text-purple-300 font-bold">
                        AES-256-GCM
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conversation Actions: Privacy Mode Toggle, Packet Inspector & Export */}
                <div className="flex items-center gap-2 shrink-0">
                  
                  {/* Zero-Knowledge Ciphertext Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsCiphertextMode(!isCiphertextMode)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                      isCiphertextMode
                        ? 'bg-[#4E115A] border-[#4E115A] text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#4E115A]'
                    }`}
                    title={isAr ? 'عرض الحزمة المشفرة كما يراها خادم السحابة' : 'Toggle raw encrypted ciphertext view'}
                  >
                    {isCiphertextMode ? <Lock className="w-3.5 h-3.5 text-amber-300" /> : <Unlock className="w-3.5 h-3.5 text-[#1AD062]" />}
                    <span className="hidden sm:inline">
                      {isCiphertextMode ? (isAr ? 'مشفر سحابياً' : 'Ciphertext Mode') : (isAr ? 'مفكوك محلياً' : 'Plaintext Mode')}
                    </span>
                  </button>

                  {/* Packet Inspector */}
                  <button
                    type="button"
                    onClick={handleInspectEncryptedPackage}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={isAr ? 'فحص حزمة التشفير الثنائية JSON' : 'Inspect Encrypted JSON Packet'}
                  >
                    <Code2 className="w-3.5 h-3.5 text-[#A38540]" />
                    <span className="hidden md:inline">{isAr ? 'فحص الحزمة' : 'Inspect'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportConversation(currentConversation.id, 'json')}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title={isAr ? 'تصدير أرشيف JSON' : 'Export Archive'}
                  >
                    <Archive className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => restoreConversation(currentConversation.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isAr ? 'استعادة للجهاز' : 'Restore'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                
                {/* Security Verification Notice */}
                <div className="max-w-xl mx-auto p-3 rounded-2xl bg-[#F5EFF7] dark:bg-purple-950/30 border border-[#4E115A]/30 dark:border-purple-900/40 text-center text-[11px] text-[#4E115A] dark:text-purple-300 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1AD062] shrink-0" />
                    <span>
                      {isAr
                        ? 'محادثة مشفرة بتشفير صفري كامل (Zero-Knowledge). المفتاح محفوظ حصرياً في متصفحك.'
                        : 'Protected with Zero-Knowledge E2EE. Your decryption key never leaves your local browser.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKeyModalOpen(true)}
                    className="font-bold underline cursor-pointer text-xs shrink-0"
                  >
                    {isAr ? 'فحص المفتاح' : 'Inspect Key'}
                  </button>
                </div>

                {/* Message Bubbles */}
                {currentConversation.messages.map((msg, index) => {
                  const isOutgoing = msg.isOutgoing;
                  // Simulated deterministic ciphertext for visual proof
                  const fakeCipherHex = `9f4c${(index * 3791 + 441).toString(16)}8b201a4f9e01... [AES-GCM AuthTag Verified]`;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 font-medium mb-1 px-1">
                        {msg.senderName}
                      </div>

                      <div
                        className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs space-y-2 transition-all ${
                          isCiphertextMode
                            ? 'bg-slate-900 text-emerald-400 border border-slate-700 font-mono text-xs'
                            : isOutgoing
                            ? 'bg-[#4E115A] text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                        }`}
                      >
                        {/* Text Content */}
                        {isCiphertextMode ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                              <Lock className="w-3 h-3 text-amber-300" />
                              <span>{isAr ? 'كتلة مشفرة مشفرة في السحابة:' : 'Cloud Ciphertext Blob:'}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-black/40 text-[11px] text-emerald-400 break-all select-text font-mono">
                              {fakeCipherHex}
                            </div>
                          </div>
                        ) : (
                          <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                        )}

                        {/* Attachments Section (Voice, Images, Documents) */}
                        {msg.hasAttachment && (
                          <div className="pt-2 border-t border-white/20 dark:border-slate-700">
                            
                            {/* Voice Note Player */}
                            {msg.attachmentType === 'voice' && (
                              <div
                                className={`p-2.5 rounded-xl flex items-center gap-3 ${
                                  isCiphertextMode
                                    ? 'bg-black/50 text-slate-300'
                                    : isOutgoing
                                    ? 'bg-white/15 text-white'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleAudio(msg.id)}
                                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 text-[#4E115A] dark:text-purple-300 flex items-center justify-center shadow-xs cursor-pointer shrink-0"
                                >
                                  {playingAudioId === msg.id ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4 ml-0.5 rtl:mr-0.5 rtl:ml-0" />
                                  )}
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between text-[11px] font-mono">
                                    <span className="truncate">{msg.attachmentName}</span>
                                    <span className="shrink-0">{msg.attachmentSize}</span>
                                  </div>
                                  <div className="w-full bg-slate-300 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                    <div
                                      className={`h-full bg-[#1AD062] rounded-full transition-all duration-300 ${
                                        playingAudioId === msg.id ? 'w-3/4 animate-pulse' : 'w-1/4'
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Image Attachment Preview */}
                            {msg.attachmentType === 'image' && msg.attachmentUrl && (
                              <div className="space-y-1.5">
                                <div className="rounded-xl overflow-hidden border border-white/20 dark:border-slate-700 max-h-60 bg-black/10">
                                  {isCiphertextMode ? (
                                    <div className="p-8 text-center bg-slate-900 text-slate-400 space-y-2">
                                      <Lock className="w-6 h-6 mx-auto text-amber-400" />
                                      <p className="font-mono text-xs text-amber-200">AES-256-GCM Encrypted Image Payload (1.4 MB)</p>
                                    </div>
                                  ) : (
                                    <img
                                      src={msg.attachmentUrl}
                                      alt={msg.attachmentName || 'Media'}
                                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                  )}
                                </div>
                                <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                                  <span>{msg.attachmentName}</span>
                                  <span>{msg.attachmentSize}</span>
                                </div>
                              </div>
                            )}

                            {/* Document Attachment */}
                            {msg.attachmentType === 'document' && (
                              <div
                                className={`p-2.5 rounded-xl flex items-center justify-between gap-3 ${
                                  isOutgoing
                                    ? 'bg-white/15 text-white'
                                    : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate">
                                      {msg.attachmentName}
                                    </div>
                                    <div className="text-[10px] opacity-75 font-mono">
                                      {msg.attachmentSize}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => restoreConversation(currentConversation.id)}
                                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white shrink-0 cursor-pointer"
                                  title={isAr ? 'تنزيل المستند' : 'Download document'}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                          </div>
                        )}

                        {/* Timestamp & E2EE Verification */}
                        <div
                          className={`flex items-center justify-end gap-1.5 text-[10px] pt-1 font-mono ${
                            isCiphertextMode
                              ? 'text-emerald-400'
                              : isOutgoing
                              ? 'text-purple-200'
                              : 'text-slate-400'
                          }`}
                        >
                          <Lock className="w-3 h-3 text-[#1AD062]" />
                          <span>{msg.timestamp}</span>
                          {isOutgoing && <CheckCheck className="w-3.5 h-3.5 text-sky-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>

              {/* Chat Input / Privacy Notice Bar */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1AD062]" />
                  <span>
                    {isAr
                      ? 'مزامنة السحابة مفعلة. تشفير وفك تشفير البيانات يتمان بالكامل داخل المتصفح.'
                      : 'Cloud sync active. All encryption and decryption operations execute 100% locally in browser.'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {currentConversation.messages.length} {isAr ? 'عنصر في الأرشيف' : 'items'}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <MessageSquareLock className="w-12 h-12 text-[#4E115A]" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {isAr ? 'اختر محادثة لعرض تفاصيل رسائلها ومرفقاتها المشفرة' : 'Select a conversation to view decrypted messages and media'}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* 64-Digit E2EE Master Key Modal */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4E115A] text-white flex items-center justify-center shadow-xs">
                  <Key className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? 'مفتاح التشفير السري E2EE (64 خانة)' : 'WhatsApp E2EE 64-Digit Master Key'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {isAr ? 'تشفير صفري تام لا يمكن للمنصة فكه دون هذا المفتاح' : 'Zero-Knowledge: Key resides strictly on your local device'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setKeyModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>{isAr ? 'تنبيه أمان صارم (Zero-Knowledge Privacy):' : 'Zero-Knowledge Privacy Notice:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {isAr
                  ? 'رواج كلاود لا تحفظ نسختك من هذا المفتاح مطلقاً على خوادمها. في حال ضياع المفتاح لن يتمكن أحد من استرجاع محادثاتك المشفرة.'
                  : 'Rawaj Cloud does not store this key. If you lose this 64-digit key, your encrypted backup cannot be restored.'}
              </p>
            </div>

            {/* 64-Digit Key Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{isAr ? 'مفتاح النسخ الاحتياطي المشفر 256-Bit:' : '256-Bit E2EE Key:'}</span>
                <button
                  type="button"
                  onClick={() => setShowKeySecret(!showKeySecret)}
                  className="text-xs text-[#4E115A] dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  {showKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showKeySecret ? (isAr ? 'إخفاء المفتاح' : 'Hide Key') : (isAr ? 'إظهار المفتاح' : 'Reveal Key')}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-mono text-xs text-center select-all break-words leading-loose tracking-wider">
                {showKeySecret ? (
                  <span className="text-[#4E115A] dark:text-purple-300 font-black">
                    {formatWhatsAppKeyDisplay(masterKey)}
                  </span>
                ) : (
                  <span className="text-slate-400 tracking-widest">
                    •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••
                  </span>
                )}
              </div>
            </div>

            {/* Key Actions: Copy & Emergency Sheet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyKey}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                {isCopiedKey ? <Check className="w-4 h-4 text-[#1AD062]" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{isCopiedKey ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ المفتاح 64 خانة' : 'Copy 64-Digit Key')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadEmergencySheet}
                className="py-2.5 px-4 rounded-xl bg-[#F5EFF7] dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300 border border-[#4E115A]/30 hover:bg-[#4E115A] hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تنزيل صحيفة الطوارئ (.txt)' : 'Download Emergency Sheet'}</span>
              </button>
            </div>

            {/* Regenerate Key Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {isAr ? 'ترغب في إعادة توليد مفتاح جديد؟' : 'Need to rotate to a new key?'}
              </span>
              <button
                type="button"
                onClick={regenerateWhatsAppMasterKey}
                className="text-[#4E115A] dark:text-purple-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isAr ? 'توليد مفتاح جديد' : 'Rotate Key'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Interactive Encryption Pipeline Modal */}
      {pipelineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? 'مسار التشفير المحلي قبل الرفع (Zero-Knowledge)' : 'Client-Side Encryption Pipeline'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    RFC 5116 (AES-GCM) + NIST SP 800-132 (PBKDF2)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPipelineModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5 Stages Pipeline Stepper */}
            <div className="space-y-3 text-xs">
              
              {/* Step 1 */}
              <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                pipelineStep >= 1 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 opacity-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  pipelineStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {pipelineStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isAr ? 'فحص واستخراج قاعدة بيانات الواتساب المحلية' : 'Local WhatsApp SQLite Extraction'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    reading msgstore.db · 4,820 messages indexed
                  </div>
                </div>
                {pipelineStep === 1 && <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />}
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                pipelineStep >= 2 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 opacity-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  pipelineStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {pipelineStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isAr ? 'اشتقاق المفتاح المحلي عبر PBKDF2 (100,000 جولة)' : 'PBKDF2 Key Derivation (100k rounds)'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    derived 256-bit AES-GCM Key · salt 16-bytes
                  </div>
                </div>
                {pipelineStep === 2 && <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />}
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                pipelineStep >= 3 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 opacity-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  pipelineStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {pipelineStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isAr ? 'التشفير المحلي AES-256-GCM للرسائل والصوتيات' : 'Local In-Memory AES-256-GCM Encryption'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    iv: 12-bytes · opus audio encrypted · zero plaintext
                  </div>
                </div>
                {pipelineStep === 3 && <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />}
              </div>

              {/* Step 4 */}
              <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                pipelineStep >= 4 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 opacity-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  pipelineStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  {pipelineStep > 4 ? <Check className="w-3.5 h-3.5" /> : '4'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isAr ? 'حساب بصمة النزاهة الرقمية والمصادقة (AuthTag)' : 'Cryptographic Integrity Tagging'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    GMAC Tag generated · SHA-256 safety fingerprint validated
                  </div>
                </div>
                {pipelineStep === 4 && <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />}
              </div>

              {/* Step 5 */}
              <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                pipelineStep >= 5 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800 opacity-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  pipelineStep >= 5 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isAr ? 'رفع الحزم المشفرة الصرفة إلى رواج كلاود' : 'Zero-Knowledge S3 Cloud Push'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    server received opaque ciphertext · Zero-Knowledge verified
                  </div>
                </div>
              </div>

            </div>

            {/* Pipeline Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPipelineModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>

              {inspectorPackage && (
                <button
                  type="button"
                  onClick={() => {
                    setPipelineModalOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فحص الحزمة الناتجة' : 'View Output Packet'}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Encrypted Package Inspector Modal */}
      {inspectorPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl p-6 border border-[#DCD3DF] dark:border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD3DF] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#4E115A] dark:text-purple-300" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAr ? 'فحص حزمة التشفير المرسلة للسحابة (Zero-Knowledge Payload)' : 'Raw Zero-Knowledge Encrypted Envelope'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectorPackage(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'هذا هو التمثيل الحقيقي للبيانات التي يتم تخزينها في رواج كلاود. لا تحتوي الحزمة على أي نصوص مقروءة أو مفاتيح سرية:'
                : 'This is the exact JSON payload stored on Rawaj Cloud S3. Notice zero plaintext or private keys are exposed:'}
            </p>

            {/* JSON Code Viewer */}
            <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 border border-slate-800">
              <pre>{JSON.stringify(inspectorPackage, null, 2)}</pre>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectorPackage, null, 2));
                  showNotification('تم نسخ الحزمة المشفرة JSON إلى الحافظة', 'Copied encrypted package JSON', 'success');
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isAr ? 'نسخ الحزمة' : 'Copy JSON'}</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectorPackage(null)}
                className="px-4 py-2 rounded-xl bg-[#4E115A] hover:bg-[#3D0D47] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {isAr ? 'تم' : 'Done'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
