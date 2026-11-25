import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { CurrencyCode } from '../../types/finops';
import { convertCurrency, formatCurrency } from '../../utils/finopsCalculator';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Layers,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface MonthlyFinOpsRecord {
  monthKey: string;
  monthAr: string;
  monthEn: string;
  arpuUSD: number;
  cacUSD: number;
  cloudCostUSD: number;
  revenueUSD: number;
  subscribers: number;
  grossMarginPct: number;
  netMarginPct: number;
}

const HISTORICAL_FINOPS_DATA: MonthlyFinOpsRecord[] = [
  {
    monthKey: '2025-12',
    monthAr: 'ديسمبر 25',
    monthEn: 'Dec 25',
    arpuUSD: 12.40,
    cacUSD: 58.00,
    cloudCostUSD: 4120,
    revenueUSD: 7440,
    subscribers: 600,
    grossMarginPct: 61.2,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-01',
    monthAr: 'يناير 26',
    monthEn: 'Jan 26',
    arpuUSD: 12.90,
    cacUSD: 55.50,
    cloudCostUSD: 4580,
    revenueUSD: 9030,
    subscribers: 700,
    grossMarginPct: 62.5,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-02',
    monthAr: 'فبراير 26',
    monthEn: 'Feb 26',
    arpuUSD: 13.50,
    cacUSD: 52.00,
    cloudCostUSD: 5100,
    revenueUSD: 10800,
    subscribers: 800,
    grossMarginPct: 63.8,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-03',
    monthAr: 'مارس 26',
    monthEn: 'Mar 26',
    arpuUSD: 14.10,
    cacUSD: 49.00,
    cloudCostUSD: 5760,
    revenueUSD: 13113,
    subscribers: 930,
    grossMarginPct: 65.1,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-04',
    monthAr: 'أبريل 26',
    monthEn: 'Apr 26',
    arpuUSD: 14.60,
    cacUSD: 47.50,
    cloudCostUSD: 6340,
    revenueUSD: 15330,
    subscribers: 1050,
    grossMarginPct: 65.9,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-05',
    monthAr: 'مايو 26',
    monthEn: 'May 26',
    arpuUSD: 15.00,
    cacUSD: 46.00,
    cloudCostUSD: 6980,
    revenueUSD: 17700,
    subscribers: 1180,
    grossMarginPct: 66.4,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-06',
    monthAr: 'يونيو 26',
    monthEn: 'Jun 26',
    arpuUSD: 15.40,
    cacUSD: 45.00,
    cloudCostUSD: 7450,
    revenueUSD: 19558,
    subscribers: 1270,
    grossMarginPct: 67.0,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-07',
    monthAr: 'يوليو 26',
    monthEn: 'Jul 26',
    arpuUSD: 15.80,
    cacUSD: 44.00,
    cloudCostUSD: 7920,
    revenueUSD: 21330,
    subscribers: 1350,
    grossMarginPct: 67.6,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-08',
    monthAr: 'أغسطس 26',
    monthEn: 'Aug 26',
    arpuUSD: 16.10,
    cacUSD: 43.50,
    cloudCostUSD: 8350,
    revenueUSD: 22862,
    subscribers: 1420,
    grossMarginPct: 67.9,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-09',
    monthAr: 'سبتمبر 26',
    monthEn: 'Sep 26',
    arpuUSD: 16.35,
    cacUSD: 42.80,
    cloudCostUSD: 8690,
    revenueUSD: 23707,
    subscribers: 1450,
    grossMarginPct: 68.1,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-10',
    monthAr: 'أكتوبر 26',
    monthEn: 'Oct 26',
    arpuUSD: 16.50,
    cacUSD: 42.40,
    cloudCostUSD: 8980,
    revenueUSD: 24255,
    subscribers: 1470,
    grossMarginPct: 68.3,
    netMarginPct: 15.0,
  },
  {
    monthKey: '2026-11',
    monthAr: 'نوفمبر 26 (الحالي)',
    monthEn: 'Nov 26 (Current)',
    arpuUSD: 16.65,
    cacUSD: 42.00,
    cloudCostUSD: 9140,
    revenueUSD: 24650,
    subscribers: 1480,
    grossMarginPct: 68.4,
    netMarginPct: 15.0,
  },
];

interface FinOpsTrendChartProps {
  currency: CurrencyCode;
  isAr: boolean;
}

export const FinOpsTrendChart: React.FC<FinOpsTrendChartProps> = ({ currency, isAr }) => {
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('12m');
  const [showArpu, setShowArpu] = useState(true);
  const [showCac, setShowCac] = useState(true);
  const [showCloudCost, setShowCloudCost] = useState(true);

  // Filtered timeline data
  const chartData = useMemo(() => {
    const rawData = timeRange === '6m' ? HISTORICAL_FINOPS_DATA.slice(-6) : HISTORICAL_FINOPS_DATA;
    return rawData.map(record => ({
      ...record,
      monthLabel: isAr ? record.monthAr : record.monthEn,
      convertedArpu: Number(convertCurrency(record.arpuUSD, currency).toFixed(2)),
      convertedCac: Number(convertCurrency(record.cacUSD, currency).toFixed(2)),
      convertedCloudCost: Number(convertCurrency(record.cloudCostUSD, currency).toFixed(0)),
      convertedRevenue: Number(convertCurrency(record.revenueUSD, currency).toFixed(0)),
    }));
  }, [timeRange, currency, isAr]);

  // Current Latest Stats
  const latest = HISTORICAL_FINOPS_DATA[HISTORICAL_FINOPS_DATA.length - 1];
  const earliest = timeRange === '6m' ? HISTORICAL_FINOPS_DATA[HISTORICAL_FINOPS_DATA.length - 6] : HISTORICAL_FINOPS_DATA[0];

  const arpuGrowthPct = ((latest.arpuUSD - earliest.arpuUSD) / earliest.arpuUSD) * 100;
  const cacReductionPct = ((earliest.cacUSD - latest.cacUSD) / earliest.cacUSD) * 100;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyFinOpsRecord & any = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 font-sans z-50">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/80 font-bold">
            <span className="text-slate-200">{label}</span>
            <span className="text-slate-400 font-mono text-[11px]">{data.subscribers} {isAr ? 'مشترك' : 'users'}</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {isAr ? 'متوسط الإيراد (ARPU):' : 'ARPU:'}
              </span>
              <span className="font-bold">{formatCurrency(data.arpuUSD, currency, isAr)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                {isAr ? 'تكلفة اكتساب العميل (CAC):' : 'CAC:'}
              </span>
              <span className="font-bold">{formatCurrency(data.cacUSD, currency, isAr)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                {isAr ? 'تكلفة السحابة الشهرية:' : 'Cloud Cost:'}
              </span>
              <span className="font-bold">{formatCurrency(data.cloudCostUSD, currency, isAr)}</span>
            </div>

            <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>{isAr ? 'هامش الربح الصافي:' : 'Net Margin Policy:'}</span>
              <span className="text-emerald-400 font-bold">{data.netMarginPct}% (مضمون)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {isAr
                ? 'تحليل الاتجاهات الزمنية: متوسط الإيراد (ARPU) وتكلفة الاكتساب (CAC) مقابل تكاليف السحابة'
                : 'Real-Time FinOps Trends: ARPU & CAC vs. Historical Monthly Cloud Costs'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isAr
              ? 'مخطط بياني مركب (Recharts Multi-Axis) يوضح انخفاض تكلفة الاكتساب مع توسع الإيرادات ونمو البنية التحتية بهامش ربح 15% ثابت.'
              : 'Multi-axis visualization correlating subscriber expansion with cloud infrastructure scaling and unit economics margin preservation.'}
          </p>
        </div>

        {/* Action Toggles: Timeframe + Series Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'آخر 6 أشهر' : 'Last 6 Months'}
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('12m')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === '12m'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'آخر 12 شهراً' : '12-Month Timeline'}
            </button>
          </div>

          {/* Metric Visibility Chips */}
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setShowArpu(!showArpu)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showArpu
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showArpu ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>ARPU</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCac(!showCac)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showCac
                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                  : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showCac ? 'bg-rose-500' : 'bg-slate-300'}`} />
              <span>CAC</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCloudCost(!showCloudCost)}
              className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                showCloudCost
                  ? 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                  : 'bg-slate-50 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${showCloudCost ? 'bg-sky-500' : 'bg-slate-300'}`} />
              <span>{isAr ? 'تكلفة السحابة' : 'Cloud Cost'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 block font-mono">
            {isAr ? 'متوسط الإيراد الحالي (ARPU)' : 'Current ARPU'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(latest.arpuUSD, currency, isAr)}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.5 rounded font-bold">
              +{arpuGrowthPct.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 block font-mono">
            {isAr ? 'تكلفة اكتساب العميل (CAC)' : 'Current CAC'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-400">
              {formatCurrency(latest.cacUSD, currency, isAr)}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.5 rounded font-bold">
              -{cacReductionPct.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 block font-mono">
            {isAr ? 'تكلفة السحابة الشهرية الإجمالية' : 'Total Monthly Cloud Cost'}
          </span>
          <span className="text-lg font-black font-mono text-sky-600 dark:text-sky-400 block">
            {formatCurrency(latest.cloudCostUSD, currency, isAr)}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
          <span className="text-[10px] text-slate-400 block font-mono">
            {isAr ? 'فترة استرداد الاكتساب (Payback)' : 'CAC Payback'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
              2.5 {isAr ? 'شهر' : 'mo'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              (LTV/CAC 9.5x)
            </span>
          </div>
        </div>
      </div>

      {/* Main Recharts Chart Area */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: isAr ? 10 : 30, left: isAr ? 30 : 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            />

            {/* Left Y-Axis for Unit Metrics: ARPU and CAC */}
            <YAxis
              yAxisId="unit"
              orientation={isAr ? 'right' : 'left'}
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v}`}
              domain={[0, 'auto']}
            />

            {/* Right Y-Axis for Total Cloud Cost Volume */}
            <YAxis
              yAxisId="cost"
              orientation={isAr ? 'left' : 'right'}
              tickLine={false}
              axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
              tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              domain={[0, 'auto']}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: 11, fontFamily: 'sans-serif' }}
            />

            {/* Area / Bar: Total Cloud Infrastructure Costs */}
            {showCloudCost && (
              <Area
                yAxisId="cost"
                type="monotone"
                dataKey="convertedCloudCost"
                name={isAr ? 'تكاليف السحابة المفوترة (المحور الأيمن)' : 'Cloud Infra Cost (Right Axis)'}
                fill="url(#cloudCostGradient)"
                stroke="#0284c7"
                strokeWidth={2}
                fillOpacity={0.18}
              />
            )}

            {/* Line: ARPU Trend (Growth Expansion) */}
            {showArpu && (
              <Line
                yAxisId="unit"
                type="monotone"
                dataKey="convertedArpu"
                name={isAr ? 'متوسط الإيراد لكل عميل ARPU' : 'Average Revenue Per User (ARPU)'}
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#059669' }}
              />
            )}

            {/* Line: CAC Trend (Efficiency Decline) */}
            {showCac && (
              <Line
                yAxisId="unit"
                type="monotone"
                dataKey="convertedCac"
                name={isAr ? 'تكلفة اكتساب العميل CAC' : 'Customer Acquisition Cost (CAC)'}
                stroke="#f43f5e"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#e11d48' }}
              />
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="cloudCostGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Narrative Footer */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            {isAr
              ? 'مؤشر كفاءة رأس المال: اتساع الفجوة الإيجابية بين ARPU ($16.65) وتكلفة السحابة مع هبوط الـ CAC يؤكد تحقيق هامش الربح 15% وتفوق نموذج العمل.'
              : 'Capital Efficiency Signal: Divergence of ARPU ($16.65) from CAC ($42.00) confirms sustainable 15% net profit margin compounding.'}
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 shrink-0">
          Recharts ComposedChart Engine
        </span>
      </div>

    </div>
  );
};
