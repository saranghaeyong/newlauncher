export interface TvApp {
  id: string;
  name: string;
  packageName: string;
  activityName?: string;
  category: 'entertainment' | 'streaming' | 'gaming' | 'utility' | 'system';
  accentColor: string;
  iconName: string;
  customIconUrl?: string;
  badge?: string;
  description: string;
  isFavorite: boolean;
  version?: string;
}

export type FocusZone = 'top_bar' | 'main_dock' | 'all_apps_grid' | 'modal';

export type TopBarItem = 'clock' | 'wifi' | 'inputs' | 'settings' | 'export' | 'remote_toggle';

export interface TvSystemState {
  wifiConnected: boolean;
  wifiSsid: string;
  wifiSignalStrength: number; // 1-4
  activeInput: string;
  availableInputs: { id: string; name: string; label: string; active: boolean }[];
  soundEnabled: boolean;
  ambientGlowLevel: number; // 0 to 100
  timeFormat24h: boolean;
  showSeconds: boolean;
  activeAppId: string | null;
  settingsOpen: boolean;
  wifiModalOpen: boolean;
  inputsModalOpen: boolean;
  exportModalOpen: boolean;
  remoteWidgetOpen: boolean;
  allAppsExpanded: boolean;
}
