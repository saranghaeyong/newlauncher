import React from 'react';
import {
  Play,
  Film,
  Tv,
  Gamepad2,
  FolderOpen,
  Plus,
  LayoutGrid,
  Radio,
  Music2,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface AppIconProps {
  iconName: string;
  size?: number;
  className?: string;
  accentColor?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  iconName,
  size = 48,
  className = '',
  accentColor = '#FFFFFF',
}) => {
  switch (iconName) {
    case 'netflix':
      return (
        <div
          className={`flex items-center justify-center font-black ${className}`}
          style={{ width: size, height: size, color: '#E50914' }}
        >
          <span className="text-3xl font-extrabold tracking-tighter drop-shadow-md select-none font-serif">
            N
          </span>
        </div>
      );

    case 'youtube':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="w-10 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-lg relative">
            <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-0.5" />
          </div>
        </div>
      );

    case 'prime':
      return (
        <div
          className={`flex flex-col items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <span className="text-xl font-bold tracking-tight text-sky-400 select-none">
            prime
          </span>
          <div className="w-8 h-1 bg-sky-400 rounded-full mt-0.5" />
        </div>
      );

    case 'disney':
      return (
        <div
          className={`flex items-center justify-center font-serif ${className}`}
          style={{ width: size, height: size }}
        >
          <span className="text-2xl font-bold italic tracking-wider text-blue-400 select-none drop-shadow">
            D+
          </span>
        </div>
      );

    case 'spotify':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex flex-col items-center justify-center gap-1 shadow-md">
            <div className="w-6 h-1 bg-black rounded-full rotate-[-8deg]" />
            <div className="w-5 h-0.5 bg-black rounded-full rotate-[-8deg]" />
            <div className="w-4 h-0.5 bg-black rounded-full rotate-[-8deg]" />
          </div>
        </div>
      );

    case 'plex':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center rotate-45 shadow-md">
            <div className="w-3.5 h-3.5 bg-black rounded-sm" />
          </div>
        </div>
      );

    case 'twitch':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="w-9 h-9 bg-purple-600 rounded-md flex items-center justify-center gap-1 p-1.5 shadow-md">
            <div className="w-1.5 h-3 bg-white rounded-xs" />
            <div className="w-1.5 h-3 bg-white rounded-xs" />
          </div>
        </div>
      );

    case 'kodi':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-md">
            K
          </div>
        </div>
      );

    case 'appletv':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <div className="flex items-center gap-0.5 text-white font-medium">
            <span className="text-xl"></span>
            <span className="text-xs font-bold tracking-tighter">tv</span>
          </div>
        </div>
      );

    case 'retroarch':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <Gamepad2 size={size * 0.65} className="text-blue-400 drop-shadow" />
        </div>
      );

    case 'folder':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <FolderOpen size={size * 0.65} className="text-sky-400 drop-shadow" />
        </div>
      );

    case 'deadpool':
      return (
        <div
          className={`flex items-center justify-center relative overflow-hidden rounded-full ${className}`}
          style={{ width: size, height: size }}
        >
          <img
            src="/src/assets/images/deadpool_mask_insignia_1794381463196.jpg"
            alt="Deadpool"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Styled fallback if image load fails
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle stylized fallback SVG mask if image is hidden */}
          <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center -z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-4 bg-black rounded-full rotate-12 flex items-center justify-center">
                <div className="w-1 h-1.5 bg-white rounded-full -rotate-12" />
              </div>
              <div className="w-2.5 h-4 bg-black rounded-full -rotate-12 flex items-center justify-center">
                <div className="w-1 h-1.5 bg-white rounded-full rotate-12" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'all_apps':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <LayoutGrid size={size * 0.6} className="text-red-500 drop-shadow" />
        </div>
      );

    case 'add_app':
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
        >
          <Plus size={size * 0.6} className="text-neutral-400" />
        </div>
      );

    default:
      return (
        <div
          className={`flex items-center justify-center ${className}`}
          style={{ width: size, height: size, color: accentColor }}
        >
          <Film size={size * 0.6} />
        </div>
      );
  }
};
