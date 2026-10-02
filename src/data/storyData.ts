import paradeImage from '../assets/images/august_parade_1790900144168.jpg';

export interface SentenceItem {
  id: number;
  text: string;
  translation: string;
  section: 'Orientation' | 'Event' | 'Re-orientation';
  sectionLabel: string;
  verbs: Array<{
    word: string;
    base: string;
    type: 'regular' | 'irregular';
    phonetic: string;
  }>;
  vocabulary: Array<{
    term: string;
    meaning: string;
    phonetic: string;
  }>;
  timeReference?: string;
  culturalNote?: string;
}

export const PARADE_IMAGE = paradeImage;

export const FULL_STORY_TEXT = `Last August 17th, I went to a parade with my family. We left home at seven o'clock in the morning. The parade started at eight. Students from many schools marched along the main street. They wore traditional clothes and carried red and white flags. My favorite part was the school band. After the parade, we ate fried rice at a food stall. We went home at noon. It was a wonderful day.`;

export const STORY_SENTENCES: SentenceItem[] = [
  {
    id: 0,
    text: "Last August 17th, I went to a parade with my family.",
    translation: "17 Agustus lalu, saya pergi ke pawai bersama keluarga saya.",
    section: "Orientation",
    sectionLabel: "Orientation (Setting the Scene)",
    verbs: [
      { word: "went", base: "go", type: "irregular", phonetic: "/wɛnt/" }
    ],
    vocabulary: [
      { term: "parade", meaning: "pawai / karnaval", phonetic: "/pəˈreɪd/" },
      { term: "family", meaning: "keluarga", phonetic: "/ˈfæm.əl.i/" }
    ],
    timeReference: "Last August 17th (Hari Kemerdekaan RI)",
    culturalNote: "August 17th is Indonesia's Independence Day (HUT RI), celebrated across the nation with vibrant street parades."
  },
  {
    id: 1,
    text: "We left home at seven o'clock in the morning.",
    translation: "Kami berangkat dari rumah pada pukul tujuh pagi.",
    section: "Event",
    sectionLabel: "Event 1 (Departure)",
    verbs: [
      { word: "left", base: "leave", type: "irregular", phonetic: "/lɛft/" }
    ],
    vocabulary: [
      { term: "left home", meaning: "berangkat / meninggalkan rumah", phonetic: "/lɛft hoʊm/" }
    ],
    timeReference: "at seven o'clock in the morning (07:00 WIB)"
  },
  {
    id: 2,
    text: "The parade started at eight.",
    translation: "Pawai dimulai pada pukul delapan.",
    section: "Event",
    sectionLabel: "Event 2 (Parade Begins)",
    verbs: [
      { word: "started", base: "start", type: "regular", phonetic: "/ˈstɑːr.tɪd/" }
    ],
    vocabulary: [
      { term: "started", meaning: "dimulai", phonetic: "/ˈstɑːr.tɪd/" }
    ],
    timeReference: "at eight (08:00 WIB)"
  },
  {
    id: 3,
    text: "Students from many schools marched along the main street.",
    translation: "Siswa-siswi dari banyak sekolah berbaris di sepanjang jalan utama.",
    section: "Event",
    sectionLabel: "Event 3 (Students Marching)",
    verbs: [
      { word: "marched", base: "march", type: "regular", phonetic: "/mɑːrtʃt/" }
    ],
    vocabulary: [
      { term: "marched along", meaning: "berbaris di sepanjang", phonetic: "/mɑːrtʃt əˈlɔːŋ/" },
      { term: "main street", meaning: "jalan utama kota", phonetic: "/meɪn striːt/" }
    ],
    culturalNote: "School contingents (SD, SMP, SMA) parade in disciplined formations along protocol avenues."
  },
  {
    id: 4,
    text: "They wore traditional clothes and carried red and white flags.",
    translation: "Mereka mengenakan pakaian adat dan membawa bendera merah putih.",
    section: "Event",
    sectionLabel: "Event 4 (Costumes & Flags)",
    verbs: [
      { word: "wore", base: "wear", type: "irregular", phonetic: "/wɔːr/" },
      { word: "carried", base: "carry", type: "regular", phonetic: "/ˈkær.id/" }
    ],
    vocabulary: [
      { term: "traditional clothes", meaning: "pakaian adat daerah", phonetic: "/trəˈdɪʃ.ən.əl kloʊðz/" },
      { term: "red and white flags", meaning: "bendera merah putih (Sang Saka)", phonetic: "/rɛd ænd waɪt flæɡz/" }
    ],
    culturalNote: "Pakaian Adat represents Indonesia's motto 'Bhinneka Tunggal Ika' (Unity in Diversity) with traditional costumes from Java, Sumatra, Bali, Kalimantan, Sulawesi, Papua, and beyond."
  },
  {
    id: 5,
    text: "My favorite part was the school band.",
    translation: "Bagian terfavorit saya adalah marching band sekolah.",
    section: "Event",
    sectionLabel: "Event 5 (Parade Highlight)",
    verbs: [
      { word: "was", base: "be", type: "irregular", phonetic: "/wʌz/" }
    ],
    vocabulary: [
      { term: "favorite part", meaning: "bagian terfavorit", phonetic: "/ˈfeɪ.vər.ɪt pɑːrt/" },
      { term: "school band", meaning: "drumband / marching band sekolah", phonetic: "/skuːl bænd/" }
    ],
    culturalNote: "School marching bands play patriotic anthems like 'Hari Merdeka' and 'Indonesia Raya' with drums and brass."
  },
  {
    id: 6,
    text: "After the parade, we ate fried rice at a food stall.",
    translation: "Setelah pawai, kami makan nasi goreng di warung makan.",
    section: "Event",
    sectionLabel: "Event 6 (Lunch at Food Stall)",
    verbs: [
      { word: "ate", base: "eat", type: "irregular", phonetic: "/eɪt/" }
    ],
    vocabulary: [
      { term: "fried rice", meaning: "nasi goreng", phonetic: "/fraɪd raɪs/" },
      { term: "food stall", meaning: "warung makan / kaki lima", phonetic: "/fuːd stɔːl/" }
    ],
    timeReference: "After the parade"
  },
  {
    id: 7,
    text: "We went home at noon.",
    translation: "Kami pulang ke rumah pada siang hari.",
    section: "Event",
    sectionLabel: "Event 7 (Heading Home)",
    verbs: [
      { word: "went", base: "go", type: "irregular", phonetic: "/wɛnt/" }
    ],
    vocabulary: [
      { term: "at noon", meaning: "pada tengah hari (12:00)", phonetic: "/æt nuːn/" }
    ],
    timeReference: "at noon (12:00 WIB)"
  },
  {
    id: 8,
    text: "It was a wonderful day.",
    translation: "Hari itu adalah hari yang sangat menyenangkan.",
    section: "Re-orientation",
    sectionLabel: "Re-orientation (Personal Feeling / Conclusion)",
    verbs: [
      { word: "was", base: "be", type: "irregular", phonetic: "/wʌz/" }
    ],
    vocabulary: [
      { term: "wonderful", meaning: "luar biasa / sangat menyenangkan", phonetic: "/ˈwʌn.dər.fəl/" }
    ]
  }
];

export const VERB_PAIRS = [
  { base: "go", past: "went", type: "irregular", rule: "Irregular verb (changes root completely)", ipa: "/ɡoʊ/ → /wɛnt/", id: "pergi" },
  { base: "leave", past: "left", type: "irregular", rule: "Irregular verb (vowel change + t)", ipa: "/liːv/ → /lɛft/", id: "berangkat / pergi" },
  { base: "start", past: "started", type: "regular", rule: "Regular: base ends in /t/, suffix pronounced /ɪd/", ipa: "/stɑːrt/ → /ˈstɑːrtɪd/", id: "memulai" },
  { base: "march", past: "marched", type: "regular", rule: "Regular: base ends in unvoiced /tʃ/, suffix pronounced /t/", ipa: "/mɑːrtʃ/ → /mɑːrtʃt/", id: "berbaris" },
  { base: "wear", past: "wore", type: "irregular", rule: "Irregular verb (vowel change)", ipa: "/wɛər/ → /wɔːr/", id: "mengenakan" },
  { base: "carry", past: "carried", type: "regular", rule: "Regular: ends in consonant + y, changes to -ied, pronounced /d/", ipa: "/ˈkæri/ → /ˈkærid/", id: "membawa" },
  { base: "be (is/am)", past: "was", type: "irregular", rule: "Irregular auxiliary/linking verb for singular subject", ipa: "/biː/ → /wʌz/", id: "adalah / berada" },
  { base: "eat", past: "ate", type: "irregular", rule: "Irregular verb (vowel change)", ipa: "/iːt/ → /eɪt/", id: "makan" }
];

export const INITIAL_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "When did the writer and their family leave home?",
    options: [
      "At seven o'clock in the morning",
      "At eight o'clock",
      "At noon",
      "On August 18th"
    ],
    correctIndex: 0,
    explanation: "Sentence 2 states: 'We left home at seven o'clock in the morning.'"
  },
  {
    id: 2,
    question: "What was the writer's favorite part of the parade?",
    options: [
      "Eating fried rice at the food stall",
      "The school band",
      "Waking up at seven in the morning",
      "Carrying the red and white flags"
    ],
    correctIndex: 1,
    explanation: "Sentence 6 clearly highlights: 'My favorite part was the school band.'"
  },
  {
    id: 3,
    question: "Which past tense verb in the text is a regular verb with the ending pronounced as /ɪd/?",
    options: [
      "went",
      "started",
      "wore",
      "ate"
    ],
    correctIndex: 1,
    explanation: "'Started' ends in /t/, so the regular past suffix -ed is pronounced as an extra syllable: /ˈstɑːrtɪd/."
  },
  {
    id: 4,
    question: "What is the generic structure of the last sentence: 'It was a wonderful day'?",
    options: [
      "Orientation",
      "Event 1",
      "Re-orientation (personal evaluation/comment)",
      "Complication"
    ],
    correctIndex: 2,
    explanation: "In an English Recount Text, the final comment sharing the writer's feelings or evaluation is called the Re-orientation."
  }
];

export const VOICE_OPTIONS = [
  { id: 'Kore', name: 'Kore', gender: 'Female', description: 'Warm, articulate, friendly English teacher voice' },
  { id: 'Puck', name: 'Puck', gender: 'Male', description: 'Upbeat, youthful, student-friendly narrator' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', description: 'Energetic, cheerful, and crisp' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', description: 'Deep, steady, classic storyteller tone' },
  { id: 'Charon', name: 'Charon', gender: 'Male', description: 'Calm, formal, clear pedagogical pacing' },
];

export const STYLE_OPTIONS = [
  { id: 'Clear, lively, educational teacher voice', label: 'Teacher Narration (Warm & Clear)' },
  { id: 'Cheerful junior high student recounting a holiday adventure', label: 'Student Persona (Enthusiastic)' },
  { id: 'Slow, measured pacing for beginner language learners', label: 'Slow & Paced (Beginner English)' },
  { id: 'Excited parade announcer live from Indonesian Independence Day', label: 'Festival Announcer (Festive)' }
];
