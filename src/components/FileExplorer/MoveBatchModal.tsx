import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Folder,
  HardDrive,
  FolderInput,
  X,
  Check,
  ChevronRight,
  FolderLock,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface MoveBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileIds: string[];
  folderIds?: string[];
}

export const MoveBatchModal: React.FC<MoveBatchModalProps> = ({
  isOpen,
  onClose,
  fileIds,
  folderIds = [],
}) => {
  const {
    lang,
    folders,
    files,
    moveFiles,
    moveFoldersBatch,
    currentFolderId,
  } = useStorage();

  const isAr = lang === 'ar';
  const totalItemsCount = fileIds.length + folderIds.length;

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId !== null ? null : (folders[0]?.id || null)
  );

  if (!isOpen || totalItemsCount === 0) return null;

  // Calculate size of selected files + files directly in selected folders
  const selectedFiles = files.filter(f => fileIds.includes(f.id));
  const directFilesSize = selectedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const folderFiles = files.filter(
    f => folderIds.includes(f.folderId || '') && !f.isTrash && !fileIds.includes(f.id)
  );
  const folderFilesSize = folderFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
  const totalSizeBytes = directFilesSize + folderFilesSize;

  // Prevent moving into any of the folders being moved
  const availableFolders = folders.filter(f => !folderIds.includes(f.id));

  const handleMoveConfirm = () => {
    if (fileIds.length > 0) {
      moveFiles(fileIds, selectedFolderId);
    }
    if (folderIds.length > 0) {
      moveFoldersBatch(folderIds, selectedFolderId);
    }
    onClose();
  };

  const itemDetailsText = isAr
    ? [
        fileIds.length > 0 ? `${fileIds.length} ${fileIds.length === 1 ? 'ملف' : 'ملفات'}` : null,
        folderIds.length > 0 ? `${folderIds.length} ${folderIds.length === 1 ? 'مجلد' : 'مجلدات'}` : null,
      ]
        .filter(Boolean)
        .join(' و ')
    : [
        fileIds.length > 0 ? `${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}` : null,
        folderIds.length > 0 ? `${folderIds.length} ${folderIds.length === 1 ? 'folder' : 'folders'}` : null,
      ]
        .filter(Boolean)
        .join(' and ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCD3DF] dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5EFF7] dark:bg-purple-950/60 text-[#4E115A] dark:text-purple-300 flex items-center justify-center shrink-0 border border-[#DCD3DF]/60">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white">
                {isAr ? 'نقل العناصر المحددة' : 'Move Selected Items'}
              </h3>
              <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-0.5 font-mono">
                {isAr
                  ? `نقل ${itemDetailsText} (${formatBytes(totalSizeBytes, 1, isAr)})`
                  : `Moving ${itemDetailsText} (${formatBytes(totalSizeBytes, 1, isAr)})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E6A75] hover:text-[#1E1E24] dark:hover:text-slate-200 hover:bg-[#F5EFF7] dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Folder Selection List */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          <div className="text-[11px] font-bold text-[#6E6A75] dark:text-slate-500 uppercase tracking-wider px-1 font-mono">
            {isAr ? 'اختر مجلد الوجهة:' : 'Select Destination Folder:'}
          </div>

          {/* Root Directory Option */}
          <div
            onClick={() => setSelectedFolderId(null)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              selectedFolderId === null
                ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-1 ring-[#4E115A] text-[#1E1E24] dark:text-purple-100 shadow-xs'
                : 'border-[#DCD3DF] dark:border-slate-800 hover:bg-[#F5EFF7]/50 dark:hover:bg-slate-800/60 text-[#1E1E24] dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-[#4E115A] dark:text-purple-400 border border-[#DCD3DF]/50 shadow-2xs">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold block text-[#1E1E24] dark:text-white">
                  {isAr ? 'المجلد الرئيسي (Root Drive)' : 'Root Drive'}
                </span>
                <span className="text-[10px] text-[#6E6A75] block font-mono">/ (Home)</span>
              </div>
            </div>
            {selectedFolderId === null && (
              <span className="w-5 h-5 rounded-full bg-[#4E115A] text-white flex items-center justify-center text-xs shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Available Custom Folders */}
          {availableFolders.map(folder => {
            const isSelected = selectedFolderId === folder.id;
            const isCurrent = currentFolderId === folder.id;
            const folderFilesCount = files.filter(f => f.folderId === folder.id && !f.isTrash).length;

            return (
              <div
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#F5EFF7] dark:bg-purple-950/40 border-[#4E115A] ring-1 ring-[#4E115A] text-[#1E1E24] dark:text-purple-100 shadow-xs'
                    : 'border-[#DCD3DF] dark:border-slate-800 hover:bg-[#F5EFF7]/50 dark:hover:bg-slate-800/60 text-[#1E1E24] dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${folder.color || '#4E115A'}15` }}
                  >
                    {folder.isVault ? (
                      <FolderLock className="w-4 h-4" style={{ color: folder.color || '#4E115A' }} />
                    ) : (
                      <Folder className="w-4 h-4" style={{ color: folder.color || '#4E115A' }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold truncate block text-[#1E1E24] dark:text-white">
                        {folder.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-[#6E6A75]">
                          {isAr ? '(الموقع الحالي)' : '(Current)'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6E6A75] font-mono">
                      {folderFilesCount} {isAr ? 'ملف' : 'files'}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-[#4E115A] text-white flex items-center justify-center text-xs shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#6E6A75] rtl:rotate-180 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-[#F5EFF7]/70 dark:bg-slate-900/80 border-t border-[#DCD3DF] dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#6E6A75] dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors border border-[#DCD3DF] dark:border-slate-700 cursor-pointer"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleMoveConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-[#4E115A] hover:bg-[#3D0D47] rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FolderInput className="w-4 h-4" />
            <span>{isAr ? 'نقل العناصر إلى هنا' : 'Move Items Here'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
