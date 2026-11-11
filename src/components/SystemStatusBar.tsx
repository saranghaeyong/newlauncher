import React from 'react';
import {
  Wifi,
  Tv,
  Settings,
  Code2,
  Gamepad,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TopBarItem, TvSystemState } from '../types/launcher';

interface SystemStatusBarProps {
  systemState: TvSystemState;
  focusedItem: TopBarItem | null;
  onSelectItem: (item: TopBarItem) => void;
  onToggleSound: () => void;
}

export const SystemStatusBar: React.FC<SystemStatusBarProps> = ({
  systemState,
  focusedItem,
  onSelectItem,
  onToggleSound,
}) => {
  return (
    <div className="flex items-center gap-2 md:gap-3 p-1.5 rounded-full bg-neutral-950/40 backdrop-blur-xl border border-white/8 shadow-lg">
      {/* Audio Mute/Unmute */}
      <button
        onClick={onToggleSound}
        className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-200 transition-colors"
        title={systemState.soundEnabled ? 'Mute TV Navigation Audio' : 'Unmute Audio'}
        aria-label="Sound Toggle"
      >
        {systemState.soundEnabled ? (
          <Volume2 size={16} className="text-neutral-300" />
        ) : (
          <VolumeX size={16} className="text-red-500" />
        )}
      </button>

      {/* Wi-Fi Connection Indicator */}
      <button
        onClick={() => onSelectItem('wifi')}
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
          focusedItem === 'wifi'
            ? 'bg-neutral-800 text-white shadow-[0_0_20px_rgba(208,15,31,0.5)] ring-1 ring-red-500 scale-105'
            : 'text-neutral-300 hover:bg-white/5 hover:text-white'
        }`}
        title="Wi-Fi Network Settings (Intent: android.settings.WIFI_SETTINGS)"
        aria-label="Wi-Fi Connection"
      >
        <Wifi
          size={16}
          className={systemState.wifiConnected ? 'text-neutral-100' : 'text-red-500'}
        />
        <span className="hidden sm:inline text-xs font-medium tracking-tight text-neutral-300 group-hover:text-white">
          {systemState.wifiSsid}
        </span>
        {focusedItem === 'wifi' && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping absolute -top-0.5 -right-0.5" />
        )}
      </button>

      {/* Input Shortcut (HDMI / TV Input) */}
      <button
        onClick={() => onSelectItem('inputs')}
        className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
          focusedItem === 'inputs'
            ? 'bg-neutral-800 text-white shadow-[0_0_20px_rgba(208,15,31,0.5)] ring-1 ring-red-500 scale-105'
            : 'text-neutral-300 hover:bg-white/5 hover:text-white'
        }`}
        title="TV Inputs / HDMI Selector (Intent: android.media.tv.action.VIEW_INPUTS)"
        aria-label="TV Inputs"
      >
        <Tv size={16} className="text-neutral-300 group-hover:text-red-400" />
        <span className="hidden md:inline text-xs font-medium tracking-tight text-neutral-300">
          {systemState.activeInput}
        </span>
      </button>

      {/* Android TV Settings Shortcut */}
      <button
        onClick={() => onSelectItem('settings')}
        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
          focusedItem === 'settings'
            ? 'bg-neutral-800 text-white shadow-[0_0_20px_rgba(208,15,31,0.5)] ring-1 ring-red-500 scale-105'
            : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
        }`}
        title="System Settings (Intent: android.settings.SETTINGS)"
        aria-label="System Settings"
      >
        <Settings size={17} className="text-neutral-300" />
      </button>

      {/* Native Android Project & APK Exporter */}
      <button
        onClick={() => onSelectItem('export')}
        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
          focusedItem === 'export'
            ? 'bg-neutral-800 text-white shadow-[0_0_20px_rgba(208,15,31,0.5)] ring-1 ring-red-500 scale-105'
            : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
        }`}
        title="View Kotlin Project & Android Manifest"
        aria-label="Native Android Studio Project"
      >
        <Code2 size={17} className="text-red-400" />
      </button>

      {/* Virtual TV Remote Toggle */}
      <button
        onClick={() => onSelectItem('remote_toggle')}
        className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
          focusedItem === 'remote_toggle' || systemState.remoteWidgetOpen
            ? 'bg-red-950/70 text-red-300 shadow-[0_0_15px_rgba(208,15,31,0.4)] ring-1 ring-red-500/80'
            : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
        }`}
        title="Toggle On-Screen TV Remote"
        aria-label="Remote Controller"
      >
        <Gamepad size={17} />
      </button>
    </div>
  );
};
