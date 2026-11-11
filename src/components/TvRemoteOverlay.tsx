import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Undo2,
  Home,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  X,
  Keyboard,
} from 'lucide-react';

interface TvRemoteOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'home') => void;
}

export const TvRemoteOverlay: React.FC<TvRemoteOverlayProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
      {/* Remote Chassis */}
      <div className="w-56 bg-neutral-900/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-red-500/20">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-neutral-300">
              TV Remote
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyboardHint(!showKeyboardHint)}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Keyboard Shortcuts"
            >
              <Keyboard size={13} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Keyboard shortcut banner */}
        {showKeyboardHint && (
          <div className="mb-3 p-2 rounded-xl bg-neutral-950 text-[10px] text-neutral-400 space-y-1 border border-neutral-800">
            <div><strong className="text-white">Arrows:</strong> D-Pad Direction</div>
            <div><strong className="text-white">Enter:</strong> OK / Launch</div>
            <div><strong className="text-white">Esc/Bksp:</strong> Back</div>
            <div><strong className="text-white">H:</strong> Home Dock</div>
          </div>
        )}

        {/* D-Pad Circular Ring */}
        <div className="relative w-40 h-40 mx-auto my-2 rounded-full bg-neutral-950 border border-neutral-800 shadow-inner flex items-center justify-center">
          {/* UP button */}
          <button
            onClick={() => onNavigate('up')}
            className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-10 flex items-center justify-center text-neutral-400 hover:text-white active:text-red-500 active:scale-95 transition-all"
            aria-label="D-Pad Up"
          >
            <ChevronUp size={22} />
          </button>

          {/* DOWN button */}
          <button
            onClick={() => onNavigate('down')}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-10 flex items-center justify-center text-neutral-400 hover:text-white active:text-red-500 active:scale-95 transition-all"
            aria-label="D-Pad Down"
          >
            <ChevronDown size={22} />
          </button>

          {/* LEFT button */}
          <button
            onClick={() => onNavigate('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-12 flex items-center justify-center text-neutral-400 hover:text-white active:text-red-500 active:scale-95 transition-all"
            aria-label="D-Pad Left"
          >
            <ChevronLeft size={22} />
          </button>

          {/* RIGHT button */}
          <button
            onClick={() => onNavigate('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-12 flex items-center justify-center text-neutral-400 hover:text-white active:text-red-500 active:scale-95 transition-all"
            aria-label="D-Pad Right"
          >
            <ChevronRight size={22} />
          </button>

          {/* Center OK button */}
          <button
            onClick={() => onNavigate('select')}
            className="w-16 h-16 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 hover:border-red-500 hover:shadow-[0_0_15px_rgba(208,15,31,0.5)] active:scale-90 transition-all flex flex-col items-center justify-center shadow-lg group"
            aria-label="OK Center Button"
          >
            <span className="text-xs font-bold tracking-wider text-neutral-200 group-hover:text-red-400">
              OK
            </span>
          </button>
        </div>

        {/* Function Keys Row: BACK & HOME */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => onNavigate('back')}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition-all text-xs font-medium"
            aria-label="TV Back"
          >
            <Undo2 size={14} className="text-red-500" />
            <span>BACK</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 active:scale-95 transition-all text-xs font-medium"
            aria-label="TV Home"
          >
            <Home size={14} className="text-neutral-300" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
