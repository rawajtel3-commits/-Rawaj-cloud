import React, { useState, useRef, useEffect } from 'react';
import { useStorage } from '../../context/StorageContext';
import { FolderItem } from '../../types/storage';
import {
  HardDrive,
  Folder,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  FolderPlus,
  Upload,
  ChevronDown,
  Layers,
  Check,
  Share2,
} from 'lucide-react';

interface BreadcrumbsBarProps {
  onNewFolderClick: () => void;
  onUploadClick: () => void;
}

interface BreadcrumbNode {
  id: string | null;
  name: string;
  color?: string;
  isVault?: boolean;
}

export const BreadcrumbsBar: React.FC<BreadcrumbsBarProps> = ({
  onNewFolderClick,
  onUploadClick,
}) => {
  const {
    lang,
    currentFolderId,
    setCurrentFolderId,
    folders,
    files,
    activeCategory,
    moveFiles,
    uploadFiles,
    setShareFolder,
  } = useStorage();

  const [dropTargetNodeId, setDropTargetNodeId] = useState<string | null | undefined>(undefined);
  const [siblingDropdownFolderId, setSiblingDropdownFolderId] = useState<string | null | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isAr = lang === 'ar';
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  const handleNodeDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetNodeId(undefined);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSiblingDropdownFolderId(undefined);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute full recursive breadcrumbs hierarchy from currentFolderId up to root
  const breadcrumbPath: BreadcrumbNode[] = [];
  
  if (currentFolderId) {
    let curr: FolderItem | undefined = folders.find(f => f.id === currentFolderId);
    const chain: BreadcrumbNode[] = [];
    
    // Safety guard against cycles (max 10 depth)
    let depth = 0;
    while (curr && depth < 10) {
      chain.unshift({
        id: curr.id,
        name: curr.name,
        color: curr.color,
        isVault: curr.isVault,
      });
      if (curr.parentId) {
        curr = folders.find(f => f.id === curr!.parentId);
      } else {
        curr = undefined;
      }
      depth++;
    }
    breadcrumbPath.push(...chain);
  }

  // Prepend Root Home
  const fullPath: BreadcrumbNode[] = [
    {
      id: null,
      name: isAr ? 'المساحة الرئيسية' : 'Home Drive',
      color: '#0284C7',
    },
    ...breadcrumbPath,
  ];

  // Immediate parent folder if not at root
  const currentFolder = folders.find(f => f.id === currentFolderId);
  const parentFolderId = currentFolder ? currentFolder.parentId : null;
  const parentFolder = parentFolderId ? folders.find(f => f.id === parentFolderId) : null;

  // Items count in current directory
  const currentSubfoldersCount = folders.filter(f => f.parentId === currentFolderId && !f.isVault).length;
  const currentFilesCount = files.filter(f => f.folderId === currentFolderId && !f.isTrash && !f.isVault).length;

  // Sibling / Child folder helper for dropdown
  const getSubfoldersOf = (parentId: string | null) => {
    return folders.filter(f => f.parentId === parentId && !f.isVault);
  };

  return (
    <nav aria-label="Directory Breadcrumbs" className="relative bg-[#F5EFF7] dark:bg-slate-900 rounded-2xl border border-[#DCD3DF] dark:border-slate-800 p-2 sm:p-2.5 shadow-xs transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left Side: Parent Jump Button + Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
          
          {/* 1-Click Jump to Parent Button (Visible when inside a folder) */}
          {currentFolderId !== null && (
            <button
              onClick={() => setCurrentFolderId(parentFolderId)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDropTargetNodeId(parentFolderId);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (dropTargetNodeId === parentFolderId) {
                  setDropTargetNodeId(undefined);
                }
              }}
              onDrop={(e) => handleNodeDrop(e, parentFolderId)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border group cursor-pointer ${
                dropTargetNodeId === parentFolderId
                  ? 'bg-white text-[#4E115A] border-2 border-[#4E115A] ring-2 ring-[#4E115A]/30 scale-105 shadow-sm'
                  : 'bg-white dark:bg-slate-800 hover:bg-[#F5EFF7] dark:hover:bg-blue-950/50 text-[#1E1E24] hover:text-[#4E115A] dark:text-slate-300 dark:hover:text-blue-400 border-[#DCD3DF] dark:border-slate-700/60'
              }`}
              title={
                parentFolder
                  ? (isAr ? `الرجوع ونقل الملفات إلى: ${parentFolder.name}` : `Back and drop to: ${parentFolder.name}`)
                  : (isAr ? 'الرجوع ونقل الملفات إلى المساحة الرئيسية' : 'Back and drop to Home Drive')
              }
            >
              <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
              <span className="hidden sm:inline">
                {isAr ? 'للأعلى' : 'Up'}
              </span>
            </button>
          )}

          {/* Breadcrumb Segments */}
          <div className="flex items-center gap-1 min-w-0">
            {fullPath.map((node, index) => {
              const isLast = index === fullPath.length - 1;
              const isRoot = node.id === null;
              const subfolders = getSubfoldersOf(node.id);
              const isDropdownOpen = siblingDropdownFolderId === node.id;

              return (
                <div key={node.id || 'root'} className="flex items-center gap-1 shrink-0">
                  
                  {/* Segment Button */}
                  <div className="relative flex items-center">
                    <button
                      onClick={() => {
                        if (!isLast) {
                          setCurrentFolderId(node.id);
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        setDropTargetNodeId(node.id);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        if (dropTargetNodeId === node.id) {
                          setDropTargetNodeId(undefined);
                        }
                      }}
                      onDrop={(e) => handleNodeDrop(e, node.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs transition-all relative cursor-pointer ${
                        dropTargetNodeId === node.id
                          ? 'bg-white text-[#4E115A] border-2 border-[#4E115A] ring-2 ring-[#4E115A]/30 scale-105 shadow-sm'
                          : isLast
                          ? 'bg-white dark:bg-blue-950/60 text-[#4E115A] dark:text-blue-300 font-bold border border-[#DCD3DF] dark:border-transparent shadow-xs'
                          : 'text-[#6E6A75] hover:text-[#1E1E24] dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800/80 font-medium'
                      }`}
                      title={node.name}
                    >
                      {dropTargetNodeId === node.id && (
                        <span className="absolute -top-2 rtl:left-1 ltr:right-1 text-[9px] bg-[#4E115A] text-white px-1.5 py-0.2 rounded-full font-bold shadow-xs animate-bounce whitespace-nowrap">
                          {isAr ? 'نقل' : 'Drop'}
                        </span>
                      )}
                      {isRoot ? (
                        <HardDrive className={`w-3.5 h-3.5 ${isLast || dropTargetNodeId === node.id ? 'text-[#4E115A] dark:text-blue-400' : 'text-[#6E6A75]'}`} />
                      ) : (
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: node.color || '#4E115A' }}
                        />
                      )}
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">
                        {node.name}
                      </span>
                    </button>

                    {/* Quick Subfolders Dropdown Trigger (if folder has subfolders) */}
                    {subfolders.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSiblingDropdownFolderId(isDropdownOpen ? undefined : node.id);
                        }}
                        className={`p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5 rtl:mr-0.5 ${
                          isDropdownOpen ? 'bg-slate-200 dark:bg-slate-700 text-slate-800' : ''
                        }`}
                        title={isAr ? 'عرض المجلدات الفرعية' : 'Show subfolders'}
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    )}

                    {/* Sibling / Child Folders Popover */}
                    {isDropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute top-full rtl:right-0 ltr:left-0 mt-1 z-30 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-800">
                          {isAr ? 'الانتقال إلى مجلد فرعي:' : 'Jump to subfolder:'}
                        </div>
                        <div className="max-h-48 overflow-y-auto py-1">
                          {subfolders.map(sub => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setCurrentFolderId(sub.id);
                                setSiblingDropdownFolderId(undefined);
                              }}
                              className="w-full flex items-center justify-between px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Folder className="w-3.5 h-3.5" style={{ color: sub.color || '#0284C7' }} />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              {currentFolderId === sub.id && (
                                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Breadcrumb Separator */}
                  {!isLast && (
                    <ChevronIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Directory Item Stats & Fast Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          
          {/* Metadata: Folders & Files Count */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
            <span>
              {currentSubfoldersCount} {isAr ? 'مجلدات' : 'folders'}
            </span>
            <span>·</span>
            <span>
              {currentFilesCount} {isAr ? 'ملفات' : 'files'}
            </span>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1.5">
            {currentFolder && (
              <button
                type="button"
                onClick={() => setShareFolder(currentFolder)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EFF7] dark:bg-purple-950/40 hover:bg-[#4E115A] text-[#4E115A] dark:text-purple-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-[#4E115A]/30 dark:border-purple-500/30 cursor-pointer shadow-2xs"
                title={isAr ? `مشاركة مجلد "${currentFolder.name}" وإنشاء رابط` : `Share folder "${currentFolder.name}"`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAr ? 'مشاركة المجلد' : 'Share Folder'}</span>
              </button>
            )}

            <button
              onClick={onUploadClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isAr ? 'رفع هنا' : 'Upload'}</span>
            </button>

            <button
              onClick={onNewFolderClick}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-[#F5EFF7] dark:hover:bg-slate-700 text-[#1E1E24] dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors border border-[#DCD3DF] dark:border-slate-700/60 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#6E6A75]" />
              <span>{isAr ? 'مجلد' : 'Folder'}</span>
            </button>
          </div>

        </div>

      </div>
    </nav>
  );
};
