import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, Tv, Check, Lock, X, RefreshCw } from 'lucide-react';
import { TvSystemState } from '../types/launcher';

interface WifiInputsModalProps {
  type: 'wifi' | 'inputs';
  isOpen: boolean;
  onClose: () => void;
  systemState: TvSystemState;
  onUpdateSystemState: (partial: Partial<TvSystemState>) => void;
}

export const WifiInputsModal: React.FC<WifiInputsModalProps> = ({
  type,
  isOpen,
  onClose,
  systemState,
  onUpdateSystemState,
}) => {
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const wifiNetworks = [
    { ssid: 'Deadpool_5G_Ultra', signal: 4, secured: true, current: true },
    { ssid: 'X-Mansion_Fiber_Guest', signal: 3, secured: true, current: false },
    { ssid: 'Stark_Industries_IoT', signal: 2, secured: true, current: false },
    { ssid: 'Chimichanga_Express', signal: 4, secured: false, current: false },
  ];

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 800);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-6"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="w-full max-w-lg rounded-3xl bg-neutral-900 border border-white/10 p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-4">
            <div className="flex items-center gap-2.5">
              {type === 'wifi' ? (
                <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Wifi size={16} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Tv size={16} />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {type === 'wifi' ? 'Wi-Fi Networks' : 'TV Video Inputs'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {type === 'wifi'
                    ? 'android.settings.WIFI_SETTINGS'
                    : 'android.media.tv.action.VIEW_INPUTS'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              <X size={16} />
            </button>
          </div>

          {/* Wi-Fi View */}
          {type === 'wifi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Available Networks</span>
                <button
                  onClick={handleScan}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                >
                  <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
                  <span>Scan</span>
                </button>
              </div>

              <div className="space-y-2">
                {wifiNetworks.map((net) => (
                  <button
                    key={net.ssid}
                    onClick={() => {
                      onUpdateSystemState({ wifiSsid: net.ssid, wifiConnected: true });
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                      systemState.wifiSsid === net.ssid
                        ? 'bg-neutral-800/80 border-red-500 shadow-md ring-1 ring-red-500/50'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wifi size={16} className={systemState.wifiSsid === net.ssid ? 'text-red-500' : 'text-neutral-400'} />
                      <div>
                        <div className="text-xs font-semibold text-white">{net.ssid}</div>
                        <div className="text-[10px] text-neutral-500">
                          {systemState.wifiSsid === net.ssid ? 'Connected · 5.8 GHz' : 'Saved Network'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {net.secured && <Lock size={12} className="text-neutral-500" />}
                      {systemState.wifiSsid === net.ssid && (
                        <Check size={16} className="text-red-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TV Inputs View */}
          {type === 'inputs' && (
            <div className="space-y-3">
              <span className="text-xs text-neutral-400 block mb-2">Select Hardware Video Source</span>
              {systemState.availableInputs.map((input) => (
                <button
                  key={input.id}
                  onClick={() => {
                    onUpdateSystemState({ activeInput: input.name });
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                    systemState.activeInput === input.name
                      ? 'bg-neutral-800/80 border-red-500 shadow-md ring-1 ring-red-500/50'
                      : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tv size={16} className={systemState.activeInput === input.name ? 'text-red-500' : 'text-neutral-400'} />
                    <div>
                      <div className="text-xs font-semibold text-white">{input.name}</div>
                      <div className="text-[10px] text-neutral-500">{input.label}</div>
                    </div>
                  </div>

                  {systemState.activeInput === input.name && (
                    <Check size={16} className="text-red-500" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/8 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white"
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
