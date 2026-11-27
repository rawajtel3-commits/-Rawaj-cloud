import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import {
  Code2,
  Terminal,
  Copy,
  Check,
  Zap,
  HardDrive,
  Key,
  Layers,
  ArrowRight,
  ExternalLink,
  Flame,
  Snowflake,
} from 'lucide-react';

export const DeveloperApiView: React.FC = () => {
  const { lang, showNotification } = useStorage();
  const [activeSdk, setActiveSdk] = useState<'python' | 'node' | 'curl' | 'flutter'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [presignedFilename, setPresignedFilename] = useState('dataset_2026_model.bin');
  const [presignedTtl, setPresignedTtl] = useState('3600');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [monthlyTransferGB, setMonthlyTransferGB] = useState(5000);

  const isAr = lang === 'ar';

  const generatePresignedUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUrl = `https://s3.rawajcloud.com/v1/vault-storage/${presignedFilename}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=RAWJ_AKIA_8819%2F20261107%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20261107T090000Z&X-Amz-Expires=${presignedTtl}&X-Amz-SignedHeaders=host&X-Amz-Signature=89c3b7f1984210d79bf10e47923fa1c8`;
    setGeneratedUrl(mockUrl);
    showNotification(
      'تم توليد رابط Pre-signed URL عالي الأمان في أقل من 38ms',
      'Pre-signed URL generated in <38ms',
      'success'
    );
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showNotification('تم نسخ الكود البرمجي', 'Code snippet copied', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const sdkSnippets = {
    curl: `# 1. Instant Chunked Upload via Pre-signed URL (tus / S3 compatible)
curl -X PUT "https://s3.rawajcloud.com/v1/buckets/my-vault/backup.tar.gz" \\
  -H "Authorization: Bearer rawaj_live_sk_7749021899" \\
  -H "Content-Type: application/gzip" \\
  -H "x-amz-server-side-encryption: AES256" \\
  --upload-file ./backup.tar.gz

# 2. Get Zero-Knowledge Object with zero egress fee
curl -X GET "https://s3.rawajcloud.com/v1/buckets/my-vault/backup.tar.gz" \\
  -H "Authorization: Bearer rawaj_live_sk_7749021899" \\
  --output ./downloaded_backup.tar.gz`,

    python: `import boto3
from botocore.client import Config

# Initialize Rawaj Cloud S3 Client (Zero Egress Endpoint)
s3_client = boto3.client(
    's3',
    endpoint_url='https://s3.rawajcloud.com',
    aws_access_key_id='RAWJ_ACCESS_KEY_77',
    aws_secret_access_key='RAWJ_SECRET_KEY_99',
    config=Config(signature_version='s3v4')
)

# 1. Resumable Multipart Upload
s3_client.upload_file(
    Filename='training_weights.safetensors',
    Bucket='deep-models',
    Key='models/v3/weights.safetensors',
    ExtraArgs={'ServerSideEncryption': 'AES256'}
)

# 2. Generate Client-side Pre-signed Download URL
url = s3_client.generate_presigned_url(
    'get_object',
    Params={'Bucket': 'deep-models', 'Key': 'models/v3/weights.safetensors'},
    ExpiresIn=3600
)
print(f"Direct Edge Download URL: {url}")`,

    node: `import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";

// Initialize S3 Client compatible with Rawaj Cloud & Cloudflare R2
const client = new S3Client({
  region: "auto",
  endpoint: "https://s3.rawajcloud.com",
  credentials: {
    accessKeyId: process.env.RAWAJ_ACCESS_KEY!,
    secretAccessKey: process.env.RAWAJ_SECRET_KEY!,
  },
});

async function uploadToRawaj() {
  const stream = createReadStream("./enterprise_archive.zip");
  const command = new PutObjectCommand({
    Bucket: "production-data",
    Key: "archives/2026/archive.zip",
    Body: stream,
  });

  const response = await client.send(command);
  console.log("Uploaded successfully with ETag:", response.ETag);
}`,

    flutter: `// Rawaj Cloud Mobile SDK for Flutter
import 'package:rawaj_cloud_sdk/rawaj_cloud.dart';

void uploadCameraRoll() async {
  final client = RawajClient(
    apiKey: 'rawaj_mobile_live_token_4412',
    enableBackgroundWorkManager: true, // Native Android/iOS background
  );

  final task = await client.uploadMultipart(
    filePath: '/storage/emulated/0/DCIM/Camera/IMG_9921.jpg',
    bucket: 'camera-roll',
    smartCompression: SmartCompression.webpLossless,
    onProgress: (bytes, total) {
      print('Progress: \${(bytes / total * 100).toStringAsFixed(1)}%');
    },
  );
}`
  };

  // Egress Cost Calculation:
  // Rawaj Cloud: $0.00
  // AWS S3: $0.09 per GB
  // Google Cloud: $0.12 per GB
  const awsCost = (monthlyTransferGB * 0.09).toFixed(0);
  const gcpCost = (monthlyTransferGB * 0.12).toFixed(0);

  return (
    <div className="w-full flex-1 p-4 sm:p-6 lg:p-8 pb-28 space-y-6">
      
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 shadow-xl border border-purple-900/30 overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <Code2 className="w-4 h-4" />
            <span>{isAr ? 'واجهات برمجة التطبيقات والمطورين' : 'S3-Compatible Developer Platform'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {isAr ? 'واجهة S3 API وتكامل البنية الهجينة' : 'S3-Compatible API & Hybrid Multi-Cloud'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isAr
              ? 'اربط تطبيقاتك ومشاريعك السحابية بسهولة تامة باستخدام حزم SDK المتوافقة مع S3 (Boto3, AWS SDK, cURL). استمتع بتفادي تكاليف نقل البيانات كلياً (Zero Egress Fees) عبر شبكة Cloudflare R2 العالمية.'
              : 'Seamlessly plug into your existing S3 toolchain. Enjoy true Zero Egress bandwidth fees powered by Cloudflare R2 and multi-region edge caches.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>Endpoint: https://s3.rawajcloud.com</span>
            <span>·</span>
            <span>Signature: AWS4-HMAC-SHA256</span>
            <span>·</span>
            <span className="text-emerald-400">{isAr ? 'رسوم نقل البيانات: 0.00$' : 'Zero Egress: $0.00'}</span>
          </div>
        </div>
      </div>

      {/* Zero Egress Savings Calculator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'حاسبة توفير تكاليف سحب البيانات (Zero Egress Savings)' : 'Zero Egress Bandwidth Calculator'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAr ? 'قارن تكلفة سحب وتنزيل البيانات شهرياً بين رواج كلاود والشركات الأخرى' : 'See how much you save on monthly downloads compared to AWS & Google Cloud'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">{isAr ? 'البيانات المسحوبة:' : 'Transfer:'}</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
              {monthlyTransferGB.toLocaleString()} GB / {isAr ? 'شهر' : 'month'}
            </span>
          </div>
        </div>

        {/* Slider */}
        <div>
          <input
            type="range"
            min={100}
            max={50000}
            step={500}
            value={monthlyTransferGB}
            onChange={e => setMonthlyTransferGB(parseInt(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Cost Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-center font-mono">
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
              {isAr ? 'رواج كلاود (Zero Egress)' : 'Rawaj Cloud'}
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              $0.00
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-500 mt-0.5">
              {isAr ? 'مجاناً مدى الحياة' : '100% Free Transfer'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-medium text-slate-500 uppercase">
              AWS S3 Standard ($0.09/GB)
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
              ${awsCost}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {isAr ? `توفير $${awsCost} شهرياً مع رواج` : `Save $${awsCost}/mo with Rawaj`}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-medium text-slate-500 uppercase">
              Google Cloud Storage ($0.12/GB)
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
              ${gcpCost}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {isAr ? `توفير $${gcpCost} شهرياً مع رواج` : `Save $${gcpCost}/mo with Rawaj`}
            </div>
          </div>
        </div>
      </div>

      {/* Storage Tiering Lifecycle (Hot NVMe vs Cold Glacier) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {isAr ? 'آلية التوجيه التلقائي للملفات (Storage Tiering)' : 'Automated Storage Tiering'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {isAr ? 'التخزين الساخن (Hot NVMe Tier)' : 'Hot NVMe Storage Tier'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {isAr
                  ? 'للملفات النشطة والفيديوهات قيد التشغيل. سرعات قراءة تفوق 3,500 MB/s مع زمن استجابة API أقل من 40ms.'
                  : 'Ultra-fast NVMe SSDs for active files and live streaming with sub-40ms latency.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
              <Snowflake className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {isAr ? 'التخزين البارد والأرشيف (Cold Tier)' : 'Cold Archive Tier'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {isAr
                  ? 'أرشفة تلقائية للنسخ القديمة بعد 30 يوماً لخفض تكلفة التخزين إلى أدنى حد (0.002$/GB) مع بقاء 11 تسعات.'
                  : 'Automated archiving after 30 days to slash storage costs to $0.002/GB with 11 Nines durability.'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Pre-signed URL Interactive Tester */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isAr ? 'مولد الروابط المؤقتة الموقعة (Pre-signed URL Generator)' : 'Pre-signed URL Interactive Playground'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? 'توليد رابط رفع وتنزيل مباشر عند الـ Edge محمي بتوقيع AWS4-HMAC-SHA256' : 'Generate instant edge upload/download URLs signed with AWS Signature Version 4'}
          </p>
        </div>

        <form onSubmit={generatePresignedUrl} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-500 block mb-1 font-mono">{isAr ? 'اسم الملف:' : 'Object Key:'}</label>
            <input
              type="text"
              value={presignedFilename}
              onChange={e => setPresignedFilename(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-500 block mb-1 font-mono">{isAr ? 'مدة الصلاحية (ثواني):' : 'TTL (Seconds):'}</label>
            <select
              value={presignedTtl}
              onChange={e => setPresignedTtl(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-mono"
            >
              <option value="900">900 (15 min)</option>
              <option value="3600">3600 (1 hour)</option>
              <option value="86400">86400 (24 hours)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-xs"
            >
              {isAr ? 'توليد الرابط الآن (<40ms)' : 'Generate URL (<40ms)'}
            </button>
          </div>
        </form>

        {generatedUrl && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="text-emerald-600 font-semibold">{isAr ? 'تم التوليد بنجاح (زمن الاستجابة 34ms)' : 'Generated in 34ms'}</span>
              <button
                onClick={() => copySnippet(generatedUrl)}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{isAr ? 'نسخ الرابط' : 'Copy'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
              {generatedUrl}
            </div>
          </div>
        )}
      </div>

      {/* Code SDKs Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        
        {/* SDK Tab Header */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl">
            {(['curl', 'python', 'node', 'flutter'] as const).map(sdk => (
              <button
                key={sdk}
                onClick={() => setActiveSdk(sdk)}
                className={`px-3 py-1 text-xs font-mono font-semibold rounded-lg transition-colors capitalize ${
                  activeSdk === sdk
                    ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {sdk === 'curl' ? 'cURL' : sdk === 'node' ? 'Node.js (AWS SDK)' : sdk === 'flutter' ? 'Flutter / Dart' : 'Python (Boto3)'}
              </button>
            ))}
          </div>

          <button
            onClick={() => copySnippet(sdkSnippets[activeSdk])}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? (isAr ? 'تم النسخ' : 'Copied') : (isAr ? 'نسخ الكود' : 'Copy Code')}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          <pre>{sdkSnippets[activeSdk]}</pre>
        </div>

      </div>

    </div>
  );
};
