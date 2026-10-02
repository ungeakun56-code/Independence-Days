import React from 'react';
import { Volume2, BookOpen, Sparkles, Languages, CheckCircle2, Mic } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPlayingGlobal: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isPlayingGlobal,
}) => {
  const tabs = [
    { id: 'reader', label: 'Story Reader & Audio', icon: BookOpen },
    { id: 'grammar', label: 'Past Tense & Structure', icon: CheckCircle2 },
    { id: 'vocabulary', label: 'Vocabulary & Cards', icon: Languages },
    { id: 'speaking', label: 'Pronunciation Studio', icon: Mic },
    { id: 'quiz', label: 'Comprehension Quiz', icon: Sparkles },
    { id: 'tts-studio', label: 'Custom TTS Lab', icon: Volume2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-red-100 shadow-xs">
      {/* Top Banner with Indonesian Red & White Independence Day Motif */}
      <div className="bg-linear-to-r from-red-600 via-red-500 to-rose-600 text-white text-xs sm:text-sm font-medium py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-white font-bold tracking-wider text-[11px]">
              🇮🇩 HUT RI 17 AGUSTUS
            </span>
            <span className="hidden sm:inline text-red-50">
              Indonesian Independence Day Recount Text • English Learning Hub
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 bg-red-700/80 px-2.5 py-0.5 rounded-full border border-red-400/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Powered by <span className="font-semibold text-white">gemini-3.8-flash-tts</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-500/20 shrink-0">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                August 17th Parade
              </h1>
              <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                Grade 8 SMP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive Audio Story & Recount Text Lab with AI Voice Narration
            </p>
          </div>
        </div>

        {/* Global audio status indicator */}
        {isPlayingGlobal && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-medium self-start md:self-auto shadow-xs">
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-emerald-600 rounded-full animate-sound-wave-1"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-sound-wave-2"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-sound-wave-3"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-sound-wave-4"></span>
            </div>
            <span>Speaking with Gemini TTS...</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-6xl mx-auto px-4 flex gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm shadow-red-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
