import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Shared Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Cache for generated audio clips to provide instant repeat playback
const audioCache = new Map<string, string>();

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    ttsModel: 'gemini-3.8-flash-tts',
    textModel: 'gemini-3.8-flash',
  });
});

// POST /api/tts
// Converts text to speech using gemini-3.8-flash-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore', style = 'Clear, lively, educational teacher voice' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text parameter is required.' });
    }

    const trimmedText = text.trim();
    const cacheKey = `${voiceName}_${style}_${trimmedText}`;

    if (audioCache.has(cacheKey)) {
      return res.json({
        audioBase64: audioCache.get(cacheKey),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        fallbackAvailable: true,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmedText,
              speechMetadata: {
                style,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Supported: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error('No audio data received from Gemini 3.8 Flash TTS.');
    }

    // Keep cache size bounded
    if (audioCache.size > 200) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, base64Audio);

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
      cached: false,
    });
  } catch (err: any) {
    console.error('Gemini TTS error:', err);
    res.status(500).json({
      error: err.message || 'Failed to synthesize speech.',
      fallbackAvailable: true,
    });
  }
});

// POST /api/analyze-reading
// Provides friendly English teacher feedback on reading & recount text
app.post('/api/analyze-reading', async (req, res) => {
  try {
    const { sentenceText, userTranscript } = req.body;

    if (!sentenceText) {
      return res.status(400).json({ error: 'sentenceText is required.' });
    }

    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is missing.' });
    }

    const prompt = `You are a supportive, encouraging junior high school (SMP) English teacher in Indonesia.
Target sentence: "${sentenceText}"
Student reading transcript: "${userTranscript || '(Student recorded audio / practiced reading)'}"

Provide warm, constructive pedagogical feedback in JSON format:
{
  "rating": "Excellent" | "Good Job" | "Keep Practicing",
  "score": number between 75 and 100,
  "encouragement": "Short 1-2 sentence warm encouraging comment for the Indonesian student",
  "phoneticTips": ["1-2 tips focusing on past tense endings like -ed in marched/started/carried, or vowel sounds"],
  "grammarNote": "1 brief educational sentence explaining the past tense verb or recount text feature in this sentence"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({
      error: err.message || 'Failed to analyze reading.',
    });
  }
});

// POST /api/generate-quiz
// Generates fresh questions about the August 17th recount text
app.post('/api/generate-quiz', async (_req, res) => {
  try {
    const story = `Last August 17th, I went to a parade with my family. We left home at seven o'clock in the morning. The parade started at eight. Students from many schools marched along the main street. They wore traditional clothes and carried red and white flags. My favorite part was the school band. After the parade, we ate fried rice at a food stall. We went home at noon. It was a wonderful day.`;

    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is missing.' });
    }

    const prompt = `Based on this Recount Text:
"${story}"

Generate 4 interactive multiple choice questions suitable for Grade 8 Indonesian Junior High School (SMP) English curriculum:
- 1 question about main event / orientation (Who / When / What)
- 1 question about past tense verbs (went, left, started, marched, wore, carried, ate)
- 1 question about specific detail (e.g., favorite part, clothes, what they ate, time)
- 1 question about recount text purpose / re-orientation

Return valid JSON with format:
[
  {
    "id": 1,
    "question": "Question string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear explanation in friendly English for students"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const questions = JSON.parse(response.text || '[]');
    res.json({ questions });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
});

// Vite Middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
