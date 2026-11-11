import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Wifi,
  Tv,
  Volume2,
  VolumeX,
  Sliders,
  Info,
  Shield,
  Smartphone,
  Check,
  X,
  Flame,
  Sun,
  Monitor,
} from 'lucide-react';
import { TvSystemState } from '../types/launcher';

interface SystemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemState: TvSystemState;
  onUpdateSystemState: (partial: Partial<TvSystemState>) => void;
}

export const SystemSettingsModal: React.FC<SystemSettingsModalProps> = ({
  isOpen,
  onClose,
  systemState,
  onUpdateSystemState,
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'sound' | 'network' | 'about'>('display');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-6"
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl h-[560px] rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl flex overflow-hidden"
        >
          {/* Left Sidebar Menu */}
          <div className="w-64 bg-neutral-950/80 p-6 border-r border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-6 border-b border-white/10 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    TV Settings
                  </h3>
                  <p className="text-[10px] text-neutral-400">Android TV System</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {[
                  { id: 'display', label: 'Display & Ambient', icon: Monitor },
                  { id: 'sound', label: 'Sound & Audio', icon: Volume2 },
                  { id: 'network', label: 'Network & Wi-Fi', icon: Wifi },
                  { id: 'about', label: 'About Launcher', icon: Info },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-md font-semibold'
                          : 'text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <Flame size={14} className="text-red-500" />
              <span>Deadpool Home Edition</span>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="flex-1 p-8 overflow-y-auto no-scrollbar flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/8 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight capitalize">
                    {activeTab === 'display' && 'Display & Deadpool Ambient Glow'}
                    {activeTab === 'sound' && 'Sound & Tactile Feedback'}
                    {activeTab === 'network' && 'Network & Internet Connection'}
                    {activeTab === 'about' && 'About DEADPOOL HOME'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Configure preferences for this Android TV launcher
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'display' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold text-neutral-200 block mb-2">
                      Deadpool Crimson Ambient Glow Intensity ({systemState.ambientGlowLevel}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemState.ambientGlowLevel}
                      onChange={(e) =>
                        onUpdateSystemState({
                          ambientGlowLevel: Number(e.target.value),
                        })
                      }
                      className="w-full accent-red-600 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-neutral-500 mt-1">
                      <span>Pure Stealth (0%)</span>
                      <span>Balanced Cinematic (50%)</span>
                      <span>Maximum Effort (100%)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">
                          AMOLED Deep Black Canvas
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          True #050505 AMOLED black with zero backlighting bleed
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400">ACTIVE</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Clock Format</div>
                      <div className="text-[11px] text-neutral-400">
                        Toggle between 24-Hour (21:45) and 12-Hour (09:45 PM)
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSystemState({
                          timeFormat24h: !systemState.timeFormat24h,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white transition-colors"
                    >
                      {systemState.timeFormat24h ? '24-Hour' : '12-Hour AM/PM'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'sound' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Tactile Navigation Audio (Web Audio API)
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Authentic Apple TV style tick on remote D-pad navigation
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onUpdateSystemState({
                          soundEnabled: !systemState.soundEnabled,
                        })
                      }
                      className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        systemState.soundEnabled
                          ? 'bg-red-600 text-white'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {systemState.soundEnabled ? 'Enabled' : 'Muted'}
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5">
                    <div className="text-xs font-semibold text-white mb-1">
                      Audio Output Mode
                    </div>
                    <div className="text-[11px] text-neutral-400 mb-3">
                      Passthrough: Dolby Atmos / DTS-HD Master Audio via eARC
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      HDMI eARC Bitstream
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'network' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-2">
                    <div className="flex justify-between text-neutral-300">
                      <span>SSID:</span>
                      <span className="text-white font-bold">{systemState.wifiSsid}</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Frequency:</span>
                      <span className="text-white">5.8 GHz (Wi-Fi 6 AX)</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>Signal Strength:</span>
                      <span className="text-emerald-400">Excellent (-42 dBm)</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>IP Address:</span>
                      <span className="text-neutral-400">192.168.1.185</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-neutral-950/60 border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Application:</span>
                      <span className="text-white font-semibold">DEADPOOL HOME Launcher</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Android Target:</span>
                      <span className="text-white">Android 9 to Android 14+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Leanback Category:</span>
                      <span className="text-red-400 font-mono">android.intent.category.LEANBACK_LAUNCHER</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Default Home Filter:</span>
                      <span className="text-red-400 font-mono">android.intent.category.HOME</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Developer:</span>
                      <span className="text-neutral-300">Elite Android TV Engineering</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/8 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500">
                Press ESC or click Outside to return to Homescreen
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
              >
                Close Settings
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
