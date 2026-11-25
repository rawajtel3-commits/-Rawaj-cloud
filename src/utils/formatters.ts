export function formatBytes(bytes: number, decimals: number = 1, isArabic: boolean = false): string {
  if (bytes === 0) return isArabic ? '0 بايت' : '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizesEn = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const sizesAr = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت', 'تيرابايت', 'بيتابايت'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedNum = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${formattedNum} ${isArabic ? sizesAr[i] : sizesEn[i]}`;
}

export function formatSpeed(bytesPerSec: number, isArabic: boolean = false): string {
  if (bytesPerSec < 1024) {
    return `${Math.round(bytesPerSec)} ${isArabic ? 'بايت/ث' : 'B/s'}`;
  } else if (bytesPerSec < 1024 * 1024) {
    return `${(bytesPerSec / 1024).toFixed(1)} ${isArabic ? 'ك.ب/ث' : 'KB/s'}`;
  } else {
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} ${isArabic ? 'م.ب/ث' : 'MB/s'}`;
  }
}

export function formatDuration(seconds: number, isArabic: boolean = false): string {
  if (seconds <= 0) return isArabic ? 'لحظات...' : 'a few moments...';
  if (seconds < 60) return `${Math.round(seconds)} ${isArabic ? 'ثانية متبقية' : 'sec remaining'}`;
  const minutes = Math.floor(seconds / 60);
  const remainingSec = Math.round(seconds % 60);
  return `${minutes} ${isArabic ? 'دقيقة' : 'min'} ${remainingSec > 0 ? `${remainingSec} ${isArabic ? 'ثانية' : 'sec'}` : ''}`;
}

export function formatDate(isoString: string, isArabic: boolean = false): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getFileTypeInfo(extension: string) {
  const ext = extension.toLowerCase().replace('.', '');
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'svg', 'avif'].includes(ext)) {
    return { type: 'image' as const, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50' };
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(ext)) {
    return { type: 'video' as const, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50' };
  }
  if (['pdf'].includes(ext)) {
    return { type: 'pdf' as const, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50' };
  }
  if (['doc', 'docx', 'txt', 'rtf', 'md'].includes(ext)) {
    return { type: 'document' as const, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/50' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return { type: 'spreadsheet' as const, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50' };
  }
  if (['ppt', 'pptx', 'key'].includes(ext)) {
    return { type: 'presentation' as const, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50' };
  }
  if (['zip', 'rar', 'tar', 'gz', '7z', 'bz2'].includes(ext)) {
    return { type: 'archive' as const, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50' };
  }
  if (['mp3', 'wav', 'aac', 'flac', 'm4a'].includes(ext)) {
    return { type: 'audio' as const, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/50' };
  }
  return { type: 'code' as const, color: 'text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' };
}
