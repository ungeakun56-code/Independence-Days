import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Settings2,
  Languages,
  BookMarked,
  Sparkles,
  Info,
  Check,
  Loader2,
  ArrowRight
} from 'lucide-react';
import {
  STORY_SENTENCES,
  FULL_STORY_TEXT,
  PARADE_IMAGE,
  VOICE_OPTIONS,
  STYLE_OPTIONS,
  SentenceItem
} from '../data/storyData';
import { fetchGeminiTTS, playAudioData, stopAudio, fallbackSpeech } from '../utils/audioPlayer';

interface StoryReaderProps {
  onNavigateToTab: (tab: string, sentenceId?: number) => void;
  selectedSentenceId: number;
  setSelectedSentenceId: (id: number) => void;
  onAudioStateChange: (isPlaying: boolean) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  onNavigateToTab,
  selectedSentenceId,
  setSelectedSentenceId,
  onAudioStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isContinuousPlay, setIsContinuousPlay] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_OPTIONS[0].id);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [highlightVerbs, setHighlightVerbs] = useState<boolean>(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isContinuousRef = useRef<boolean>(isContinuousPlay);
  isContinuousRef.current = isContinuousPlay;

  const currentSentence = STORY_SENTENCES[selectedSentenceId] || STORY_SENTENCES[0];

  useEffect(() => {
    return () => {
      stopAudio();
      onAudioStateChange(false);
    };
  }, [onAudioStateChange]);

  // Play audio for a specific sentence by index
  const playSentenceAudio = async (sentenceIndex: number, continueAfter: boolean = false) => {
    stopAudio();
    setIsPlaying(true);
    setIsLoadingAudio(true);
    onAudioStateChange(true);
    setStatusMessage(`Synthesizing sentence ${sentenceIndex + 1} with gemini-3.8-flash-tts...`);

    const sentence = STORY_SENTENCES[sentenceIndex];
    if (!sentence) {
      setIsPlaying(false);
      setIsLoadingAudio(false);
      onAudioStateChange(false);
      return;
    }

    try {
      const audioUrl = await fetchGeminiTTS(sentence.text, selectedVoice, selectedStyle);
      setIsLoadingAudio(false);
      setStatusMessage('');

      const audio = playAudioData(audioUrl, playbackSpeed, () => {
        if (continueAfter && isContinuousRef.current && sentenceIndex < STORY_SENTENCES.length - 1) {
          const nextIndex = sentenceIndex + 1;
          setSelectedSentenceId(nextIndex);
          // small natural pause between sentences
          setTimeout(() => {
            playSentenceAudio(nextIndex, true);
          }, 450);
        } else {
          setIsPlaying(false);
          onAudioStateChange(false);
        }
      });
      currentAudioRef.current = audio;
    } catch (err: any) {
      console.warn('TTS API error, falling back to speech synthesis:', err);
      setIsLoadingAudio(false);
      setStatusMessage('Using local audio engine fallback...');
      fallbackSpeech(sentence.text, playbackSpeed, () => {
        if (continueAfter && isContinuousRef.current && sentenceIndex < STORY_SENTENCES.length - 1) {
          const nextIndex = sentenceIndex + 1;
          setSelectedSentenceId(nextIndex);
          setTimeout(() => {
            playSentenceAudio(nextIndex, true);
          }, 450);
        } else {
          setIsPlaying(false);
          onAudioStateChange(false);
          setStatusMessage('');
        }
      });
    }
  };

  // Play full story as one unified narrative
  const handlePlayFullStory = async () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
      onAudioStateChange(false);
      return;
    }

    if (isContinuousPlay) {
      // play sentence by sentence so highlighting tracks live
      playSentenceAudio(selectedSentenceId, true);
    } else {
      // Unary full text
      stopAudio();
      setIsPlaying(true);
      setIsLoadingAudio(true);
      onAudioStateChange(true);
      setStatusMessage('Synthesizing full recount story with gemini-3.8-flash-tts...');

      try {
        const audioUrl = await fetchGeminiTTS(FULL_STORY_TEXT, selectedVoice, selectedStyle);
        setIsLoadingAudio(false);
        setStatusMessage('');
        const audio = playAudioData(audioUrl, playbackSpeed, () => {
          setIsPlaying(false);
          onAudioStateChange(false);
        });
        currentAudioRef.current = audio;
      } catch (err) {
        setIsLoadingAudio(false);
        fallbackSpeech(FULL_STORY_TEXT, playbackSpeed, () => {
          setIsPlaying(false);
          onAudioStateChange(false);
        });
      }
    }
  };

  const handleStop = () => {
    stopAudio();
    setIsPlaying(false);
    setIsLoadingAudio(false);
    onAudioStateChange(false);
    setStatusMessage('');
  };

  const handleSelectSentence = (id: number) => {
    setSelectedSentenceId(id);
    playSentenceAudio(id, false);
  };

  const handleNext = () => {
    if (selectedSentenceId < STORY_SENTENCES.length - 1) {
      const next = selectedSentenceId + 1;
      setSelectedSentenceId(next);
      if (isPlaying) playSentenceAudio(next, isContinuousPlay);
    }
  };

  const handlePrev = () => {
    if (selectedSentenceId > 0) {
      const prev = selectedSentenceId - 1;
      setSelectedSentenceId(prev);
      if (isPlaying) playSentenceAudio(prev, isContinuousPlay);
    }
  };

  // Play a single vocabulary word or short phrase
  const handlePlayTerm = async (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const audioUrl = await fetchGeminiTTS(term, selectedVoice, 'Clear, isolated pronunciation for language learners');
      playAudioData(audioUrl, 0.95);
    } catch {
      fallbackSpeech(term, 0.9);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Visual Card with Generated Parade Illustration */}
      <div className="relative rounded-3xl overflow-hidden border border-red-100 shadow-lg bg-linear-to-r from-red-600 via-rose-600 to-red-700 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Illustration on left/top */}
          <div className="lg:col-span-6 relative aspect-16/9 lg:aspect-auto lg:h-full overflow-hidden bg-slate-900">
            <img
              src={PARADE_IMAGE}
              alt="Indonesian August 17th Parade"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent lg:hidden" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs px-2.5 py-1 rounded-full font-semibold shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              Pawai Kemerdekaan 17 Agustus
            </div>
          </div>

          {/* Hero text & Quick Listen */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                  English Recount Text
                </span>
                <span className="bg-red-900/60 text-red-100 text-xs font-medium px-2.5 py-1 rounded-full border border-red-300/30">
                  Past Tense (V2) Focus
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                "Last August 17th, I went to a parade..."
              </h2>
              <p className="text-red-100 text-sm sm:text-base leading-relaxed mb-6">
                Listen, read along, and practice this classic Indonesian Independence Day recount story.
                Experience real-time speech narration powered by Google's <span className="font-semibold underline decoration-white/50">gemini-3.8-flash-tts</span> model.
              </p>
            </div>

            {/* Quick Hero Play Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/20">
              <button
                onClick={handlePlayFullStory}
                disabled={isLoadingAudio}
                className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 active:scale-95 px-5 py-2.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
              >
                {isLoadingAudio ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-red-600" />
                ) : (
                  <Play className="w-4 h-4 fill-red-600" />
                )}
                <span>{isPlaying ? 'Pause Narration' : 'Listen to Full Story'}</span>
              </button>

              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3.5 py-2.5 rounded-2xl text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer"
                title="Stop audio"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-red-100 ml-auto">
                <span className="text-white/80">Voice:</span>
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                  {selectedVoice} (Gemini TTS)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio & Display Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Playback Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={selectedSentenceId === 0}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Sentence"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => playSentenceAudio(selectedSentenceId, isContinuousPlay)}
              disabled={isLoadingAudio}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm shadow-xs transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isPlaying ? 'Pause' : `Play Sentence ${selectedSentenceId + 1}`}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={selectedSentenceId === STORY_SENTENCES.length - 1}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Sentence"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Sentence {selectedSentenceId + 1} of {STORY_SENTENCES.length}
            </span>
          </div>

          {/* Voice, Persona & Speed Settings */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Continuous Autoplay Mode Toggle */}
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={isContinuousPlay}
                onChange={(e) => setIsContinuousPlay(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500 accent-red-600"
              />
              <span>Autoplay All Sentences</span>
            </label>

            {/* Voice Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Voice:</span>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  if (isPlaying) {
                    stopAudio();
                    setIsPlaying(false);
                    onAudioStateChange(false);
                  }
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {VOICE_OPTIONS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.gender} - {v.description.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Style Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Style:</span>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer max-w-[150px] truncate"
              >
                {STYLE_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Speed Pill */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[0.75, 1.0, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-white text-red-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View toggles & status */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                showTranslation
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{showTranslation ? 'Bilingual ID ON' : 'Show Indonesian'}</span>
            </button>

            <button
              onClick={() => setHighlightVerbs(!highlightVerbs)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                highlightVerbs
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>{highlightVerbs ? 'Past Verbs (V2) Highlighted' : 'Highlight Verbs'}</span>
            </button>
          </div>

          {statusMessage && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Story Interactive Sentences List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sentence Stream (Interactive Read-Along) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>Read-Along Sentences</span>
              <span className="text-xs font-normal normal-case text-slate-500">
                (Click any sentence to listen)
              </span>
            </h3>
            <span className="text-xs text-slate-400">9 Sentences total</span>
          </div>

          <div className="space-y-2.5">
            {STORY_SENTENCES.map((sentence) => {
              const isSelected = selectedSentenceId === sentence.id;
              const isCurrentlyReading = isSelected && isPlaying;

              return (
                <div
                  key={sentence.id}
                  onClick={() => handleSelectSentence(sentence.id)}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-50/70 border-red-300 shadow-sm ring-2 ring-red-500/20'
                      : 'bg-white border-slate-200 hover:border-red-200 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Sentence Number Badge */}
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-700'
                        }`}
                      >
                        {sentence.id + 1}
                      </span>

                      {/* Text & Highlighted Verbs */}
                      <div>
                        <p className={`text-base sm:text-lg font-medium leading-relaxed ${
                          isSelected ? 'text-slate-900 font-semibold' : 'text-slate-700'
                        }`}>
                          {highlightVerbs ? (
                            renderHighlightedSentence(sentence)
                          ) : (
                            sentence.text
                          )}
                        </p>

                        {/* Translation */}
                        {showTranslation && (
                          <p className="mt-1 text-xs sm:text-sm text-slate-500 italic">
                            {sentence.translation}
                          </p>
                        )}

                        {/* Structure Tag */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              sentence.section === 'Orientation'
                                ? 'bg-blue-100 text-blue-700'
                                : sentence.section === 'Re-orientation'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {sentence.section}
                          </span>

                          {sentence.timeReference && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                              ⏰ {sentence.timeReference}
                            </span>
                          )}

                          {sentence.verbs.map((v) => (
                            <span
                              key={v.word}
                              className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-md"
                            >
                              V2: {v.word} ({v.base})
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Listen Icon Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSentence(sentence.id);
                      }}
                      className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                        isCurrentlyReading
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-600'
                      }`}
                      title="Speak with Gemini TTS"
                    >
                      {isCurrentlyReading ? (
                        <div className="flex items-end gap-0.5 h-3.5 w-3.5 justify-center">
                          <span className="w-0.5 bg-white rounded-full animate-sound-wave-1"></span>
                          <span className="w-0.5 bg-white rounded-full animate-sound-wave-2"></span>
                          <span className="w-0.5 bg-white rounded-full animate-sound-wave-3"></span>
                        </div>
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Deep Inspector for Selected Sentence */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-28 bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
                  #{currentSentence.id + 1}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sentence Inspector</h4>
                  <p className="text-xs text-slate-500">{currentSentence.sectionLabel}</p>
                </div>
              </div>

              <button
                onClick={() => playSentenceAudio(currentSentence.id, false)}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear AI Voice</span>
              </button>
            </div>

            {/* Sentence Spotlight */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
              <p className="text-slate-900 font-semibold text-base leading-relaxed">
                "{currentSentence.text}"
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-1.5 italic">
                "{currentSentence.translation}"
              </p>
            </div>

            {/* Recount Text Role */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Recount Text Function
              </label>
              <div className="p-3 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                {currentSentence.section === 'Orientation' && (
                  <p>
                    <strong>Orientation:</strong> Introduces the background setting—who was involved (I and my family), when it occurred (Last August 17th), and what they did (went to a parade).
                  </p>
                )}
                {currentSentence.section === 'Event' && (
                  <p>
                    <strong>Chronological Event:</strong> Recounts one of the steps or observations during the festival day in chronological sequence using past tense verbs.
                  </p>
                )}
                {currentSentence.section === 'Re-orientation' && (
                  <p>
                    <strong>Re-orientation:</strong> Concluding personal evaluation or emotional impression summarizing the narrator's happy experience ("It was a wonderful day").
                  </p>
                )}
              </div>
            </div>

            {/* Past Tense Verbs in this Sentence */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Simple Past Verbs (Verb 2)
              </label>
              <div className="space-y-2">
                {currentSentence.verbs.map((verb) => (
                  <div
                    key={verb.word}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-amber-900 text-sm">{verb.word}</span>
                        <span className="text-amber-700 text-xs">← base: <strong className="font-semibold">{verb.base}</strong></span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                          {verb.type}
                        </span>
                      </div>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        IPA Sound: <code className="font-mono bg-white/70 px-1 rounded">{verb.phonetic}</code>
                      </p>
                    </div>

                    <button
                      onClick={(e) => handlePlayTerm(verb.word, e)}
                      className="p-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 transition-colors cursor-pointer"
                      title={`Listen to pronunciation of '${verb.word}'`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Vocabulary Chips */}
            {currentSentence.vocabulary.length > 0 && (
              <div className="mb-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Key Vocabulary
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentSentence.vocabulary.map((vocab) => (
                    <button
                      key={vocab.term}
                      onClick={(e) => handlePlayTerm(vocab.term, e)}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer group"
                    >
                      <Volume2 className="w-3 h-3 text-slate-400 group-hover:text-red-500" />
                      <span>{vocab.term}</span>
                      <span className="text-slate-400 font-normal">({vocab.meaning})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Note */}
            {currentSentence.culturalNote && (
              <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-900 leading-relaxed mb-4">
                <span className="font-bold flex items-center gap-1 mb-1 text-red-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  Cultural Note:
                </span>
                {currentSentence.culturalNote}
              </div>
            )}

            {/* Jump to Pronunciation Studio Button */}
            <button
              onClick={() => onNavigateToTab('speaking', currentSentence.id)}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>Practice Pronouncing This Sentence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper: Highlight past verbs within sentence text
function renderHighlightedSentence(sentence: SentenceItem) {
  const words = sentence.text.split(/(\s+)/);
  const verbWords = sentence.verbs.map((v) => v.word.toLowerCase());

  return words.map((chunk, idx) => {
    const cleanWord = chunk.toLowerCase().replace(/[^a-z]/g, '');
    const matchedVerb = sentence.verbs.find((v) => v.word.toLowerCase() === cleanWord);

    if (matchedVerb) {
      return (
        <span
          key={idx}
          className="relative inline-block bg-amber-200/90 text-amber-950 font-bold px-1.5 py-0.5 rounded-md mx-0.5 border border-amber-300 shadow-2xs group/verb"
          title={`Past Tense (V2) of '${matchedVerb.base}' - ${matchedVerb.type}`}
        >
          {chunk}
          <span className="text-[10px] text-amber-800 ml-0.5 font-normal">
            ({matchedVerb.base})
          </span>
        </span>
      );
    }
    return <span key={idx}>{chunk}</span>;
  });
}
