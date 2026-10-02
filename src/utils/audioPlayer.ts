// Audio Player and Web Audio utilities for Gemini TTS playback

let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, string>();

export async function fetchGeminiTTS(
  text: string,
  voiceName: string = 'Kore',
  style: string = 'Clear, lively, educational teacher voice'
): Promise<string> {
  const cacheKey = `${voiceName}:${style}:${text.trim()}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceName, style }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `TTS request failed: ${response.status}`);
  }

  const data = await response.json();
  const audioDataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
  audioCache.set(cacheKey, audioDataUrl);
  return audioDataUrl;
}

export function playAudioData(
  audioSrc: string,
  playbackRate: number = 1.0,
  onEnd?: () => void
): HTMLAudioElement {
  stopAudio();

  const audio = new Audio(audioSrc);
  audio.playbackRate = playbackRate;
  currentAudio = audio;

  audio.onended = () => {
    currentAudio = null;
    if (onEnd) onEnd();
  };

  audio.onerror = () => {
    currentAudio = null;
    if (onEnd) onEnd();
  };

  audio.play().catch((err) => {
    console.warn('Audio play prevented or interrupted:', err);
    if (onEnd) onEnd();
  });

  return audio;
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
}

export function fallbackSpeech(text: string, rate: number = 1.0, onEnd?: () => void): void {
  stopAudio();
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = 'en-US';

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

// Pleasant browser Web Audio synthesizer sounds for UI feedback (no external files needed)
export function playChime(isSuccess: boolean = true): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (isSuccess) {
      // Cheerful major arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } else {
      // Soft try-again tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.debug('Web Audio feedback error:', e);
  }
}
