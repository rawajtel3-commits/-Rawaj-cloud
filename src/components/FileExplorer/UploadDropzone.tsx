import React, { useState, useRef } from 'react';
import { useStorage } from '../../context/StorageContext';
import { UploadCloud, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export const UploadDropzone: React.FC = () => {
  const { lang, uploadFiles, currentFolderId, folders } = useStorage();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = lang === 'ar';

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const currentFolderName = currentFolder ? currentFolder.name : (isAr ? 'المجلد الرئيسي (Root Drive)' : 'Root Drive');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files, currentFolderId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files, currentFolderId);
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 group ${
        isDragOver
          ? 'border-[#4E115A] bg-[#F5EFF7] dark:bg-purple-950/30 scale-[0.99] ring-2 ring-[#4E115A]/20'
          : 'border-[#DCD3DF] dark:border-slate-800 hover:border-[#4E115A] dark:hover:border-purple-400 bg-white/70 dark:bg-slate-900/40 hover:bg-[#F5EFF7]/60 dark:hover:bg-slate-850/40'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#F5EFF7] dark:bg-purple-950/60 text-[#4E115A] dark:text-purple-300 border border-[#DCD3DF] dark:border-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h4 className="text-sm font-bold text-[#1E1E24] dark:text-slate-200">
          {isAr
            ? 'اسحب الملفات وأفلتها هنا، أو انقر للاختيار من جهازك'
            : 'Drag and drop files here, or click to browse'}
        </h4>

        <p className="text-xs text-[#6E6A75] dark:text-slate-400 mt-1 max-w-md">
          {isAr
            ? 'دعم رفع مقسم للأجزاء (Multipart Chunking) حتى 100GB مع فحص التكرار التلقائي (Deduplication)'
            : 'Supports Resumable Multipart Uploads up to 100GB with instant client deduplication'}
        </p>

        {/* Current Folder Destination Hint */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5EFF7] dark:bg-purple-950/40 text-[#4E115A] dark:text-purple-300 text-xs font-semibold shadow-xs">
          <span className="opacity-70">{isAr ? 'المجلد الحالي:' : 'Current folder:'}</span>
          <span className="font-bold">{currentFolderName}</span>
        </div>

        {/* Feature Badges in Dropzone */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#6E6A75] dark:text-slate-400 font-mono">
          <span className="flex items-center gap-1 text-[#1AD062] font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? 'فحص البصمة SHA-256' : 'SHA-256 Deduplication'}</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-[#4E115A] dark:text-purple-300 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'استئناف عند انقطاع الاتصال' : 'Auto-Resume tus/S3'}</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1 text-[#A38540] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isAr ? 'تشفير AES-256-GCM' : 'AES-256-GCM'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
