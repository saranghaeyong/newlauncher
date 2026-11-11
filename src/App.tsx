/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_INSTALLED_APPS } from './data/installedApps';
import { TvApp, FocusZone, TopBarItem, TvSystemState } from './types/launcher';
import { ClockWidget } from './components/ClockWidget';
import { SystemStatusBar } from './components/SystemStatusBar';
import { AppBubbleDock } from './components/AppBubbleDock';
import { AllAppsGridOverlay } from './components/AllAppsGridOverlay';
import { TvRemoteOverlay } from './components/TvRemoteOverlay';
import { AppLaunchModal } from './components/AppLaunchModal';
import { SystemSettingsModal } from './components/SystemSettingsModal';
import { WifiInputsModal } from './components/WifiInputsModal';
import { AndroidProjectViewerModal } from './components/AndroidProjectViewerModal';
import { tvAudio } from './utils/audio';

export default function App() {
  const [apps, setApps] = useState<TvApp[]>(INITIAL_INSTALLED_APPS);
  const [focusZone, setFocusZone] = useState<FocusZone>('main_dock');
  const [focusedDockIndex, setFocusedDockIndex] = useState<number>(0);
  const [focusedTopBarItem, setFocusedTopBarItem] = useState<TopBarItem | null>(null);

  const [activeApp, setActiveApp] = useState<TvApp | null>(null);
  const [activeWifiInputsType, setActiveWifiInputsType] = useState<'wifi' | 'inputs' | null>(null);

  const [systemState, setSystemState] = useState<TvSystemState>({
    wifiConnected: true,
    wifiSsid: 'Deadpool_5G_Ultra',
    wifiSignalStrength: 4,
    activeInput: 'HDMI 1 (PS5)',
    availableInputs: [
      { id: 'hdmi1', name: 'HDMI 1 (PS5)', label: 'PlayStation 5 · 4K 120Hz VRR', active: true },
      { id: 'hdmi2', name: 'HDMI 2 (eARC)', label: 'Sonos Arc Dolby Atmos Soundbar', active: false },
      { id: 'tuner', name: 'Live TV Tuner', label: 'Over-the-Air 4K ATSC 3.0 Broadcasts', active: false },
      { id: 'av', name: 'AV Component', label: 'Legacy Composite/Component Console', active: false },
    ],
    soundEnabled: true,
    ambientGlowLevel: 65,
    timeFormat24h: true,
    showSeconds: false,
    activeAppId: null,
    settingsOpen: false,
    wifiModalOpen: false,
    inputsModalOpen: false,
    exportModalOpen: false,
    remoteWidgetOpen: false,
    allAppsExpanded: false,
  });

  const updateSystemState = useCallback((partial: Partial<TvSystemState>) => {
    setSystemState((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleSound = useCallback(() => {
    const nextSound = !systemState.soundEnabled;
    tvAudio.enabled = nextSound;
    updateSystemState({ soundEnabled: nextSound });
    if (nextSound) tvAudio.playSelectConfirm();
  }, [systemState.soundEnabled, updateSystemState]);

  // Launch App handler
  const handleLaunchApp = useCallback((app: TvApp) => {
    tvAudio.playSelectConfirm();
    setActiveApp(app);
  }, []);

  // Top Bar item selection
  const handleSelectTopBarItem = useCallback((item: TopBarItem) => {
    tvAudio.playSelectConfirm();
    if (item === 'clock') {
      updateSystemState({ settingsOpen: true });
    } else if (item === 'wifi') {
      setActiveWifiInputsType('wifi');
    } else if (item === 'inputs') {
      setActiveWifiInputsType('inputs');
    } else if (item === 'settings') {
      updateSystemState({ settingsOpen: true });
    } else if (item === 'export') {
      updateSystemState({ exportModalOpen: true });
    } else if (item === 'remote_toggle') {
      updateSystemState({ remoteWidgetOpen: !systemState.remoteWidgetOpen });
    }
  }, [systemState.remoteWidgetOpen, updateSystemState]);

  // Unified Remote Navigator for both Keyboard and On-Screen TV Remote
  const handleRemoteNavigate = useCallback((direction: 'up' | 'down' | 'left' | 'right' | 'select' | 'back' | 'home') => {
    // If an app is launched in full-screen
    if (activeApp) {
      if (direction === 'back' || direction === 'home') {
        tvAudio.playBackDismiss();
        setActiveApp(null);
      }
      return;
    }

    // If a modal is open
    if (systemState.settingsOpen || activeWifiInputsType || systemState.exportModalOpen) {
      if (direction === 'back' || direction === 'home') {
        tvAudio.playBackDismiss();
        updateSystemState({
          settingsOpen: false,
          exportModalOpen: false,
        });
        setActiveWifiInputsType(null);
        setFocusZone('main_dock');
      }
      return;
    }

    // If All-Apps overlay is expanded
    if (systemState.allAppsExpanded) {
      if (direction === 'back' || direction === 'home') {
        tvAudio.playBackDismiss();
        updateSystemState({ allAppsExpanded: false });
        setFocusZone('main_dock');
      }
      return;
    }

    // MAIN HOMESCREEN D-PAD NAVIGATION
    if (direction === 'home') {
      tvAudio.playFocusTick();
      setFocusZone('main_dock');
      setFocusedTopBarItem(null);
      return;
    }

    if (focusZone === 'main_dock') {
      const totalDockItems = apps.length + 1; // apps + all_apps bubble

      if (direction === 'right') {
        if (focusedDockIndex < totalDockItems - 1) {
          tvAudio.playFocusTick();
          setFocusedDockIndex((prev) => prev + 1);
        } else {
          tvAudio.playEdgeThud();
        }
      } else if (direction === 'left') {
        if (focusedDockIndex > 0) {
          tvAudio.playFocusTick();
          setFocusedDockIndex((prev) => prev - 1);
        } else {
          tvAudio.playEdgeThud();
        }
      } else if (direction === 'up') {
        tvAudio.playFocusTick();
        setFocusZone('top_bar');
        setFocusedTopBarItem('settings');
      } else if (direction === 'down') {
        tvAudio.playSelectConfirm();
        updateSystemState({ allAppsExpanded: true });
        setFocusZone('all_apps_grid');
      } else if (direction === 'select') {
        if (focusedDockIndex === apps.length) {
          // Clicked "All Apps" bubble
          tvAudio.playSelectConfirm();
          updateSystemState({ allAppsExpanded: true });
          setFocusZone('all_apps_grid');
        } else if (apps[focusedDockIndex]) {
          handleLaunchApp(apps[focusedDockIndex]);
        }
      }
    } else if (focusZone === 'top_bar') {
      const topBarItems: TopBarItem[] = ['clock', 'wifi', 'inputs', 'settings', 'export', 'remote_toggle'];
      const currentIndex = topBarItems.indexOf(focusedTopBarItem || 'settings');

      if (direction === 'right') {
        tvAudio.playFocusTick();
        const nextIndex = Math.min(topBarItems.length - 1, currentIndex + 1);
        setFocusedTopBarItem(topBarItems[nextIndex]);
      } else if (direction === 'left') {
        tvAudio.playFocusTick();
        const prevIndex = Math.max(0, currentIndex - 1);
        setFocusedTopBarItem(topBarItems[prevIndex]);
      } else if (direction === 'down') {
        tvAudio.playFocusTick();
        setFocusZone('main_dock');
        setFocusedTopBarItem(null);
      } else if (direction === 'select') {
        if (focusedTopBarItem) {
          handleSelectTopBarItem(focusedTopBarItem);
        }
      } else if (direction === 'back') {
        tvAudio.playBackDismiss();
        setFocusZone('main_dock');
        setFocusedTopBarItem(null);
      }
    }
  }, [
    activeApp,
    systemState.settingsOpen,
    systemState.exportModalOpen,
    systemState.allAppsExpanded,
    activeWifiInputsType,
    focusZone,
    apps,
    focusedDockIndex,
    focusedTopBarItem,
    updateSystemState,
    handleLaunchApp,
    handleSelectTopBarItem,
  ]);

  // Global Keyboard listener for Android TV Remote keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a form input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          handleRemoteNavigate('right');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleRemoteNavigate('left');
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleRemoteNavigate('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleRemoteNavigate('down');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleRemoteNavigate('select');
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          handleRemoteNavigate('back');
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          handleRemoteNavigate('home');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRemoteNavigate]);

  const handleAddNewApp = (newApp: TvApp) => {
    setApps((prev) => [newApp, ...prev]);
    tvAudio.playSelectConfirm();
  };

  const handleToggleFavorite = (appId: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, isFavorite: !app.isFavorite } : app
      )
    );
    tvAudio.playFocusTick();
  };

  // Ambient Glow calculation
  const glowOpacity = (systemState.ambientGlowLevel / 100) * 0.45;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050505] text-[#F5F5F7] select-none flex flex-col justify-between font-sans">
      {/* 1. BACKGROUND LAYERS: Pure AMOLED Black, Subtle Carbon Texture, Dark Crimson Ambient Gradients */}
      {/* Background Image Texture */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center pointer-events-none opacity-40 mix-blend-screen"
        style={{
          backgroundImage: `url('/src/assets/images/deadpool_ambient_backdrop_1794381462684.jpg')`,
        }}
      />

      {/* Subtle Deadpool Carbon-Fiber Tactical Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle Deadpool Signature Crimson Ambient Lighting (Bottom & Top-Left Vignettes) */}
      <div
        className="absolute -bottom-40 inset-x-0 h-96 rounded-t-full blur-[140px] pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: '#D00F1F',
          opacity: glowOpacity,
        }}
      />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[160px] pointer-events-none transition-opacity duration-500"
        style={{
          backgroundColor: '#990000',
          opacity: glowOpacity * 0.7,
        }}
      />

      {/* 2. TOP ROW: Top Left Clock & Top Right System Status */}
      <header className="relative z-20 flex items-start justify-between p-6 md:p-10 lg:px-14">
        {/* Top Left: Large Live Digital Clock & Date */}
        <ClockWidget
          isFocused={focusZone === 'top_bar' && focusedTopBarItem === 'clock'}
          timeFormat24h={systemState.timeFormat24h}
          showSeconds={systemState.showSeconds}
          onSelect={() => {
            setFocusZone('top_bar');
            setFocusedTopBarItem('clock');
            handleSelectTopBarItem('clock');
          }}
        />

        {/* Top Right: Minimalist Glass System Status Bar */}
        <SystemStatusBar
          systemState={systemState}
          focusedItem={focusZone === 'top_bar' ? focusedTopBarItem : null}
          onSelectItem={(item) => {
            setFocusZone('top_bar');
            setFocusedTopBarItem(item);
            handleSelectTopBarItem(item);
          }}
          onToggleSound={toggleSound}
        />
      </header>

      {/* 3. CENTER: Single Horizontal App Bubble Dock (Centerpiece) */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-4">
        <AppBubbleDock
          apps={apps.filter((a) => a.isFavorite)}
          focusedIndex={focusedDockIndex}
          isDockFocused={focusZone === 'main_dock'}
          onSelectApp={handleLaunchApp}
          onOpenAllApps={() => {
            updateSystemState({ allAppsExpanded: true });
            setFocusZone('all_apps_grid');
          }}
          onFocusChange={(index) => {
            setFocusZone('main_dock');
            setFocusedDockIndex(index);
          }}
        />
      </main>

      {/* 4. BOTTOM BAR: Subtle Brand Signature & Live Input Info */}
      <footer className="relative z-20 flex items-center justify-between px-8 md:px-14 py-4 text-[11px] text-neutral-500 font-light">
        <div className="flex items-center gap-2 tracking-wider">
          <span className="font-extrabold text-neutral-300 tracking-widest text-[10px]">
            DEADPOOL
          </span>
          <span className="text-red-600 font-bold">·</span>
          <span>HOME</span>
          <span className="hidden sm:inline text-neutral-600">| Single Homescreen Android TV</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => updateSystemState({ remoteWidgetOpen: !systemState.remoteWidgetOpen })}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            <span>TV Remote {systemState.remoteWidgetOpen ? 'Active' : 'Widget'}</span>
          </button>
          <span className="text-neutral-600">·</span>
          <button
            onClick={() => updateSystemState({ exportModalOpen: true })}
            className="text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
          >
            Export Kotlin Project
          </button>
        </div>
      </footer>

      {/* 5. ALL APPS IN-PLACE GLASS GRID OVERLAY (Requirement 5) */}
      <AllAppsGridOverlay
        isOpen={systemState.allAppsExpanded}
        apps={apps}
        onClose={() => {
          tvAudio.playBackDismiss();
          updateSystemState({ allAppsExpanded: false });
          setFocusZone('main_dock');
        }}
        onSelectApp={(app) => {
          updateSystemState({ allAppsExpanded: false });
          handleLaunchApp(app);
        }}
        onAddNewApp={handleAddNewApp}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 6. TV APP LAUNCH MODAL (Simulated TV App Execution) */}
      <AppLaunchModal
        app={activeApp}
        isOpen={!!activeApp}
        onClose={() => {
          tvAudio.playBackDismiss();
          setActiveApp(null);
        }}
      />

      {/* 7. ANDROID TV SYSTEM SETTINGS MODAL */}
      <SystemSettingsModal
        isOpen={systemState.settingsOpen}
        onClose={() => {
          tvAudio.playBackDismiss();
          updateSystemState({ settingsOpen: false });
        }}
        systemState={systemState}
        onUpdateSystemState={updateSystemState}
      />

      {/* 8. WI-FI & TV INPUTS MODAL */}
      <WifiInputsModal
        type={activeWifiInputsType || 'wifi'}
        isOpen={!!activeWifiInputsType}
        onClose={() => {
          tvAudio.playBackDismiss();
          setActiveWifiInputsType(null);
        }}
        systemState={systemState}
        onUpdateSystemState={updateSystemState}
      />

      {/* 9. NATIVE KOTLIN ANDROID STUDIO PROJECT EXPORTER & BUILD GUIDE */}
      <AndroidProjectViewerModal
        isOpen={systemState.exportModalOpen}
        onClose={() => {
          tvAudio.playBackDismiss();
          updateSystemState({ exportModalOpen: false });
        }}
      />

      {/* 10. ON-SCREEN ANDROID TV REMOTE WIDGET */}
      <TvRemoteOverlay
        isOpen={systemState.remoteWidgetOpen}
        onClose={() => updateSystemState({ remoteWidgetOpen: false })}
        onNavigate={handleRemoteNavigate}
      />
    </div>
  );
}
