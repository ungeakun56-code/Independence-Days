import React, { useState } from 'react';
import { Volume2, Sparkles, BookOpen, Layers, RotateCw } from 'lucide-react';
import { fetchGeminiTTS, playAudioData, fallbackSpeech } from '../utils/audioPlayer';

interface VocabItem {
  id: string;
  term: string;
  phonetic: string;
  partOfSpeech: string;
  translation: string;
  exampleSentence: string;
  exampleTranslation: string;
  culturalNote?: string;
  icon: string;
}

export const VOCABULARY_LIST: VocabItem[] = [
  {
    id: 'parade',
    term: 'Parade',
    phonetic: '/pəˈreɪd/',
    partOfSpeech: 'noun',
    translation: 'Pawai / Karnaval',
    exampleSentence: 'Last August 17th, I went to a parade with my family.',
    exampleTranslation: '17 Agustus lalu, saya pergi ke pawai bersama keluarga saya.',
    culturalNote: 'In Indonesia, August 17th street parades (Pawai Karnaval Kemerdekaan) feature schools, marching bands, and floats.',
    icon: '🎺'
  },
  {
    id: 'traditional-clothes',
    term: 'Traditional Clothes',
    phonetic: '/trəˈdɪʃ.ən.əl kloʊðz/',
    partOfSpeech: 'noun phrase',
    translation: 'Pakaian Adat Daerah',
    exampleSentence: 'They wore traditional clothes and carried red and white flags.',
    exampleTranslation: 'Mereka mengenakan pakaian adat dan membawa bendera merah putih.',
    culturalNote: 'Reflecting Bhinneka Tunggal Ika, participants proudly wear traditional regional attire from Aceh, Java, Bali, Papua, etc.',
    icon: '👘'
  },
  {
    id: 'school-band',
    term: 'School Band',
    phonetic: '/skuːl bænd/',
    partOfSpeech: 'noun phrase',
    translation: 'Grup Marching Band / Drumband Sekolah',
    exampleSentence: 'My favorite part was the school band.',
    exampleTranslation: 'Bagian favorit saya adalah kelompok marching band sekolah.',
    culturalNote: 'School marching bands are the star attraction of 17 Agustus parades, performing vibrant percussion and brass melodies.',
    icon: '🥁'
  },
  {
    id: 'red-and-white-flags',
    term: 'Red and White Flags',
    phonetic: '/rɛd ænd waɪt flæɡz/',
    partOfSpeech: 'noun phrase',
    translation: 'Bendera Merah Putih (Sang Saka)',
    exampleSentence: 'They carried red and white flags along the street.',
    exampleTranslation: 'Mereka membawa bendera merah putih di sepanjang jalan.',
    culturalNote: 'The Indonesian national flag: red symbolizes bravery (keberanian) and white symbolizes purity (kesucian).',
    icon: '🇮🇩'
  },
  {
    id: 'food-stall',
    term: 'Food Stall',
    phonetic: '/fuːd stɔːl/',
    partOfSpeech: 'noun',
    translation: 'Warung Makan / Kaki Lima',
    exampleSentence: 'After the parade, we ate fried rice at a food stall.',
    exampleTranslation: 'Setelah pawai, kami makan nasi goreng di warung makan.',
    culturalNote: 'Street stalls (warung makan) line parade routes serving fresh traditional refreshments and meals to spectators.',
    icon: '🍢'
  },
  {
    id: 'fried-rice',
    term: 'Fried Rice',
    phonetic: '/fraɪd raɪs/',
    partOfSpeech: 'noun',
    translation: 'Nasi Goreng',
    exampleSentence: 'We ate delicious fried rice at a food stall.',
    exampleTranslation: 'Kami makan nasi goreng lezat di warung makan.',
    culturalNote: 'Nasi Goreng is Indonesia’s world-famous comfort food, often garnished with kerupuk and sliced cucumber.',
    icon: '🍳'
  },
  {
    id: 'marched-along',
    term: 'Marched Along',
    phonetic: '/mɑːrtʃt əˈlɔːŋ/',
    partOfSpeech: 'verb + preposition',
    translation: 'Berbaris di Sepanjang',
    exampleSentence: 'Students from many schools marched along the main street.',
    exampleTranslation: 'Siswa-siswi dari banyak sekolah berbaris di sepanjang jalan utama.',
    culturalNote: 'School groups practice their synchronized marching (baris-berbaris) weeks ahead of Independence Day.',
    icon: '🚶‍♂️'
  },
  {
    id: 'wonderful',
    term: 'Wonderful',
    phonetic: '/ˈwʌn.dər.fəl/',
    partOfSpeech: 'adjective',
    translation: 'Luar Biasa / Sangat Menyenangkan',
    exampleSentence: 'It was a wonderful day.',
    exampleTranslation: 'Hari itu adalah hari yang sangat menyenangkan.',
    culturalNote: 'A high-frequency descriptive adjective expressing delight and positive emotion in recount text conclusions.',
    icon: '✨'
  },
  {
    id: 'main-street',
    term: 'Main Street',
    phonetic: '/meɪn striːt/',
    partOfSpeech: 'noun',
    translation: 'Jalan Utama Kota / Protokol',
    exampleSentence: 'The parade marched along the main street.',
    exampleTranslation: 'Pawai itu berbaris di sepanjang jalan utama.',
    icon: '🛣️'
  }
];

export const VocabularySection: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handlePlayWord = async (text: string, id: string, speed: number = 1.0) => {
    setPlayingId(id);
    try {
      const audioUrl = await fetchGeminiTTS(text, 'Kore', 'Clear pronunciation isolated word for language learner');
      playAudioData(audioUrl, speed, () => setPlayingId(null));
    } catch {
      fallbackSpeech(text, speed, () => setPlayingId(null));
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredList = VOCABULARY_LIST.filter((v) =>
    v.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Interactive Vocabulary & Audio Cards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Key Words & Cultural Expressions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Listen to authentic pronunciation with Gemini TTS, practice phonetics, and understand Indonesian cultural context.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search word or arti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.map((item) => {
          const isFlipped = flippedCards[item.id] || false;
          const isPlaying = playingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top bar with icon and audio buttons */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 bg-slate-100 rounded-2xl">
                      {item.icon}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                        {item.term}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.phonetic}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          {item.partOfSpeech}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audio trigger */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePlayWord(item.term, item.id, 0.75)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold transition-colors cursor-pointer"
                      title="Slow pronunciation (0.75x)"
                    >
                      0.75x
                    </button>
                    <button
                      onClick={() => handlePlayWord(item.term, item.id, 1.0)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                      title="Listen with Gemini TTS"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Translation Banner */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Arti Bahasa Indonesia
                  </span>
                  <p className="text-slate-900 font-bold text-sm mt-0.5">
                    {item.translation}
                  </p>
                </div>

                {/* Example sentence from text */}
                <div className="text-xs text-slate-700 bg-amber-50/50 border border-amber-200/60 rounded-2xl p-3 mb-3">
                  <span className="text-[10px] font-bold text-amber-900 block mb-0.5">
                    Sample from Recount Text:
                  </span>
                  <p className="font-semibold text-slate-800">
                    "{item.exampleSentence}"
                  </p>
                  <p className="text-slate-500 italic text-[11px] mt-1">
                    "{item.exampleTranslation}"
                  </p>
                </div>

                {/* Cultural connection */}
                {item.culturalNote && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    💡 <strong className="text-slate-700">Culture:</strong> {item.culturalNote}
                  </p>
                )}
              </div>

              {/* Bottom Quick Test Card Flip / Pronounce Full Sentence */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handlePlayWord(item.exampleSentence, `sent-${item.id}`)}
                  className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Hear sentence</span>
                </button>

                <span className="text-[11px] text-slate-400">
                  Gemini 3.8 TTS
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
