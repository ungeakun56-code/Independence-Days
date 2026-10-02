import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  Loader2,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { INITIAL_QUIZ_QUESTIONS } from '../data/storyData';
import { fetchGeminiTTS, playAudioData, fallbackSpeech, playChime } from '../utils/audioPlayer';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const ComprehensionQuiz: React.FC = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);

  const currentQuestion = questions[currentIdx] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isCurrentAnswered = selectedAnswers[currentQuestion.id] !== undefined;

  const handleSelectOption = (optIdx: number) => {
    if (isCurrentAnswered) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIdx,
    }));

    const isCorrect = optIdx === currentQuestion.correctIndex;
    playChime(isCorrect);
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setShowResults(false);
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleListenQuestion = async () => {
    setAudioPlaying(true);
    try {
      const audioUrl = await fetchGeminiTTS(
        currentQuestion.question,
        'Kore',
        'Clear, articulate quiz teacher reading question aloud'
      );
      playAudioData(audioUrl, 1.0, () => setAudioPlaying(false));
    } catch {
      fallbackSpeech(currentQuestion.question, 1.0, () => setAudioPlaying(false));
    }
  };

  const handleGenerateNewQuiz = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Quiz generation failed.');
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setSelectedAnswers({});
        setCurrentIdx(0);
        setShowResults(false);
        playChime(true);
      }
    } catch (err) {
      console.warn('Fallback generating quiz:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const score = calculateScore();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Comprehension & Grammar Evaluation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            August 17th Parade Quiz
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Test your understanding of story chronology, past tense verbs, and recount text details.
          </p>
        </div>

        {/* Generate New Quiz Button */}
        <button
          onClick={handleGenerateNewQuiz}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-300" />
          )}
          <span>{isGenerating ? 'Generating...' : 'AI Quiz Generator (Gemini 3.8)'}</span>
        </button>
      </div>

      {!showResults ? (
        /* Question Card */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
            <span>Question {currentIdx + 1} of {totalQuestions}</span>
            <span>Answered: {answeredCount}/{totalQuestions}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
            <div
              className="bg-red-600 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currentQuestion.question}
            </h3>
            <button
              onClick={handleListenQuestion}
              disabled={audioPlaying}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors shrink-0 cursor-pointer"
              title="Listen to question via Gemini TTS"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestion.id] === idx;
              const isCorrect = idx === currentQuestion.correctIndex;

              let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300';
              if (isCurrentAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-rose-500 text-rose-900 line-through';
                } else {
                  btnStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isCurrentAnswered}
                  className={`w-full p-4 rounded-2xl border text-sm sm:text-base font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isCurrentAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isCurrentAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Teacher's Explanation */}
          {isCurrentAnswered && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 mb-6 animate-in fade-in">
              <span className="font-bold block mb-1">💡 Teacher Explanation:</span>
              <p>{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {isCurrentAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <span>{currentIdx < totalQuestions - 1 ? 'Next Question' : 'View Final Score'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Celebration Card */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-lg text-center animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
            <Trophy className="w-10 h-10" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Quiz Completed!
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            You scored <strong className="text-slate-900 font-extrabold">{score}</strong> out of{' '}
            <strong className="text-slate-900 font-extrabold">{totalQuestions}</strong> correctly!
          </p>

          <div className="inline-block p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-800 text-sm font-semibold mb-8">
            {score === totalQuestions ? (
              <span className="text-emerald-700 font-bold">
                🎉 Outstanding work! You have mastered this recount text and its past tense verbs!
              </span>
            ) : score >= totalQuestions / 2 ? (
              <span className="text-amber-700 font-bold">
                👏 Good job! Review the vocabulary cards or listen to the recount text again to score 100%!
              </span>
            ) : (
              <span className="text-red-700 font-bold">
                💪 Keep practicing! Use the read-along audio reader to reinforce your learning.
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>

            <button
              onClick={handleGenerateNewQuiz}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate New AI Questions</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
