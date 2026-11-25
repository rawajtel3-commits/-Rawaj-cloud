import React, { useState, useEffect } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  FolderInput,
  Download,
  Trash2,
  X,
  CheckSquare,
  AlertTriangle,
  Folder,
  FileText,
  ListOrdered,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';
import { MoveBatchModal } from './MoveBatchModal';
import { BatchRenameModal } from './BatchRenameModal';

interface BatchActionBarProps {
  currentFiles: { id: string; sizeBytes: number }[];
  currentFolders?: { id: string }[];
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  currentFiles,
  currentFolders = [],
}) => {
  const {
    lang,
    selectedFileIds,
    selectedFolderIds,
    clearSelection,
    selectAllVisible,
    deleteFilesBatch,
    deleteFoldersBatch,
    downloadFilesBatch,
    files,
  } = useStorage();

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const isAr = lang === 'ar';

  // Listen for Escape key to deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
        setConfirmDeleteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  const totalSelectedCount = selectedFileIds.length + selectedFolderIds.length;
  if (totalSelectedCount === 0) return null;

  // Calculate size of selected files + files inside selected folders
  const selectedFiles = files.filter(f => selectedFileIds.includes(f.id));
  const directFilesSize = selectedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

  const folderFiles = files.filter(
    f => selectedFolderIds.includes(f.folderId || '') && !f.isTrash && !selectedFileIds.includes(f.id)
  );
  const folderFilesSize = folderFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalSizeBytes = directFilesSize + folderFilesSize;

  // Determine if all visible files and folders are selected
  const allVisibleFilesSelected =
    currentFiles.length === 0 || currentFiles.every(f => selectedFileIds.includes(f.id));
  const allVisibleFoldersSelected =
    currentFolders.length === 0 || currentFolders.every(f => selectedFolderIds.includes(f.id));
  const allVisibleSelected =
    currentFiles.length + currentFolders.length > 0 &&
    allVisibleFilesSelected &&
    allVisibleFoldersSelected;

  const handleBatchDownload = () => {
    setConfirmDeleteOpen(false);
    // Gather all files directly selected plus files inside selected folders
    const folderFileIds = files
      .filter(f => selectedFolderIds.includes(f.folderId || '') && !f.isTrash)
      .map(f => f.id);
    const allDownloadIds = Array.from(new Set([...selectedFileIds, ...folderFileIds]));
    if (allDownloadIds.length > 0) {
      downloadFilesBatch(allDownloadIds);
    }
  };

  const handleBatchDelete = (permanent: boolean) => {
    if (selectedFileIds.length > 0) {
      deleteFilesBatch(selectedFileIds, permanent);
    }
    if (selectedFolderIds.length > 0) {
      deleteFoldersBatch(selectedFolderIds);
    }
    setConfirmDeleteOpen(false);
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      clearSelection();
    } else {
      selectAllVisible(
        currentFiles.map(f => f.id),
        currentFolders.map(f => f.id)
      );
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-200">
        <div className="bg-[#1E1E24]/95 dark:bg-[#1E1E24]/95 text-white backdrop-blur-xl border border-[#DCD3DF]/30 dark:border-slate-700 shadow-2xl rounded-2xl p-2.5 sm:px-4 sm:py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 ring-1 ring-white/10">
          
          {/* Section 1: Selected Count & Breakdown */}
          <div className="flex items-center gap-3 px-2 py-0.5">
            <span className="w-7 h-7 rounded-xl bg-[#4E115A] text-white flex items-center justify-center text-xs font-mono font-bold shadow-xs shrink-0 ring-1 ring-white/20">
              {totalSelectedCount}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold leading-tight whitespace-nowrap text-white">
                {isAr
                  ? `${totalSelectedCount} ${totalSelectedCount === 1 ? 'عنصر محدد' : 'عناصر محددة'}`
                  : `${totalSelectedCount} ${totalSelectedCount === 1 ? 'item' : 'items'} selected`}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-mono leading-tight mt-0.5">
                {selectedFileIds.length > 0 && (
                  <span className="flex items-center gap-0.5">
                    <FileText className="w-2.5 h-2.5 text-purple-300" />
                    <span>{selectedFileIds.length} {isAr ? 'ملف' : 'files'}</span>
                  </span>
                )}
                {selectedFileIds.length > 0 && selectedFolderIds.length > 0 && <span>·</span>}
                {selectedFolderIds.length > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Folder className="w-2.5 h-2.5 text-amber-300" />
                    <span>{selectedFolderIds.length} {isAr ? 'مجلد' : 'folders'}</span>
                  </span>
                )}
                {totalSizeBytes > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-emerald-300">{formatBytes(totalSizeBytes, 1, isAr)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:block h-7 w-px bg-slate-700/80" />

          {/* Section 2: Core Batch Actions (Move, Download, Delete) */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Move Action */}
            <button
              onClick={() => {
                setConfirmDeleteOpen(false);
                setMoveModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-[#4E115A]/70 text-slate-100 hover:text-white border border-slate-700 hover:border-[#4E115A] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              title={isAr ? 'نقل العناصر المحددة إلى مجلد آخر' : 'Move selected items to another folder'}
            >
              <FolderInput className="w-3.5 h-3.5 text-purple-300" />
              <span>{isAr ? 'نقل' : 'Move'}</span>
            </button>

            {/* Batch Rename Action with Sequence Numbering */}
            {selectedFileIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  setRenameModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-950/80 hover:bg-[#4E115A] text-purple-200 hover:text-white border border-purple-700/80 hover:border-purple-500 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                title={isAr ? 'إعادة تسمية الملفات المحددة بالتسلسل الرقمي' : 'Batch rename selected files with sequence numbering'}
              >
                <ListOrdered className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? 'ترقيم تسلسلي' : 'Sequence Rename'}</span>
              </button>
            )}

            {/* Download Action */}
            <button
              onClick={handleBatchDownload}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
              title={isAr ? 'تنزيل جميع الملفات والمجلدات المحددة' : 'Download selected items'}
            >
              <Download className="w-3.5 h-3.5 text-[#1AD062]" />
              <span>{isAr ? 'تنزيل' : 'Download'}</span>
            </button>

            {/* Delete Trigger */}
            <div className="relative">
              <button
                onClick={() => setConfirmDeleteOpen(!confirmDeleteOpen)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 border border-rose-800/80 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                title={isAr ? 'حذف العناصر المحددة' : 'Delete selected items'}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>{isAr ? 'حذف' : 'Delete'}</span>
              </button>

              {/* Confirm Delete Popover */}
              {confirmDeleteOpen && (
                <div className="absolute bottom-full mb-3 rtl:left-0 ltr:right-0 sm:ltr:left-1/2 sm:ltr:-translate-x-1/2 w-72 p-4 bg-[#1E1E24] text-slate-100 rounded-2xl border border-rose-800/60 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{isAr ? 'تأكيد حذف العناصر المحددة' : 'Confirm Bulk Deletion'}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                    {isAr
                      ? `هل تريد نقل ${totalSelectedCount} عنصر إلى سلة المحذوفات أم إجراء محو نهائي؟`
                      : `Move ${totalSelectedCount} items to Trash or permanently delete?`}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleBatchDelete(false)}
                      className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-100 text-center transition-colors border border-slate-700 cursor-pointer"
                    >
                      {isAr ? 'نقل إلى سلة المحذوفات' : 'Move to Trash'}
                    </button>
                    <button
                      onClick={() => handleBatchDelete(true)}
                      className="w-full py-1.5 px-3 bg-[#B91C1C] hover:bg-rose-700 text-xs font-bold rounded-xl text-white text-center transition-colors shadow-xs cursor-pointer"
                    >
                      {isAr ? 'حذف نهائي فوري (Crypto-Shred)' : 'Permanent Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="hidden sm:block h-7 w-px bg-slate-700/80" />

          {/* Section 3: Select All Toggle & Clear Selection */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSelectAllVisible}
              className={`p-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                allVisibleSelected
                  ? 'text-[#4E115A] bg-white hover:bg-slate-100'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={allVisibleSelected ? (isAr ? 'إلغاء تحديد الكل' : 'Deselect all') : (isAr ? 'تحديد كل العناصر الظاهرة' : 'Select all visible')}
            >
              <CheckSquare className="w-4 h-4" />
            </button>

            <button
              onClick={clearSelection}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title={isAr ? 'إلغاء التحديد (Esc)' : 'Deselect all (Esc)'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Move Batch Modal */}
      <MoveBatchModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        fileIds={selectedFileIds}
        folderIds={selectedFolderIds}
      />

      {/* Batch Rename Modal with Sequence Numbering */}
      <BatchRenameModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        fileIds={selectedFileIds}
      />
    </>
  );
};
