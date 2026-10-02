import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  X
} from 'lucide-react';
import { VERB_PAIRS } from '../data/storyData';
import { fetchGeminiTTS, playAudioData, fallbackSpeech, playChime } from '../utils/audioPlayer';

export const GrammarInspector: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'regular' | 'irregular'>('all');
  const [playingVerb, setPlayingVerb] = useState<string | null>(null);

  // Quick Verb Matching Game State
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const filteredVerbs = VERB_PAIRS.filter((v) => {
    if (filterType === 'all') return true;
    return v.type === filterType;
  });

  const handlePlayVerb = async (text: string) => {
    setPlayingVerb(text);
    try {
      const audioUrl = await fetchGeminiTTS(text, 'Kore', 'Clear pronunciation isolated word for language learner');
      playAudioData(audioUrl, 0.9, () => setPlayingVerb(null));
    } catch {
      fallbackSpeech(text, 0.9, () => setPlayingVerb(null));
    }
  };

  // Mini quiz data
  const miniQuizItems = [
    { base: 'go', correct: 'went', options: ['goed', 'went', 'gone', 'going'], explanation: "'go' is an irregular verb. The past simple is 'went'." },
    { base: 'start', correct: 'started', options: ['startted', 'started', 'starting', 'start'], explanation: "'start' is regular. It ends in /t/, so we add -ed and pronounce it as /ˈstɑːrtɪd/." },
    { base: 'march', correct: 'marched', options: ['marched', 'marcht', 'marching', 'marchen'], explanation: "'march' is regular. We add -ed, pronounced with a /t/ sound: /mɑːrtʃt/." },
    { base: 'eat', correct: 'ate', options: ['eated', 'ate', 'eaten', 'eating'], explanation: "'eat' is irregular. The past simple form is 'ate'." },
    { base: 'wear', correct: 'wore', options: ['weared', 'worn', 'wore', 'wearing'], explanation: "'wear' is irregular. The past simple is 'wore'." }
  ];

  const currentQuiz = miniQuizItems[quizIndex];

  const handleSelectQuizOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuiz.correct;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      playChime(true);
    } else {
      playChime(false);
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < miniQuizItems.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // restart
      setQuizIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setQuizScore(0);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title & Introduction */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SMP English Curriculum • Recount Text Genre</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Recount Text Grammar & Structure Breakdown
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            A <strong>Recount Text</strong> retells past events, experiences, or activities in the order they happened.
            The primary language feature is the <strong>Simple Past Tense (Verb 2)</strong>, chronological time connectors, and action verbs.
          </p>
        </div>

        {/* 3 Pillars of Recount Text Structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-2">
              1
            </div>
            <h4 className="font-bold text-blue-900 text-sm">Orientation</h4>
            <p className="text-blue-800 text-xs mt-1 leading-relaxed">
              Provides background: <em>Who</em> (writer & family), <em>When</em> (Last August 17th), and <em>Where / What</em> (went to the parade).
            </p>
            <span className="inline-block mt-2 text-[10px] font-semibold bg-white text-blue-700 px-2 py-0.5 rounded-md">
              Sentences 1 - 3
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-2">
              2
            </div>
            <h4 className="font-bold text-emerald-900 text-sm">Events in Chronology</h4>
            <p className="text-emerald-800 text-xs mt-1 leading-relaxed">
              Sequential stages of what happened: students marching, traditional clothes, red-and-white flags, school band, eating fried rice, returning home.
            </p>
            <span className="inline-block mt-2 text-[10px] font-semibold bg-white text-emerald-700 px-2 py-0.5 rounded-md">
              Sentences 4 - 8
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm mb-2">
              3
            </div>
            <h4 className="font-bold text-purple-900 text-sm">Re-orientation</h4>
            <p className="text-purple-800 text-xs mt-1 leading-relaxed">
              A personal comment or closing summary: <em>"It was a wonderful day."</em> expressing feelings about the whole experience.
            </p>
            <span className="inline-block mt-2 text-[10px] font-semibold bg-white text-purple-700 px-2 py-0.5 rounded-md">
              Sentence 9
            </span>
          </div>
        </div>
      </div>

      {/* Regular -ed Pronunciation Rules Special Guide */}
      <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-lg">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3>Pronouncing Regular Past Tense (-ed) Endings</h3>
        </div>
        <p className="text-amber-800 text-xs sm:text-sm mb-5 leading-relaxed">
          Students often ask: <em>"How do I pronounce the -ed in English?"</em> There are 3 distinct sound rules.
          Listen to the difference with Gemini TTS:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rule 1: /ɪd/ */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-amber-100 text-amber-900 font-extrabold text-sm px-2.5 py-0.5 rounded-lg">
                /ɪd/ Sound
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Extra syllable</span>
            </div>
            <p className="text-xs text-slate-700 mb-2">
              After base verbs ending in <strong>/t/</strong> or <strong>/d/</strong>.
            </p>
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-amber-950 text-sm">started</span>
                <span className="text-xs text-slate-500 block">/ˈstɑːr.tɪd/ (2 syllables)</span>
              </div>
              <button
                onClick={() => handlePlayVerb('started')}
                className="p-2 bg-amber-200 hover:bg-amber-300 rounded-lg text-amber-900 transition-colors cursor-pointer"
                title="Hear 'started'"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rule 2: /t/ */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-orange-100 text-orange-900 font-extrabold text-sm px-2.5 py-0.5 rounded-lg">
                /t/ Sound
              </span>
              <span className="text-[11px] text-slate-500 font-medium">No extra syllable</span>
            </div>
            <p className="text-xs text-slate-700 mb-2">
              After voiceless endings like <strong>/p, k, s, ʃ, tʃ/</strong>.
            </p>
            <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-orange-950 text-sm">marched</span>
                <span className="text-xs text-slate-500 block">/mɑːrtʃt/ (ends in /t/)</span>
              </div>
              <button
                onClick={() => handlePlayVerb('marched')}
                className="p-2 bg-orange-200 hover:bg-orange-300 rounded-lg text-orange-900 transition-colors cursor-pointer"
                title="Hear 'marched'"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rule 3: /d/ */}
          <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-yellow-100 text-yellow-900 font-extrabold text-sm px-2.5 py-0.5 rounded-lg">
                /d/ Sound
              </span>
              <span className="text-[11px] text-slate-500 font-medium">No extra syllable</span>
            </div>
            <p className="text-xs text-slate-700 mb-2">
              After voiced sounds and vowels like <strong>/r, l, m, n, vowels/</strong>.
            </p>
            <div className="p-2.5 rounded-xl bg-yellow-50/80 border border-yellow-200 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-yellow-950 text-sm">carried</span>
                <span className="text-xs text-slate-500 block">/ˈkær.id/ (ends in /d/)</span>
              </div>
              <button
                onClick={() => handlePlayVerb('carried')}
                className="p-2 bg-yellow-200 hover:bg-yellow-300 rounded-lg text-yellow-900 transition-colors cursor-pointer"
                title="Hear 'carried'"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Verb Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Story Verbs (Verb 1 → Verb 2) Audio Matrix
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Click any audio button to listen to native pronunciation generated by Gemini TTS.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (8)
            </button>
            <button
              onClick={() => setFilterType('regular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'regular'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Regular (-ed)
            </button>
            <button
              onClick={() => setFilterType('irregular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'irregular'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Irregular
            </button>
          </div>
        </div>

        {/* Verbs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredVerbs.map((item) => (
            <div
              key={item.base}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">V1:</span>
                  <span className="font-bold text-slate-700 text-sm">{item.base}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-red-500 font-medium">V2:</span>
                  <span className="font-extrabold text-slate-900 text-base">{item.past}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.type === 'regular'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <span className="italic">Arti: {item.id}</span>
                  <span>•</span>
                  <code className="text-[11px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {item.ipa}
                  </code>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {item.rule}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handlePlayVerb(`${item.base}, ${item.past}`)}
                  className="p-2.5 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  title={`Listen to '${item.base}' and '${item.past}'`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Quick Mini-Quiz for Past Verbs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Interactive Verb Challenge
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              Question {quizIndex + 1} of {miniQuizItems.length} • Score: {quizScore}
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-4">
            <p className="text-xs text-slate-500 font-medium mb-1">What is the past tense (Verb 2) form of:</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                "{currentQuiz.base}"
              </span>
              <button
                onClick={() => handlePlayVerb(currentQuiz.base)}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Hear base verb"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {currentQuiz.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt === currentQuiz.correct;

              let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';
              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-800 line-through';
                } else {
                  btnStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectQuizOption(opt)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOpt && <Check className="w-4 h-4 text-emerald-600" />}
                  {isAnswered && isSelected && !isCorrectOpt && <X className="w-4 h-4 text-rose-600" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 mb-4 animate-in fade-in">
              <p className="font-semibold mb-1">Teacher's Note:</p>
              <p>{currentQuiz.explanation}</p>
            </div>
          )}

          {isAnswered && (
            <button
              onClick={handleNextQuiz}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {quizIndex < miniQuizItems.length - 1 ? 'Next Question →' : 'Restart Mini Challenge ↺'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
