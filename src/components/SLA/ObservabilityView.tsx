import React from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Activity,
  CheckCircle2,
  Server,
  Zap,
  ShieldCheck,
  Globe2,
  Cpu,
  BarChart3,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

export const ObservabilityView: React.FC = () => {
  const { lang } = useStorage();
  const isAr = lang === 'ar';

  const multiAzRegions = [
    {
      nameAr: 'منطقة الرياض (me-central-1)',
      nameEn: 'Riyadh Region (me-central-1)',
      status: 'operational',
      latency: '24ms',
      uptime: '99.99%',
      iops: '124,000 IOPS',
    },
    {
      nameAr: 'منطقة دبي (me-south-1)',
      nameEn: 'Dubai Region (me-south-1)',
      status: 'operational',
      latency: '28ms',
      uptime: '99.98%',
      iops: '118,500 IOPS',
    },
    {
      nameAr: 'منطقة فرانكفورت (eu-central-1)',
      nameEn: 'Frankfurt Region (eu-central-1)',
      status: 'operational',
      latency: '68ms',
      uptime: '99.99%',
      iops: '189,200 IOPS',
    },
  ];

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 pb-28 space-y-6">
      
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-teal-900 via-slate-900 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-teal-900/30 overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>{isAr ? 'مركز المراقبة والاعتمادية الحية' : 'Live Observability & Durability'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAr ? 'اتفاقية مستوى الخدمة 99.9% ومتانة 11 تسعات' : 'SLA (99.9% Uptime) & 11 Nines Durability'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAr
              ? 'مراقبة حية مستمرة لزمن الاستجابة ومعدلات نجاح الرفع والتشفير عبر مناطق جغرافية ثلاثية متزامنة (Multi-AZ Replication) تضمن عدم فقدان أي بايت من بياناتك حتى في حالات الكوارث الطبيعية.'
              : 'Real-time telemetry across multi-AZ regions with automated disaster recovery, guaranteeing 99.999999999% durability and sub-120ms p95 latency.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span className="text-emerald-400 font-bold">{isAr ? 'التوافر الشهري: 99.94%' : 'Uptime: 99.94%'}</span>
            <span>·</span>
            <span>{isAr ? 'المتانة: 11 تسعات (99.999999999%)' : 'Durability: 11 Nines'}</span>
            <span>·</span>
            <span>{isAr ? 'معدل نجاح الرفع: 99.92%' : 'Upload Success: 99.92%'}</span>
          </div>
        </div>
      </div>

      {/* SLA Target Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md space-y-2">
          <div className="text-slate-500 flex items-center justify-between">
            <span>{isAr ? 'استجابة API (p95)' : 'p95 API Latency'}</span>
            <span className="text-emerald-600 font-bold">{isAr ? 'ممتاز' : 'Optimal'}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            94ms
          </div>
          <div className="text-[10px] text-slate-400">
            {isAr ? 'المستهدف: أقل من 120ms' : 'SLA Target: < 120ms'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md space-y-2">
          <div className="text-slate-500 flex items-center justify-between">
            <span>{isAr ? 'توليد Pre-signed URL' : 'Pre-signed URL Latency'}</span>
            <span className="text-emerald-600 font-bold">{isAr ? 'فائق' : 'Ultra-Fast'}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            34ms
          </div>
          <div className="text-[10px] text-slate-400">
            {isAr ? 'المستهدف: أقل من 40ms' : 'SLA Target: < 40ms'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md space-y-2">
          <div className="text-slate-500 flex items-center justify-between">
            <span>{isAr ? 'بدء الفيديو (TTFF)' : 'Video Time-to-First-Frame'}</span>
            <span className="text-emerald-600 font-bold">{isAr ? 'سلس' : 'Instant'}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            310ms
          </div>
          <div className="text-[10px] text-slate-400">
            {isAr ? 'المستهدف: أقل من 350ms' : 'SLA Target: < 350ms'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md space-y-2">
          <div className="text-slate-500 flex items-center justify-between">
            <span>{isAr ? 'متانة البيانات' : 'Data Durability'}</span>
            <span className="text-emerald-600 font-bold">11 Nines</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            99.999999999%
          </div>
          <div className="text-[10px] text-slate-400">
            {isAr ? 'تكرار في 3 مناطق جغرافية' : '3-AZ Multi-Replication'}
          </div>
        </div>

      </div>

      {/* Multi-AZ Replication Infrastructure */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              {isAr ? 'مراكز البيانات ومناطق التوافر الجغرافية (Multi-AZ Clusters)' : 'Multi-AZ Availability Clusters'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'نسخ بياناتك تلقائياً وبشكل متزامن في ثلاث مناطق منفصلة تماماً' : 'Synchronous real-time replication across independent geographic power grids'}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAr ? 'جميع المناطق تعمل بكفاءة 100%' : 'All Systems Operational'}</span>
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {multiAzRegions.map((region, i) => (
            <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-850 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {isAr ? region.nameAr : region.nameEn}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                    <span>IOPS: {region.iops}</span>
                    <span>·</span>
                    <span>{isAr ? `زمن الوصول: ${region.latency}` : `Edge Ping: ${region.latency}`}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {region.uptime} Uptime
                </span>
                <span className="text-slate-400 text-[11px]">
                  NVMe Enterprise SSD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
