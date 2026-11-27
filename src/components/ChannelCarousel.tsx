import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChannelCarouselProps {
  title: string;
  subtitle?: string;
  titlePrefix?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const ChannelCarousel: React.FC<ChannelCarouselProps> = ({
  title,
  subtitle,
  titlePrefix,
  children,
  action,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (delta: number) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            {titlePrefix}
            <h2 className="font-semibold text-xl md:text-2xl text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <span className="text-xs text-[#9CA3AF] font-medium">
                {subtitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount(-360)}
              aria-label={`Scroll ${title} left`}
              className="w-9 h-9 rounded-full bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] hover:bg-[#1E2636] text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(360)}
              aria-label={`Scroll ${title} right`}
              className="w-9 h-9 rounded-full bg-[#171D2A] border border-[#1F2937] hover:border-[#374151] hover:bg-[#1E2636] text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-5 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
      >
        {children}
      </div>
    </section>
  );
};
