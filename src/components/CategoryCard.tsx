import React from 'react';
import {
  Newspaper,
  Tv,
  Film,
  Sparkles,
  Music,
  Smile,
  GraduationCap,
} from 'lucide-react';
import { CategoryTile, ChannelCategory } from '../types/channel';
import { MediaImage } from './MediaImage';

interface CategoryCardProps {
  category: CategoryTile;
  channelCount: number;
  spanWide?: boolean;
  onSelect: (category: ChannelCategory) => void;
}

const CATEGORY_ICONS: Record<ChannelCategory, React.ComponentType<{ className?: string }>> = {
  News: Newspaper,
  Entertainment: Tv,
  Movies: Film,
  Devotional: Sparkles,
  Music: Music,
  Kids: Smile,
  Educational: GraduationCap,
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  channelCount,
  spanWide = false,
  onSelect,
}) => {
  const Icon = CATEGORY_ICONS[category.id];

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={`relative h-44 rounded-2xl overflow-hidden bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] text-left group transition-transform duration-200 hover:scale-[1.01] ${
        spanWide ? 'sm:col-span-2' : ''
      }`}
    >
      <MediaImage
        src={category.thumbnail}
        alt={`${category.title} Telugu television category`}
        fallbackLabel={category.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080B12] via-[#080B12]/55 to-black/15" />

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-base text-white truncate">
            {category.title}
          </h3>
          <p className="text-xs text-[#D1D5DB] truncate mt-0.5">
            {category.id === 'Educational'
              ? 'T-SAT Vidya, Nipuna & More'
              : `${channelCount} Live ${channelCount === 1 ? 'Channel' : 'Channels'}`}
          </p>
        </div>

        <span className="w-9 h-9 rounded-full bg-[#171D2A]/85 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-[#E50914] group-hover:border-[#E50914] transition-colors shrink-0">
          <Icon className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
};
