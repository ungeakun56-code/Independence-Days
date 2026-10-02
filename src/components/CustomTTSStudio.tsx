import React, { useState } from 'react';
import {
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Loader2,
  Copy,
  Check,
  Languages
} from 'lucide-react';
import { VOICE_OPTIONS, STYLE_OPTIONS, FULL_STORY_TEXT } from '../data/storyData';
import { fetchGeminiTTS, playAudioData, stopAudio, fallbackSpeech } from '../utils/audioPlayer';

const PRESET_STORIES = [
  {
    title: 'August 17th Parade (Original Text)',
    text: FULL_STORY_TEXT,
    description: 'The complete recount text about the Independence Day parade.'
  },
  {
    title: 'Kerupuk Eating Competition (Lomba Kerupuk)',
    text: `On August 17th, my school held a kerupuk eating race. A crispy cracker was tied to a string. We had to eat it with our hands tied behind our backs. Everyone laughed loudly. My friend Budi won first prize!`,
    description: 'A fun school recount text about traditional Indonesian games.'
  },
  {
    title: 'Panjat Pinang (Greasy Pole Climb)',
    text: `In the afternoon, the villagers gathered for the panjat pinang game. A tall nut tree pole was covered in grease. Teams helped each other reach prizes at the top, like bicycles and pots. It was so exciting to watch!`,
    description: 'Recount text about teamwork in the iconic panjat pinang challenge.'
  },
  {
    title: 'Morning Flag Ceremony (Upacara Bendera)',
    text: `At seven o'clock, all students and teachers assembled on the school yard. We stood in neat rows and wore complete scout uniforms. When the red and white flag was raised, we sang Indonesia Raya proudly.`,
    description: 'Descriptive recount of the solemn August 17th flag ceremony.'
  }
];

export const CustomTTSStudio: React.FC = () => {
  const [inputText, setInputText] = useState<string>(FULL_STORY_TEXT);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_OPTIONS[0].id);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastAudioUrl, setLastAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateAndPlay = async () => {
    if (!inputText.trim()) return;

    stopAudio();
    setIsPlaying(true);
    setIsLoading(true);

    try {
      const audioUrl = await fetchGeminiTTS(inputText.trim(), selectedVoice, selectedStyle);
      setLastAudioUrl(audioUrl);
      setIsLoading(false);

      playAudioData(audioUrl, playbackSpeed, () => {
        setIsPlaying(false);
      });
    } catch (err) {
      console.warn('Gemini TTS error, falling back:', err);
      setIsLoading(false);
      fallbackSpeech(inputText.trim(), playbackSpeed, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleStop = () => {
    stopAudio();
    setIsPlaying(false);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Gemini 3.8 Flash TTS Voice Lab</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Custom Text-to-Speech Studio
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Experiment with custom recount texts, speeches, and dialogue using the <strong className="text-slate-800">gemini-3.8-flash-tts</strong> audio model.
        </p>

        {/* Preset Selector */}
        <div className="mt-5">
          <span className="text-xs font-bold text-slate-600 block mb-2">
            Try an Indonesian Independence Day Recount Preset:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_STORIES.map((preset) => (
              <button
                key={preset.title}
                onClick={() => setInputText(preset.text)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  inputText === preset.text
                    ? 'bg-red-50/80 border-red-300 ring-1 ring-red-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <h4 className="text-xs font-bold text-slate-900">{preset.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Text to Convert to Speech:
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <span className="text-xs text-slate-400">
              {inputText.length} characters
            </span>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          placeholder="Type or paste any English text or recount story here..."
          className="w-full text-sm sm:text-base font-medium text-slate-800 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 leading-relaxed resize-y"
        />

        {/* Voice and Style Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Voice Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Gemini Voice Persona:
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.gender} • {v.description.split(',')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Style Prompt */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Speech Style & Tone:
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speed Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Playback Speed:
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[0.75, 1.0, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateAndPlay}
              disabled={isLoading || !inputText.trim()}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Volume2 className="w-4 h-4 animate-pulse" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isLoading ? 'Synthesizing Audio...' : isPlaying ? 'Restart Audio' : 'Speak Text'}</span>
            </button>

            {isPlaying && (
              <button
                onClick={handleStop}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-2xl text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Stop</span>
              </button>
            )}
          </div>

          {lastAudioUrl && (
            <a
              href={lastAudioUrl}
              download="gemini-tts-recount.wav"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download WAV Audio</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
