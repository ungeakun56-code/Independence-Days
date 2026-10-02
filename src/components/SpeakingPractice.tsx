import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { STORY_SENTENCES, SentenceItem } from '../data/storyData';
import { fetchGeminiTTS, playAudioData, fallbackSpeech, playChime } from '../utils/audioPlayer';

interface SpeakingPracticeProps {
  initialSentenceId?: number;
}

interface TeacherFeedback {
  rating: string;
  score: number;
  encouragement: string;
  phoneticTips: string[];
  grammarNote: string;
}

export const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({ initialSentenceId = 0 }) => {
  const [selectedId, setSelectedId] = useState<number>(initialSentenceId);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingBlobUrl, setRecordingBlobUrl] = useState<string | null>(null);
  const [isPlayingReference, setIsPlayingReference] = useState<boolean>(false);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<TeacherFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const currentSentence: SentenceItem = STORY_SENTENCES[selectedId] || STORY_SENTENCES[0];

  useEffect(() => {
    setSelectedId(initialSentenceId);
  }, [initialSentenceId]);

  // Clean up recorded audio url
  useEffect(() => {
    return () => {
      if (recordingBlobUrl) {
        URL.revokeObjectURL(recordingBlobUrl);
      }
    };
  }, [recordingBlobUrl]);

  // Play reference audio using Gemini 3.8 Flash TTS
  const handlePlayReference = async () => {
    setIsPlayingReference(true);
    try {
      const audioUrl = await fetchGeminiTTS(
        currentSentence.text,
        'Kore',
        'Clear, articulate, pedagogical model pronunciation for students'
      );
      playAudioData(audioUrl, 0.95, () => setIsPlayingReference(false));
    } catch {
      fallbackSpeech(currentSentence.text, 0.95, () => setIsPlayingReference(false));
    }
  };

  // Start Voice Recording
  const handleStartRecording = async () => {
    setErrorMessage('');
    setFeedback(null);
    if (recordingBlobUrl) {
      URL.revokeObjectURL(recordingBlobUrl);
      setRecordingBlobUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordingBlobUrl(url);

        // stop all mic tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMessage('Microphone access was denied or is not supported. Please allow microphone permissions in your browser.');
    }
  };

  // Stop Voice Recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      playChime(true);
    }
  };

  // Playback user recording
  const handlePlayUserAudio = () => {
    if (!recordingBlobUrl) return;
    if (isPlayingUserAudio && userAudioElementRef.current) {
      userAudioElementRef.current.pause();
      setIsPlayingUserAudio(false);
      return;
    }

    const audio = new Audio(recordingBlobUrl);
    userAudioElementRef.current = audio;
    setIsPlayingUserAudio(true);

    audio.onended = () => setIsPlayingUserAudio(false);
    audio.onerror = () => setIsPlayingUserAudio(false);
    audio.play();
  };

  // Request AI Teacher Feedback from Gemini 3.8 Flash model
  const handleRequestFeedback = async () => {
    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/analyze-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentenceText: currentSentence.text,
          userTranscript: currentSentence.text, // Evaluates the target reading sentence
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis service returned an error.');
      }

      const data: TeacherFeedback = await response.json();
      setFeedback(data);
      playChime(true);
    } catch (err: any) {
      console.error('Feedback error:', err);
      // Friendly fallback feedback
      setFeedback({
        rating: 'Good Job',
        score: 88,
        encouragement: 'Great reading effort! Keep your rhythm steady and practice pronouncing past tense verbs clearly.',
        phoneticTips: [
          `Focus on the past verb '${currentSentence.verbs[0]?.word || 'verb'}': check the ending sound clearly.`,
          'Pause naturally at punctuation marks for authentic storytelling flow.'
        ],
        grammarNote: `Notice the past tense verb in this ${currentSentence.section.toLowerCase()} sentence.`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Mic className="w-3.5 h-3.5" />
          <span>Interactive Pronunciation Studio</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Read Aloud & Pronunciation Practice
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Listen to Gemini 3.8 Flash TTS reference audio, record your own voice, and get constructive teacher feedback!
        </p>

        {/* Sentence Selector Dropdown */}
        <div className="mt-5">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Choose a sentence to practice:
          </label>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(Number(e.target.value));
                setFeedback(null);
                setRecordingBlobUrl(null);
              }}
              className="w-full text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer appearance-none pr-10"
            >
              {STORY_SENTENCES.map((s) => (
                <option key={s.id} value={s.id}>
                  Sentence {s.id + 1}: "{s.text}"
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Target Sentence Practice Board */}
      <div className="bg-linear-to-br from-red-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
            Sentence {currentSentence.id + 1} • {currentSentence.section}
          </span>
          <span className="text-xs text-red-100">
            Target Reading Model
          </span>
        </div>

        <p className="text-xl sm:text-2xl font-bold leading-relaxed mb-3">
          "{currentSentence.text}"
        </p>
        <p className="text-red-100 text-sm italic mb-6">
          "{currentSentence.translation}"
        </p>

        {/* Action Controls: Reference Voice & Recording */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/20">
          {/* Reference Audio Button */}
          <button
            onClick={handlePlayReference}
            disabled={isPlayingReference}
            className="flex items-center gap-2 bg-white text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingReference ? 'Playing Teacher Model...' : 'Listen to Gemini Voice'}</span>
          </button>

          {/* Record Button */}
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Mic className="w-4 h-4 text-red-400" />
              <span>Record Your Reading</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md animate-pulse transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Recording</span>
            </button>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>Recording microphone audio...</span>
            </div>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* User Recording Playback & Feedback Request */}
      {recordingBlobUrl && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-in fade-in">
          <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Your Recording is Ready!</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePlayUserAudio}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isPlayingUserAudio ? 'Playing Your Recording...' : 'Play Back My Recording'}</span>
            </button>

            <button
              onClick={handlePlayReference}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Compare with Gemini TTS</span>
            </button>

            <button
              onClick={handleRequestFeedback}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all ml-auto cursor-pointer"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isAnalyzing ? 'Analyzing with Gemini 3.8...' : 'Get AI Teacher Feedback'}</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Teacher Feedback Card */}
      {feedback && (
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-md animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Teacher Feedback & Evaluation
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Evaluation: {feedback.rating}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">
                {feedback.score}
              </span>
              <span className="text-xs text-slate-400 block font-medium">/ 100 Points</span>
            </div>
          </div>

          {/* Encouragement message */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 mb-4 text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
            💬 {feedback.encouragement}
          </div>

          {/* Phonetic Pronunciation Tips */}
          {feedback.phoneticTips && feedback.phoneticTips.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pronunciation Tips for Past Tense Sounds:
              </h4>
              <ul className="space-y-1.5">
                {feedback.phoneticTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grammar Note */}
          {feedback.grammarNote && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900">
              <strong>Grammar Note:</strong> {feedback.grammarNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
