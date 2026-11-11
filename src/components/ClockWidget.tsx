import React, { useState, useEffect } from 'react';

interface ClockWidgetProps {
  isFocused?: boolean;
  timeFormat24h?: boolean;
  showSeconds?: boolean;
  onSelect?: () => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  isFocused = false,
  timeFormat24h = true,
  showSeconds = false,
  onSelect,
}) => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hoursRaw = time.getHours();
  const hours = timeFormat24h
    ? String(hoursRaw).padStart(2, '0')
    : String(hoursRaw % 12 || 12).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');
  const ampm = hoursRaw >= 12 ? 'PM' : 'AM';

  // Format date: e.g., "Tuesday, Nov 11"
  const weekday = time.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col items-start transition-all duration-200 cursor-pointer p-2 rounded-2xl ${
        isFocused
          ? 'bg-white/5 shadow-[0_0_25px_rgba(208,15,31,0.35)] ring-1 ring-red-500/80 scale-102'
          : 'hover:bg-white/5'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Current time: ${hours}:${minutes}, ${weekday} ${monthDay}`}
    >
      {/* Time Display */}
      <div className="flex items-baseline tracking-tight font-light">
        <span className="text-4xl md:text-5xl lg:text-6xl font-extralight text-neutral-100 tabular-nums">
          {hours}
        </span>
        <span className="text-3xl md:text-4xl lg:text-5xl font-light text-red-600 px-1 animate-pulse select-none">
          :
        </span>
        <span className="text-4xl md:text-5xl lg:text-6xl font-extralight text-neutral-100 tabular-nums">
          {minutes}
        </span>

        {showSeconds && (
          <span className="ml-2 text-xl font-light text-neutral-400 tabular-nums">
            {seconds}
          </span>
        )}

        {!timeFormat24h && (
          <span className="ml-2.5 text-xs font-semibold tracking-wider text-red-500/90 uppercase self-end mb-2">
            {ampm}
          </span>
        )}
      </div>

      {/* Date & Day Display */}
      <div className="flex items-center gap-2 mt-1 text-xs md:text-sm tracking-wide text-neutral-400">
        <span className="font-semibold text-neutral-200 uppercase tracking-widest text-[11px]">
          {weekday}
        </span>
        <span className="text-red-600 font-bold" aria-hidden="true">
          ·
        </span>
        <span className="font-normal text-neutral-300">
          {monthDay}
        </span>
      </div>
    </div>
  );
};
