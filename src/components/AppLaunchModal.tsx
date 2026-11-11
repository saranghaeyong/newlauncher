import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TvApp } from '../types/launcher';
import { AppIcon } from './AppIcon';
import {
  Undo2,
  Maximize2,
  Tv,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AppLaunchModalProps {
  app: TvApp | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppLaunchModal: React.FC<AppLaunchModalProps> = ({
  app,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isOpen || !app) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col bg-[#050505] text-white overflow-hidden select-none"
      >
        {/* Top TV App Action Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-lg"
            >
              <Undo2 size={15} className="text-red-500" />
              <span>Return to DEADPOOL HOME</span>
              <kbd className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-mono">
                BACK / ESC
              </kbd>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-neutral-300">
                {app.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400 border border-neutral-800">
                v{app.version || '1.0.0'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <CheckCircle2 size={12} />
              LEANBACK_LAUNCHER INTENT ACTIVE
            </span>
          </div>
        </div>

        {/* Cinematic Main Body Display */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-8">
          {/* Ambient Lighting matching App Accent */}
          <div
            className="absolute -top-32 w-full max-w-4xl h-96 rounded-full blur-[140px] opacity-25 pointer-events-none"
            style={{ backgroundColor: app.accentColor }}
          />

          {/* App Branding & Preview Window */}
          <div className="relative z-10 w-full max-w-3xl rounded-3xl bg-neutral-900/80 border border-white/10 p-8 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center p-2 mb-4 ring-4 shadow-2xl transition-all"
              style={{
                backgroundColor: '#0a0a0c',
                boxShadow: `0 0 35px ${app.accentColor}40`,
                borderColor: app.accentColor,
              }}
            >
              <AppIcon iconName={app.iconName} size={52} accentColor={app.accentColor} />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
              {app.name}
            </h1>
            <p className="text-sm text-neutral-400 max-w-lg mb-6 leading-relaxed">
              {app.description}
            </p>

            {/* Android Intent Telemetry Panel */}
            <div className="w-full bg-neutral-950/90 rounded-2xl p-4 border border-neutral-800 text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Package Name:</span>
                <span className="text-red-400 font-semibold">{app.packageName}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Target Activity:</span>
                <span className="text-neutral-300 truncate max-w-xs">{app.activityName || 'Default'}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Intent Action:</span>
                <span className="text-neutral-300">android.intent.action.MAIN</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Category:</span>
                <span className="text-neutral-300">android.intent.category.LEANBACK_LAUNCHER</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Display Mode:</span>
                <span className="text-neutral-300">3840x2160 @ 60Hz HDR10+</span>
              </div>
            </div>

            {/* Simulated TV Action buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-xs tracking-wide text-white transition-all shadow-lg active:scale-95"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause TV Stream' : 'Resume Playback'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-all active:scale-95"
              >
                Exit to Launcher
              </button>
            </div>
          </div>
        </div>

        {/* TV Bottom Bar Indicator */}
        <div className="p-4 bg-neutral-950/90 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-500 px-8">
          <div className="flex items-center gap-2">
            <Tv size={14} className="text-red-500" />
            <span>Deadpool Leanback Host System · Android TV 14</span>
          </div>
          <div>Press TV Remote BACK to exit</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
