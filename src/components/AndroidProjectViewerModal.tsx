import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  FileCode,
  Download,
  Copy,
  Check,
  X,
  Terminal,
  FolderArchive,
  Layers,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_STUDIO_PROJECT_FILES } from '../data/androidProjectFiles';

interface AndroidProjectViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidProjectViewerModal: React.FC<AndroidProjectViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFileKey, setSelectedFileKey] = useState<string>('manifest');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const currentFile = ANDROID_STUDIO_PROJECT_FILES[selectedFileKey] || ANDROID_STUDIO_PROJECT_FILES['manifest'];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('DeadpoolHome-AndroidTV') || zip;

      // Add all project files into the zip structure
      Object.values(ANDROID_STUDIO_PROJECT_FILES).forEach((file) => {
        rootFolder.file(file.path, file.content);
      });

      // Add README with APK build and ADB install commands
      rootFolder.file(
        'README.md',
        `# DEADPOOL HOME — Minimal Android TV Launcher
A premium single-homescreen Android TV launcher engineered in Kotlin.

## Features
- Single AMOLED black homescreen (#050505) with signature Deadpool crimson accents
- Floating circular glass application bubbles with smooth D-pad remote enlargement
- Leanback Launcher & Android TV Home intent filters
- Real-time digital clock and calendar integration
- System shortcuts (Wi-Fi, Settings, TV HDMI inputs)
- Expandable All-Apps in-place glass grid

## Building the Release APK
1. Open this directory in Android Studio (Jellyfish / Koala or newer).
2. Or build directly from command line:
   \`\`\`bash
   chmod +x gradlew
   ./gradlew assembleRelease
   \`\`\`
   Output APK located at:
   \`app/build/outputs/apk/release/app-release.apk\`

## Installing on Android TV via ADB
1. Enable Developer Options & Network/USB Debugging on your Android TV.
2. Connect to your TV:
   \`\`\`bash
   adb connect <TV_IP_ADDRESS>:5555
   adb install -r app/build/outputs/apk/release/app-release.apk
   \`\`\`
3. Press the Home button on your TV remote and choose DEADPOOL HOME as Always.
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'DeadpoolHome-AndroidTV-Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="w-full max-w-5xl h-[620px] rounded-3xl bg-neutral-900 border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-5 border-b border-white/8 bg-neutral-950/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                <Code2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Native Android Studio Project (Kotlin)
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-500/30">
                    Android 9 to 14+
                  </span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Production Android TV Launcher codebase with HOME and LEANBACK_LAUNCHER filters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <Download size={14} className={isZipping ? 'animate-bounce' : ''} />
                <span>{isZipping ? 'Packaging ZIP...' : 'Download Project (.ZIP)'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Body: File Selector & Code Display */}
          <div className="flex-1 flex overflow-hidden">
            {/* File List */}
            <div className="w-72 bg-neutral-950 p-4 border-r border-white/5 overflow-y-auto no-scrollbar space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1 mb-1">
                Source Files
              </div>
              {Object.entries(ANDROID_STUDIO_PROJECT_FILES).map(([key, file]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFileKey(key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono transition-all text-left truncate ${
                    selectedFileKey === key
                      ? 'bg-neutral-800 text-red-400 font-semibold border border-red-500/30'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode size={14} className={selectedFileKey === key ? 'text-red-400' : 'text-neutral-500'} />
                  <span className="truncate">{file.title}</span>
                </button>
              ))}

              <div className="pt-4 mt-4 border-t border-white/5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1 mb-1">
                  Release APK Guide
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono space-y-1.5">
                  <div className="text-white font-semibold flex items-center gap-1">
                    <Terminal size={12} className="text-red-400" />
                    Build APK:
                  </div>
                  <div className="text-neutral-300">./gradlew assembleRelease</div>
                  <div className="text-white font-semibold mt-2 flex items-center gap-1">
                    <Terminal size={12} className="text-red-400" />
                    Install onto TV:
                  </div>
                  <div className="text-neutral-300">adb install -r app-release.apk</div>
                </div>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 flex flex-col bg-neutral-950/40">
              <div className="flex items-center justify-between px-6 py-2.5 bg-neutral-950 border-b border-white/5 text-xs text-neutral-400 font-mono">
                <span>{currentFile.path}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex-1 p-6 overflow-auto font-mono text-xs text-neutral-200 leading-relaxed bg-[#060608]">
                <pre>{currentFile.content}</pre>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
