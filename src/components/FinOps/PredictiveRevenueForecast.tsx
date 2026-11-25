import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
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
  Sparkles,
  Sliders,
  Calendar,
  Layers,
  ArrowUpRight,
  HardDrive,
  Users,
  Target,
  Zap,
  CheckCircle2,
  Download,
  Percent,
} from 'lucide-react';

interface PredictiveRevenueForecastProps {
  currency: CurrencyCode;
  isAr: boolean;
}

type ForecastScenario = 'conservative' | 'baseline' | 'aggressive';

export const PredictiveRevenueForecast: React.FC<PredictiveRevenueForecastProps> = ({
  currency,
  isAr,
}) => {
  // Horizon in months
  const [horizonMonths, setHorizonMonths] = useState<6 | 12 | 24>(12);

  // Active scenario preset
  const [scenario, setScenario] = useState<ForecastScenario>('baseline');

  // Adjustable Forecasting Parameters
  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(8.5); // 8.5%
  const [monthlyChurnRate, setMonthlyChurnRate] = useState<number>(1.8); // 1.8%
  const [arpuExpansionRate, setArpuExpansionRate] = useState<number>(3.0); // 3.0%
  const [avgStoragePerUserGB, setAvgStoragePerUserGB] = useState<number>(650); // 650 GB average blended

  // Baseline Initial Numbers (Current Month: Nov 2026)
  const initialSubscribers = 1480;
  const initialArpuUSD = 16.65;
  const initialMrrUSD = initialSubscribers * initialArpuUSD; // $24,642

  // Quick Scenario Presets Handler
  const applyScenario = (sc: ForecastScenario) => {
    setScenario(sc);
    if (sc === 'conservative') {
      setMonthlyGrowthRate(4.2);
      setMonthlyChurnRate(3.1);
      setArpuExpansionRate(1.2);
    } else if (sc === 'baseline') {
      setMonthlyGrowthRate(8.5);
      setMonthlyChurnRate(1.8);
      setArpuExpansionRate(3.0);
    } else if (sc === 'aggressive') {
      setMonthlyGrowthRate(15.5);
      setMonthlyChurnRate(1.1);
      setArpuExpansionRate(4.8);
    }
  };

  // Month Names Generator
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const monthNamesEn = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Mathematical Projection Engine
  const forecastData = useMemo(() => {
    const data = [];
    let currentSubs = initialSubscribers;
    let currentArpu = initialArpuUSD;
    const startYear = 2026;
    const startMonth = 10; // November (0-indexed: 10)

    for (let m = 0; m <= horizonMonths; m++) {
      const date = new Date(startYear, startMonth + m, 1);
      const mIdx = date.getMonth();
      const yr = date.getFullYear();
      const yrShort = String(yr).slice(2);

      const labelAr = `${monthNamesAr[mIdx]} ${yrShort}`;
      const labelEn = `${monthNamesEn[mIdx]} ${yrShort}`;

      if (m > 0) {
        // Net subscriber growth: current * (1 + netRate)
        const netGrowthMultiplier = 1 + (monthlyGrowthRate - monthlyChurnRate) / 100;
        currentSubs = Math.round(currentSubs * netGrowthMultiplier);

        // ARPU expansion from upgrades and storage add-ons
        const arpuExpansionMultiplier = 1 + arpuExpansionRate / 100;
        currentArpu = currentArpu * arpuExpansionMultiplier;
      }

      const projectedMrrUSD = currentSubs * currentArpu;
      const projectedArrUSD = projectedMrrUSD * 12;
      
      // Mandatory 15% Net Profit Policy
      const projectedNetProfitUSD = projectedMrrUSD * 0.15;
      const projectedCloudCostUSD = projectedMrrUSD * 0.316; // Based on 68.4% gross margin

      // Predicted Total Storage Footprint (in Terabytes)
      const projectedStorageTB = (currentSubs * avgStoragePerUserGB) / 1000;

      data.push({
        monthIndex: m,
        monthLabel: isAr ? labelAr : labelEn,
        subscribers: currentSubs,
        arpuUSD: currentArpu,
        mrrUSD: projectedMrrUSD,
        arrUSD: projectedArrUSD,
        netProfitUSD: projectedNetProfitUSD,
        cloudCostUSD: projectedCloudCostUSD,
        storageTB: projectedStorageTB,
        convertedMrr: Number(convertCurrency(projectedMrrUSD, currency).toFixed(0)),
        convertedArr: Number(convertCurrency(projectedArrUSD, currency).toFixed(0)),
        convertedProfit: Number(convertCurrency(projectedNetProfitUSD, currency).toFixed(0)),
        convertedCloudCost: Number(convertCurrency(projectedCloudCostUSD, currency).toFixed(0)),
      });
    }

    return data;
  }, [
    horizonMonths,
    monthlyGrowthRate,
    monthlyChurnRate,
    arpuExpansionRate,
    avgStoragePerUserGB,
    currency,
    isAr,
  ]);

  // Key Milestones & End of Horizon Metrics
  const endPeriod = forecastData[forecastData.length - 1];
  const mrrGrowthRatio = endPeriod.mrrUSD / initialMrrUSD;

  // Milestone Detectors
  const milestone50kMonth = forecastData.find(d => d.mrrUSD >= 50000);
  const milestone100kMonth = forecastData.find(d => d.mrrUSD >= 100000);
  const milestoneMillionArrMonth = forecastData.find(d => d.arrUSD >= 1000000);

  // Custom Tooltip for Forecast
  const CustomForecastTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs space-y-2 font-sans z-50">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/80 font-bold">
            <span className="text-slate-100 font-semibold">{label}</span>
            <span className="text-emerald-400 font-mono text-[11px]">{data.subscribers.toLocaleString()} {isAr ? 'مشترك متوقع' : 'users'}</span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {isAr ? 'الإيراد الشهري المتوقع (MRR):' : 'Projected MRR:'}
              </span>
              <span className="font-bold">{formatCurrency(data.mrrUSD, currency, isAr)}</span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                {isAr ? 'الإيراد السنوي المتوقع (ARR):' : 'Annual Run-Rate (ARR):'}
              </span>
              <span className="font-bold">{formatCurrency(data.arrUSD, currency, isAr)}</span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                {isAr ? 'صافي الربح المتوقع (15%):' : 'Net Profit (15%):'}
              </span>
              <span className="font-bold">+{formatCurrency(data.netProfitUSD, currency, isAr)}</span>
            </div>

            <div className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {isAr ? 'السعة السحابية المطلوبة:' : 'Storage Demand:'}
              </span>
              <span className="font-bold">{data.storageTB.toFixed(1)} TB</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleExportForecast = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Month,Subscribers,ARPU_USD,MRR_USD,ARR_USD,NetProfit_15_USD,Storage_TB",
        ...forecastData.map(
          d => `${d.monthLabel},${d.subscribers},${d.arpuUSD.toFixed(2)},${d.mrrUSD.toFixed(2)},${d.arrUSD.toFixed(2)},${d.netProfitUSD.toFixed(2)},${d.storageTB.toFixed(2)}`
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RawajCloud_MRR_Forecast_${horizonMonths}M.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Scenario Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isAr
                  ? 'أداة التنبؤ بالإيرادات والنمو المستقبلي (Predictive MRR & ARR Forecast)'
                  : 'Predictive SaaS Revenue Forecasting & Cohort Run-Rate Modeler'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'محاكاة ديناميكية لنمو الإيراد الشهري المتكرر (MRR) وقاعدة المشتركين وتكاليف السعة مع الالتزام التام بسياسة هامش الربح 15%.'
                : 'Project future monthly recurring revenue and active cohorts based on expansion trends, churn rates, and storage consumption.'}
            </p>
          </div>

          {/* Horizon & Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setHorizonMonths(6)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  horizonMonths === 6
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isAr ? '6 أشهر' : '6 Months'}
              </button>
              <button
                type="button"
                onClick={() => setHorizonMonths(12)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  horizonMonths === 12
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isAr ? '12 شهراً (سنة)' : '12 Months (1Y)'}
              </button>
              <button
                type="button"
                onClick={() => setHorizonMonths(24)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  horizonMonths === 24
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isAr ? '24 شهراً (سنتان)' : '24 Months (2Y)'}
              </button>
            </div>

            <button
              onClick={handleExportForecast}
              className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصدير النموذج CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Scenario Presets Pill Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              {isAr ? 'سيناريو النمو المعتمد:' : 'Growth Preset:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyScenario('conservative')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scenario === 'conservative'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isAr ? 'متحفظ (Conservative)' : 'Conservative'}
              </button>

              <button
                type="button"
                onClick={() => applyScenario('baseline')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scenario === 'baseline'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isAr ? 'المستهدف الأساسي (Baseline)' : 'Target Baseline'}
              </button>

              <button
                type="button"
                onClick={() => applyScenario('aggressive')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  scenario === 'aggressive'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {isAr ? 'نمو متسارع (Aggressive)' : 'Aggressive Scale'}
              </button>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            {isAr
              ? `صافي معدل النمو الشهري الفعال: +${(monthlyGrowthRate - monthlyChurnRate).toFixed(1)}%`
              : `Net Monthly Growth: +${(monthlyGrowthRate - monthlyChurnRate).toFixed(1)}%`}
          </span>
        </div>

        {/* Interactive Sliders for Custom Fine-Tuning */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isAr ? 'معدل اكتساب المشتركين الجدد:' : 'New Subscriber Growth:'}
              </span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {monthlyGrowthRate.toFixed(1)}%/{isAr ? 'شهر' : 'mo'}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={25}
              step={0.5}
              value={monthlyGrowthRate}
              onChange={e => {
                setMonthlyGrowthRate(Number(e.target.value));
                setScenario('baseline');
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isAr ? 'معدل تسرب المشتركين (Churn):' : 'Monthly Churn Rate:'}
              </span>
              <span className="font-mono font-bold text-rose-500">
                {monthlyChurnRate.toFixed(1)}%/{isAr ? 'شهر' : 'mo'}
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.1}
              value={monthlyChurnRate}
              onChange={e => {
                setMonthlyChurnRate(Number(e.target.value));
                setScenario('baseline');
              }}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isAr ? 'توسع وترقية ARPU الشهري:' : 'Monthly ARPU Expansion:'}
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {arpuExpansionRate.toFixed(1)}%/{isAr ? 'شهر' : 'mo'}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={arpuExpansionRate}
              onChange={e => {
                setArpuExpansionRate(Number(e.target.value));
                setScenario('baseline');
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Projection Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            {isAr ? `MRR المتوقع (بعد ${horizonMonths} شهراً)` : `Projected MRR (${horizonMonths}M)`}
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(endPeriod.mrrUSD, currency, isAr)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono block">
            {isAr ? `نمو بمقدار ${mrrGrowthRatio.toFixed(1)}x ضعفاً` : `${mrrGrowthRatio.toFixed(1)}x Revenue Multiple`}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            {isAr ? `معدل التشغيل السنوي (ARR)` : `Annual Run-Rate (ARR)`}
          </span>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {formatCurrency(endPeriod.arrUSD, currency, isAr)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold block">
            +{((endPeriod.arrUSD - initialMrrUSD * 12) / (initialMrrUSD * 12) * 100).toFixed(0)}% {isAr ? 'زيادة سنوية' : 'YoY'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            {isAr ? 'صافي الربح الشهري (15% صافي)' : 'Projected Net Profit (15%)'}
          </span>
          <div className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400">
            {formatCurrency(endPeriod.netProfitUSD, currency, isAr)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {isAr ? 'سياسة ربحية مضمونة' : 'Strict 15% Policy'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">
            {isAr ? 'المشتركون النشطون المتوقعون' : 'Projected Active Users'}
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {endPeriod.subscribers.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-500 font-mono block">
            {endPeriod.storageTB.toFixed(0)} TB {isAr ? 'سعة مستهلكة' : 'Storage Footprint'}
          </span>
        </div>

      </div>

      {/* Main Recharts Forecast Curve */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isAr
                ? `مسار الإيرادات الشهرية المتكررة وصافي الأرباح (${horizonMonths} شهراً)`
                : `Predictive MRR & Net Profit Trajectory (${horizonMonths} Months)`}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {isAr ? 'محسوب بالعملة المختارة ومطابق لنسبة الربح 15%' : 'Calculated in selected currency with 15% margin'}
          </span>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastData}
              margin={{ top: 10, right: isAr ? 10 : 30, left: isAr ? 30 : 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="forecastMrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastProfitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />

              <XAxis
                dataKey="monthLabel"
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
              />

              {/* Primary Y-Axis for Revenue */}
              <YAxis
                yAxisId="revenue"
                orientation={isAr ? 'right' : 'left'}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
              />

              {/* Secondary Y-Axis for Subscribers */}
              <YAxis
                yAxisId="users"
                orientation={isAr ? 'left' : 'right'}
                tickLine={false}
                axisLine={{ stroke: 'rgba(148, 163, 184, 0.2)' }}
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                domain={['dataMin - 200', 'dataMax + 400']}
              />

              <Tooltip content={<CustomForecastTooltip />} />

              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 11, fontFamily: 'sans-serif' }}
              />

              {/* Area: Projected MRR */}
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="convertedMrr"
                name={isAr ? 'الإيراد الشهري المتكرر (MRR)' : 'Projected MRR'}
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#forecastMrrGradient)"
              />

              {/* Area: 15% Net Profit */}
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="convertedProfit"
                name={isAr ? 'صافي الأرباح المحققة (15%)' : 'Net Profit (15% Policy)'}
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#forecastProfitGradient)"
              />

              {/* Line: Subscribers Trajectory */}
              <Line
                yAxisId="users"
                type="monotone"
                dataKey="subscribers"
                name={isAr ? 'قاعدة المشتركين النشطة (المحور الثانوي)' : 'Active Subscribers (Right Axis)'}
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Milestones and Cloud Capacity Pre-provisioning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Milestone Card 1 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Target className="w-4 h-4" />
            <h4 className="text-xs font-bold">{isAr ? 'محطة $50,000 MRR' : '$50k MRR Milestone'}</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {milestone50kMonth
              ? (isAr
                  ? `من المتوقع الوصول إليها في ${milestone50kMonth.monthLabel} (بعد ${milestone50kMonth.monthIndex} أشهر) بحجم مشتركين يبلغ ${milestone50kMonth.subscribers.toLocaleString()} عميل.`
                  : `Expected in ${milestone50kMonth.monthLabel} (${milestone50kMonth.monthIndex} months) with ${milestone50kMonth.subscribers.toLocaleString()} subscribers.`)
              : (isAr ? 'خارج أفق التنبؤ الزمني الحالي.' : 'Beyond current projection horizon.')}
          </p>
        </div>

        {/* Milestone Card 2 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Zap className="w-4 h-4" />
            <h4 className="text-xs font-bold">{isAr ? 'محطة 1,000,000$ ARR Run-Rate' : '$1M ARR Run-Rate'}</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {milestoneMillionArrMonth
              ? (isAr
                  ? `الدخول في نادي المليون دولار سنوياً متوقع في ${milestoneMillionArrMonth.monthLabel} بصافي ربح سنوي مضمون قدره 150,000 دولار.`
                  : `Crossing $1M annual run-rate expected in ${milestoneMillionArrMonth.monthLabel} with $150k net profit compounding.`)
              : (isAr ? 'يتطلب أفق تنبؤ 24 شهراً مع استمرار وتيرة النمو الحالية.' : 'Requires 24-month horizon with sustained expansion.')}
          </p>
        </div>

        {/* Milestone Card 3: Cloud Capacity Planning */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-500">
            <HardDrive className="w-4 h-4" />
            <h4 className="text-xs font-bold">{isAr ? 'توصية سعة السحابة (FinOps Prep)' : 'Cloud Capacity Pre-Purchasing'}</h4>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {isAr
              ? `يصل الطلب التخزيني المتوقع إلى ${endPeriod.storageTB.toFixed(0)} تيرابايت. يُوصى بحجز سعات AWS/GCP المخصصة (Reserved Instances) لتوفير 18% إضافية.`
              : `Storage demand reaches ${endPeriod.storageTB.toFixed(0)} TB. Recommend booking Reserved S3 Capacity commits to unlock additional 18% cost reductions.`}
          </p>
        </div>

      </div>

    </div>
  );
};
