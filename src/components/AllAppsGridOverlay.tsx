import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TvApp } from '../types/launcher';
import { AppIcon } from './AppIcon';
import { Search, Plus, X, ArrowUp, Sparkles, Star } from 'lucide-react';

interface AllAppsGridOverlayProps {
  isOpen: boolean;
  apps: TvApp[];
  onClose: () => void;
  onSelectApp: (app: TvApp) => void;
  onAddNewApp: (newApp: TvApp) => void;
  onToggleFavorite: (appId: string) => void;
}

export const AllAppsGridOverlay: React.FC<AllAppsGridOverlayProps> = ({
  isOpen,
  apps,
  onClose,
  onSelectApp,
  onAddNewApp,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [focusedGridIndex, setFocusedGridIndex] = useState<number>(0);
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);

  // Form for custom app
  const [customName, setCustomName] = useState('');
  const [customPackage, setCustomPackage] = useState('');
  const [customCategory, setCustomCategory] = useState<'streaming' | 'gaming' | 'utility' | 'entertainment'>('streaming');

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'all', label: 'All Apps' },
    { id: 'streaming', label: 'Streaming & Cinema' },
    { id: 'entertainment', label: 'Media & Audio' },
    { id: 'gaming', label: 'Games & Emulators' },
    { id: 'utility', label: 'Tools & System' },
  ];

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.packageName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle D-pad navigation within the overlay
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAddAppModalOpen) return;

      const columns = 4; // grid columns on typical TV layout
      const totalItems = filteredApps.length + 1; // +1 for "Add App" button

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedGridIndex((prev) => Math.min(totalItems - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedGridIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedGridIndex((prev) => Math.min(totalItems - 1, prev + columns));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (focusedGridIndex < columns) {
          // If on the top row and pressing up, return to dock!
          onClose();
        } else {
          setFocusedGridIndex((prev) => Math.max(0, prev - columns));
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedGridIndex === filteredApps.length) {
          setIsAddAppModalOpen(true);
        } else if (filteredApps[focusedGridIndex]) {
          onSelectApp(filteredApps[focusedGridIndex]);
        }
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredApps, focusedGridIndex, isAddAppModalOpen, onClose, onSelectApp]);

  if (!isOpen) return null;

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPackage.trim()) return;

    const newApp: TvApp = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      packageName: customPackage.trim(),
      category: customCategory,
      accentColor: '#D00F1F',
      iconName: 'all_apps',
      description: `Installed TV application (${customPackage.trim()})`,
      isFavorite: true,
      version: '1.0.0',
    };

    onAddNewApp(newApp);
    setCustomName('');
    setCustomPackage('');
    setIsAddAppModalOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-2xl p-6 md:p-12 overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/8">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-white/10 text-neutral-300 hover:text-white transition-all text-xs font-medium"
            >
              <ArrowUp size={14} className="text-red-500 group-hover:-translate-y-0.5 transition-transform" />
              <span>Return to Dock</span>
              <kbd className="text-[10px] bg-neutral-800 text-neutral-400 px-1 rounded ml-1 font-mono">
                ESC
              </kbd>
            </button>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                All Applications
                <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-500/30">
                  {filteredApps.length} Installed
                </span>
              </h2>
            </div>
          </div>

          {/* Search Input & Action */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TV apps or packages..."
                className="w-48 md:w-64 pl-9 pr-4 py-1.5 rounded-full bg-neutral-900/90 border border-white/10 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsAddAppModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/90 hover:bg-red-600 text-white text-xs font-medium transition-all shadow-md"
            >
              <Plus size={14} />
              <span>Add Custom App</span>
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-md'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-y-auto no-scrollbar py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 pr-2"
        >
          {filteredApps.map((app, index) => {
            const isFocused = focusedGridIndex === index;

            return (
              <motion.button
                key={app.id}
                onClick={() => onSelectApp(app)}
                onMouseEnter={() => setFocusedGridIndex(index)}
                whileHover={{ scale: 1.03 }}
                animate={{
                  scale: isFocused ? 1.04 : 1,
                }}
                className={`group relative text-left p-4 rounded-2xl transition-all duration-200 flex items-start gap-4 cursor-pointer outline-hidden ${
                  isFocused
                    ? 'bg-neutral-850/90 border border-red-500/80 shadow-[0_0_25px_rgba(208,15,31,0.4)]'
                    : 'bg-neutral-900/40 hover:bg-neutral-850/60 border border-white/6 hover:border-white/15'
                }`}
              >
                {/* App Circular Icon */}
                <div
                  className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all ${
                    isFocused
                      ? 'bg-neutral-950 ring-2 ring-red-500 shadow-[0_0_15px_rgba(208,15,31,0.6)]'
                      : 'bg-neutral-900 border border-white/10'
                  }`}
                >
                  <AppIcon iconName={app.iconName} size={30} accentColor={app.accentColor} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-white tracking-tight truncate">
                      {app.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(app.id);
                      }}
                      className="text-neutral-500 hover:text-amber-400 p-1"
                      title={app.isFavorite ? 'Remove from Dock' : 'Pin to Dock'}
                    >
                      <Star
                        size={13}
                        className={app.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                      />
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                    {app.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono text-neutral-500 truncate">
                      {app.packageName}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* Add App Card in Grid */}
          <button
            onClick={() => setIsAddAppModalOpen(true)}
            onMouseEnter={() => setFocusedGridIndex(filteredApps.length)}
            className={`p-4 rounded-2xl border border-dashed transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
              focusedGridIndex === filteredApps.length
                ? 'border-red-500 bg-red-950/20 text-white shadow-[0_0_20px_rgba(208,15,31,0.3)]'
                : 'border-white/15 hover:border-white/30 text-neutral-400 hover:text-white bg-transparent'
            }`}
          >
            <div className="w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center">
              <Plus size={20} className="text-red-500" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-neutral-200">Add App Package</div>
              <div className="text-[11px] text-neutral-500">Register sideloaded or custom APK</div>
            </div>
          </button>
        </div>

        {/* Add App Modal */}
        <AnimatePresence>
          {isAddAppModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.94 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.94 }}
                className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={18} className="text-red-500" />
                    Add Application
                  </h3>
                  <button
                    onClick={() => setIsAddAppModalOpen(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateApp} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Application Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Smart YouTube TV"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Android Package Name (Leanback Intent)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. com.liskovsoft.videomanager"
                      value={customPackage}
                      onChange={(e) => setCustomPackage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white font-mono focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Category
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white focus:outline-hidden focus:border-red-500"
                    >
                      <option value="streaming">Streaming & Video</option>
                      <option value="entertainment">Media & Music</option>
                      <option value="gaming">Gaming & Emulation</option>
                      <option value="utility">Utility & Tools</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddAppModalOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white shadow-lg transition-colors"
                    >
                      Add to TV Launcher
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
