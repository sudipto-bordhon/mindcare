import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@mindcare.app').trim().toLowerCase();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
const ADMIN_NAME = (process.env.ADMIN_NAME || 'MindCare System Administrator').trim();
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || ADMIN_PASSWORD || 'mindcare-admin-session-secret';
const adminSessions = new Map<string, string>();

app.use(express.json());

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sudiptobordhon_db_user:Gjj0OHRoyKFITi7h@cluster0.e1g0f6w.mongodb.net/test?retryWrites=true&w=majority';

let isMongoConnected = false;

// User Mongoose Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  ageBand: { type: String, default: 'adult' },
  preferredLanguage: { type: String, default: 'bn' },
  theme: { type: String, default: 'light' },
  role: { type: String, default: 'user' },
  streakDays: { type: Number, default: 1 },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
});

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

// In-memory fallback and seed accounts
interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  ageBand: string;
  preferredLanguage: string;
  theme: string;
  role: string;
  streakDays: number;
  createdAt: string;
}

const memoryUsers: AppUser[] = [
  {
    id: 'user_sudipto',
    name: 'Sudipto Bordhon',
    email: 'sudipto@mindcare.app',
    password: 'mindcare123',
    phone: '+880 1712 345678',
    ageBand: 'adult',
    preferredLanguage: 'bn',
    theme: 'light',
    role: 'user',
    streakDays: 0,
    createdAt: '2026-10-15',
  },
  {
    id: 'user_system_admin',
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    phone: '+880 1819 876543',
    ageBand: 'adult',
    preferredLanguage: 'en',
    theme: 'light',
    role: 'super_admin',
    streakDays: 0,
    createdAt: new Date().toISOString().split('T')[0],
  }
];

// Seed initial users into MongoDB if connected
async function seedDefaultUsers() {
  if (!isMongoConnected) return;
  try {
    for (const u of memoryUsers) {
      if (u.email === ADMIN_EMAIL) {
        await UserModel.updateOne(
          { email: ADMIN_EMAIL },
          {
            $set: {
              id: u.id,
              name: u.name,
              password: u.password,
              phone: u.phone,
              ageBand: u.ageBand,
              preferredLanguage: u.preferredLanguage,
              theme: u.theme,
              role: 'super_admin',
              streakDays: u.streakDays,
            },
            $setOnInsert: { createdAt: u.createdAt },
          },
          { upsert: true }
        );
      } else {
        const existing = await UserModel.findOne({ email: u.email.toLowerCase() });
        if (!existing) {
          await UserModel.create(u);
        }
      }
    }
    console.log(`Default users seeded in MongoDB. System admin: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.warn('Notice: Error seeding default users in MongoDB:', err);
  }
}

// Attempt connection to MongoDB
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    isMongoConnected = true;
    console.log('MongoDB successfully connected to Atlas cluster!');
    seedDefaultUsers();
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn('MongoDB connection note: Running with in-memory resilient database (Atlas cluster selection timed out or IP restricted):', err.message);
  });

// Initialize Gemini client on server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// OpenAI Configuration
const openAIApiKey = process.env.OPENAI_API_KEY;
let openAIQuotaExhaustedUntil = 0;

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Generates warm, compassionate, non-clinical wellness responses when external network is constrained
function generateEmpatheticFallback(userQuery: string, language: string = 'bn'): string {
  const query = (userQuery || '').toLowerCase();
  const isBn = language === 'bn';

  if (isBn) {
    if (query === 'hi' || query === 'hello' || query === 'হাই' || query === 'হ্যালো' || query === 'আসসালামু আলাইকুম') {
      return 'হ্যালো! আমি আপনার কথা শুনতে প্রস্তুত। এই মুহূর্তে আপনার মন কেমন আছে?';
    }
    if (query.includes('প্রশ্ন') || query.includes('question') || query.includes('পাগল') || query.includes('সুস্থ') || query.includes('condition') || query.includes('অবস্থা') || query.includes('টেস্ট') || query.includes('test')) {
      return `প্রথমেই একটি বিষয় আপনাকে আশ্বস্ত করতে চাই—মানসিক চাপ, ক্লান্তি বা অতিরিক্ত দুশ্চিন্তা থাকা মানেই কেউ 'পাগল' হয়ে যাওয়া নয়। শারীরিক অসুস্থতার মতোই মনের ওপরও বিভিন্ন সময়ে অতিরিক্ত প্রেশার তৈরি হয় এবং সঠিক যত্নে মন আবার পুরোপুরি স্বাভাবিক ও সতেজ হয়ে ওঠে।\n\nআপনার মনের বর্তমান অবস্থা বুঝতে এবং আপনাকে কার্যকর পরামর্শ দিতে আমাকে নিচের ৫টি সহজ প্রশ্নের উত্তর দিন:\n\n১. **ঘুমের অবস্থা:** গত কয়েকদিন আপনার ঘুম কেমন হচ্ছে? (মাঝরাতে ভেঙে যাওয়া বা সহজে ঘুম না আসার সমস্যা আছে কি?)\n২. **মন ও মেজাজের অনুভূতি:** দিনের বেশিরভাগ সময় কি মন ভারী, বিষণ্ন বা খিটখিটে লাগছে?\n৩. **শারীরিক ও মানসিক অস্থিরতা:** কোনো নির্দিষ্ট বিষয় বা কারণ ছাড়াই কি বুক ধড়ফড় করা বা অতিরিক্ত ভয়/টেনশন কাজ করছে?\n৪. **আগ্রহ ও কাজের শক্তি:** যেসব কাজ আপনি আগে উপভোগ করতেন, এখন কি সেগুলোতে অনীহা বা অতিরিক্ত ক্লান্তি অনুভব করছেন?\n৫. **অতিরিক্ত চিন্তা (Overthinking):** মাথায় কি বারবার একই নেতিবাচক বা আশঙ্কাজনক চিন্তা ঘুরপাক খাচ্ছে?\n\nআপনি একটি একটি করে বা একসাথে যেভাবে সহজ মনে হয় লিখে জানান। আপনার উত্তরের ওপর ভিত্তি করে আমরা আপনার বর্তমান মানসিক চাপ মূল্যায়ন করব এবং মন হালকা ও ভালো রাখার সহজ কৌশলগুলো ঠিক করব।`;
    }
    if (query.includes('ঘুম') || query.includes('sleep') || query.includes('রাত')) {
      return `আপনার ঘুমের সমস্যা বা ক্লান্তি আপনার শারীরিক ও মানসিক অবস্থাকে প্রভাবিত করতে পারে।\n\nকিছু সহজ টিপস:\n• ঘুমানোর অন্তত ৩০ মিনিট আগে মোবাইল বা স্ক্রিন দূরে রাখুন।\n• ৪-৭-৮ শ্বাসপ্রশ্বাসের কৌশল চেষ্টা করুন (৪ সেকেন্ড নাক দিয়ে শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন, এবং ৮ সেকেন্ডে মুখ দিয়ে ধীরে ধীরে ছাড়ুন)।\n• ঘরের আলো মৃদু রাখুন এবং শান্ত পরিবেশ তৈরি করুন।\n\nনিজের যত্ন নেওয়ার জন্য শরীরকে পর্যাপ্ত সময় দিন।`;
    }
    if (query.includes('উদ্বেগ') || query.includes('অস্থির') || query.includes('ভয়') || query.includes('টেনশন') || query.includes('চাপ') || query.includes('stress') || query.includes('anxiety')) {
      return `আমি বুঝতে পারছি যে আপনি এই মুহূর্তে কিছুটা অস্থিরতা বা মানসিক চাপ অনুভব করছেন। এই অনুভূতিগুলো খুবই স্বাভাবিক এবং আপনি একা নন।\n\nনিজেকে তাৎক্ষণিকভাবে শান্ত করতে এই পদক্ষেপগুলো করতে পারেন:\n১. **৫-৪-৩-২-১ গ্রাউন্ডিং টেকনিক:** আপনার চারপাশের ৫টি জিনিস লক্ষ্য করুন, ৪টি জিনিস স্পর্শ করুন, ৩টি শব্দ শুনুন, ২টি গন্ধ অনুভব করুন এবং ১টি দীর্ঘ গভীর শ্বাস নিন।\n২. এক গ্লাস স্বাভাবিক জল পান করুন এবং কাঁধের পেশীগুলো শিথিল করুন।\n\nমনে রাখবেন, কোনো অনুভূতিই স্থায়ী নয়—আপনি ধীরে ধীরে স্বাভাবিক অবস্থায় ফিরে আসবেন।`;
    }
    if (
      query.includes('খারাপ') ||
      query.includes('কষ্ট') ||
      query.includes('মন') ||
      query.includes('বিষাদ') ||
      query.includes('sad') ||
      query.includes('alone') ||
      query.includes('একা') ||
      query.includes('mon valo nai') ||
      query.includes('mon bhalo nei') ||
      query.includes('mon kharap') ||
      query.includes('amar mon valo') ||
      query.includes('amar mon bhalo')
    ) {
      return `আপনার কষ্টের কথা ভাগ করে নেওয়ার জন্য ধন্যবাদ। যখন অনুভূতিগুলো মনের ভেতর জমে থাকে, তখন মন অনেক ভারী লাগে।\n\n• নিজেকে সময় দিন; মন খারাপ হওয়া কোনো দুর্বলতা নয়।\n• পছন্দের কোনো শান্ত গান শুনতে পারেন বা খোলা বাতাসে কয়েক মিনিট হাঁটতে পারেন।\n• আপনার অনুভূতিগুলো ডায়েরিতে লিখে রাখতে পারেন।\n\nআপনি অনেক মূল্যবান, এবং নিজেকে একটু মমতা দেওয়ার চেষ্টা করুন।`;
    }
    return `আমি আপনার কথা আন্তরিকভাবে শুনেছি। আপনার মনের কথা খোলাখুলি শেয়ার করার জন্য ধন্যবাদ।\n\nমানসিক চাপ কমাতে ও মন ভালো রাখতে কিছু দ্রুত পরামর্শ:\n• প্রতিদিন ছোট ছোট বিরতি নিন এবং বুক ভরে ৩ বার গভীর শ্বাস নিন।\n• মনের ওপর একবারে বেশি কাজের চাপ না নিয়ে একটি একটি করে সম্পূর্ণ করুন।\n• নিজের প্রিয় কোনো শখ বা প্রিয় মানুষের সাথে ১০ মিনিট মন খুলে কথা বলুন।\n\nআপনি চাইলে আপনার মনের বর্তমান অবস্থা সম্পর্কে আমাকে বিস্তারিত বলতে পারেন—আমি আপনাকে সাহায্য করার জন্য প্রস্তুত।`;
  } else {
    if (query.includes('question') || query.includes('test') || query.includes('crazy') || query.includes('condition') || query.includes('insane') || query.includes('healthy')) {
      return `First, please be reassured: experiencing deep stress, exhaustion, or intense emotions does NOT mean you are "crazy". Just like the body gets fatigued, the mind experiences cognitive and emotional overload that is entirely treatable with mindful care.\n\nTo help understand your current mental state, please answer these 5 simple check-in questions:\n\n1. **Sleep Patterns:** How has your sleep been over the past week (trouble falling asleep, waking up early)?\n2. **Daily Mood:** Do you feel down, irritable, or emotionally numb most of the day?\n3. **Physical & Nervous Tension:** Are you experiencing racing thoughts, palpitations, or restlessness?\n4. **Energy & Interest:** Have you lost joy or motivation in activities you usually enjoy?\n5. **Overwhelm & Pressure:** Do you feel that life's demands are too heavy to carry right now?\n\nTake your time to reply. Based on your answers, I will provide targeted strategies to relieve pressure and uplift your mood.`;
    }
    if (query.includes('sleep') || query.includes('insomnia') || query.includes('tired')) {
      return `Sleep challenges can deeply affect your daytime energy and emotional calm.\n\nGentle steps you can try tonight:\n• Disconnect from electronic screens 30-45 minutes before sleep.\n• Try 4-7-8 deep breathing: Inhale for 4s, hold for 7s, exhale for 8s.\n• Keep your sleeping area cool and dark.\n\nBe patient with yourself—your body knows how to heal with rest.`;
    }
    if (query.includes('anxiety') || query.includes('anxious') || query.includes('stress') || query.includes('panic') || query.includes('overwhelm')) {
      return `I hear the stress you are experiencing, and it is completely understandable to feel overwhelmed.\n\nTry this quick 5-4-3-2-1 Grounding exercise right now:\n1. Notice 5 things you can see around you.\n2. Touch 4 things near you.\n3. Listen for 3 distinct sounds.\n4. Notice 2 aromas.\n5. Take 1 slow, deep diaphragmatic breath.\n\nTake it one breath at a time. You are safe in this moment.`;
    }
    return `Thank you for sharing your thoughts with me. Self-care begins with giving yourself permission to pause and breathe.\n\n• Take three deep breaths through your nose and out through your mouth.\n• Drink a glass of water and gently roll your shoulders back.\n• Take small, manageable steps today without pressuring yourself.\n\nI am here to support you whenever you need to reflect or unwind.`;
  }
}

// Clean and sanitize messages for Gemini API
function sanitizeGeminiContents(messages: AIMessage[]) {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const m of messages) {
    if (!m.content || !m.content.trim()) continue;
    const role: 'user' | 'model' = m.role === 'assistant' ? 'model' : 'user';

    // Gemini API requires the first turn to have role 'user'
    if (contents.length === 0 && role === 'model') {
      continue;
    }

    // Merge consecutive turns with the same role
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${m.content}`;
    } else {
      contents.push({
        role,
        parts: [{ text: m.content }]
      });
    }
  }

  // Ensure at least one valid user message exists
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  return contents;
}

async function requestAICompletion({
  systemInstruction,
  messages,
  temperature = 0.7,
  responseFormat,
  language = 'bn',
}: {
  systemInstruction: string;
  messages: AIMessage[];
  temperature?: number;
  responseFormat?: 'json' | 'text';
  language?: string;
}): Promise<{ text: string; source: string }> {
  // Extract last user message for fallback matching
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  // 1. Try OpenAI if key is present AND not currently blocked by quota exhaustion
  if (openAIApiKey && Date.now() > openAIQuotaExhaustedUntil) {
    try {
      const openAiMessages = [
        { role: 'system', content: systemInstruction },
        ...messages
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openAiMessages,
          temperature,
          ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {})
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return { text: content, source: 'openai-gpt-4o-mini' };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || res.statusText;
        if (res.status === 429 || errMsg.includes('quota') || errMsg.includes('insufficient_quota')) {
          console.warn('OpenAI quota exhausted. Switching immediately to Gemini for the next 15 minutes.');
          openAIQuotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
        } else {
          console.warn('OpenAI API returned non-OK status, falling back to Gemini:', errMsg);
        }
      }
    } catch (err: any) {
      console.warn('OpenAI request timed out or errored, falling back to Gemini:', err?.message);
    }
  }

  // 2. High-speed Gemini implementation
  if (aiClient) {
    const contents = sanitizeGeminiContents(messages);

    // Primary: Gemini 3.1 Flash Lite (ultra-low latency ~1.5s, natural multilingual)
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction,
          ...(responseFormat === 'json' ? { responseMimeType: 'application/json' } : {})
        }
      });

      if (response?.text) {
        return { text: response.text.trim(), source: 'gemini-3.1-flash-lite' };
      }
    } catch (liteErr: any) {
      console.warn('Gemini 3.1 Flash Lite error, attempting Gemini 3.8 Flash:', liteErr?.message);
    }

    // Secondary: Gemini 3.8 Flash with low thinking level
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          ...(responseFormat === 'json' ? { responseMimeType: 'application/json' } : {})
        }
      });

      if (response?.text) {
        return { text: response.text.trim(), source: 'gemini-3.8-flash' };
      }
    } catch (flashErr: any) {
      console.error('Gemini 3.8 Flash error:', flashErr?.message);
    }
  }

  // 3. Resilient instant compassionate fallback engine (Guarantees user never sees infinite loading)
  if (responseFormat === 'json') {
    return {
      text: JSON.stringify({
        patterns: [
          language === 'bn' ? 'নিয়মিত বিরতিতে বিশ্রাম মানসিক ভারসাম্য বজায় রাখতে সহায়তা করে।' : 'Regular rest intervals support emotional stability.',
          language === 'bn' ? 'দৈনিক অনুভূতি পর্যবেক্ষণ স্ট্রেস কমাতে ভূমিকা রাখে।' : 'Daily mood tracking helps recognize personal stressors.'
        ],
        summary: language === 'bn' ? 'আপনার সার্বিক সুস্থতা যাত্রায় আপনি সচেষ্ট আছেন।' : 'You are mindfully tracking your wellness journey.'
      }),
      source: 'mindcare_compassionate_engine'
    };
  }

  return {
    text: generateEmpatheticFallback(lastUserMsg, language),
    source: 'mindcare_compassionate_engine'
  };
}

// Crisis safety keywords for immediate safety protocol
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'self harm', 'cutting myself',
  'আত্মহত্যা', 'মরতে চাই', 'নিজেকে শেষ', 'জীবন শেষ'
];

function checkCrisis(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
}

function isWellnessRelated(text: string): boolean {
  const query = text.toLowerCase();
  const wellnessTerms = [
    'মন', 'মেজাজ', 'কষ্ট', 'দুঃখ', 'খারাপ', 'চাপ', 'টেনশন', 'উদ্বেগ', 'ভয়', 'ঘুম',
    'একা', 'কান্না', 'অস্থির', 'শান্ত', 'বিষণ্ন', 'আত্মহত্যা', 'মানসিক', 'স্বাস্থ্য',
    'mood', 'mind', 'mon', 'valo', 'bhalo', 'nai', 'kharap', 'sad', 'happy', 'stress', 'anxiety', 'panic', 'sleep', 'lonely',
    'depressed', 'depression', 'mental', 'feel', 'feeling', 'tension', 'worry',
    'upset', 'cry', 'calm', 'suicide', 'self harm', 'hello', 'hi', 'হাই', 'হ্যালো'
  ];
  return wellnessTerms.some(term => query.includes(term));
}

// Health & Database status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MindCare API',
    mongoStatus: isMongoConnected ? 'connected' : 'memory_fallback',
    aiAvailable: !!aiClient,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db-status', (req, res) => {
  res.json({
    connected: isMongoConnected,
    mode: isMongoConnected ? 'MongoDB Atlas' : 'In-Memory Secure Store',
    uriMasked: 'mongodb+srv://sudiptobordhon_db_user:****@cluster0.e1g0f6w.mongodb.net'
  });
});

// Demo accounts endpoint for 1-click preview
app.get('/api/auth/demo-users', (req, res) => {
  res.json({
    demoAccounts: [
      {
        name: 'Sudipto Bordhon',
        email: 'sudipto@mindcare.app',
        password: 'mindcare123',
        role: 'user',
        badge: 'Regular User (14-Day History)',
        ageBand: 'adult'
      },
      {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: 'super_admin',
        badge: 'System Administrator',
        ageBand: 'adult'
      }
    ]
  });
});

// Authentication: Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, ageBand = 'adult', preferredLanguage = 'bn', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    if (isMongoConnected) {
      const existing = await UserModel.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      }
    } else {
      const existingMem = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (existingMem) {
        return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      }
    }

    const newUserObj: AppUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      phone: phone || '',
      ageBand,
      preferredLanguage,
      theme: 'light',
      role: 'user',
      streakDays: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (isMongoConnected) {
      await UserModel.create(newUserObj);
    }
    // Always sync in-memory for zero latency
    memoryUsers.push(newUserObj);

    // Exclude password in response
    const { password: _, ...safeUser } = newUserObj;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: safeUser,
      database: isMongoConnected ? 'MongoDB' : 'Memory'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error creating account. Please try again.' });
  }
});

// Authentication: Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let matchedUser: AppUser | null = null;

    if (isMongoConnected) {
      const dbUser = await UserModel.findOne({ email: cleanEmail });
      if (dbUser && dbUser.password === cleanPassword) {
        matchedUser = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          password: dbUser.password,
          phone: dbUser.phone,
          ageBand: dbUser.ageBand,
          preferredLanguage: dbUser.preferredLanguage,
          theme: dbUser.theme,
          role: dbUser.role,
          streakDays: dbUser.streakDays,
          createdAt: dbUser.createdAt
        };
      }
    }

    // Fallback to memoryUsers if not found or MongoDB offline
    if (!matchedUser) {
      const memUser = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword);
      if (memUser) {
        matchedUser = memUser;
      }
    }

    if (!matchedUser) {
      return res.status(401).json({ error: 'Invalid email or password. Please try again or use the demo login credentials.' });
    }

    const { password: _, ...safeUser } = matchedUser as AppUser & { adminToken?: string };
    if (matchedUser.role === 'admin' || matchedUser.role === 'super_admin') {
      const payload = Buffer.from(JSON.stringify({
        userId: matchedUser.id,
        role: matchedUser.role,
        expiresAt: Date.now() + (8 * 60 * 60 * 1000),
      })).toString('base64url');
      const signature = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('base64url');
      safeUser.adminToken = `${payload}.${signature}`;
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      user: safeUser
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during sign in.' });
  }
});

function isAdminRequest(req: express.Request): boolean {
  const token = req.headers['x-admin-token'];
  if (typeof token !== 'string') return false;
  if (adminSessions.has(token)) return true;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  try {
    const expectedSignature = crypto.createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('base64url');
    const validSignature = signature.length === expectedSignature.length
      && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!validSignature) return false;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      userId?: string;
      role?: string;
      expiresAt?: number;
    };
    return (session.role === 'admin' || session.role === 'super_admin')
      && typeof session.userId === 'string'
      && typeof session.expiresAt === 'number'
      && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function safeUser(user: AppUser | Record<string, unknown>) {
  const { password: _password, ...withoutPassword } = user as AppUser;
  return withoutPassword;
}

app.get('/api/admin/users', async (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'Admin authorization required.' });
  try {
    const databaseUsers = isMongoConnected
      ? await UserModel.find({}, { password: 0, _id: 0 }).sort({ createdAt: -1 }).lean()
      : [];
    const usersByEmail = new Map<string, Record<string, unknown>>();
    for (const user of databaseUsers) {
      usersByEmail.set(String(user.email).toLowerCase(), user);
    }
    for (const user of memoryUsers) {
      const email = user.email.toLowerCase();
      if (!usersByEmail.has(email)) usersByEmail.set(email, safeUser(user));
    }
    const users = Array.from(usersByEmail.values()).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    res.json({ users });
  } catch (error) {
    console.error('Admin user listing error:', error);
    res.status(500).json({ error: 'Unable to load users.' });
  }
});

app.patch('/api/admin/users/:id', async (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'Admin authorization required.' });
  const { role } = req.body;
  if (!['user', 'counselor', 'admin', 'super_admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid user role.' });
  }
  if (req.params.id === 'user_system_admin') {
    return res.status(400).json({ error: 'The system administrator role cannot be changed.' });
  }
  try {
    if (isMongoConnected) {
      const updated = await UserModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: { role } },
        { new: true, projection: { password: 0, _id: 0 } }
      ).lean();
      if (!updated) return res.status(404).json({ error: 'User not found.' });
      return res.json({ user: updated });
    }
    const user = memoryUsers.find(item => item.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.role = role;
    return res.json({ user: safeUser(user) });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({ error: 'Unable to update user.' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  if (!isAdminRequest(req)) return res.status(403).json({ error: 'Admin authorization required.' });
  if (req.params.id === 'user_system_admin') {
    return res.status(400).json({ error: 'The system administrator cannot be deleted.' });
  }
  try {
    if (isMongoConnected) {
      const deleted = await UserModel.findOneAndDelete({ id: req.params.id });
      if (!deleted) return res.status(404).json({ error: 'User not found.' });
    } else {
      const index = memoryUsers.findIndex(item => item.id === req.params.id);
      if (index < 0) return res.status(404).json({ error: 'User not found.' });
      memoryUsers.splice(index, 1);
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('Admin user deletion error:', error);
    return res.status(500).json({ error: 'Unable to delete user.' });
  }
});

// Mind Assistant chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en', ageBand = 'adult', memoryConsent = true } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const isCrisis = checkCrisis(message);

    if (isCrisis) {
      const crisisReply = language === 'bn'
        ? `আমি শুনতে পাচ্ছি যে আপনি খুব কঠিন সময়ের মধ্য দিয়ে যাচ্ছেন, এবং আপনার এই কষ্ট অত্যন্ত গুরুত্বপূর্ণ। অনুগ্রহ করে একা থাকবেন না—সাহায্য নেওয়ার জন্য মানুষ প্রস্তুত আছেন।\n\n🚨 **জরুরি সহায়তা ও হটলাইন (বাংলাদেশ):**\n- **জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন:** ১৬১২২ (বিনামূল্যে)\n- **কান পেতে রই (ইমোশনাল সাপোর্ট):** ০১৭৭৯৫৫৪৩৯১\n- **জরুরি জাতীয় সেবা:** ৯৯৯\n- **আন্তর্জাতিক:** Crisis Text Line (HOME লিখে 741741 এ এসএমএস করুন) অথবা 988\n\nঅনুগ্রহ করে এখনই কোনো বিশ্বস্ত পরিবার/বন্ধুর সাথে যোগাযোগ করুন অথবা নিকটস্থ হাসপাতালে যান। আপনার জীবন মূল্যবান।`
        : `I hear how much pain and distress you are experiencing right now, and your safety is deeply important. Please do not carry this alone—there are compassionate people ready to support you right now.\n\n🚨 **Immediate Crisis & Emergency Helplines:**\n- **Bangladesh National Mental Health Helpline:** 16122 (Toll-free)\n- **Kaan Pete Roi (Emotional Support Helpline):** +8801779554391\n- **National Emergency Assistance:** 999\n- **International Suicide & Crisis Lifeline:** 988 (USA/Canada) or text HOME to 741741\n\nPlease reach out to a trusted loved one or contact emergency services immediately. You matter, and support is available.`;

      return res.json({
        reply: crisisReply,
        isCrisis: true,
        source: 'crisis_protocol',
      });
    }

    if (!isWellnessRelated(message)) {
      const outOfScopeReply = language === 'bn'
        ? 'আমি শুধু মানসিক সুস্থতা, মুড, স্ট্রেস, ঘুম ও self-care বিষয়ে সহায়তা করি। বাংলাদেশ বা অন্যান্য সাধারণ তথ্যের প্রশ্নের উত্তর আমি দিতে পারি না। আপনার মন বা অনুভূতি নিয়ে কিছু শেয়ার করতে চাইলে বলুন—আমি শুনছি।'
        : 'I can only help with mental wellness, mood, stress, sleep, and self-care. I cannot answer general factual questions. If you would like to share how you are feeling, I am here to listen.';
      return res.json({
        reply: outOfScopeReply,
        isCrisis: false,
        source: 'wellness_scope_guard',
      });
    }

    const systemInstruction = `You are MindCare's wellness chatbot, an expert, deeply empathetic, supportive, and non-judgmental wellness companion designed for users in Bangladesh and worldwide.
Current language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
User age band: ${ageBand}.

Core Capabilities & Conversational Guidelines:
1. SPECIFICITY OVER BOILERPLATE: Always directly address the user's specific words, questions, emotions, and scenarios. Never give generic boilerplate responses.
2. MENTAL CONDITION CHECK & QUESTIONS:
   - If the user asks you to assess their state, ask questions, or asks: "আমাকে কিছু প্রশ্ন করো", "আমি কি সুস্থ নাকি পাগল / খারাপ অবস্থায় আছি", or similar:
     a) Reassure with warmth and destigmatize: Emphatically clarify that emotional distress, heavy thoughts, or feeling overwhelmed does NOT mean someone is "পাগল" (crazy/mad). Mental fatigue or anxiety is as real and treatable as physical fatigue.
     b) Actively present 5 friendly, focused interactive questions (numbered 1 to 5) evaluating:
        1. ঘুমের মান ও স্থায়িত্ব (Sleep patterns & quality)
        2. মেজাজ ও বিষণ্নতার অনুভূতি (Mood, persistent sadness or irritability)
        3. শারীরিক ও মানসিক উদ্বেগ (Physical tension, palpitations, racing thoughts)
        4. উৎসাহ ও কাজের এনার্জি (Interest, motivation, daily functioning)
        5. মাথার ওপর অতিরিক্ত চাপ ও নেতিবাচক চিন্তা (Overthinking, helplessness, pressure)
     c) Invite the user to answer these questions at their own pace.
3. PROVIDING ACTIONABLE SOLUTIONS & CARE:
   - When the user shares answers or describes their condition, provide insightful, structured feedback on their emotional state, followed by concrete guidance:
     • মন ভালো রাখার উপায় (Ways to uplift mood, re-energize, and restore joy)
     • মনের ওপর প্রেশার বা মানসিক চাপ কমানোর উপায় (Evidence-informed ways to relieve mental pressure, boundary setting, 4-7-8 breathing)
     • মন শান্ত ও স্থিতিশীল করার সহজ দৈনন্দিন কৌশল (Grounding 5-4-3-2-1, hydration, light movement)
     • Remind them that MindCare offers clinical-grade PHQ-9 and GAD-7 self-assessments right in the app, as well as verified counselors in the Doctor section.
4. CLINICAL BOUNDARIES:
   - You are an empathetic wellness chatbot, not a licensed medical doctor or prescribing psychiatrist. Do not prescribe medicines or provide rigid clinical diagnoses, but DO provide compassionate psychoeducation and evidence-informed coping tools.
5. TONE & LANGUAGE:
   - Speak in warm, conversational, authentic ${language === 'bn' ? 'Bengali (সহানুভূতিশীল ও সহজ বাংলা)' : 'English'}. Use bullet points and clean structure so advice is easy to read and absorb.
6. SCOPE:
   - Only answer mental wellness and self-care questions. Never answer unrelated general-knowledge questions.`;

    const formattedMessages: AIMessage[] = [];

    if (memoryConsent && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-6);
      for (const item of recentHistory) {
        if (item.role && item.content) {
          formattedMessages.push({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            content: item.content
          });
        }
      }
    }

    formattedMessages.push({
      role: 'user',
      content: message
    });

    const aiRes = await requestAICompletion({
      systemInstruction,
      messages: formattedMessages,
      temperature: 0.7,
      language,
    });

    res.json({
      reply: aiRes.text,
      isCrisis: false,
      source: aiRes.source
    });
  } catch (error: any) {
    console.error('Error generating chatbot response:', error);
    const lang = req.body?.language || 'en';
    const errorFallback = lang === 'bn'
      ? 'দুঃখিত, সংযোগে কিছু সমস্যা হয়েছে। তবে মনে রাখবেন, গভীর শ্বাস নেওয়া এবং এক গ্লাস জল পান করা এই মুহূর্তে আপনাকে কিছুটা স্বস্তি দিতে পারে।'
      : 'I encountered a temporary connection issue. Take a gentle breath, hydrate, and know that you are doing your best today.';
    res.json({
      reply: errorFallback,
      isCrisis: false,
      source: 'fallback_error_recovery'
    });
  }
});

function buildLocalGuidance(checkIns: any[], screenings: any[], language: string): string[] {
  const isBn = language === 'bn';
  const latestCheckIn = [...checkIns]
    .sort((a, b) => String(b.updatedAt || b.createdAt || b.date).localeCompare(String(a.updatedAt || a.createdAt || a.date)))[0];
  const latestScreening = screenings[0];
  const recommendations: string[] = [];

  if (latestScreening?.flaggedSafetyQuestion) {
    recommendations.push(isBn
      ? 'টেস্টে নিরাপত্তা-সংক্রান্ত উত্তরের ইঙ্গিত আছে। এখনই বিশ্বাসযোগ্য কারও সঙ্গে কথা বলুন; নিজেকে নিরাপদ রাখা কঠিন হলে স্থানীয় জরুরি সহায়তা নিন।'
      : 'A test response raised a safety concern. Reach out to someone you trust now; if you may not be able to stay safe, contact local emergency support.');
  } else if (latestScreening?.recommendation) {
    recommendations.push(String(latestScreening.recommendation));
  }

  if (latestCheckIn?.stressLevel >= 8) {
    recommendations.push(isBn
      ? 'আজ ৩–৫ মিনিট ধীরে শ্বাস নেওয়া বা grounding অনুশীলন করুন, তারপর বিশ্বাসযোগ্য কারও সঙ্গে আপনার চাপের কথা ভাগ করুন।'
      : 'Try 3–5 minutes of paced breathing or grounding today, then share how you are feeling with someone you trust.');
  } else if (latestCheckIn?.stressLevel >= 5) {
    recommendations.push(isBn
      ? 'কাজের মাঝে ছোট বিরতি নিয়ে কয়েক মিনিট ধীরে শ্বাস নিন; পরের check-in-এ চাপের পরিবর্তন লিখুন।'
      : 'Take a short break for a few minutes of slow breathing, then note any change in your next check-in.');
  } else if (latestCheckIn?.sleepHours < 7) {
    recommendations.push(isBn
      ? 'আজ রাতে ঘুমের জন্য একটু আগে থেকে শান্ত হওয়ার রুটিন রাখার চেষ্টা করুন।'
      : 'Try starting a calming bedtime routine a little earlier tonight.');
  } else if (latestCheckIn) {
    recommendations.push(isBn
      ? 'যে দৈনন্দিন অভ্যাসগুলো আপনাকে ভালো রাখে সেগুলো চালিয়ে যান এবং নিয়মিত check-in করুন।'
      : 'Continue the routines that support you and keep checking in regularly.');
  }

  if (latestScreening?.flaggedSafetyQuestion && latestCheckIn?.stressLevel >= 8) {
    recommendations.push(isBn
      ? 'নিজেকে নিরাপদ রাখতে অসুবিধা হলে একা থাকবেন না এবং জরুরি সহায়তার সঙ্গে যোগাযোগ করুন।'
      : 'If staying safe feels difficult, do not stay alone and contact emergency support.');
  }

  return recommendations.slice(0, 3);
}

// Stress pattern analysis (Strictly based on real user check-in data)
app.post('/api/stress-analysis', async (req, res) => {
  try {
    const {
      checkIns = [],
      screenings = [],
      journalEntries = [],
      language = 'en',
      journalConsented = false,
    } = req.body;
    if (!Array.isArray(checkIns)) {
      return res.status(400).json({ error: 'checkIns must be an array' });
    }

    const recentScreenings = Array.isArray(screenings)
      ? [...screenings].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 10)
      : [];

    // Zero-data state: if user has no real check-in or screening data, do NOT generate fake mock data
    if (checkIns.length === 0 && recentScreenings.length === 0) {
      return res.json({
        patterns: [],
        summary: language === 'bn'
          ? 'আপনার এখনো কোনো দৈনিক চেক-ইন তথ্য রেকর্ড করা হয়নি। আপনার নিজস্ব স্ট্রেস ও ঘুমের সম্পর্কের ওপর চ্যাটবটের পর্যবেক্ষণ পেতে অনুগ্রহ করে দৈনিক অ্যাসেসমেন্ট সম্পন্ন করুন।'
          : 'No check-in data recorded yet. Please complete at least one daily assessment to allow the chatbot to generate personalized observational patterns based on your real logs.',
        recommendations: [],
        disclaimer: language === 'bn'
          ? 'এই পর্যবেক্ষণ কোনো ডাক্তারি ডায়াগনোসিস নয়।'
          : 'This observational pattern recognition is non-diagnostic.'
      });
    }

    const recentCheckIns = [...checkIns]
      .sort((a, b) => String(b.updatedAt || b.createdAt || b.date).localeCompare(String(a.updatedAt || a.createdAt || a.date)))
      .slice(0, 10);
    const consentedJournalEntries = journalConsented && Array.isArray(journalEntries)
      ? journalEntries.slice(0, 10)
      : [];
    const prompt = `Analyze these real self-reported mental wellness check-in records for a user.
Check-in records: ${JSON.stringify(recentCheckIns)}
Screening results: ${JSON.stringify(recentScreenings)}
${consentedJournalEntries.length > 0 ? `User-consented journal entries: ${JSON.stringify(consentedJournalEntries)}` : 'Journal entries are excluded because chatbot journal analysis consent is not enabled.'}

Generate:
1. 3 cautious observational patterns using all available provided records (use phrases like "may be associated with", "correlates with").
2. 1 short encouraging summary (under 60 words).
3. 2-3 practical, compassionate next-step recommendations based on the check-ins and screening results. Prioritize a flagged safety response and the screening report's recommendation when present. Do not diagnose or prescribe.
Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
Strict rule: DO NOT diagnose, use medical pathology words, or claim certainty. Return valid JSON only with keys "patterns" (array of strings), "summary" (string), and "recommendations" (array of strings).`;

    const aiRes = await requestAICompletion({
      systemInstruction: 'You are an observational, evidence-informed mental wellness data analyst. Respond only in valid JSON.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      responseFormat: 'json',
      language,
    });

    const parsed = JSON.parse(aiRes.text || '{}');
    const parsedRecommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((item: unknown): item is string => typeof item === 'string')
      : [];
    res.json({
      patterns: parsed.patterns || [
        language === 'bn' ? 'পর্যাপ্ত বিশ্রাম মেজাজের স্থায়িত্ব রক্ষায় সহায়ক হতে পারে।' : 'Adequate rest appears associated with steadier energy levels.'
      ],
      summary: parsed.summary || (language === 'bn' ? 'আপনার সুস্থতা যাত্রায় আপনি এগিয়ে যাচ্ছেন।' : 'You are mindfully tracking your wellness journey.'),
      recommendations: parsedRecommendations.length > 0
        ? parsedRecommendations.slice(0, 3)
        : buildLocalGuidance(recentCheckIns, recentScreenings, language),
      source: aiRes.source,
      disclaimer: language === 'bn'
        ? 'এই বিশ্লেষণ কোনো ডাক্তারি ডায়াগনোসিস নয়।'
        : 'This pattern recognition is non-diagnostic and observational only.'
    });
  } catch (error) {
    console.error('Error in stress analysis:', error);
    const latest = Array.isArray(req.body?.checkIns)
      ? [...req.body.checkIns]
        .sort((a, b) => String(b.updatedAt || b.createdAt || b.date).localeCompare(String(a.updatedAt || a.createdAt || a.date)))[0]
      : null;
    const localPatterns = latest
      ? req.body?.language === 'bn'
        ? [
          `আপনার সর্বশেষ মুড ${latest.moodLabel || `${latest.mood}/৫`} এবং self-reported stress ${latest.stressLevel}/১০।`,
          `${latest.sleepHours} ঘণ্টা ঘুম ও ${latest.sleepQuality} sleep quality আপনার আজকের wellness context-এর অংশ।`,
          `আপনার energy ${latest.energyLevel}/১০ এবং focus ${latest.focusLevel}/১০ হিসেবে নথিভুক্ত হয়েছে।`
        ]
        : [
          `Your latest mood was ${latest.moodLabel || `${latest.mood}/5`} with self-reported stress at ${latest.stressLevel}/10.`,
          `Your logged sleep was ${latest.sleepHours} hours with ${latest.sleepQuality} quality as today’s wellness context.`,
          `Your recorded energy was ${latest.energyLevel}/10 and focus was ${latest.focusLevel}/10.`
        ]
      : [];
    res.json({
      patterns: localPatterns,
      summary: req.body?.language === 'bn'
        ? (latest
          ? 'আপনার সংরক্ষিত check-in থেকে একটি স্থানীয় wellness summary তৈরি হয়েছে। আরও দিনের data যোগ হলে সময়ের সঙ্গে পরিবর্তনও দেখা যাবে।'
          : 'আপনার সংরক্ষিত টেস্টের ফল অনুযায়ী স্থানীয় wellness guidance তৈরি হয়েছে।')
        : (latest
          ? 'A local wellness summary was generated from your saved check-in. More days of data will make changes over time easier to compare.'
          : 'Local wellness guidance was generated from your saved screening results.'),
      recommendations: buildLocalGuidance(
        Array.isArray(req.body?.checkIns) ? req.body.checkIns : [],
        Array.isArray(req.body?.screenings) ? req.body.screenings : [],
        req.body?.language || 'en'
      ),
      source: 'local-check-in-summary',
      disclaimer: req.body?.language === 'bn'
        ? 'এটি self-reported wellness data-এর summary, কোনো diagnosis নয়।'
        : 'This is a summary of self-reported wellness data, not a diagnosis.'
    });
  }
});

app.post('/api/weekly-integrated-report', async (req, res) => {
  const { checkIns, screenings, asOfDate, language = 'en' } = req.body || {};
  const isBn = language === 'bn';

  if (!Array.isArray(checkIns) || !Array.isArray(screenings)) {
    return res.status(400).json({ error: 'checkIns and screenings must be arrays' });
  }
  if (typeof asOfDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(asOfDate)) {
    return res.status(400).json({ error: 'asOfDate must use YYYY-MM-DD format' });
  }

  const endDate = new Date(`${asOfDate}T00:00:00.000Z`);
  if (Number.isNaN(endDate.getTime()) || endDate.toISOString().slice(0, 10) !== asOfDate) {
    return res.status(400).json({ error: 'asOfDate is not a valid date' });
  }
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 6);
  const weekStart = startDate.toISOString().slice(0, 10);
  const latestScreeningDate = new Date(endDate);
  latestScreeningDate.setUTCDate(latestScreeningDate.getUTCDate() - 29);
  const screeningStart = latestScreeningDate.toISOString().slice(0, 10);

  const weekCheckIns = checkIns
    .filter((entry: any) =>
      typeof entry?.date === 'string' &&
      entry.date >= weekStart &&
      entry.date <= asOfDate &&
      ['mood', 'stressLevel', 'sleepHours', 'energyLevel'].every(key => Number.isFinite(entry[key]))
    )
    .sort((a: any, b: any) => a.date.localeCompare(b.date))
    .map((entry: any) => ({
      date: entry.date,
      mood: entry.mood,
      stressLevel: entry.stressLevel,
      sleepHours: entry.sleepHours,
      energyLevel: entry.energyLevel,
    }));

  const screeningByInstrument = new Map<string, any>();
  screenings
    .filter((entry: any) =>
      typeof entry?.date === 'string' &&
      entry.date >= screeningStart &&
      entry.date <= asOfDate &&
      typeof entry.instrumentId === 'string' &&
      Number.isFinite(entry.totalScore) &&
      Number.isFinite(entry.maxScore) &&
      entry.maxScore > 0
    )
    .sort((a: any, b: any) => b.date.localeCompare(a.date))
    .forEach((entry: any) => {
      if (!screeningByInstrument.has(entry.instrumentId)) {
        screeningByInstrument.set(entry.instrumentId, {
          instrumentId: entry.instrumentId,
          instrumentTitle: entry.instrumentTitle,
          date: entry.date,
          totalScore: entry.totalScore,
          maxScore: entry.maxScore,
          band: entry.band,
          bandColor: entry.bandColor,
          recommendation: entry.recommendation,
          flaggedSafetyQuestion: Boolean(entry.flaggedSafetyQuestion),
        });
      }
    });
  const recentScreenings = Array.from(screeningByInstrument.values());

  const average = (key: 'mood' | 'stressLevel' | 'sleepHours' | 'energyLevel') =>
    weekCheckIns.length
      ? Number((weekCheckIns.reduce((sum, entry) => sum + entry[key], 0) / weekCheckIns.length).toFixed(1))
      : null;
  const averages = {
    mood: average('mood'),
    stressLevel: average('stressLevel'),
    sleepHours: average('sleepHours'),
    energyLevel: average('energyLevel'),
  };
  const insights: string[] = [];
  const recommendations: string[] = [];
  const elevatedScreenings = recentScreenings.filter((entry: any) =>
    /moderate|severe|high|elevated|মাঝারি|তীব্র|উচ্চ/i.test(String(entry.band || ''))
  );
  const highStressWeek = averages.stressLevel !== null && averages.stressLevel >= 7;
  const shortSleepWeek = averages.sleepHours !== null && averages.sleepHours < 7;

  if (weekCheckIns.length < 3) {
    insights.push(isBn
      ? 'সাপ্তাহিক দৈনিক প্রবণতা বোঝার জন্য অন্তত ৩টি check-in দরকার; বর্তমানে তথ্য সীমিত।'
      : 'At least 3 check-ins are needed to describe a weekly daily pattern; current data is limited.');
  } else if (recentScreenings.length > 0 && (highStressWeek || shortSleepWeek)) {
    const factors = [
      ...(highStressWeek ? [isBn ? 'গড় স্ব-প্রতিবেদিত চাপ বেশি' : 'higher average self-reported stress'] : []),
      ...(shortSleepWeek ? [isBn ? 'গড় ঘুম ৭ ঘণ্টার কম' : 'average sleep below 7 hours'] : []),
    ];
    const bands = elevatedScreenings.map((entry: any) => `${entry.instrumentTitle}: ${entry.band}`);
    insights.push(isBn
      ? `এই সপ্তাহে ${factors.join(' ও ')} এবং সাম্প্রতিক ${bands.length ? bands.join(', ') : 'স্ক্রিনিং ফল'} একই রিপোর্টে দেখা যাচ্ছে। এটি শুধু পাশাপাশি দেখা তথ্য—পরিসংখ্যানগত correlation বা রোগ নির্ণয় নয়।`
      : `This week shows ${factors.join(' and ')} alongside recent ${bands.length ? bands.join(', ') : 'screening results'}. These are co-occurring observations, not a statistical correlation or diagnosis.`);
  } else if (weekCheckIns.length >= 3 && recentScreenings.length === 0) {
    insights.push(isBn
      ? 'সাম্প্রতিক ৩০ দিনে কোনো মানসিক স্বাস্থ্য টেস্ট নেই; তাই দৈনিক প্রবণতার সঙ্গে test result একত্রে তুলনা করা যায়নি।'
      : 'There are no screening results from the last 30 days, so daily trends cannot be compared alongside a recent test result.');
  } else if (weekCheckIns.length >= 3 && recentScreenings.length > 0) {
    insights.push(isBn
      ? 'এই সপ্তাহের check-in ও সাম্প্রতিক test result একসঙ্গে দেখানো হয়েছে; এক সপ্তাহের তথ্য থেকে কারণ বা statistical correlation নির্ধারণ করা যায় না।'
      : 'This week’s check-ins and recent screening results are shown together; one week of data cannot establish cause or statistical correlation.');
  }

  if (recentScreenings.some((entry: any) => entry.flaggedSafetyQuestion)) {
    recommendations.push(isBn
      ? 'একটি টেস্টে নিরাপত্তা-সংক্রান্ত উত্তরের ইঙ্গিত আছে। এখনই বিশ্বাসযোগ্য কারও সঙ্গে কথা বলুন; নিজেকে নিরাপদ রাখা কঠিন হলে স্থানীয় জরুরি সহায়তা নিন।'
      : 'A test response raised a safety concern. Reach out to someone you trust now; if you may not be able to stay safe, contact local emergency support.');
  }
  if (elevatedScreenings.length > 0 && !recommendations.some(text => text.includes('নিরাপত্তা') || text.includes('safety'))) {
    recommendations.push(isBn
      ? 'টেস্টের ফল মাঝারি বা বেশি পরিসরে এসেছে। ফল ও পরবর্তী পদক্ষেপ নিয়ে একজন মানসিক স্বাস্থ্য পেশাজীবীর সঙ্গে কথা বলার কথা বিবেচনা করুন।'
      : 'A screening result is in a moderate or higher band. Consider discussing the result and next steps with a mental health professional.');
  }
  if (highStressWeek) {
    recommendations.push(isBn
      ? 'চাপ বেশি থাকলে আজ ৩–৫ মিনিট ধীরে শ্বাস নেওয়া বা grounding অনুশীলন করুন এবং বিশ্বাসযোগ্য কারও সঙ্গে কথা বলুন।'
      : 'If stress feels high, try 3–5 minutes of paced breathing or grounding today and talk with someone you trust.');
  } else if (shortSleepWeek) {
    recommendations.push(isBn
      ? 'গড় ঘুম ৭ ঘণ্টার কম। সম্ভব হলে নিয়মিত ঘুমের সময় ও শান্ত bedtime routine রাখার চেষ্টা করুন।'
      : 'Average sleep was below 7 hours. If possible, keep a regular sleep schedule and a calming bedtime routine.');
  }

  let aiAnalysis: {
    summary: string;
    observations: string[];
    recommendations: string[];
    source: string;
    generatedByAi: boolean;
  } | null = null;

  if (recentScreenings.length > 0) {
    const reportContext = {
      period: { startDate: weekStart, endDate: asOfDate },
      checkInCount: weekCheckIns.length,
      averages,
      screenings: recentScreenings,
      observations: insights,
      recommendations: recommendations.slice(0, 3),
    };
    const fallbackAnalysis = {
      summary: isBn
        ? `আপনার ${recentScreenings.map((entry: any) => `${entry.instrumentTitle} ${entry.totalScore}/${entry.maxScore} (${entry.band})`).join(', ')} ফল এবং গত ৭ দিনের ${weekCheckIns.length}টি check-in একসঙ্গে বিবেচনা করা হয়েছে।`
        : `Your ${recentScreenings.map((entry: any) => `${entry.instrumentTitle} score of ${entry.totalScore}/${entry.maxScore} (${entry.band})`).join(', ')} result${recentScreenings.length > 1 ? 's were' : ' was'} reviewed alongside ${weekCheckIns.length} check-in${weekCheckIns.length === 1 ? '' : 's'} from the last 7 days.`,
      observations: insights,
      recommendations: recommendations.slice(0, 3),
    };

    try {
      const aiResult = await requestAICompletion({
        systemInstruction: `You are MindCare's mental wellness report assistant. Give compassionate, practical observations based only on the supplied screening scores and self-reported weekly check-ins. Screening results are non-diagnostic. Do not diagnose, claim that one measure caused another, or call co-occurrence a statistical correlation. Recommend professional support when a test band or its supplied recommendation warrants it. Reply in ${isBn ? 'natural Bengali' : 'English'} and return valid JSON with keys "summary" (string), "observations" (array of strings), and "recommendations" (array of strings).`,
        messages: [{
          role: 'user',
          content: `Write a concise personalized analysis of this weekly wellness report and its screening results:\n${JSON.stringify(reportContext)}`,
        }],
        temperature: 0.3,
        responseFormat: 'json',
        language,
      });
      const parsed = JSON.parse(aiResult.text || '{}');
      if (
        aiResult.source !== 'mindcare_compassionate_engine' &&
        typeof parsed.summary === 'string' &&
        Array.isArray(parsed.observations) &&
        Array.isArray(parsed.recommendations)
      ) {
        aiAnalysis = {
          summary: parsed.summary,
          observations: parsed.observations.filter((item: unknown): item is string => typeof item === 'string').slice(0, 4),
          recommendations: parsed.recommendations.filter((item: unknown): item is string => typeof item === 'string').slice(0, 3),
          source: aiResult.source,
          generatedByAi: true,
        };
      } else {
        aiAnalysis = {
          ...fallbackAnalysis,
          source: 'local-report-analysis',
          generatedByAi: false,
        };
      }
    } catch (error) {
      console.error('Error generating weekly screening analysis:', error);
      aiAnalysis = {
        ...fallbackAnalysis,
        source: 'local-report-analysis',
        generatedByAi: false,
      };
    }
  }

  return res.json({
    period: { startDate: weekStart, endDate: asOfDate },
    checkInCount: weekCheckIns.length,
    averages,
    dailyCheckIns: weekCheckIns,
    screenings: recentScreenings,
    insights,
    recommendations: recommendations.slice(0, 3),
    aiAnalysis,
    disclaimer: isBn
      ? 'এটি স্ব-প্রতিবেদিত wellness তথ্য ও non-diagnostic screening-এর সারসংক্ষেপ; কোনো রোগ নির্ণয় বা পরিসংখ্যানগত correlation নয়।'
      : 'This summarizes self-reported wellness data and non-diagnostic screenings; it is not a diagnosis or a statistical correlation.',
  });
});

// Journal Reflection (Strictly consent-gated)
app.post('/api/journal-reflection', async (req, res) => {
  try {
    const { content, mood, language = 'en', userConsented = false, title = '', category = '' } = req.body;

    if (!userConsented) {
      return res.status(403).json({ error: 'Chatbot journal analysis consent has not been granted by user.' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const systemInstruction = `You are MindCare's wellness chatbot providing a journal reflection.
Use the same warm, specific, non-judgmental wellness style as the main MindCare chatbot.
Reply in ${language === 'bn' ? 'simple natural Bengali (সহজ, স্বাভাবিক বাংলা)' : 'clear, warm English'}.
Read the user's actual journal carefully and refer to its specific emotion or situation.
Return 3 short paragraphs:
1. Validate the feeling without exaggerating it.
2. Reflect one specific strength, need, or pattern present in the writing.
3. Offer one gentle, practical self-care step and one optional question for further reflection.
Do not diagnose, label the user, prescribe treatment, or claim certainty. Do not repeat generic advice that is unrelated to the entry.`;

    const prompt = `Journal title: ${title || 'Untitled'}
Category: ${category || 'Personal reflection'}
Mood tag: ${mood || 'Not specified'}
Journal content:
"""${content.slice(0, 5000)}"""

Write a thoughtful reflection based only on this journal entry.`;

    const aiRes = await requestAICompletion({
      systemInstruction,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    res.json({
      reflection: aiRes.text.trim(),
      source: aiRes.source
    });
  } catch (error) {
    console.error('Error in journal reflection:', error);
    const lang = (req.body?.language as string) || 'en';
    res.json({
      reflection: lang === 'bn'
        ? 'আপনার অনুভূতিগুলো ডায়েরিতে লিখে রাখা আত্মউপলব্ধির এক বড় ধাপ। নিজেকে সাধুবাদ দিন।'
        : 'Reflecting on your inner thoughts brings clarity, calm, and mindfulness.'
    });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindCare fullstack server running on http://localhost:${PORT}`);
  });
}

startServer();
