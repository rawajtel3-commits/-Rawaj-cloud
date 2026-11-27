import React from 'react';
import { useStorage } from '../../context/StorageContext';
import { HeroMediaSlider } from './HeroMediaSlider';
import {
  Folder,
  Video,
  Image as ImageIcon,
  CreditCard,
} from 'lucide-react';

interface HomeHubViewProps {
  onUploadClick?: () => void;
  onNewFolderClick?: () => void;
}

interface HubCardItem {
  id: string;
  titleAr: string;
  titleEn: string;
  renderIcon: () => React.ReactNode;
  onClick: () => void;
}

export const HomeHubView: React.FC<HomeHubViewProps> = () => {
  const {
    lang,
    setActiveTab,
    setActiveCategory,
    setCurrentFolderId,
  } = useStorage();

  const isAr = lang === 'ar';

  // Row 1 (inside curved deep-purple top band): ملفاتي (Right in RTL) | الباقات (Left in RTL)
  const topRowCards: HubCardItem[] = [
    {
      id: 'my-files',
      titleAr: 'ملفاتي',
      titleEn: 'My Files',
      renderIcon: () => <Folder className="w-7 h-7 text-white fill-white" strokeWidth={1.8} />,
      onClick: () => {
        setCurrentFolderId(null);
        setActiveCategory('all');
        setActiveTab('files');
      },
    },
    {
      id: 'plans',
      titleAr: 'الباقات',
      titleEn: 'Plans',
      renderIcon: () => (
        <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none" aria-hidden="true">
          <path
            d="M15.2 4.2H22.2C23.1 4.2 23.8 4.9 23.8 5.8V12.8C23.8 13.4 23.5 14 23.1 14.4L13.6 23.9C12.8 24.7 11.4 24.7 10.6 23.9L4.1 17.4C3.3 16.6 3.3 15.2 4.1 14.4L13.6 4.9C14 4.5 14.6 4.2 15.2 4.2Z"
            fill="#FFFFFF"
          />
          <circle cx="19.5" cy="8.5" r="1.6" fill="#3B004E" />
          <circle cx="19" cy="19" r="5" fill="#3B004E" stroke="#FFFFFF" strokeWidth="1.6" />
          <path d="M17.2 20.8L20.8 17.2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="17.3" cy="17.5" r="0.85" fill="#FFFFFF" />
          <circle cx="20.7" cy="20.5" r="0.85" fill="#FFFFFF" />
        </svg>
      ),
      onClick: () => setActiveTab('available-plans'),
    },
  ];

  // Rows 2 & 3 (on crisp soft light-gray background below the purple curve):
  // Row 2: الصور (Right) | الفيديو (Left)
  // Row 3: المستندات (Right) | اشتراكاتي (Left)
  const bottomGridCards: HubCardItem[] = [
    {
      id: 'photos',
      titleAr: 'الصور',
      titleEn: 'Photos',
      renderIcon: () => <ImageIcon className="w-7 h-7 text-white" strokeWidth={2.2} />,
      onClick: () => {
        setCurrentFolderId(null);
        setActiveCategory('images');
        setActiveTab('files');
      },
    },
    {
      id: 'videos',
      titleAr: 'الفيديو',
      titleEn: 'Videos',
      renderIcon: () => <Video className="w-7 h-7 text-white fill-white" strokeWidth={1.8} />,
      onClick: () => {
        setCurrentFolderId(null);
        setActiveCategory('videos');
        setActiveTab('files');
      },
    },
    {
      id: 'documents',
      titleAr: 'المستندات',
      titleEn: 'Documents',
      renderIcon: () => (
        <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none" aria-hidden="true">
          <path
            d="M7.5 3.5H16.5L21.5 8.5V23C21.5 23.8 20.8 24.5 20 24.5H7.5C6.7 24.5 6 23.8 6 23V5C6 4.2 6.7 3.5 7.5 3.5Z"
            fill="#FFFFFF"
          />
          <path d="M16.5 3.5V8.5H21.5" fill="#D8C4E2" />
          <text
            x="13.75"
            y="18.5"
            textAnchor="middle"
            fill="#3B004E"
            fontSize="6.8"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            PDF
          </text>
        </svg>
      ),
      onClick: () => {
        setCurrentFolderId(null);
        setActiveCategory('documents');
        setActiveTab('files');
      },
    },
    {
      id: 'subscriptions',
      titleAr: 'اشتراكاتي',
      titleEn: 'Subscriptions',
      renderIcon: () => <CreditCard className="w-7 h-7 text-white" strokeWidth={2.2} />,
      onClick: () => setActiveTab('subscriptions'),
    },
  ];

  const renderWhiteCard = (card: HubCardItem, isInPurpleBand: boolean) => (
    <button
      key={card.id}
      type="button"
      onClick={card.onClick}
      className={`group relative w-full min-w-0 flex flex-col justify-between items-center p-4 sm:p-5 min-h-[136px] sm:min-h-[154px] rounded-[20px] bg-white dark:bg-slate-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7C3AED] ${
        isInPurpleBand
          ? 'shadow-[0_8px_22px_rgba(0,0,0,0.22)]'
          : 'shadow-[0_4px_16px_rgba(59,0,78,0.08)] border border-slate-100 dark:border-slate-800'
      }`}
    >
      {/* Top-Right (RTL) Deep Royal Purple Circular Icon Badge */}
      <div className="w-full flex justify-start">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#3B004E] flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
          {card.renderIcon()}
        </div>
      </div>

      {/* Bottom Centered Deep Purple Bold Label */}
      <span className="text-lg sm:text-xl font-black tracking-tight text-[#3B004E] dark:text-white mt-3">
        {isAr ? card.titleAr : card.titleEn}
      </span>
    </button>
  );

  return (
    <div
      className="w-full flex-1 flex flex-col bg-[#F3F2F5] dark:bg-slate-950 pb-28"
      role="region"
      aria-label={isAr ? 'الصفحة الرئيسية - رواج كلاود' : 'Rawaj Cloud Home'}
    >
      {/* Curved Deep Royal Purple Upper Band holding Banner + Dots + Row 1 (ملفاتي & الباقات) */}
      <div className="bg-[#3B004E] rounded-b-[28px] sm:rounded-b-[34px] pb-5 sm:pb-6 shadow-md shadow-[#3B004E]/15">
        <div className="max-w-2xl mx-auto px-4 pt-1 space-y-4">
          <HeroMediaSlider />

          {/* Row 1: ملفاتي | الباقات */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 pt-1">
            {topRowCards.map(card => renderWhiteCard(card, true))}
          </div>
        </div>
      </div>

      {/* Lower Surface holding Rows 2 & 3: الصور | الفيديو / المستندات | اشتراكاتي */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          {bottomGridCards.map(card => renderWhiteCard(card, false))}
        </div>
      </div>
    </div>
  );
};
