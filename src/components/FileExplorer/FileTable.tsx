import React from 'react';
import { useStorage } from '../../context/StorageContext';
import { FileItem, FolderItem } from '../../types/storage';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  FileArchive,
  Music,
  Code,
  FileSpreadsheet,
  Star,
  Share2,
  Trash2,
  History,
  Lock,
  WifiOff,
  FileCode,
  Eye,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';
import { FileContextMenu } from './FileContextMenu';
import { FolderContextMenu } from './FolderContextMenu';

interface FileTableProps {
  currentFolders: FolderItem[];
  currentFiles: FileItem[];
  onFolderClick: (id: string) => void;
  onFileClick: (file: FileItem) => void;
  onShareClick: (file: FileItem) => void;
  onVersionsClick: (file: FileItem) => void;
  onQuickViewFolder?: (folder: FolderItem) => void;
  onShareFolder?: (folder: FolderItem) => void;
}

export const FileTable: React.FC<FileTableProps> = ({
  currentFolders,
  currentFiles,
  onFolderClick,
  onFileClick,
  onShareClick,
  onVersionsClick,
  onQuickViewFolder,
  onShareFolder,
}) => {
  const {
    lang,
    toggleFavorite,
    deleteFile,
    cryptoShredFile,
    selectedFileIds,
    toggleSelectFile,
    selectAllFiles,
    selectedFolderIds,
    toggleSelectFolder,
    selectAllVisible,
    clearSelection,
    toggleOfflineSync,
    moveFiles,
    uploadFiles,
    setShareFolder,
  } = useStorage();

  const isAr = lang === 'ar';
  const totalVisible = currentFiles.length + currentFolders.length;
  const allFilesSelected = currentFiles.length > 0 ? currentFiles.every(f => selectedFileIds.includes(f.id)) : true;
  const allFoldersSelected = currentFolders.length > 0 ? currentFolders.every(f => selectedFolderIds.includes(f.id)) : true;
  const allSelected = totalVisible > 0 && allFilesSelected && allFoldersSelected;
  const someSelected =
    !allSelected &&
    (currentFiles.some(f => selectedFileIds.includes(f.id)) ||
     currentFolders.some(f => selectedFolderIds.includes(f.id)));

  // Drag and Drop States
  const [draggedFileId, setDraggedFileId] = React.useState<string | null>(null);
  const [dropTargetFolderId, setDropTargetFolderId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    setDraggedFileId(file.id);
    const idsToMove = selectedFileIds.includes(file.id) && selectedFileIds.length > 1
      ? selectedFileIds
      : [file.id];
    e.dataTransfer.setData('application/x-rawaj-file-ids', JSON.stringify(idsToMove));
    e.dataTransfer.setData('text/plain', file.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedFileId(null);
    setDropTargetFolderId(null);
  };

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetFolderId(null);
    setDraggedFileId(null);

    const raw = e.dataTransfer.getData('application/x-rawaj-file-ids');
    if (raw) {
      try {
        const ids: string[] = JSON.parse(raw);
        if (ids && ids.length > 0) {
          moveFiles(ids, targetFolderId);
          return;
        }
      } catch (err) {
        console.error('Failed to parse drag transfer file IDs', err);
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files, targetFolderId);
    }
  };

  // Context Menu State (Files)
  const [contextMenu, setContextMenu] = React.useState<{
    file: FileItem;
    x: number;
    y: number;
  } | null>(null);

  // Context Menu State (Folders)
  const [folderContextMenu, setFolderContextMenu] = React.useState<{
    folder: FolderItem;
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setFolderContextMenu(null);
    setContextMenu({
      file,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folder: FolderItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(null);
    setFolderContextMenu({
      folder,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const renderFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-amber-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <Music className="w-4 h-4 text-teal-500" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-slate-500" />;
      default:
        return <FileText className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left rtl:text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-mono">
              <th className="py-2.5 px-3 w-10 text-center">
                {totalVisible > 0 && (
                  <button
                    onClick={() => {
                      if (allSelected) {
                        clearSelection();
                      } else {
                        selectAllVisible(
                          currentFiles.map(f => f.id),
                          currentFolders.map(f => f.id)
                        );
                      }
                    }}
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-colors mx-auto cursor-pointer ${
                      allSelected
                        ? 'bg-[#4E115A] border-[#4E115A] text-white shadow-xs'
                        : someSelected
                        ? 'bg-[#4E115A]/15 border-[#4E115A] text-[#4E115A] dark:text-purple-300'
                        : 'border-[#DCD3DF] dark:border-slate-600 hover:border-[#4E115A]'
                    }`}
                    title={allSelected ? (isAr ? 'إلغاء تحديد الكل' : 'Deselect All') : (isAr ? 'تحديد كل العناصر' : 'Select All')}
                  >
                    {allSelected ? (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    ) : someSelected ? (
                      <span className="w-2 h-0.5 bg-[#4E115A] dark:bg-purple-400 rounded-full" />
                    ) : null}
                  </button>
                )}
              </th>
              <th className="py-2.5 px-3 font-semibold">{isAr ? 'الاسم' : 'Name'}</th>
              <th className="py-2.5 px-3 font-semibold hidden md:table-cell">{isAr ? 'تاريخ التعديل' : 'Modified'}</th>
              <th className="py-2.5 px-3 font-semibold text-right rtl:text-left">{isAr ? 'الحجم' : 'Size'}</th>
              <th className="py-2.5 px-3 font-semibold hidden lg:table-cell">{isAr ? 'البصمة (SHA-256)' : 'SHA-256 Hash'}</th>
              <th className="py-2.5 px-3 font-semibold hidden sm:table-cell text-center">{isAr ? 'النسخ' : 'Versions'}</th>
              <th className="py-2.5 px-3 font-semibold text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            
            {/* Folders Rows */}
            {currentFolders.map(folder => {
              const isDropTarget = dropTargetFolderId === folder.id;
              const isFolderSelected = selectedFolderIds.includes(folder.id);
              return (
                <tr
                  key={folder.id}
                  onClick={() => onFolderClick(folder.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = e.dataTransfer.types.includes('Files') ? 'copy' : 'move';
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDropTargetFolderId(folder.id);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    if (dropTargetFolderId === folder.id) {
                      setDropTargetFolderId(null);
                    }
                  }}
                  onDrop={(e) => handleFolderDrop(e, folder.id)}
                  onContextMenu={(e) => handleFolderContextMenu(e, folder)}
                  className={`cursor-pointer transition-all group ${
                    isDropTarget
                      ? 'bg-[#F5EFF7] dark:bg-purple-950/50 ring-2 ring-inset ring-[#4E115A]'
                      : isFolderSelected
                      ? 'bg-[#F5EFF7] dark:bg-purple-950/30'
                      : 'hover:bg-[#F5EFF7]/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectFolder(folder.id);
                      }}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors mx-auto cursor-pointer ${
                        isFolderSelected
                          ? 'bg-[#4E115A] border-[#4E115A] text-white shadow-xs'
                          : selectedFolderIds.length > 0 || selectedFileIds.length > 0
                          ? 'border-[#DCD3DF] dark:border-slate-600 bg-white dark:bg-slate-800 opacity-90 hover:border-[#4E115A]'
                          : 'border-[#DCD3DF] dark:border-slate-700 opacity-50 group-hover:opacity-100 hover:border-[#4E115A]'
                      }`}
                      title={isFolderSelected ? (isAr ? 'إلغاء تحديد المجلد' : 'Deselect folder') : (isAr ? 'تحديد المجلد' : 'Select folder')}
                    >
                      {isFolderSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#1E1E24] dark:text-white">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${folder.color || '#4E115A'}20` }}
                      >
                        <Folder className="w-3.5 h-3.5" style={{ color: folder.color || '#4E115A' }} />
                      </div>
                      <span className="group-hover:text-[#4E115A] dark:group-hover:text-purple-300 transition-colors">
                        {folder.name}
                      </span>
                      {isDropTarget && (
                        <span className="inline-flex items-center text-[10px] bg-[#4E115A] text-white px-2 py-0.5 rounded-full font-bold shadow-xs animate-bounce mx-1">
                          {draggedFileId ? (isAr ? 'إفلات للنقل' : 'Drop to move') : (isAr ? 'إفلات للرفع هنا' : 'Drop to upload')}
                        </span>
                      )}
                      {onQuickViewFolder && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickViewFolder(folder);
                          }}
                          className="p-1 rounded-md text-[#6E6A75] hover:text-[#4E115A] hover:bg-[#F5EFF7] dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                          title={isAr ? 'نظرة سريعة على المجلد' : 'Quick View Folder'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {folder.isShared && (
                        <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5 bg-[#F5EFF7] dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/40" title={isAr ? 'مجلد مشترك' : 'Shared Folder'}>
                          <Share2 className="w-2.5 h-2.5" />
                          <span>{isAr ? 'مشترك' : 'Shared'}</span>
                        </span>
                      )}
                      {folder.isVault && (
                        <span className="text-[10px] text-[#1AD062] font-mono font-bold">
                          E2EE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#6E6A75] dark:text-slate-400 hidden md:table-cell font-mono">
                    {formatDate(folder.createdAt, isAr)}
                  </td>
                  <td className="py-2.5 px-3 text-[#6E6A75] font-mono text-right rtl:text-left">
                    —
                  </td>
                  <td className="py-2.5 px-3 text-[#6E6A75] font-mono hidden lg:table-cell text-[10px]">
                    dir/virtual
                  </td>
                  <td className="py-2.5 px-3 text-center hidden sm:table-cell text-[#6E6A75]">
                    —
                  </td>
                  <td className="py-2.5 px-3 text-center text-[#6E6A75] text-[11px]">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onShareFolder) onShareFolder(folder);
                          else setShareFolder(folder);
                        }}
                        className="p-1 rounded-md text-[#4E115A] hover:bg-[#F5EFF7] dark:text-purple-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isAr ? 'مشاركة المجلد وإنشاء رابط' : 'Share Folder & Permissions'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {onQuickViewFolder && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickViewFolder(folder);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#4E115A] dark:text-purple-300 bg-white dark:bg-slate-800 hover:bg-[#F5EFF7] dark:hover:bg-slate-750 border border-[#DCD3DF] dark:border-slate-700 hover:border-[#4E115A] transition-all shadow-2xs cursor-pointer"
                          title={isAr ? 'نظرة سريعة على المجلد دون الدخول إليه' : 'Quick View folder contents and metadata'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isAr ? 'نظرة سريعة' : 'Quick View'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFolderContextMenu(e, folder);
                        }}
                        className="p-1 text-[#6E6A75] hover:text-[#1E1E24] dark:hover:text-white rounded transition-colors cursor-pointer"
                        title={isAr ? 'خيارات المجلد' : 'Folder Options'}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      <span className="hidden md:inline font-mono text-[10px] text-[#6E6A75]">
                        {folder.isSyncPinned ? (isAr ? 'محلي' : 'Local') : (isAr ? 'سحابي' : 'Cloud')}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Files Rows */}
            {currentFiles.map(file => {
              const isSelected = selectedFileIds.includes(file.id);
              const isBeingDragged = draggedFileId === file.id || (isSelected && draggedFileId !== null && selectedFileIds.includes(draggedFileId));

              return (
                <tr
                  key={file.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, file)}
                  onDragEnd={handleDragEnd}
                  onContextMenu={(e) => handleContextMenu(e, file)}
                  className={`hover:bg-[#F5EFF7] dark:hover:bg-slate-800/40 transition-colors group cursor-grab active:cursor-grabbing select-none ${
                    isBeingDragged
                      ? 'opacity-40 bg-[#F5EFF7]/80'
                      : isSelected
                      ? 'bg-[#F5EFF7] dark:bg-purple-950/20'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectFile(file.id);
                      }}
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors mx-auto cursor-pointer ${
                        isSelected
                          ? 'bg-[#4E115A] border-[#4E115A] text-white shadow-xs'
                          : selectedFileIds.length > 0 || selectedFolderIds.length > 0
                          ? 'border-[#DCD3DF] dark:border-slate-600 bg-white dark:bg-slate-800 opacity-90 hover:border-[#4E115A]'
                          : 'border-[#DCD3DF] dark:border-slate-700 opacity-50 group-hover:opacity-100 hover:border-[#4E115A]'
                      }`}
                      title={isSelected ? (isAr ? 'إلغاء التحديد' : 'Deselect') : (isAr ? 'تحديد الملف' : 'Select file')}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  </td>

                  <td className="py-2.5 px-3">
                    <div
                      onClick={() => onFileClick(file)}
                      className="flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className="shrink-0">{renderFileIcon(file)}</div>
                      <span className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate max-w-xs md:max-w-md">
                        {file.name}
                      </span>
                      {file.isVault && (
                        <span title={isAr ? 'مشفر كلياً' : 'Zero-Knowledge Encrypted'}>
                          <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                        </span>
                      )}
                      {file.isOffline && (
                        <span title={isAr ? 'متاح دون اتصال' : 'Available Offline'}>
                          <WifiOff className="w-3 h-3 text-sky-500 shrink-0" />
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 hidden md:table-cell font-mono tabular-nums">
                    {formatDate(file.updatedAt, isAr)}
                  </td>

                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-mono tabular-nums text-right rtl:text-left font-medium">
                    {formatBytes(file.sizeBytes, 1, isAr)}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 dark:text-slate-500 hidden lg:table-cell" title={file.checksum}>
                    {file.checksum.slice(0, 10)}...{file.checksum.slice(-6)}
                  </td>

                  <td className="py-2.5 px-3 text-center hidden sm:table-cell">
                    <button
                      onClick={() => onVersionsClick(file)}
                      className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title={isAr ? 'عرض النسخ' : 'View versions'}
                    >
                      v{file.versions.length > 0 ? file.versions[0].versionNumber : '1.0'}
                    </button>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onFileClick(file)}
                        className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
                        title={isAr ? 'معاينة المستند' : 'Preview Document'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleFavorite(file.id)}
                        className={`p-1 rounded transition-colors ${
                          file.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                        }`}
                        title={isAr ? 'تفضيل' : 'Favorite'}
                      >
                        <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-amber-500' : ''}`} />
                      </button>

                      <button
                        onClick={() => onShareClick(file)}
                        className="p-1 text-[#4E115A] hover:bg-[#F5EFF7] dark:text-purple-300 dark:hover:bg-slate-800 rounded transition-colors"
                        title={isAr ? 'إنشاء رابط مشاركة محمي' : 'Create Share Link'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleContextMenu(e, file)}
                        className="p-1 text-[#6E6A75] hover:text-[#1E1E24] dark:hover:text-white rounded transition-colors cursor-pointer"
                        title={isAr ? 'خيارات إضافية ورابط المشاركة' : 'More Options & Share'}
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (file.isVault) {
                            cryptoShredFile(file.id);
                          } else {
                            deleteFile(file.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                        title={file.isVault ? (isAr ? 'محو مشفر كلياً' : 'Crypto-Shred') : (isAr ? 'حذف' : 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

      {/* Interactive Context Menu (Files) */}
      {contextMenu && (
        <FileContextMenu
          file={contextMenu.file}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpenPreview={(f) => onFileClick(f)}
          onOpenShareModal={(f) => onShareClick(f)}
          onOpenVersionHistory={(f) => onVersionsClick(f)}
        />
      )}

      {/* Interactive Context Menu (Folders) */}
      {folderContextMenu && (
        <FolderContextMenu
          folder={folderContextMenu.folder}
          x={folderContextMenu.x}
          y={folderContextMenu.y}
          onClose={() => setFolderContextMenu(null)}
          onOpenFolder={(id) => onFolderClick(id)}
          onQuickView={(f) => onQuickViewFolder && onQuickViewFolder(f)}
          onShareFolder={(f) => {
            if (onShareFolder) onShareFolder(f);
            else setShareFolder(f);
          }}
        />
      )}
    </div>
  );
};
