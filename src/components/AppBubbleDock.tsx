import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TvApp } from '../types/launcher';
import { AppIcon } from './AppIcon';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AppBubbleDockProps {
  apps: TvApp[];
  focusedIndex: number;
  isDockFocused: boolean;
  onSelectApp: (app: TvApp) => void;
  onOpenAllApps: () => void;
  onFocusChange: (index: number) => void;
}

export const AppBubbleDock: React.FC<AppBubbleDockProps> = ({
  apps,
  focusedIndex,
  isDockFocused,
  onSelectApp,
  onOpenAllApps,
  onFocusChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // The dock items include the apps + the "All Apps" expander bubble
  const totalItems = apps.length + 1; // last one is "All Apps"

  // Automatically scroll the focused bubble into center view
  useEffect(() => {
    if (isDockFocused && bubbleRefs.current[focusedIndex] && scrollContainerRef.current) {
      const bubbleEl = bubbleRefs.current[focusedIndex];
      const container = scrollContainerRef.current;
      if (bubbleEl) {
        const bubbleLeft = bubbleEl.offsetLeft;
        const bubbleWidth = bubbleEl.offsetWidth;
        const containerWidth = container.offsetWidth;
        const targetScroll = bubbleLeft - containerWidth / 2 + bubbleWidth / 2;

        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }
  }, [focusedIndex, isDockFocused]);

  const focusedApp = focusedIndex < apps.length ? apps[focusedIndex] : null;
  const isAllAppsFocused = focusedIndex === apps.length;

  return (
    <div className="relative w-full flex flex-col items-center justify-center my-auto py-8">
      {/* Selected App Label Display Above/Below Dock with Deadpool styling */}
      <div className="h-14 flex flex-col items-center justify-center mb-3">
        <AnimatePresence mode="wait">
          {isDockFocused && (
            <motion.div
              key={isAllAppsFocused ? 'all-apps' : focusedApp?.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="flex flex-col items-center text-center px-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-semibold text-neutral-100 tracking-tight drop-shadow-md">
                  {isAllAppsFocused ? 'All Applications' : focusedApp?.name}
                </span>
                {!isAllAppsFocused && focusedApp?.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-500/30">
                    {focusedApp.badge}
                  </span>
                )}
              </div>
              <span className="text-xs text-neutral-400 font-normal tracking-wide mt-0.5 max-w-md truncate">
                {isAllAppsFocused
                  ? 'Press OK or DOWN to expand full library over homescreen'
                  : focusedApp?.description}
              </span>
            </motion.div>
          )}
          {!isDockFocused && (
            <div className="text-xs tracking-widest text-neutral-500 uppercase font-medium">
              DEADPOOL LAUNCHER
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Dock Container with subtle liquid glass backdrop */}
      <div className="relative max-w-full w-full px-6 flex items-center justify-center">
        {/* Subtle horizontal fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#050505] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#050505] to-transparent z-10" />

        {/* Scrollable Row of Circular Bubbles */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-6 md:gap-8 px-12 py-8 overflow-x-auto no-scrollbar scroll-smooth max-w-6xl"
        >
          {apps.map((app, index) => {
            const isItemFocused = isDockFocused && focusedIndex === index;

            return (
              <motion.button
                key={app.id}
                ref={(el) => { bubbleRefs.current[index] = el; }}
                onClick={() => {
                  onFocusChange(index);
                  onSelectApp(app);
                }}
                onMouseEnter={() => onFocusChange(index)}
                whileHover={{ scale: 1.12, y: -8 }}
                animate={{
                  scale: isItemFocused ? 1.22 : 1,
                  y: isItemFocused ? -14 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 26,
                }}
                className={`group relative shrink-0 flex flex-col items-center outline-hidden cursor-pointer focus:outline-hidden ${
                  isItemFocused ? 'z-20' : 'z-0'
                }`}
                tabIndex={-1}
                aria-label={`Launch ${app.name}`}
              >
                {/* Circular Glass Bubble */}
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                    isItemFocused
                      ? 'bg-gradient-to-b from-neutral-800/90 to-neutral-950/95 ring-2 ring-red-500 shadow-[0_0_40px_rgba(208,15,31,0.7)]'
                      : 'bg-neutral-900/60 hover:bg-neutral-850/80 border border-white/10 hover:border-white/20 shadow-md'
                  }`}
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Specular Rim Light */}
                  <div className="absolute inset-x-2 top-1 h-3 rounded-t-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

                  {/* App Icon */}
                  <AppIcon
                    iconName={app.iconName}
                    size={46}
                    accentColor={app.accentColor}
                  />

                  {/* Focused pulse dot indicator */}
                  {isItemFocused && (
                    <div className="absolute -bottom-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#D00F1F]" />
                  )}
                </div>

                {/* Subtle static title when not focused */}
                {!isItemFocused && (
                  <span className="text-[11px] font-medium text-neutral-400 group-hover:text-neutral-200 mt-2 tracking-tight transition-colors truncate max-w-[80px]">
                    {app.name}
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* ALL APPS Glass Bubble */}
          <motion.button
            ref={(el) => { bubbleRefs.current[apps.length] = el; }}
            onClick={() => {
              onFocusChange(apps.length);
              onOpenAllApps();
            }}
            onMouseEnter={() => onFocusChange(apps.length)}
            whileHover={{ scale: 1.12, y: -8 }}
            animate={{
              scale: isAllAppsFocused && isDockFocused ? 1.22 : 1,
              y: isAllAppsFocused && isDockFocused ? -14 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 26,
            }}
            className={`group relative shrink-0 flex flex-col items-center outline-hidden cursor-pointer focus:outline-hidden ${
              isAllAppsFocused && isDockFocused ? 'z-20' : 'z-0'
            }`}
            tabIndex={-1}
            aria-label="Expand All Applications Grid"
          >
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                isAllAppsFocused && isDockFocused
                  ? 'bg-gradient-to-b from-red-950/80 to-neutral-950/95 ring-2 ring-red-500 shadow-[0_0_40px_rgba(208,15,31,0.7)]'
                  : 'bg-neutral-900/60 hover:bg-neutral-850/80 border border-red-500/30 hover:border-red-500/60 shadow-md'
              }`}
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="absolute inset-x-2 top-1 h-3 rounded-t-full bg-gradient-to-b from-red-500/20 to-transparent pointer-events-none" />
              <AppIcon iconName="all_apps" size={44} />
            </div>

            {(!isAllAppsFocused || !isDockFocused) && (
              <span className="text-[11px] font-medium text-red-400 group-hover:text-red-300 mt-2 tracking-tight transition-colors">
                All Apps
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Minimalist Hint Bar for Remote Controls */}
      <div className="flex items-center gap-6 mt-4 text-[11px] text-neutral-500 tracking-wide">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono">
            ◀ ▶
          </kbd>{' '}
          Navigate
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono">
            OK
          </kbd>{' '}
          Launch
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono">
            ▼
          </kbd>{' '}
          All Apps
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300 font-mono">
            ▲
          </kbd>{' '}
          Settings
        </span>
      </div>
    </div>
  );
};
