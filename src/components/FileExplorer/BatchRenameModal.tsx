import React, { useState, useMemo, useEffect } from 'react';
import { useStorage } from '../../context/StorageContext';
import { FileItem } from '../../types/storage';
import {
  X,
  Edit3,
  ListOrdered,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  FileText,
  FileCode,
  Image as ImageIcon,
  Video,
  FileArchive,
  Music,
  FileSpreadsheet,
  FileCheck2,
  MoveUp,
  MoveDown,
  RotateCcw,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Replace,
} from 'lucide-react';
import { formatBytes, getFileTypeInfo } from '../../utils/formatters';

interface BatchRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileIds: string[];
}

type RenameMode = 'sequence' | 'pattern' | 'replace';
type SequencePosition = 'suffix' | 'prefix' | 'parentheses';
type CaseTransform = 'none' | 'lower' | 'upper' | 'capitalize';
type SortOption = 'current' | 'name-asc' | 'name-desc' | 'date-desc' | 'date-asc' | 'size-desc' | 'size-asc';

export const BatchRenameModal: React.FC<BatchRenameModalProps> = ({
  isOpen,
  onClose,
  fileIds,
}) => {
  const { lang, files, batchRenameFiles, showNotification, clearSelection } = useStorage();
  const isAr = lang === 'ar';

  // Mode: sequence (recommended), pattern, replace
  const [mode, setMode] = useState<RenameMode>('sequence');

  // Selected file items from the store
  const rawSelectedFiles = useMemo(() => {
    return files.filter(f => fileIds.includes(f.id));
  }, [files, fileIds]);

  // Order state of selected files (allows manual reordering)
  const [orderedFileIds, setOrderedFileIds] = useState<string[]>([]);
  const [excludedFileIds, setExcludedFileIds] = useState<string[]>([]);

  // Sequence Configuration State
  const [baseName, setBaseName] = useState('File');
  const [useOriginalName, setUseOriginalName] = useState(false);
  const [position, setPosition] = useState<SequencePosition>('suffix');
  const [startNumber, setStartNumber] = useState<number>(1);
  const [step, setStep] = useState<number>(1);
  const [paddingDigits, setPaddingDigits] = useState<number>(3); // e.g. 001
  const [separator, setSeparator] = useState<string>('_');
  const [preserveExtension, setPreserveExtension] = useState<boolean>(true);
  const [caseTransform, setCaseTransform] = useState<CaseTransform>('none');
  const [sortOption, setSortOption] = useState<SortOption>('current');

  // Custom Pattern Configuration State
  // Tokens: {name}, {n}, {ext}, {date}, {year}
  const [customPattern, setCustomPattern] = useState('{name}_{n}');

  // Replace Configuration State
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Search filter inside preview list
  const [previewFilter, setPreviewFilter] = useState('');

  // Synchronize ordered IDs when fileIds change
  useEffect(() => {
    if (fileIds.length > 0) {
      setOrderedFileIds(fileIds);
      setExcludedFileIds([]);
      // Pick a smart base name from first file
      const first = files.find(f => f.id === fileIds[0]);
      if (first) {
        // Strip number and extension from first file name for a smart default
        const cleanName = first.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_\-\s]*\d+$/, '')
          .trim();
        if (cleanName && cleanName.length > 0) {
          setBaseName(cleanName);
        } else {
          setBaseName('Document');
        }
      }
    }
  }, [fileIds, files]);

  // Handle Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Apply sorting to orderedFileIds
  const handleSortChange = (newSort: SortOption) => {
    setSortOption(newSort);
    const sorted = [...rawSelectedFiles];

    switch (newSort) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));
        break;
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'size-desc':
        sorted.sort((a, b) => b.sizeBytes - a.sizeBytes);
        break;
      case 'size-asc':
        sorted.sort((a, b) => a.sizeBytes - b.sizeBytes);
        break;
      case 'current':
      default:
        // Keep fileIds order
        break;
    }

    if (newSort !== 'current') {
      setOrderedFileIds(sorted.map(f => f.id));
    } else {
      setOrderedFileIds(fileIds);
    }
  };

  // Reorder items up/down
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= orderedFileIds.length) return;
    const next = [...orderedFileIds];
    const temp = next[index];
    next[index] = next[newIdx];
    next[newIdx] = temp;
    setOrderedFileIds(next);
    setSortOption('current');
  };

  // Helper: Format sequence number with padding
  const formatSequenceNum = (num: number, digits: number): string => {
    if (digits <= 1) return String(num);
    return String(num).padStart(digits, '0');
  };

  // Helper: Apply case transform
  const applyCase = (text: string, transform: CaseTransform): string => {
    switch (transform) {
      case 'lower':
        return text.toLowerCase();
      case 'upper':
        return text.toUpperCase();
      case 'capitalize':
        return text.replace(/\b\w/g, c => c.toUpperCase());
      default:
        return text;
    }
  };

  // Today's date tokens
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }, []);
  const yearStr = useMemo(() => String(new Date().getFullYear()), []);

  // Compute renames for all ordered files
  const previewItems = useMemo(() => {
    const activeFiles: { file: FileItem; index: number }[] = [];

    // Map orderedFileIds to files
    orderedFileIds.forEach(id => {
      const f = rawSelectedFiles.find(item => item.id === id);
      if (f) {
        activeFiles.push({ file: f, index: activeFiles.length });
      }
    });

    let seqCounter = startNumber;

    return activeFiles.map(({ file, index }) => {
      const isExcluded = excludedFileIds.includes(file.id);

      // Extract original base name and extension
      const lastDotIndex = file.name.lastIndexOf('.');
      let origBase = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
      let origExt = lastDotIndex !== -1 ? file.name.substring(lastDotIndex + 1) : file.extension;

      let newBase = origBase;
      let newExt = origExt;

      if (!isExcluded) {
        if (mode === 'sequence') {
          const numStr = formatSequenceNum(seqCounter, paddingDigits);
          const activeBase = useOriginalName ? origBase : (baseName.trim() || 'File');

          if (position === 'suffix') {
            newBase = separator ? `${activeBase}${separator}${numStr}` : `${activeBase}${numStr}`;
          } else if (position === 'prefix') {
            newBase = separator ? `${numStr}${separator}${activeBase}` : `${numStr}${activeBase}`;
          } else if (position === 'parentheses') {
            newBase = `${activeBase} (${numStr})`;
          }
          seqCounter += step;
        } else if (mode === 'pattern') {
          const numStr = formatSequenceNum(seqCounter, paddingDigits);
          newBase = customPattern
            .replace(/\{name\}/gi, origBase)
            .replace(/\{n\}|\{seq\}/gi, numStr)
            .replace(/\{date\}/gi, todayStr)
            .replace(/\{year\}/gi, yearStr);
          seqCounter += step;
        } else if (mode === 'replace') {
          if (findText) {
            if (caseSensitive) {
              newBase = origBase.split(findText).join(replaceText);
            } else {
              const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              newBase = origBase.replace(regex, replaceText);
            }
          }
        }

        // Apply case transform
        newBase = applyCase(newBase, caseTransform);

        if (preserveExtension) {
          newExt = caseTransform === 'upper' ? origExt.toUpperCase() : origExt.toLowerCase();
        }
      }

      const finalName = preserveExtension && newExt ? `${newBase}.${newExt}` : newBase;

      return {
        file,
        index,
        seqNumber: index + 1,
        originalName: file.name,
        newName: finalName,
        isExcluded,
        hasChanged: finalName !== file.name,
      };
    });
  }, [
    orderedFileIds,
    rawSelectedFiles,
    excludedFileIds,
    mode,
    baseName,
    useOriginalName,
    position,
    startNumber,
    step,
    paddingDigits,
    separator,
    preserveExtension,
    caseTransform,
    customPattern,
    findText,
    replaceText,
    caseSensitive,
    todayStr,
    yearStr,
  ]);

  // Check for duplicate names (Collisions)
  const duplicateNames = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    previewItems.forEach(item => {
      if (!item.isExcluded) {
        const lower = item.newName.toLowerCase();
        if (seen.has(lower)) {
          dupes.add(lower);
        } else {
          seen.add(lower);
        }
      }
    });
    return dupes;
  }, [previewItems]);

  const hasCollisions = duplicateNames.size > 0;
  const activeRenameCount = previewItems.filter(i => !i.isExcluded && i.hasChanged).length;

  // Toggle single item exclusion
  const toggleExclude = (id: string) => {
    setExcludedFileIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Presets
  const applyPreset = (presetType: 'invoice' | 'photo' | 'backup' | 'prefixDoc') => {
    setMode('sequence');
    switch (presetType) {
      case 'invoice':
        setBaseName('Invoice');
        setUseOriginalName(false);
        setPosition('suffix');
        setSeparator('_');
        setStartNumber(1);
        setStep(1);
        setPaddingDigits(3);
        setPreserveExtension(true);
        break;
      case 'photo':
        setBaseName('IMG');
        setUseOriginalName(false);
        setPosition('suffix');
        setSeparator('_');
        setStartNumber(1);
        setStep(1);
        setPaddingDigits(4);
        setPreserveExtension(true);
        break;
      case 'backup':
        setBaseName(`Backup_${todayStr}`);
        setUseOriginalName(false);
        setPosition('suffix');
        setSeparator('_');
        setStartNumber(1);
        setStep(1);
        setPaddingDigits(2);
        setPreserveExtension(true);
        break;
      case 'prefixDoc':
        setUseOriginalName(true);
        setPosition('prefix');
        setSeparator(' - ');
        setStartNumber(1);
        setStep(1);
        setPaddingDigits(2);
        setPreserveExtension(true);
        break;
    }
  };

  // Submit Batch Rename
  const handleApplyBatchRename = () => {
    if (activeRenameCount === 0) {
      showNotification(
        'لم يتم إجراء أي تعديل على أسماء الملفات',
        'No changes were made to file names',
        'info'
      );
      onClose();
      return;
    }

    if (hasCollisions) {
      showNotification(
        'يرجى معالجة الأسماء المكررة لتجنب تعارض الملفات قبل التطبيق',
        'Please resolve duplicate name collisions before applying',
        'warning'
      );
      return;
    }

    const renamesToApply = previewItems
      .filter(item => !item.isExcluded && item.hasChanged)
      .map(item => ({
        id: item.file.id,
        newName: item.newName,
      }));

    batchRenameFiles(renamesToApply);
    clearSelection();
    onClose();
  };

  // Filtered preview items for UI display
  const filteredPreview = useMemo(() => {
    if (!previewFilter.trim()) return previewItems;
    const q = previewFilter.toLowerCase();
    return previewItems.filter(
      item =>
        item.originalName.toLowerCase().includes(q) ||
        item.newName.toLowerCase().includes(q)
    );
  }, [previewItems, previewFilter]);

  if (!isOpen || rawSelectedFiles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* ========================================================= */}
        {/* MODAL HEADER                                              */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-[#4E115A] to-[#3a0c43] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <ListOrdered className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {isAr ? 'إعادة التسمية المجمعة بالتسلسل الرقمي' : 'Batch Rename with Sequence Numbers'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono font-bold">
                  {rawSelectedFiles.length} {isAr ? 'ملفات' : 'files'}
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                {isAr
                  ? 'ترقيم تسلسلي ذكي، تحويل التنسيقات، ومعاينة حية دقيقة وفورية'
                  : 'Automated sequence numbering, tokens, and live duplicate detection'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title={isAr ? 'إغلاق' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODE TABS & QUICK PRESETS BAR                             */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-3 border-b border-[#DCD3DF] dark:border-slate-800 bg-[#F5EFF7]/60 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-[#DCD3DF] dark:border-slate-700/60 shadow-2xs">
            <button
              onClick={() => setMode('sequence')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'sequence'
                  ? 'bg-[#4E115A] text-white shadow-xs'
                  : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>{isAr ? 'ترقيم تسلسلي' : 'Sequence Numbering'}</span>
            </button>

            <button
              onClick={() => setMode('pattern')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'pattern'
                  ? 'bg-[#4E115A] text-white shadow-xs'
                  : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isAr ? 'نمط مخصص (Tokens)' : 'Custom Pattern'}</span>
            </button>

            <button
              onClick={() => setMode('replace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'replace'
                  ? 'bg-[#4E115A] text-white shadow-xs'
                  : 'text-[#6E6A75] dark:text-slate-400 hover:text-[#1E1E24] dark:hover:text-white'
              }`}
            >
              <Replace className="w-3.5 h-3.5" />
              <span>{isAr ? 'بحث واستبدال' : 'Find & Replace'}</span>
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#6E6A75] dark:text-slate-400 font-bold text-[11px] hidden sm:inline">
              {isAr ? 'قوالب سريعة:' : 'Presets:'}
            </span>
            <button
              type="button"
              onClick={() => applyPreset('invoice')}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-[#4E115A] hover:text-[#4E115A] dark:hover:text-purple-300 transition-colors cursor-pointer"
            >
              {isAr ? 'فواتير (Invoice_001)' : 'Invoices (001)'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('photo')}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-[#4E115A] hover:text-[#4E115A] dark:hover:text-purple-300 transition-colors cursor-pointer"
            >
              {isAr ? 'صور (IMG_0001)' : 'Photos (0001)'}
            </button>
            <button
              type="button"
              onClick={() => applyPreset('prefixDoc')}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-[#DCD3DF] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-[#4E115A] hover:text-[#4E115A] dark:hover:text-purple-300 transition-colors cursor-pointer hidden md:inline-block"
            >
              {isAr ? 'ترقيم تصاعدي (01 - اسم)' : 'Prefix (01 - Name)'}
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* MODAL BODY (SCROLLABLE)                                   */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* CONFIGURATION CONTROLS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-[#DCD3DF] dark:border-slate-800 space-y-4">
            
            {/* Mode 1: Sequence Numbering Controls */}
            {mode === 'sequence' && (
              <div className="space-y-4">
                
                {/* Row 1: Base Name & Keep Original Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'الاسم الأساسي الجديد (Base Name):' : 'Base Name:'}
                    </label>
                    <input
                      type="text"
                      disabled={useOriginalName}
                      value={baseName}
                      onChange={e => setBaseName(e.target.value)}
                      placeholder={isAr ? 'مثال: Project_Report أو Photo' : 'e.g. Project_Report or Photo'}
                      className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border transition-all ${
                        useOriginalName
                          ? 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                          : 'bg-white dark:bg-slate-900 border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20 focus:border-[#4E115A]'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-5 pb-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useOriginalName}
                        onChange={e => setUseOriginalName(e.target.checked)}
                        className="w-4 h-4 rounded text-[#4E115A] focus:ring-[#4E115A] border-[#DCD3DF] dark:border-slate-700"
                      />
                      <span>{isAr ? 'الاحتفاظ باسم الملف الأصلي وإضافة الرقم' : 'Keep original name & append/prepend number'}</span>
                    </label>
                  </div>
                </div>

                {/* Row 2: Sequence Number Placement & Separator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* Position */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'موقع الرقم التسلسلي:' : 'Number Position:'}
                    </label>
                    <select
                      value={position}
                      onChange={e => setPosition(e.target.value as SequencePosition)}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20 cursor-pointer"
                    >
                      <option value="suffix">{isAr ? 'في النهاية (اسم_001)' : 'At the End (Name_001)'}</option>
                      <option value="prefix">{isAr ? 'في البداية (001_اسم)' : 'At the Beginning (001_Name)'}</option>
                      <option value="parentheses">{isAr ? 'بين أقواس: اسم (001)' : 'Parentheses: Name (001)'}</option>
                    </select>
                  </div>

                  {/* Separator */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'الفاصل (Separator):' : 'Separator:'}
                    </label>
                    <select
                      value={separator}
                      onChange={e => setSeparator(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20 cursor-pointer"
                    >
                      <option value="_">{isAr ? 'شرطة سفلية: _ (Underscore)' : 'Underscore (_)'}</option>
                      <option value="-">{isAr ? 'واصلة: - (Hyphen)' : 'Hyphen (-)'}</option>
                      <option value=" - ">{isAr ? 'واصلة مع مسافة: [ - ]' : 'Hyphen with spaces ( - )'}</option>
                      <option value=" ">{isAr ? 'مسافة فارغة [ ]' : 'Space ( )'}</option>
                      <option value=".">{isAr ? 'نقطة: .' : 'Dot (.)'}</option>
                      <option value="">{isAr ? 'بدون فاصل' : 'None'}</option>
                    </select>
                  </div>

                  {/* Start Number & Step */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'رقم البداية ومقدار القفز:' : 'Start & Step:'}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={startNumber}
                        onChange={e => setStartNumber(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20"
                        title={isAr ? 'رقم البداية' : 'Start Number'}
                      />
                      <span className="text-slate-400 font-bold text-xs">+</span>
                      <input
                        type="number"
                        min="1"
                        value={step}
                        onChange={e => setStep(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 px-2 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20"
                        title={isAr ? 'مقدار الزيادة' : 'Step'}
                      />
                    </div>
                  </div>

                  {/* Padding / Digits */}
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'الخانات (الأصفار البادئة):' : 'Padding / Digits:'}
                    </label>
                    <select
                      value={paddingDigits}
                      onChange={e => setPaddingDigits(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20 cursor-pointer"
                    >
                      <option value="1">{isAr ? 'بدون أصفار (1, 2, 3...)' : '1 digit: 1, 2, 3'}</option>
                      <option value="2">{isAr ? 'خانتان (01, 02...)' : '2 digits: 01, 02'}</option>
                      <option value="3">{isAr ? '3 خانات (001, 002...)' : '3 digits: 001, 002'}</option>
                      <option value="4">{isAr ? '4 خانات (0001, 0002...)' : '4 digits: 0001, 0002'}</option>
                      <option value="5">{isAr ? '5 خانات (00001...)' : '5 digits: 00001'}</option>
                    </select>
                  </div>

                </div>

              </div>
            )}

            {/* Mode 2: Custom Pattern Controls */}
            {mode === 'pattern' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                    {isAr ? 'صيغة النمط المخصص (Custom Token Pattern):' : 'Pattern Template:'}
                  </label>
                  <input
                    type="text"
                    value={customPattern}
                    onChange={e => setCustomPattern(e.target.value)}
                    placeholder="{name}_{n}"
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white focus:ring-2 focus:ring-[#4E115A]/20"
                  />
                </div>

                {/* Token Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-[#6E6A75] dark:text-slate-400 font-bold">{isAr ? 'الرموز المتاحة للإدراج:' : 'Available Tokens:'}</span>
                  {[
                    { token: '{n}', label: isAr ? 'الرقم المتسلسل' : 'Sequence Num' },
                    { token: '{name}', label: isAr ? 'الاسم الأصلي' : 'Original Name' },
                    { token: '{date}', label: todayStr },
                    { token: '{year}', label: yearStr },
                  ].map(item => (
                    <button
                      key={item.token}
                      type="button"
                      onClick={() => setCustomPattern(prev => `${prev}${item.token}`)}
                      className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-[#4E115A] dark:text-purple-300 font-mono text-[10px] hover:bg-purple-100 cursor-pointer"
                      title={item.label}
                    >
                      + {item.token} ({item.label})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'رقم البداية ومقدار الزيادة:' : 'Start Number & Step:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={startNumber}
                        onChange={e => setStartNumber(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2.5 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700"
                      />
                      <span>+</span>
                      <input
                        type="number"
                        min="1"
                        value={step}
                        onChange={e => setStep(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 px-2 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'عدد خانات الرقم (الأصفار):' : 'Sequence Padding:'}
                    </label>
                    <select
                      value={paddingDigits}
                      onChange={e => setPaddingDigits(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700"
                    >
                      <option value="1">1 (1, 2, 3)</option>
                      <option value="2">01, 02, 03</option>
                      <option value="3">001, 002, 003</option>
                      <option value="4">0001, 0002, 0003</option>
                    </select>
                  </div>
                </div>

              </div>
            )}

            {/* Mode 3: Find & Replace Controls */}
            {mode === 'replace' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'النص المراد البحث عنه واستبداله:' : 'Find Text:'}
                    </label>
                    <input
                      type="text"
                      value={findText}
                      onChange={e => setFindText(e.target.value)}
                      placeholder={isAr ? 'مثال: draft أو copy' : 'e.g. draft or copy'}
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E1E24] dark:text-slate-200 mb-1">
                      {isAr ? 'النص البديل الجديد:' : 'Replace With:'}
                    </label>
                    <input
                      type="text"
                      value={replaceText}
                      onChange={e => setReplaceText(e.target.value)}
                      placeholder={isAr ? 'مثال: final أو معتمد' : 'e.g. final or v1'}
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={e => setCaseSensitive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4E115A]"
                    />
                    <span>{isAr ? 'مطابقة حالة الأحرف اللاتينية (Case Sensitive)' : 'Case Sensitive Match'}</span>
                  </label>
                </div>
              </div>
            )}

            {/* Shared Options: Case Transformation & Extension Preservation */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={preserveExtension}
                    onChange={e => setPreserveExtension(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4E115A] focus:ring-[#4E115A] border-[#DCD3DF] dark:border-slate-700"
                  />
                  <span>{isAr ? 'الحفاظ التلقائي على امتداد الملفات الأصلي (.pdf, .png)' : 'Preserve original file extensions (.pdf, .png)'}</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#6E6A75] dark:text-slate-400 font-bold">{isAr ? 'حالة الأحرف:' : 'Case:'}</span>
                <select
                  value={caseTransform}
                  onChange={e => setCaseTransform(e.target.value as CaseTransform)}
                  className="px-2.5 py-1 rounded-xl text-xs bg-white dark:bg-slate-900 border border-[#DCD3DF] dark:border-slate-700 text-[#1E1E24] dark:text-white cursor-pointer"
                >
                  <option value="none">{isAr ? 'افتراضي دون تغيير' : 'Unchanged'}</option>
                  <option value="lower">lowercase (صغير)</option>
                  <option value="upper">UPPERCASE (كبير)</option>
                  <option value="capitalize">Capitalize (أول حرف كبير)</option>
                </select>
              </div>

            </div>

          </div>

          {/* ========================================================= */}
          {/* SORTING & LIVE PREVIEW TABLE                              */}
          {/* ========================================================= */}
          <div className="space-y-3">
            
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400">
                  {isAr ? 'معاينة التسمية الحية اللحظية' : 'Live Batch Preview'}
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ({activeRenameCount} {isAr ? 'سيتم تعديلها' : 'will be renamed'})
                </span>
              </div>

              {/* Sorting and Search within modal */}
              <div className="flex items-center gap-2">
                
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-2.5 ltr:left-2.5" />
                  <input
                    type="text"
                    value={previewFilter}
                    onChange={e => setPreviewFilter(e.target.value)}
                    placeholder={isAr ? 'تصفية القائمة...' : 'Filter list...'}
                    className="rtl:pr-7 ltr:pl-7 py-1 text-[11px] rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1E1E24] dark:text-white w-32 sm:w-40"
                  />
                </div>

                {/* Sort Option */}
                <select
                  value={sortOption}
                  onChange={e => handleSortChange(e.target.value as SortOption)}
                  className="px-2.5 py-1 rounded-xl text-[11px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1E1E24] dark:text-slate-300 cursor-pointer"
                >
                  <option value="current">{isAr ? 'ترتيب الاختيار الحالي' : 'Selection Order'}</option>
                  <option value="name-asc">{isAr ? 'الاسم: أ → ي (A-Z)' : 'Name: A → Z'}</option>
                  <option value="name-desc">{isAr ? 'الاسم: ي → أ (Z-A)' : 'Name: Z → A'}</option>
                  <option value="date-desc">{isAr ? 'الأحدث تاريخاً' : 'Newest First'}</option>
                  <option value="date-asc">{isAr ? 'الأقدم تاريخاً' : 'Oldest First'}</option>
                  <option value="size-desc">{isAr ? 'الحجم الأكبر' : 'Largest First'}</option>
                  <option value="size-asc">{isAr ? 'الحجم الأصغر' : 'Smallest First'}</option>
                </select>

              </div>
            </div>

            {/* Collision Alert Banner */}
            {hasCollisions && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 flex items-center gap-2.5 text-xs animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">
                    {isAr ? 'تنبيه: توجد أسماء مكررة متطابقة!' : 'Warning: Duplicate names detected!'}
                  </span>{' '}
                  <span className="text-[11px] opacity-90">
                    {isAr
                      ? 'قد يؤدي ذلك لتضارب بالملفات. قم بتغيير خيارات الترقيم أو استخدم أصفار بادئة.'
                      : 'Multiple files will have the exact same name. Adjust start number or separator.'}
                  </span>
                </div>
              </div>
            )}

            {/* Preview List Box */}
            <div className="border border-[#DCD3DF] dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
              
              {/* Table Column Headings */}
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/80 text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 grid grid-cols-12 gap-2 sticky top-0 z-10">
                <div className="col-span-1 flex items-center gap-1">
                  <span>#</span>
                </div>
                <div className="col-span-5">{isAr ? 'الاسم الأصلي الحالي' : 'Original Filename'}</div>
                <div className="col-span-5">{isAr ? 'الاسم الجديد بعد الترقيم' : 'New Renamed Result'}</div>
                <div className="col-span-1 text-center">{isAr ? 'ترتيب' : 'Order'}</div>
              </div>

              {/* Items */}
              {filteredPreview.map((item, idx) => {
                const isDupe = duplicateNames.has(item.newName.toLowerCase());
                const typeInfo = getFileTypeInfo(item.file.extension);

                return (
                  <div
                    key={item.file.id}
                    className={`px-4 py-2.5 grid grid-cols-12 gap-2 items-center text-xs transition-colors ${
                      item.isExcluded
                        ? 'opacity-40 bg-slate-50 dark:bg-slate-950/30'
                        : isDupe
                        ? 'bg-amber-50/60 dark:bg-amber-950/20'
                        : item.hasChanged
                        ? 'hover:bg-purple-50/40 dark:hover:bg-slate-800/40'
                        : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    
                    {/* Index & Exclude Checkbox */}
                    <div className="col-span-1 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!item.isExcluded}
                        onChange={() => toggleExclude(item.file.id)}
                        className="w-3.5 h-3.5 rounded text-[#4E115A] cursor-pointer"
                        title={item.isExcluded ? (isAr ? 'تضمين في التسمية' : 'Include') : (isAr ? 'استبعاد' : 'Exclude')}
                      />
                      <span className="font-mono text-[10px] text-slate-400">
                        {item.seqNumber}
                      </span>
                    </div>

                    {/* Original Name */}
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-[#6E6A75]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[11px] text-slate-700 dark:text-slate-300" title={item.originalName}>
                          {item.originalName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatBytes(item.file.sizeBytes, 1, isAr)}
                        </span>
                      </div>
                    </div>

                    {/* New Name */}
                    <div className="col-span-5 flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 shrink-0">
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </span>

                      <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <p
                          className={`truncate font-mono text-[11px] font-bold ${
                            isDupe
                              ? 'text-amber-600 dark:text-amber-400'
                              : item.hasChanged
                              ? 'text-[#4E115A] dark:text-purple-300'
                              : 'text-slate-500'
                          }`}
                          title={item.newName}
                        >
                          {item.newName}
                        </p>
                        {isDupe && (
                          <span
                            className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold shrink-0"
                            title={isAr ? 'اسم مكرر' : 'Duplicate name'}
                          >
                            ⚠️ Dupe
                          </span>
                        )}
                        {!item.isExcluded && item.hasChanged && !isDupe && (
                          <Check className="w-3 h-3 text-[#1AD062] shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Manual Move Up/Down Controls */}
                    <div className="col-span-1 flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, 'up')}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title={isAr ? 'تحريك للأعلى في التسلسل' : 'Move up in sequence'}
                      >
                        <MoveUp className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === filteredPreview.length - 1}
                        onClick={() => moveItem(idx, 'down')}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title={isAr ? 'تحريك للأسفل في التسلسل' : 'Move down in sequence'}
                      >
                        <MoveDown className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER ACTIONS                                      */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-[#DCD3DF] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          <div className="text-xs text-[#6E6A75] dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1AD062]" />
            <span>
              {isAr
                ? `${activeRenameCount} ملف جاهز للتسمية الفورية المشفرة`
                : `${activeRenameCount} files ready for batch rename`}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              disabled={activeRenameCount === 0 || hasCollisions}
              onClick={handleApplyBatchRename}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4E115A] hover:bg-[#3d0d46] disabled:opacity-50 disabled:hover:bg-[#4E115A] transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-[#1AD062]" />
              <span>
                {isAr
                  ? `تطبيق التسمية على ${activeRenameCount} ملف`
                  : `Apply Batch Rename (${activeRenameCount})`}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
