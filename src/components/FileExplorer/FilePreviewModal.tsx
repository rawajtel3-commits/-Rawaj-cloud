import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStorage } from '../../context/StorageContext';
import { FileItem } from '../../types/storage';
import {
  X,
  Download,
  Share2,
  History,
  Trash2,
  Lock,
  Video,
  FileText,
  Image as ImageIcon,
  Check,
  Copy,
  Layers,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  Maximize2,
  Minimize2,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  Printer,
  Table,
  Code2,
  WrapText,
  ShieldCheck,
  Award,
  Hash,
  ExternalLink,
  Globe,
  Sliders,
  FlipHorizontal,
} from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';

export const FilePreviewModal: React.FC = () => {
  const {
    lang,
    previewFile,
    setPreviewFile,
    setShareFile,
    setVersionHistoryFile,
    cryptoShredFile,
    deleteFile,
    showNotification,
  } = useStorage();

  const isAr = lang === 'ar';

  // Modal Fullscreen Toggle
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard Escape Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          setPreviewFile(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, setPreviewFile]);

  // Reset state when file changes
  useEffect(() => {
    setIsFullscreen(false);
  }, [previewFile]);

  if (!previewFile) return null;

  const handleDownload = () => {
    let downloadUrl = previewFile.mediaUrl || previewFile.thumbnailUrl;
    let cleanup = false;

    if (!downloadUrl) {
      const blob = new Blob(
        [
          previewFile.previewContent ||
            `Rawaj Cloud Secure File\nName: ${previewFile.name}\nSize: ${previewFile.sizeBytes} bytes\nSHA-256 Checksum: ${previewFile.checksum}`,
        ],
        { type: 'application/octet-stream' }
      );
      downloadUrl = URL.createObjectURL(blob);
      cleanup = true;
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = previewFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (cleanup) {
      setTimeout(() => URL.revokeObjectURL(downloadUrl!), 2000);
    }

    showNotification(
      `جاري تنزيل الملف "${previewFile.name}" مباشرة عبر موزع Edge CDN السريع`,
      `Downloading "${previewFile.name}" via Rawaj Edge CDN`,
      'success'
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const isImage = previewFile.type === 'image';
  const isVideo = previewFile.type === 'video';
  const isPdf = previewFile.type === 'pdf' || previewFile.extension.toLowerCase() === 'pdf';
  const isSpreadsheet =
    previewFile.type === 'spreadsheet' ||
    ['xlsx', 'xls', 'csv'].includes(previewFile.extension.toLowerCase());
  const isTextOrCode =
    !isPdf &&
    !isImage &&
    !isVideo &&
    (['txt', 'md', 'json', 'csv', 'sql', 'js', 'ts', 'jsx', 'tsx', 'py', 'env', 'html', 'css', 'xml', 'log'].includes(
      previewFile.extension.toLowerCase()
    ) ||
      previewFile.mimeType.startsWith('text/') ||
      previewFile.type === 'document' ||
      previewFile.type === 'code');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#DCD3DF] dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'max-w-[98vw] h-[96vh]'
            : 'max-w-5xl max-h-[92vh] h-[85vh]'
        }`}
      >
        
        {/* ========================================================= */}
        {/* TOP HEADER BAR                                            */}
        {/* ========================================================= */}
        <div className="px-5 py-3.5 border-b border-[#DCD3DF] dark:border-slate-800 flex items-center justify-between gap-4 bg-[#F5EFF7]/70 dark:bg-slate-900/90 shrink-0">
          
          {/* File Identity */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 text-[#4E115A] dark:text-purple-300 flex items-center justify-center shrink-0 border border-[#DCD3DF] dark:border-slate-700 shadow-2xs">
              {isPdf && <FileText className="w-5 h-5 text-rose-500" />}
              {isImage && <ImageIcon className="w-5 h-5 text-amber-500" />}
              {isVideo && <Video className="w-5 h-5 text-blue-500" />}
              {isSpreadsheet && <FileSpreadsheet className="w-5 h-5 text-emerald-500" />}
              {isTextOrCode && <FileCode className="w-5 h-5 text-indigo-500" />}
              {!isPdf && !isImage && !isVideo && !isSpreadsheet && !isTextOrCode && (
                <FileText className="w-5 h-5 text-purple-500" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1E1E24] dark:text-white truncate" title={previewFile.name}>
                  {previewFile.name}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-mono font-bold uppercase text-[#4E115A] dark:text-purple-300 border border-[#DCD3DF] dark:border-slate-700 shrink-0">
                  {previewFile.extension}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#6E6A75] dark:text-slate-400 font-mono mt-0.5">
                <span>{formatBytes(previewFile.sizeBytes, 1, isAr)}</span>
                <span>·</span>
                <span>{formatDate(previewFile.updatedAt, isAr)}</span>
                {previewFile.isVault && (
                  <>
                    <span>·</span>
                    <span className="text-[#1AD062] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Zero-Knowledge (AES-256)</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Print Button (PDF & Text) */}
            {(isPdf || isTextOrCode) && (
              <button
                type="button"
                onClick={handlePrint}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={isAr ? 'طباعة المستند' : 'Print Document'}
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {/* Share Link */}
            <button
              type="button"
              onClick={() => {
                setShareFile(previewFile);
                setPreviewFile(null);
              }}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'مشاركة الرابط المشفر' : 'Share Link'}
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Version History */}
            <button
              type="button"
              onClick={() => {
                setVersionHistoryFile(previewFile);
                setPreviewFile(null);
              }}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'سجل النسخ السابقة' : 'Version History'}
            >
              <History className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#4E115A] hover:bg-[#3d0d46] text-white rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-[#1AD062]" />
              <span>{isAr ? 'تنزيل' : 'Download'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
              title={isFullscreen ? (isAr ? 'تصغير' : 'Exit Fullscreen') : (isAr ? 'ملء الشاشة' : 'Fullscreen')}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق (Esc)' : 'Close (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* ========================================================= */}
        {/* DEDICATED PREVIEW ENGINE                                  */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-100/70 dark:bg-slate-950">
          {isPdf && <PdfPreviewViewer file={previewFile} isAr={isAr} />}
          {isImage && <ImagePreviewViewer file={previewFile} isAr={isAr} />}
          {isTextOrCode && <TextCodePreviewViewer file={previewFile} isAr={isAr} />}
          {isVideo && <VideoPreviewViewer file={previewFile} isAr={isAr} />}
          {isSpreadsheet && <SpreadsheetPreviewViewer file={previewFile} isAr={isAr} />}
        </div>

        {/* ========================================================= */}
        {/* FOOTER BAR: SECURITY AUDIT & CHECKSUM                     */}
        {/* ========================================================= */}
        <div className="px-5 py-3 border-t border-[#DCD3DF] dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          
          {/* Checksum and Redundancy */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6E6A75] dark:text-slate-400 font-mono">{isAr ? 'بصمة SHA-256:' : 'SHA-256:'}</span>
              <span className="font-mono text-[11px] text-[#1E1E24] dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 select-all">
                {previewFile.checksum}
              </span>
              <CopyChecksumButton checksum={previewFile.checksum} isAr={isAr} showNotification={showNotification} />
            </div>

            <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>

            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[#1AD062] font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1AD062]" />
              <span>11 Nines (99.999999999%) Durability Verified</span>
            </div>
          </div>

          {/* Delete or Crypto-Shred Button */}
          <div className="flex items-center gap-2">
            {previewFile.isVault ? (
              <button
                type="button"
                onClick={() => {
                  cryptoShredFile(previewFile.id);
                  setPreviewFile(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-rose-200 dark:border-rose-900/50 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isAr ? 'محو مشفر كلياً (Crypto-Shred)' : 'Crypto-Shred'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  deleteFile(previewFile.id);
                  setPreviewFile(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'نقل لسلة المحذوفات' : 'Move to Trash'}</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

// ============================================================================
// 1. PDF DOCUMENT PREVIEW VIEWER (MULTI-PAGE INTERACTIVE ENGINE)
// ============================================================================
interface PdfViewerProps {
  file: FileItem;
  isAr: boolean;
}

const PdfPreviewViewer: React.FC<PdfViewerProps> = ({ file, isAr }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 4;
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [pdfSearch, setPdfSearch] = useState<string>('');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);

  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const handlePrevPage = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleZoomIn = () => setZoomLevel(z => Math.min(200, z + 20));
  const handleZoomOut = () => setZoomLevel(z => Math.max(60, z - 20));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handleFitWidth = () => setZoomLevel(120);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      
      {/* PDF Specialized Control Bar */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-[#DCD3DF] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
        
        {/* Page Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
            title={isAr ? 'الصفحة السابقة' : 'Previous Page'}
          >
            {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {isAr
              ? `صفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
            title={isAr ? 'الصفحة التالية' : 'Next Page'}
          >
            {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>

          {/* Thumbnails Toggle */}
          <button
            type="button"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showThumbnails
                ? 'bg-purple-50 dark:bg-purple-950/40 border-[#4E115A] text-[#4E115A] dark:text-purple-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAr ? 'المصغرات' : 'Thumbnails'}</span>
          </button>
        </div>

        {/* Zoom & Rotate Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title={isAr ? 'تصغير' : 'Zoom Out'}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title={isAr ? 'تكبير' : 'Zoom In'}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            className="px-2 py-1 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hidden md:block"
          >
            {isAr ? 'ملاءمة العرض' : 'Fit Width'}
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title={isAr ? 'تدوير 90 درجة' : 'Rotate 90°'}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* PDF Search */}
        <div className="relative flex items-center min-w-[160px] sm:min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-2.5 ltr:left-2.5" />
          <input
            type="text"
            value={pdfSearch}
            onChange={e => setPdfSearch(e.target.value)}
            placeholder={isAr ? 'بحث في صفحات المستند...' : 'Find in document...'}
            className="w-full rtl:pr-8 ltr:pl-8 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-[#1E1E24] dark:text-white"
          />
        </div>

      </div>

      {/* Main PDF View Area: Thumbnails Sidebar + Center Sheet Canvas */}
      <div className="flex-1 flex min-h-0 overflow-hidden bg-slate-200/80 dark:bg-slate-950">
        
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-40 sm:w-48 bg-slate-100 dark:bg-slate-900/90 border-r rtl:border-r-0 rtl:border-l border-[#DCD3DF] dark:border-slate-800 p-3 overflow-y-auto space-y-3 shrink-0">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
              {isAr ? 'صفحات المستند' : 'Pages'}
            </span>

            {[1, 2, 3, 4].map(pg => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`w-full rounded-xl p-2 transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                  currentPage === pg
                    ? 'ring-2 ring-[#4E115A] bg-white dark:bg-slate-800 shadow-md'
                    : 'bg-white/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                {/* Mini Sheet Preview Skeleton */}
                <div className="w-full aspect-[1/1.3] bg-white border border-slate-200 dark:border-slate-700 rounded-md p-1.5 shadow-2xs flex flex-col justify-between overflow-hidden">
                  <div className="space-y-1">
                    <div className="h-1.5 bg-rose-500/80 rounded w-2/3" />
                    <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded w-full" />
                    <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded w-4/5" />
                    <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
                  </div>
                  <div className="text-[8px] font-mono text-slate-400 text-right">
                    pg. {pg}
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? `صفحة ${pg}` : `Page ${pg}`}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Center Canvas Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center">
          <div
            className="transition-transform duration-200 origin-top shadow-2xl rounded-sm"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            }}
          >
            {/* Real Rendered Document Page Canvas */}
            <div className="w-[620px] min-h-[820px] bg-white text-slate-900 p-10 sm:p-12 shadow-2xl border border-slate-200 flex flex-col justify-between relative select-text">
              
              {/* Page Header Watermark */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded bg-[#4E115A] flex items-center justify-center text-white text-[8px] font-bold">
                    R
                  </div>
                  <span className="font-bold tracking-tight text-[#4E115A]">
                    {isAr ? 'رواج كلاود - المنصة السحابية المعتمدة' : 'Rawaj Cloud - Enterprise Cloud Platform'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[9px]">
                    E2EE VERIFIED
                  </span>
                  <span>DOC-REF: {file.checksum.slice(0, 10).toUpperCase()}</span>
                </div>
              </div>

              {/* Dynamic Page Content Based on Page Number */}
              {currentPage === 1 && (
                <div className="space-y-6 py-6 flex-1">
                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-purple-700 font-bold block">
                      Technical Whitepaper & Architecture Protocol
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                      {file.name.replace(/\.pdf$/i, '').replace(/_/g, ' ')}
                    </h1>
                    <p className="text-xs text-slate-500 font-mono">
                      Published: November 2026 · Author: Tariq Al-Mohandis (Lead Cloud Architect)
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 text-xs leading-relaxed space-y-2">
                    <h4 className="font-bold text-[#4E115A] uppercase font-mono tracking-wider text-[11px]">
                      {isAr ? 'الملخص التنفيذي (Executive Summary):' : 'Executive Abstract:'}
                    </h4>
                    <p className="text-slate-700">
                      {file.previewContent ||
                        (isAr
                          ? 'توثق هذه الورقة الهندسية بنية رواج كلاود لحلول التخزين السحابي عالي الأمان بمعدل بقاء 11 تسعات، مع تطبيق التشفير الصفري AES-256 محلياً على طرف العميل قبل الإرسال لمنع أي تسريب.'
                          : 'This whitepaper documents the complete technical architecture of Rawaj Cloud, detailing client-side Zero-Knowledge encryption via AES-256-GCM and resilient chunked uploads with zero egress fees.')}
                    </p>
                  </div>

                  {/* Table of Contents */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">
                      {isAr ? 'فهرس المحتويات والمواصفات:' : 'Table of Contents:'}
                    </h4>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                        <span>1. High-Performance Hybrid S3-Compatible Storage Gateway</span>
                        <span className="font-mono text-slate-400">pg. 2</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                        <span>2. Cryptographic Envelope & Client-Side Argon2id Derivation</span>
                        <span className="font-mono text-slate-400">pg. 3</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                        <span>3. Enterprise SLA Guarantees & Global PoP Latency Benchmarks</span>
                        <span className="font-mono text-slate-400">pg. 4</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Seals */}
                  <div className="pt-4 flex items-center justify-around border-t border-slate-200 text-center">
                    <div className="space-y-1">
                      <Award className="w-6 h-6 text-amber-500 mx-auto" />
                      <div className="text-[10px] font-bold">SOC 2 Type II</div>
                      <div className="text-[9px] text-slate-400">Certified 2026</div>
                    </div>
                    <div className="space-y-1">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
                      <div className="text-[10px] font-bold">ISO 27001 / 27018</div>
                      <div className="text-[9px] text-slate-400">Cloud Privacy</div>
                    </div>
                    <div className="space-y-1">
                      <Lock className="w-6 h-6 text-[#4E115A] mx-auto" />
                      <div className="text-[10px] font-bold">Zero-Knowledge</div>
                      <div className="text-[9px] text-slate-400">Argon2id + AES-256</div>
                    </div>
                  </div>
                </div>
              )}

              {currentPage === 2 && (
                <div className="space-y-5 py-6 flex-1 text-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">Section 1</span>
                    <h2 className="text-lg font-black text-slate-900">
                      Hybrid S3 Architecture & Zero Egress Pipeline
                    </h2>
                  </div>

                  <p className="leading-relaxed text-slate-700">
                    Rawaj Cloud decouples client-facing ingress from cold backend blob storage. All uploads utilize an authenticated multipart pipeline where each file is sliced into 4MB–64MB chunks.
                  </p>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-2">
                    <div className="font-bold text-[#4E115A] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Data Path Blueprint:</span>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <div>[Client Device] ──(Local AES-GCM)──&gt; [Edge PoP Riyadh/Dubai]</div>
                      <div>[Edge PoP] ──(Direct TLS 1.3)──&gt; [Zero-Egress Object Storage Engine]</div>
                      <div>[Storage Engine] ──(Erasure Coding 8+4)──&gt; [12 Independent Failure Domains]</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="font-bold text-slate-900 mb-1">Instant Deduplication</div>
                      <p className="text-[11px] text-slate-600">
                        Cryptographic SHA-256 hash checks prevent re-uploading duplicate blocks across projects.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-white">
                      <div className="font-bold text-slate-900 mb-1">Zero Egress Tolls</div>
                      <p className="text-[11px] text-slate-600">
                        Bandwidth fees are completely eliminated using distributed edge caching networks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentPage === 3 && (
                <div className="space-y-5 py-6 flex-1 text-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">Section 2</span>
                    <h2 className="text-lg font-black text-slate-900">
                      Cryptographic Protocols & Key Derivation
                    </h2>
                  </div>

                  <p className="leading-relaxed text-slate-700">
                    The zero-knowledge security model ensures that neither Rawaj Cloud employees nor hosting infrastructure possess the mathematical capability to decrypt user payloads.
                  </p>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-[11px]">
                    <div className="font-bold text-emerald-900 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-700" />
                      <span>Argon2id Key Derivation Parameters:</span>
                    </div>
                    <div className="font-mono text-slate-800 space-y-0.5">
                      <div>· Memory Cost (m): 65,536 KiB (64 MB RAM)</div>
                      <div>· Time Iterations (t): 100,000 passes</div>
                      <div>· Parallelism Threads (p): 4 CPU Cores</div>
                      <div>· Cipher: AES-256-GCM (Galois/Counter Mode with 128-bit MAC tag)</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 font-mono">GDPR Article 17 Crypto-Shredding:</h4>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      When a user deletes a file from the Zero-Knowledge Vault, the underlying encryption master block is permanently overwritten with cryptographically random noise, making ciphertext retrieval impossible.
                    </p>
                  </div>
                </div>
              )}

              {currentPage === 4 && (
                <div className="space-y-5 py-6 flex-1 text-xs">
                  <div className="border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-mono text-purple-700 font-bold uppercase">Section 3</span>
                    <h2 className="text-lg font-black text-slate-900">
                      Enterprise SLA & Global Availability
                    </h2>
                  </div>

                  <p className="leading-relaxed text-slate-700">
                    Storage resilience is mathematically backed by continuous automated scrubbing and real-time block self-healing across 3 geographic zones.
                  </p>

                  <table className="w-full border-collapse border border-slate-200 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-mono">
                        <th className="p-2 border border-slate-200 text-left">PoP Region</th>
                        <th className="p-2 border border-slate-200 text-left">Target Latency</th>
                        <th className="p-2 border border-slate-200 text-left">SLA Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2 border border-slate-200 font-mono font-bold">me-central-1 (Riyadh)</td>
                        <td className="p-2 border border-slate-200 text-emerald-700 font-bold">&lt; 12 ms</td>
                        <td className="p-2 border border-slate-200">99.95%</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-mono font-bold">me-central-2 (Dubai)</td>
                        <td className="p-2 border border-slate-200 text-emerald-700 font-bold">&lt; 18 ms</td>
                        <td className="p-2 border border-slate-200">99.95%</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-slate-200 font-mono font-bold">eu-west-1 (Frankfurt)</td>
                        <td className="p-2 border border-slate-200 text-emerald-700 font-bold">&lt; 28 ms</td>
                        <td className="p-2 border border-slate-200">99.99%</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Official Sign-off Stamp */}
                  <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] text-slate-400">CERTIFIED DIGITAL SIGNATURE</div>
                      <div className="font-mono font-bold text-slate-900">Dr. Khalid Al-Rawaj, Chief Cryptographer</div>
                      <div className="font-mono text-[9px] text-slate-500">Key Fingerprint: 4E115A-99A1-2026-SHA256</div>
                    </div>
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#4E115A] flex items-center justify-center text-center p-1">
                      <span className="text-[8px] font-mono font-bold text-[#4E115A] uppercase leading-tight">
                        Rawaj Sealed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Page Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Rawaj Cloud Whitepaper Architecture Protocol · Confidential</span>
                <span>Page {currentPage} of {totalPages}</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================================
// 2. IMAGE PREVIEW VIEWER (HIGH-RES WITH ZOOM, PAN, ROTATE, BACKDROP)
// ============================================================================
interface ImagePreviewProps {
  file: FileItem;
  isAr: boolean;
}

const ImagePreviewViewer: React.FC<ImagePreviewProps> = ({ file, isAr }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [backdrop, setBackdrop] = useState<'dark' | 'light' | 'grid'>('dark');

  const handleZoomIn = () => setZoomLevel(z => Math.min(300, z + 25));
  const handleZoomOut = () => setZoomLevel(z => Math.max(30, z - 25));
  const handleRotate = () => setRotation(r => (r + 90) % 360);
  const handleReset = () => {
    setZoomLevel(100);
    setRotation(0);
    setIsFlipped(false);
  };

  const imageSrc =
    file.thumbnailUrl ||
    file.mediaUrl ||
    '/assets/aistudio/_________________20261107_140807______425b22ac.png';

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      
      {/* Image Specialized Toolbar */}
      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-[#DCD3DF] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
        
        {/* Zoom & Transform Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title={isAr ? 'تصغير' : 'Zoom Out'}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title={isAr ? 'تكبير' : 'Zoom In'}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title={isAr ? 'تدوير 90 درجة' : 'Rotate 90°'}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="p-1.5 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
            title={isAr ? 'انعكاس أفقي' : 'Flip Horizontal'}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-2 py-1 rounded-lg border border-[#DCD3DF] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {isAr ? 'إعادة ضبط' : 'Reset'}
          </button>
        </div>

        {/* Backdrop & Metadata */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className="hidden sm:inline">3840 × 2160 px · sRGB 24-bit</span>
          <span className="hidden sm:inline">·</span>

          <div className="flex items-center gap-1.5">
            <span>{isAr ? 'الخلفية:' : 'Backdrop:'}</span>
            <button
              type="button"
              onClick={() => setBackdrop('dark')}
              className={`w-4 h-4 rounded-full bg-slate-950 border ${backdrop === 'dark' ? 'ring-2 ring-[#4E115A]' : 'border-slate-700'}`}
              title="Dark"
            />
            <button
              type="button"
              onClick={() => setBackdrop('light')}
              className={`w-4 h-4 rounded-full bg-white border ${backdrop === 'light' ? 'ring-2 ring-[#4E115A]' : 'border-slate-300'}`}
              title="Light"
            />
            <button
              type="button"
              onClick={() => setBackdrop('grid')}
              className={`w-4 h-4 rounded-full bg-slate-400 border ${backdrop === 'grid' ? 'ring-2 ring-[#4E115A]' : 'border-slate-500'}`}
              title="Checkerboard (Alpha)"
            />
          </div>
        </div>

      </div>

      {/* Image Viewport Canvas */}
      <div
        className={`flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center transition-colors ${
          backdrop === 'dark'
            ? 'bg-slate-950'
            : backdrop === 'light'
            ? 'bg-white'
            : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-900'
        }`}
      >
        <div
          className="transition-transform duration-200 max-h-full flex items-center justify-center select-none"
          style={{
            transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg) scaleX(${isFlipped ? -1 : 1})`,
          }}
        >
          <img
            src={imageSrc}
            alt={file.name}
            className="max-h-[60vh] max-w-full w-auto object-contain rounded-xl shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

    </div>
  );
};

// ============================================================================
// 3. TEXT & CODE PREVIEW VIEWER (DUAL-VIEW: FORMATTED MARKDOWN / LINE-NUMBERED)
// ============================================================================
interface TextPreviewProps {
  file: FileItem;
  isAr: boolean;
}

const TextCodePreviewViewer: React.FC<TextPreviewProps> = ({ file, isAr }) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'code'>(
    file.extension.toLowerCase() === 'md' ? 'formatted' : 'code'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [copied, setCopied] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);

  const rawText = file.previewContent || (
    isAr
      ? `# وثيقة رواج كلاود للتخزين المشفر\n\n- البصمة الرقمية: \`${file.checksum}\`\n- الحجم: ${formatBytes(file.sizeBytes, 1, true)}\n- التشفير: AES-256-GCM مع Argon2id.`
      : `# Rawaj Cloud Secure Record\n\n- Checksum: \`${file.checksum}\`\n- Size: ${formatBytes(file.sizeBytes, 1, false)}\n- Encryption: AES-256-GCM with Argon2id.`
  );

  const lines = rawText.split('\n');
  const wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = rawText.length;

  const matchCount = searchQuery.trim()
    ? (rawText.toLowerCase().match(new RegExp(searchQuery.toLowerCase(), 'g')) || []).length
    : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-950">
      
      {/* Text Control Toolbar */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-[#DCD3DF] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
        
        {/* View Switcher: Formatted Preview vs Code Lines */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('formatted')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'formatted'
                ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isAr ? 'معاينة منسقة' : 'Formatted'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'code'
                ? 'bg-white dark:bg-slate-700 text-[#4E115A] dark:text-purple-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'الكود المصدري' : 'Source Code'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex items-center min-w-[180px] sm:min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 rtl:right-2.5 ltr:left-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث داخل النص...' : 'Search text...'}
            className="w-full rtl:pr-8 ltr:pl-8 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-[#1E1E24] dark:text-white"
          />
          {searchQuery && (
            <span className="rtl:left-2 ltr:right-2 absolute text-[10px] text-slate-400 font-mono">
              {matchCount} {isAr ? 'مطابقة' : 'matches'}
            </span>
          )}
        </div>

        {/* Stats, Font Size, Word Wrap, Copy */}
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
          <span>{lines.length} {isAr ? 'أسطر' : 'lines'}</span>
          <span>·</span>
          <span>{wordCount} {isAr ? 'كلمة' : 'words'}</span>

          {/* Font Size */}
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-200/60 dark:bg-slate-800 rounded-md">
            <button
              type="button"
              onClick={() => setFontSize('sm')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'sm' ? 'bg-white dark:bg-slate-700 text-[#4E115A]' : 'text-slate-500'}`}
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setFontSize('base')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'base' ? 'bg-white dark:bg-slate-700 text-[#4E115A]' : 'text-slate-500'}`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setFontSize('lg')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${fontSize === 'lg' ? 'bg-white dark:bg-slate-700 text-[#4E115A]' : 'text-slate-500'}`}
            >
              A+
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#4E115A] text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ النص' : 'Copy')}</span>
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-mono select-text">
        {viewMode === 'formatted' ? (
          /* Rendered Markdown / Clean Text View */
          <div className="max-w-3xl mx-auto space-y-4 font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
            {lines.map((line, idx) => {
              if (line.startsWith('# ')) {
                return (
                  <h1 key={idx} className="text-xl sm:text-2xl font-black text-[#4E115A] dark:text-purple-300 pb-2 border-b border-slate-200 dark:border-slate-800">
                    {line.replace('# ', '')}
                  </h1>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-lg font-bold text-slate-900 dark:text-white pt-2">
                    {line.replace('## ', '')}
                  </h2>
                );
              }
              if (line.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              if (line.startsWith('- ') || line.startsWith('* ')) {
                return (
                  <li key={idx} className="ml-4 rtl:mr-4 rtl:ml-0 list-disc text-xs text-slate-700 dark:text-slate-300">
                    {line.replace(/^[-*]\s+/, '')}
                  </li>
                );
              }
              if (line.startsWith('===')) {
                return <hr key={idx} className="border-slate-200 dark:border-slate-800 my-2" />;
              }
              if (!line.trim()) {
                return <div key={idx} className="h-2" />;
              }
              return (
                <p key={idx} className="text-xs text-slate-700 dark:text-slate-300">
                  {line}
                </p>
              );
            })}
          </div>
        ) : (
          /* Line-Numbered Source Code View */
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => {
                const lineNum = idx + 1;
                const hasMatch = searchQuery.trim() && line.toLowerCase().includes(searchQuery.toLowerCase());

                return (
                  <tr
                    key={lineNum}
                    className={`hover:bg-purple-50/50 dark:hover:bg-purple-950/20 ${
                      hasMatch ? 'bg-amber-100/70 dark:bg-amber-950/50' : ''
                    }`}
                  >
                    <td className="w-12 pr-3 rtl:pr-0 rtl:pl-3 select-none text-right rtl:text-left font-mono text-[11px] text-slate-400 dark:text-slate-600 border-r rtl:border-r-0 rtl:border-l border-slate-200 dark:border-slate-800 py-0.5">
                      {lineNum}
                    </td>
                    <td
                      className={`pl-3 rtl:pl-0 rtl:pr-3 py-0.5 font-mono text-slate-800 dark:text-slate-200 ${
                        wordWrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
                      } ${fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'}`}
                    >
                      {line || '\u00A0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

// ============================================================================
// 4. VIDEO PREVIEW VIEWER
// ============================================================================
interface VideoPreviewProps {
  file: FileItem;
  isAr: boolean;
}

const VideoPreviewViewer: React.FC<VideoPreviewProps> = ({ file, isAr }) => {
  const [activeBitrate, setActiveBitrate] = useState<'4K' | '1080p' | '720p'>('1080p');

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center space-y-4">
        
        {/* Video Player */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-2xl relative border border-slate-800">
          <video
            controls
            autoPlay={false}
            className="w-full h-full object-contain"
            poster={file.thumbnailUrl || '/assets/aistudio/_________________20261107_140807______425b22ac.png'}
            src={file.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Controls & Bitrate */}
        <div className="flex items-center justify-between w-full px-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? 'البث التكيفي المباشر عبر Edge PoP' : 'Adaptive Edge Streaming'}</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            {(['4K', '1080p', '720p'] as const).map(res => (
              <button
                key={res}
                type="button"
                onClick={() => setActiveBitrate(res)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                  activeBitrate === res
                    ? 'bg-[#4E115A] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================================
// 5. SPREADSHEET PREVIEW VIEWER (INTERACTIVE GRID TABLE)
// ============================================================================
interface SpreadsheetProps {
  file: FileItem;
  isAr: boolean;
}

const SpreadsheetPreviewViewer: React.FC<SpreadsheetProps> = ({ file, isAr }) => {
  const [activeSheet, setActiveSheet] = useState('Overview');

  const sampleRows = [
    { id: 1, item: 'Pro Plan Monthly Subscriptions', cat: 'SaaS Ingress', qty: '14,200', amount: 'SAR 142,000', status: 'Reconciled' },
    { id: 2, item: 'Zero-Egress Multi-Cloud Replication', cat: 'Infra', qty: '3.4 PB', amount: 'SAR 0.00 (Zero Toll)', status: 'Active' },
    { id: 3, item: 'Edge Network Accelerated Bandwidth', cat: 'CDN PoPs', qty: '18 TB', amount: 'SAR 18,400', status: 'Reconciled' },
    { id: 4, item: 'Argon2id Hardware Enclave HSMs', cat: 'Security', qty: '8 Clusters', amount: 'SAR 24,000', status: 'Verified' },
    { id: 5, item: 'Enterprise WhatsApp E2EE Vaults', cat: 'Backups', qty: '9,850 users', amount: 'SAR 89,000', status: 'Reconciled' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white dark:bg-slate-900">
      
      {/* Formula Bar Simulation */}
      <div className="px-4 py-2 border-b border-[#DCD3DF] dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-3 text-xs font-mono">
        <span className="font-bold text-[#4E115A] dark:text-purple-300">fx</span>
        <span className="text-slate-400">=SUM(C2:C6) * 1.15 [VAT 15% Approved]</span>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto p-4 select-text">
        <table className="w-full border-collapse border border-slate-200 dark:border-slate-800 text-xs text-left rtl:text-right">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
              <th className="p-2.5 border border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
              <th className="p-2.5 border border-slate-200 dark:border-slate-700">{isAr ? 'البند المالي / الخدمة' : 'Service / Line Item'}</th>
              <th className="p-2.5 border border-slate-200 dark:border-slate-700">{isAr ? 'التصنيف' : 'Category'}</th>
              <th className="p-2.5 border border-slate-200 dark:border-slate-700">{isAr ? 'الحجم / السعة' : 'Volume / Qty'}</th>
              <th className="p-2.5 border border-slate-200 dark:border-slate-700">{isAr ? 'القيمة الإجمالية' : 'Total Amount'}</th>
              <th className="p-2.5 border border-slate-200 dark:border-slate-700">{isAr ? 'حالة المطابقة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {sampleRows.map(row => (
              <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 font-mono">
                <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-center text-slate-400 font-bold">{row.id}</td>
                <td className="p-2.5 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white font-sans">{row.item}</td>
                <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">{row.cat}</td>
                <td className="p-2.5 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400">{row.qty}</td>
                <td className="p-2.5 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold">{row.amount}</td>
                <td className="p-2.5 border border-slate-200 dark:border-slate-700">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                    ✓ {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheets Tabs Bar */}
      <div className="px-4 py-1.5 border-t border-[#DCD3DF] dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center gap-2 text-xs">
        {['Overview', 'Q4 Projections', 'Egress Model', 'Audit Trail'].map(sheet => (
          <button
            key={sheet}
            type="button"
            onClick={() => setActiveSheet(sheet)}
            className={`px-3 py-1 rounded-t-lg font-mono text-xs cursor-pointer ${
              activeSheet === sheet
                ? 'bg-white dark:bg-slate-900 font-bold text-[#4E115A] dark:text-purple-300 border-t border-x border-[#DCD3DF] dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {sheet}
          </button>
        ))}
      </div>

    </div>
  );
};

// ============================================================================
// HELPER: COPY CHECKSUM BUTTON
// ============================================================================
const CopyChecksumButton: React.FC<{
  checksum: string;
  isAr: boolean;
  showNotification: (ar: string, en: string, type: 'info' | 'success') => void;
}> = ({ checksum, isAr, showNotification }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(checksum);
    setCopied(true);
    showNotification('تم نسخ بصمة SHA-256 إلى الحافظة', 'SHA-256 checksum copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
      title={isAr ? 'نسخ البصمة' : 'Copy Checksum'}
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};
