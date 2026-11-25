import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { FileGrid } from './FileGrid';
import { FileTable } from './FileTable';
import { UploadDropzone } from './UploadDropzone';
import { ShareModal } from './ShareModal';
import { VersionHistoryModal } from './VersionHistoryModal';
import { BreadcrumbsBar } from './BreadcrumbsBar';
import { BatchActionBar } from './BatchActionBar';
import { RecentFiles } from './RecentFiles';
import { FolderQuickViewPanel } from './FolderQuickViewPanel';
import { BatchRenameModal } from './BatchRenameModal';
import {
  Search,
  LayoutGrid,
  List,
  UploadCloud,
  ListOrdered,
  CheckSquare,
} from 'lucide-react';
import { FileCategory, FileItem, FolderItem } from '../../types/storage';

interface FileExplorerProps {
  onNewFolderClick: () => void;
  onUploadClick: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ onNewFolderClick, onUploadClick }) => {
  const {
    lang,
    currentFolderId,
    setCurrentFolderId,
    folders,
    files,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    sizeFilter,
    setSizeFilter,
    viewMode,
    setViewMode,
    selectedFileIds,
    clearSelection,
    selectAllVisible,
    deleteFile,
    uploadFiles,
    setPreviewFile,
    setShareFile,
    setShareFolder,
    setVersionHistoryFile,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';
  const [batchRenameOpen, setBatchRenameOpen] = useState(false);

  // Filter folders and files based on category, search, size, and current folder
  const currentFolders = folders.filter(folder => {
    if (activeCategory === 'trash') return false;
    if (activeCategory === 'vault') return folder.isVault;
    return folder.parentId === currentFolderId;
  });

  const filteredFiles = files.filter(file => {
    // Trash filter
    if (activeCategory === 'trash') {
      return file.isTrash;
    }
    if (file.isTrash) return false;

    // Vault filter
    if (activeCategory === 'vault') {
      return file.isVault;
    }
    if (file.isVault) return false;

    // Shared filter
    if (activeCategory === 'shared' && !file.isShared) return false;

    // Folder containment
    if (!searchQuery && activeCategory === 'all' && file.folderId !== currentFolderId) {
      return false;
    }

    // Category filter
    if (activeCategory === 'images' && file.type !== 'image') return false;
    if (activeCategory === 'videos' && file.type !== 'video') return false;
    if (activeCategory === 'documents' && !['pdf', 'document', 'spreadsheet', 'presentation'].includes(file.type)) return false;
    if (activeCategory === 'archives' && file.type !== 'archive') return false;

    // Size filter
    if (sizeFilter === 'large' && file.sizeBytes < 100 * 1024 * 1024) return false; // >100MB
    if (sizeFilter === 'medium' && (file.sizeBytes < 10 * 1024 * 1024 || file.sizeBytes > 100 * 1024 * 1024)) return false; // 10MB - 100MB
    if (sizeFilter === 'small' && file.sizeBytes > 10 * 1024 * 1024) return false; // <10MB

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchExt = file.extension.toLowerCase().includes(q);
      return matchName || matchExt;
    }

    return true;
  });


  const categoryTabs: { id: FileCategory; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'الكل', labelEn: 'All' },
    { id: 'images', labelAr: 'الصور', labelEn: 'Images' },
    { id: 'videos', labelAr: 'الفيديوهات', labelEn: 'Videos' },
    { id: 'documents', labelAr: 'المستندات', labelEn: 'Docs' },
    { id: 'archives', labelAr: 'الأرشيف', labelEn: 'Archives' },
    { id: 'shared', labelAr: 'المشتركة', labelEn: 'Shared' },
  ];

  // Quick View Folder Side Panel State
  const [quickViewFolder, setQuickViewFolder] = useState<FolderItem | null>(null);

  // Global Drag-and-drop file upload states
  const [isWindowDragOver, setIsWindowDragOver] = useState(false);
  const dragCounter = React.useRef(0);

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentFolderName = currentFolder ? currentFolder.name : (isAr ? 'المجلد الرئيسي (Root Drive)' : 'Root Drive');

  const handleGlobalDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    // Only activate for external files, not internal items moving
    if (e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('application/x-rawaj-file-ids')) {
      dragCounter.current += 1;
      setIsWindowDragOver(true);
    }
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsWindowDragOver(false);
    }
  };

  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files') && !e.dataTransfer.types.includes('application/x-rawaj-file-ids')) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsWindowDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files, currentFolderId);
    }
  };

  return (
    <div
      onDragEnter={handleGlobalDragEnter}
      onDragLeave={handleGlobalDragLeave}
      onDragOver={handleGlobalDragOver}
      onDrop={handleGlobalDrop}
      className="relative flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto"
    >
      {/* Full-view Drag and Drop Overlay for Uploads */}
      {isWindowDragOver && (
        <div className="absolute inset-0 z-40 bg-[#4E115A]/25 dark:bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-6 sm:p-8 pointer-events-none animate-in fade-in duration-150">
          <div className="w-full max-w-lg p-8 sm:p-10 bg-white dark:bg-slate-900 border-3 border-dashed border-[#4E115A] dark:border-purple-400 rounded-3xl text-center space-y-4 shadow-2xl scale-100 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-[#F5EFF7] dark:bg-purple-950/60 text-[#4E115A] dark:text-purple-300 mx-auto flex items-center justify-center shadow-md">
              <UploadCloud className="w-8 h-8 text-[#4E115A] dark:text-purple-300 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#1E1E24] dark:text-white">
                {isAr ? 'أفلت الملفات لرفعها مباشرة' : 'Drop files here to upload directly'}
              </h3>
              
              {/* Destination Folder Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5EFF7] dark:bg-purple-950/50 border border-[#4E115A]/20 text-[#4E115A] dark:text-purple-300 text-xs font-bold shadow-xs">
                <span className="opacity-70">{isAr ? 'المجلد الوجهة:' : 'Target folder:'}</span>
                <span className="truncate max-w-[220px]">{currentFolderName}</span>
              </div>

              <p className="text-xs text-[#6E6A75] dark:text-slate-400">
                {isAr
                  ? 'رفع سريع مقسم للأجزاء مع فحص البصمة الرقمية والتشفير التام'
                  : 'Fast chunked multipart upload with client deduplication'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Breadcrumbs Navigation Bar */}
      <BreadcrumbsBar
        onNewFolderClick={onNewFolderClick}
        onUploadClick={onUploadClick}
      />

      {/* Upload Dropzone */}
      <UploadDropzone />

      {/* Search, Category Filter, and View Mode Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6E6A75] absolute top-1/2 -translate-y-1/2 rtl:right-3 ltr:left-3" />
          <input
            type="text"
            placeholder={isAr ? 'البحث اللحظي في أسماء ومحتوى الملفات (<50ms)...' : 'Instant search files (<50ms)...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rtl:pr-9 ltr:pl-9 py-2 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 rounded-2xl text-xs text-[#1E1E24] dark:text-white placeholder:text-[#6E6A75] focus:outline-hidden focus:ring-2 focus:ring-[#4E115A]/20 focus:border-[#4E115A] transition-all"
          />
        </div>

        {/* Filter Tabs & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F5EFF7] dark:bg-slate-800/80 rounded-2xl border border-[#DCD3DF] dark:border-slate-700/40">
            {categoryTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-white shadow-xs font-bold border border-[#DCD3DF] dark:border-transparent'
                    : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
                }`}
              >
                {isAr ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Size Filter Select */}
          <select
            value={sizeFilter}
            onChange={e => setSizeFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 rounded-2xl text-xs text-[#1E1E24] dark:text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع الأحجام' : 'All Sizes'}</option>
            <option value="large">{isAr ? 'أكبر من 100MB' : '> 100 MB'}</option>
            <option value="medium">{isAr ? '10MB - 100MB' : '10 - 100 MB'}</option>
            <option value="small">{isAr ? 'أقل من 10MB' : '< 10 MB'}</option>
          </select>

          {/* View Mode Toggle: Grid (Media & Images) vs Detailed List (Document Management) */}
          <div className="flex items-center gap-1 p-1 bg-[#F5EFF7] dark:bg-slate-800/90 rounded-2xl border border-[#DCD3DF] dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-blue-300 shadow-xs border border-[#DCD3DF] dark:border-transparent'
                  : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
              }`}
              title={isAr ? 'عرض شبكي: مخصص للوسائط، الصور والفيديوهات مع بطاقات مصغرة' : 'Grid View: Optimized for visual media, photos & video preview cards'}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#A38540]" />
              <span className="hidden sm:inline">{isAr ? 'عرض شبكي (وسائط)' : 'Grid View (Media)'}</span>
              <span className="sm:hidden">{isAr ? 'شبكي' : 'Grid'}</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-blue-300 shadow-xs border border-[#DCD3DF] dark:border-transparent'
                  : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
              }`}
              title={isAr ? 'قائمة تفصيلية: مخصصة لإدارة المستندات، البصمات وتواريخ التعديل' : 'Detailed List View: Optimized for document management & metadata'}
            >
              <List className="w-3.5 h-3.5 text-[#4E115A] dark:text-blue-400" />
              <span className="hidden sm:inline">{isAr ? 'قائمة تفصيلية (مستندات)' : 'Detailed List (Docs)'}</span>
              <span className="sm:hidden">{isAr ? 'تفصيلي' : 'List'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Multi-Selection & Quick Batch Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 rounded-2xl bg-[#F5EFF7]/80 dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          {selectedFileIds.length > 0 ? (
            <span className="flex items-center gap-1.5 text-[#4E115A] dark:text-purple-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#1AD062] animate-pulse" />
              <span>
                {isAr
                  ? `تم تحديد ${selectedFileIds.length} ${selectedFileIds.length === 1 ? 'ملف' : 'ملفات'}`
                  : `${selectedFileIds.length} ${selectedFileIds.length === 1 ? 'file' : 'files'} selected`}
              </span>
            </span>
          ) : (
            <span className="text-[#6E6A75] dark:text-slate-400">
              {isAr
                ? `الملفات المتاحة: ${filteredFiles.length} ملف`
                : `${filteredFiles.length} files available`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedFileIds.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setBatchRenameOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4E115A] hover:bg-[#3d0d46] text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title={isAr ? 'إعادة تسمية الملفات المحددة بالتسلسل الرقمي' : 'Batch rename selected files with sequence numbering'}
              >
                <ListOrdered className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? 'إعادة التسمية بالتسلسل' : 'Batch Rename (Sequence)'}</span>
              </button>

              <button
                type="button"
                onClick={clearSelection}
                className="px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء التحديد' : 'Deselect'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                const visibleIds = filteredFiles.map(f => f.id);
                if (visibleIds.length > 0) {
                  selectAllVisible(visibleIds, []);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#4E115A] border border-[#DCD3DF] dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#4E115A] dark:text-purple-300" />
              <span>{isAr ? 'تحديد كل الملفات الظاهرة' : 'Select All Files'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Batch Action Bar when items selected */}
      <BatchActionBar currentFiles={filteredFiles} currentFolders={currentFolders} />

      {/* Recent Files Section for Quick Retrieval */}
      {!searchQuery && activeCategory !== 'trash' && activeCategory !== 'vault' && (
        <RecentFiles
          files={files}
          onFileClick={(file) => setPreviewFile(file)}
          onShareClick={(file) => setShareFile(file)}
        />
      )}

      {/* Main File Content View */}
      {viewMode === 'grid' ? (
        <FileGrid
          currentFolders={currentFolders}
          currentFiles={filteredFiles}
          onFolderClick={(id) => setCurrentFolderId(id)}
          onFileClick={(file) => setPreviewFile(file)}
          onShareClick={(file) => setShareFile(file)}
          onVersionsClick={(file) => setVersionHistoryFile(file)}
          onQuickViewFolder={(folder) => setQuickViewFolder(folder)}
          onShareFolder={(folder) => setShareFolder(folder)}
        />
      ) : (
        <FileTable
          currentFolders={currentFolders}
          currentFiles={filteredFiles}
          onFolderClick={(id) => setCurrentFolderId(id)}
          onFileClick={(file) => setPreviewFile(file)}
          onShareClick={(file) => setShareFile(file)}
          onVersionsClick={(file) => setVersionHistoryFile(file)}
          onQuickViewFolder={(folder) => setQuickViewFolder(folder)}
          onShareFolder={(folder) => setShareFolder(folder)}
        />
      )}

      {/* Modals & Panels */}
      <ShareModal />
      <VersionHistoryModal />
      <BatchRenameModal
        isOpen={batchRenameOpen}
        onClose={() => setBatchRenameOpen(false)}
        fileIds={selectedFileIds}
      />

      {/* Folder Quick View Side Panel Drawer */}
      <FolderQuickViewPanel
        folder={quickViewFolder}
        onClose={() => setQuickViewFolder(null)}
        onNavigateInto={(folderId) => {
          setCurrentFolderId(folderId);
          setQuickViewFolder(null);
        }}
      />

    </div>
  );
};
