import React, { useState } from 'react';
import { Header } from './components/Header';
import { StoryReader } from './components/StoryReader';
import { GrammarInspector } from './components/GrammarInspector';
import { VocabularySection } from './components/VocabularySection';
import { SpeakingPractice } from './components/SpeakingPractice';
import { ComprehensionQuiz } from './components/ComprehensionQuiz';
import { CustomTTSStudio } from './components/CustomTTSStudio';
import { BookOpen, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('reader');
  const [selectedSentenceId, setSelectedSentenceId] = useState<number>(0);
  const [isPlayingGlobal, setIsPlayingGlobal] = useState<boolean>(false);

  const handleNavigateToTab = (tab: string, sentenceId?: number) => {
    setActiveTab(tab);
    if (sentenceId !== undefined) {
      setSelectedSentenceId(sentenceId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-red-500 selection:text-white">
      {/* Top Application Navigation & Model Badge */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isPlayingGlobal={isPlayingGlobal}
      />

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8">
        {activeTab === 'reader' && (
          <StoryReader
            onNavigateToTab={handleNavigateToTab}
            selectedSentenceId={selectedSentenceId}
            setSelectedSentenceId={setSelectedSentenceId}
            onAudioStateChange={setIsPlayingGlobal}
          />
        )}

        {activeTab === 'grammar' && (
          <GrammarInspector />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularySection />
        )}

        {activeTab === 'speaking' && (
          <SpeakingPractice initialSentenceId={selectedSentenceId} />
        )}

        {activeTab === 'quiz' && (
          <ComprehensionQuiz />
        )}

        {activeTab === 'tts-studio' && (
          <CustomTTSStudio />
        )}
      </main>

      {/* Educational Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
            <span className="font-bold text-slate-800">
              August 17th Parade Recount Text Learning Hub
            </span>
            <span className="hidden sm:inline">• SMP English Grade 8 Curriculum</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Indonesian English teachers and students</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
              gemini-3.8-flash-tts
            </span>
            <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
              gemini-3.8-flash
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
