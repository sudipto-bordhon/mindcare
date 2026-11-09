import { 
  User, 
  ConsentSettings, 
  CheckIn, 
  ScreeningInstrument, 
  ScreeningAttempt, 
  JournalEntry, 
  WellnessActivity, 
  ProfessionalContact, 
  AuditEvent,
  Article 
} from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'user_sudipto',
    name: 'Sudipto Bordhon',
    email: 'sudipto@mindcare.app',
    phone: '+880 1712 345678',
    ageBand: 'adult',
    preferredLanguage: 'bn',
    theme: 'light',
    role: 'user',
    createdAt: '2026-10-15',
    streakDays: 0,
  },
  {
    id: 'user_dr_farhana',
    name: 'Dr. Farhana Rahman (Psychologist)',
    email: 'farhana@mindcare.app',
    phone: '+880 1819 876543',
    ageBand: 'adult',
    preferredLanguage: 'en',
    theme: 'light',
    role: 'admin',
    createdAt: '2026-09-01',
    streakDays: 0,
  }
];

export const DEFAULT_CONSENT: ConsentSettings = {
  aiMemoryConsent: true,
  journalAnalysisConsent: false,
  analyticsConsent: true,
  lastUpdated: new Date().toISOString()
};

export const SCREENING_INSTRUMENTS: ScreeningInstrument[] = [
  {
    id: 'phq9',
    code: 'PHQ-9',
    titleEn: 'PHQ-9 Depression Screener',
    titleBn: 'PHQ-9 বিষণ্ণতা স্ক্রিনার',
    descriptionEn: 'Over the last 1 week, how often have you been bothered by any of the following problems?',
    descriptionBn: 'গত ১ সপ্তাহে নিচের সমস্যাগুলো আপনাকে কতটা উদ্বিগ্ন বা বিরক্ত করেছে?',
    disclaimerEn: 'PHQ-9 is an evidence-informed self-administered tool used worldwide. It indicates severity levels for discussion with a doctor, not an automatic clinical diagnosis.',
    disclaimerBn: 'PHQ-9 বিশ্বব্যাপী ব্যবহৃত একটি প্রমাণ-ভিত্তিক নির্দেশনামূলক টেস্ট। এটি কোনো স্বয়ংক্রিয় চিকিৎসা নয়, বরং চিকিৎসকের সাথে আলোচনার সহায়ক।',
    isStandardized: true,
    licenseInfo: 'Pfizer Inc. Public domain clinical measure.',
    optionsEn: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
    optionsBn: ['একেবারেই না (০)', 'কয়েক দিন (১)', 'অর্ধেকের বেশি দিন (২)', 'প্রায় প্রতিদিন (৩)'],
    questions: [
      { id: 1, textEn: 'Little interest or pleasure in doing things', textBn: 'কোনো কাজ করতে ভালো না লাগা বা আগ্রহের অভাব' },
      { id: 2, textEn: 'Feeling down, depressed, or hopeless', textBn: 'মন খারাপ, বিষণ্ণ বা হতাশ বোধ করা' },
      { id: 3, textEn: 'Trouble falling or staying asleep, or sleeping too much', textBn: 'ঘুম আসতে সমস্যা হওয়া, বারবার ঘুম ভাঙা অথবা অতিরিক্ত ঘুমানো' },
      { id: 4, textEn: 'Feeling tired or having little energy', textBn: 'ক্লান্ত বোধ করা অথবা শরীরে শক্তি না পাওয়া' },
      { id: 5, textEn: 'Poor appetite or overeating', textBn: 'খাবারে অরুচি হওয়া অথবা প্রয়োজনের চেয়ে বেশি খাওয়া' },
      { id: 6, textEn: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', textBn: 'নিজের সম্পর্কে খারাপ ধারণা— নিজেকে ব্যর্থ ভাবা বা পরিবারকে হতাশ করেছেন মনে হওয়া' },
      { id: 7, textEn: 'Trouble concentrating on things, such as reading the newspaper or watching television', textBn: 'কোনো কাজে মনোযোগ দিতে সমস্যা হওয়া (যেমন পত্রিকা পড়া বা পড়াশোনা)' },
      { id: 8, textEn: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being fidgety/restless', textBn: 'এত ধীরগতিতে চলাফেরা বা কথা বলা যা অন্যরা খেয়াল করে, অথবা খুব বেশি অস্থির বোধ করা' },
      { id: 9, textEn: 'Thoughts that you would be better off dead, or of hurting yourself in some way', textBn: 'বেঁচে থাকার চেয়ে মরে যাওয়া ভালো— এমন চিন্তা অথবা নিজেকে আঘাত করার ইচ্ছা' },
    ],
    scoringBands: [
      {
        min: 0,
        max: 4,
        bandEn: 'Minimal or None',
        bandBn: 'ন্যূনতম বা স্বাভাবিক',
        color: 'emerald',
        recommendationEn: 'Your responses indicate typical everyday fluctuations. Continue healthy sleep and self-care practices.',
        recommendationBn: 'আপনার মানসিক অবস্থা স্বাভাবিক মাত্রায় রয়েছে। নিয়মিত ঘুম ও সুস্থ জীবনযাত্রা বজায় রাখুন।'
      },
      {
        min: 5,
        max: 9,
        bandEn: 'Mild Symptoms',
        bandBn: 'মৃদু লক্ষণ',
        color: 'blue',
        recommendationEn: 'Mild mood low detected. Consider regular physical activity, stress-journaling, and mindful relaxation.',
        recommendationBn: 'মৃদু বিষণ্ণতার লক্ষণ দেখা যাচ্ছে। নিয়মিত হালকা ব্যায়াম, ডায়েরি লেখা ও মননশীল রিলাক্সেশন চর্চা করুন।'
      },
      {
        min: 10,
        max: 14,
        bandEn: 'Moderate Symptoms',
        bandBn: 'মাঝারি লক্ষণ',
        color: 'amber',
        recommendationEn: 'Moderate low mood. We recommend consulting a counselor or doctor for structured coping strategies.',
        recommendationBn: 'মাঝারি মাত্রার বিষণ্ণতা। একজন মানসিক স্বাস্থ্য বিশেষজ্ঞ বা কাউন্সেলরের সাথে পরামর্শ করা ইতিবাচক হবে।'
      },
      {
        min: 15,
        max: 19,
        bandEn: 'Moderately Severe Symptoms',
        bandBn: 'মাঝারি তীব্র লক্ষণ',
        color: 'orange',
        recommendationEn: 'Moderately severe depressive symptoms. Active support from a mental health professional is strongly encouraged.',
        recommendationBn: 'মাঝারি তীব্র বিষণ্ণতা। পেশাদার মনোরোগ বিশেষজ্ঞ বা ক্লিনিক্যাল সাইকোলজিস্টের সহায়তা গ্রহণ করা প্রয়োজন।'
      },
      {
        min: 20,
        max: 27,
        bandEn: 'Severe Symptoms',
        bandBn: 'তীব্র লক্ষণ',
        color: 'rose',
        recommendationEn: 'Severe symptoms detected. Please reach out to a trusted professional or contact the 16122 helpline.',
        recommendationBn: 'তীব্র বিষণ্ণতার লক্ষণ। অতিসত্বর বিশেষজ্ঞ চিকিৎসকের শরণাপন্ন হন অথবা ১৬১২২ হেল্পলাইনে যোগাযোগ করুন।'
      }
    ]
  },
  {
    id: 'gad7',
    code: 'GAD-7',
    titleEn: 'GAD-7 Anxiety Screener',
    titleBn: 'GAD-7 উদ্বেগ ও উৎকণ্ঠা স্ক্রিনার',
    descriptionEn: 'Over the last 1 week, how often have you been bothered by the following problems?',
    descriptionBn: 'গত ১ সপ্তাহে নিচের সমস্যাগুলো আপনাকে কতটা উদ্বিগ্ন করেছে?',
    disclaimerEn: 'GAD-7 is a standardized 7-item anxiety screening tool. Results are descriptive and intended for wellness guidance.',
    disclaimerBn: 'GAD-7 হলো ৭টি প্রশ্নের একটি বৈজ্ঞানিক উদ্বেগ মূল্যায়ন টুল। এটি নির্দেশনামূলক তথ্য প্রদান করে।',
    isStandardized: true,
    licenseInfo: 'Spitzer RL, Kroenke K, Williams JB, Löwe B (2006). Public domain.',
    optionsEn: ['Not at all (0)', 'Several days (1)', 'More than half the days (2)', 'Nearly every day (3)'],
    optionsBn: ['একেবারেই না (০)', 'কয়েক দিন (১)', 'অর্ধেকের বেশি দিন (২)', 'প্রায় প্রতিদিন (৩)'],
    questions: [
      { id: 1, textEn: 'Feeling nervous, anxious, or on edge', textBn: 'উদ্বিগ্ন, অস্থির বা নার্ভাস বোধ করা' },
      { id: 2, textEn: 'Not being able to stop or control worrying', textBn: 'দুশ্চিন্তা থামাতে বা নিয়ন্ত্রণ করতে না পারা' },
      { id: 3, textEn: 'Worrying too much about different things', textBn: 'বিভিন্ন বিষয় নিয়ে অতিরিক্ত দুশ্চিন্তা করা' },
      { id: 4, textEn: 'Trouble relaxing', textBn: 'শরীর ও মন শিথিল করতে বা রিলাক্স করতে কষ্ট হওয়া' },
      { id: 5, textEn: 'Being so restless that it is hard to sit still', textBn: 'অস্থিরতার কারণে স্থির হয়ে বসে থাকতে না পারা' },
      { id: 6, textEn: 'Becoming easily annoyed or irritable', textBn: 'খুব সহজে খিটখিটে বা বিরক্ত হয়ে যাওয়া' },
      { id: 7, textEn: 'Feeling afraid, as if something awful might happen', textBn: 'ভয় পাওয়া— যেন ভয়ানক কোনো অঘটন ঘটতে যাচ্ছে' },
    ],
    scoringBands: [
      {
        min: 0,
        max: 4,
        bandEn: 'Minimal Anxiety',
        bandBn: 'স্বাভাবিক বা কম উদ্বেগ',
        color: 'emerald',
        recommendationEn: 'Healthy baseline anxiety level. Maintain mindfulness and balanced daily rhythms.',
        recommendationBn: 'আপনার উদ্বেগের মাত্রা স্বাভাবিক। দৈনন্দিন মননশীলতা ও পর্যাপ্ত বিশ্রাম বজায় রাখুন।'
      },
      {
        min: 5,
        max: 9,
        bandEn: 'Mild Anxiety',
        bandBn: 'মৃদু উদ্বেগ',
        color: 'blue',
        recommendationEn: 'Mild anxiety symptoms. Practice regular 4-7-8 breathing exercises and reduce late caffeine intake.',
        recommendationBn: 'মৃদু উদ্বেগ রয়েছে। ৪-৭-৮ শ্বাস-প্রশ্বাসের ব্যায়াম এবং সন্ধ্যার পর ক্যাফেইন কমানোর চেষ্টা করুন।'
      },
      {
        min: 10,
        max: 14,
        bandEn: 'Moderate Anxiety',
        bandBn: 'মাঝারি উদ্বেগ',
        color: 'amber',
        recommendationEn: 'Moderate anxiety symptoms. Exploring stress reduction techniques or speaking with a therapist is recommended.',
        recommendationBn: 'মাঝারি মাত্রার উদ্বেগ। স্ট্রেস কমানোর কৌশল এবং একজন থেরাপিস্টের সাথে কথা বলা উপকারী হবে।'
      },
      {
        min: 15,
        max: 21,
        bandEn: 'Severe Anxiety',
        bandBn: 'তীব্র উদ্বেগ',
        color: 'rose',
        recommendationEn: 'Significant anxiety levels. Please consult a qualified mental health clinician for tailored support.',
        recommendationBn: 'উচ্চমাত্রার উদ্বেগ লক্ষণ। অনুগ্রহ করে একজন মানসিক স্বাস্থ্য বিশেষজ্ঞের সাথে যোগাযোগ করুন।'
      }
    ]
  },
  {
    id: 'burnout',
    code: 'BURNOUT-CUSTOM',
    titleEn: 'Work-Life Balance & Burnout Check (Custom Non-Clinical)',
    titleBn: 'কর্মক্ষেত্রে ভারসাম্য ও বার্নআউট টেস্ট (কাস্টম)',
    descriptionEn: 'A custom, non-clinical wellness check to gauge physical exhaustion, cynicism, and mental fatigue.',
    descriptionBn: 'শারীরিক ক্লান্তি, কাজের প্রতি অনীহা ও মানসিক অবসাদ পর্যালোচনার জন্য একটি কাস্টম সুস্থতা টেস্ট।',
    disclaimerEn: 'This custom wellness questionnaire is non-clinical and has not been normed for diagnostic classification.',
    disclaimerBn: 'এই কাস্টম টেস্টটি নন-ক্লিনিক্যাল এবং কোনো রোগ নির্ধারণের জন্য নয়।',
    isStandardized: false,
    licenseInfo: 'MindCare Custom Educational Questionnaire',
    optionsEn: ['Rarely (0)', 'Sometimes (1)', 'Frequently (2)', 'Almost Always (3)'],
    optionsBn: ['খুব কম (০)', 'মাঝে মাঝে (১)', 'প্রায়ই (২)', 'সব সময় (৩)'],
    questions: [
      { id: 1, textEn: 'I feel emotionally drained at the end of the workday', textBn: 'কাজের দিন শেষে আমি মানসিকভাবে ক্লান্ত বোধ করি' },
      { id: 2, textEn: 'I feel cynical or detached about my daily tasks', textBn: 'আমার দৈনন্দিন কাজের প্রতি অনীহা বা বিরক্তি লাগে' },
      { id: 3, textEn: 'I find it hard to disconnect from work during family or rest hours', textBn: 'বিশ্রামের সময়েও কাজের চিন্তা মাথা থেকে বের করতে পারি না' },
      { id: 4, textEn: 'I feel my accomplishments are not making a meaningful difference', textBn: 'মনে হয় আমার কাজ কোনো অর্থপূর্ণ ফল বয়ে আনছে না' },
      { id: 5, textEn: 'I experience unexplained headaches, tight shoulders, or digestive tension', textBn: 'অকারণ মাথাব্যথা, কাঁধে টান বা শারীরিক অস্বস্তি বোধ করি' }
    ],
    scoringBands: [
      {
        min: 0,
        max: 4,
        bandEn: 'Healthy Equilibrium',
        bandBn: 'সুস্থ ভারসাম্যপূর্ণ অবস্থা',
        color: 'emerald',
        recommendationEn: 'Your boundaries appear healthy and restorative.',
        recommendationBn: 'কাজের সাথে বিশ্রামের ভারসাম্য বেশ ইতিবাচক।'
      },
      {
        min: 5,
        max: 9,
        bandEn: 'Early Fatigue Signs',
        bandBn: 'ক্লান্তির প্রাথমিক সংকেত',
        color: 'blue',
        recommendationEn: 'Take short hourly micro-breaks and protect evening rest.',
        recommendationBn: 'প্রতি ঘণ্টায় ছোট বিরতি নিন এবং রাতে বিশ্রামের সময় সুরক্ষিত রাখুন।'
      },
      {
        min: 10,
        max: 15,
        bandEn: 'High Burnout Strain',
        bandBn: 'উচ্চমাত্রার বার্নআউট চাপ',
        color: 'amber',
        recommendationEn: 'Set firm work boundary limits and schedule intentional recharge days.',
        recommendationBn: 'কাজের নির্দিষ্ট সীমারেখা তৈরি করুন এবং পূর্ণ বিশ্রামের দিন নির্ধারণ করুন।'
      }
    ]
  }
];

export const INITIAL_CHECKINS: CheckIn[] = [];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [];

export const INITIAL_SCREENINGS: ScreeningAttempt[] = [];

export const WELLNESS_ACTIVITIES: WellnessActivity[] = [
  {
    id: 'act_478_breathing',
    titleEn: '4-7-8 Relaxing Breath',
    titleBn: '৪-৭-৮ রিলাক্সিং নিঃশ্বাস অনুশীলন',
    category: 'breathing',
    durationMinutes: 4,
    descriptionEn: 'Dr. Andrew Weil’s natural tranquilizer for the nervous system. Calms heart rate and reduces acute tension.',
    descriptionBn: 'স্নায়ুতন্ত্রকে শান্ত করার বৈজ্ঞানিক পদ্ধতি। হৃদস্পন্দন স্বাভাবিক করে এবং দ্রুত মানসিক চাপ কমায়।',
    instructionsEn: [
      'Sit comfortably with your back straight and feet flat on the floor.',
      'Inhale quietly through your nose for a count of 4 seconds.',
      'Hold your breath comfortably for 7 seconds.',
      'Exhale completely and gently through your mouth for 8 seconds with a soft whoosh sound.',
      'Repeat this cycle for 4 full rounds.'
    ],
    instructionsBn: [
      'সোজা হয়ে আরাম করে বসুন এবং শরীর শিথিল রাখুন।',
      '৪ সেকেন্ড ধরে নাক দিয়ে ধীরে ধীরে গভীর শ্বাস নিন।',
      '৭ সেকেন্ড ধরে শ্বাসটি স্বাভাবিকভাবে ধরে রাখুন।',
      '৮ সেকেন্ড ধরে মুখ দিয়ে ধীরে ধীরে বাতাস বের করে দিন।',
      'এই চক্রটি ৪ বার পুনরাবৃত্তি করুন।'
    ],
    audioSupported: true
  },
  {
    id: 'act_box_breathing',
    titleEn: 'Box Breathing (Navy SEAL Calm)',
    titleBn: 'বক্স ব্রিদিং (৪-৪-৪-৪ পদ্ধতি)',
    category: 'breathing',
    durationMinutes: 5,
    descriptionEn: 'Equal-duration tactical breathing technique used by first responders to maintain composure under pressure.',
    descriptionBn: 'উচ্চ মানসিক চাপে স্থিরতা বজায় রাখার জন্য অত্যন্ত কার্যকর ৪ সেকেন্ডের চতুর্ভুজ শ্বাস পদ্ধতি।',
    instructionsEn: [
      'Step 1: Slowly inhale through your nose counting to 4.',
      'Step 2: Hold your lungs full for 4 seconds.',
      'Step 3: Exhale smoothly through mouth counting to 4.',
      'Step 4: Hold with empty lungs for 4 seconds before the next breath.'
    ],
    instructionsBn: [
      'ধাপ ১: ৪ সেকেন্ড ধরে নাক দিয়ে শ্বাস নিন।',
      'ধাপ ২: ৪ সেকেন্ড ফুসফুসে বাতাস ধরে রাখুন।',
      'ধাপ ৩: ৪ সেকেন্ড ধরে মুখ দিয়ে শ্বাস ছাড়ুন।',
      'ধাপ ৪: ৪ সেকেন্ড নিঃশ্বাস ছেড়ে রাখা অবস্থায় অপেক্ষা করুন।'
    ],
    audioSupported: true
  },
  {
    id: 'act_grounding_54321',
    titleEn: '5-4-3-2-1 Sensory Grounding',
    titleBn: '৫-৪-৩-২-১ সেন্সরি গ্রাউন্ডিং টেকনিক',
    category: 'grounding',
    durationMinutes: 5,
    descriptionEn: 'Engages all five senses to interrupt panic or racing thoughts by bringing attention back to the present room.',
    descriptionBn: 'তীব্র উৎকণ্ঠায় পঞ্চ ইন্দ্রিয়ের সাহায্যে মনোযোগকে বর্তমান মুহূর্তে ফিরিয়ে আনার সেরা বৈজ্ঞানিক পদ্ধতি।',
    instructionsEn: [
      '5 Things: Look around and acknowledge 5 things you can see (e.g., pen, clock, shadow).',
      '4 Things: Acknowledge 4 things you can physically touch (e.g., fabric of pants, table edge, hair).',
      '3 Things: Listen carefully and notice 3 sounds you can hear (e.g., fan hum, distant cars, breathing).',
      '2 Things: Identify 2 scents you can smell right now (e.g., fresh air, tea aroma, soap).',
      '1 Thing: Notice 1 taste in your mouth, or take a refreshing sip of water.'
    ],
    instructionsBn: [
      '৫টি জিনিস: চারপাশের ৫টি জিনিস চোখে দেখে মনে মনে নাম বলুন (যেমন: ঘড়ি, কলম, দেয়াল)।',
      '৪টি জিনিস: ৪টি জিনিস হাত দিয়ে স্পর্শ করুন (যেমন: জামার কাপড়, টেবিলের কোণ)।',
      '৩টি শব্দ: চোখ বন্ধ করে আশপাশের ৩টি শব্দ শোনার চেষ্টা করুন (যেমন: ফ্যানের শব্দ, গাড়ির হর্ন)।',
      '২টি গন্ধ: যেকোনো ২টি গন্ধ অনুভব করুন (যেমন: চা বা কফির সুবাস, সাবান)।',
      '১টি স্বাদ: মুখে অনুভূত একটি স্বাদ চিহ্নিত করুন বা এক ঢোক পানি পান করুন।'
    ],
    audioSupported: false
  },
  {
    id: 'act_sleep_hygiene',
    titleEn: 'Restful Sleep Hygiene Ritual',
    titleBn: 'নিবিড় ঘুমের রাতের রুটিন',
    category: 'sleep',
    durationMinutes: 10,
    descriptionEn: 'Step-by-step evening wind-down checklist to prepare your circadian rhythm for deep restorative sleep.',
    descriptionBn: 'গভীর ও শান্ত ঘুমের জন্য একটি বিজ্ঞানসম্মত সান্ধ্যকালীন প্রস্তুতি গাইড।',
    instructionsEn: [
      'Dim blue-spectrum screens 45 minutes prior to bed or switch to warm night light.',
      'Ensure the bedroom is pleasantly cool and dark.',
      'Write down tomorrow’s 3 main tasks on paper to unload cognitive pressure.',
      'Avoid high-sugar snacks or heavy caffeine after 6:00 PM.',
      'Practice 5 minutes of gentle neck and shoulder stretching in bed.'
    ],
    instructionsBn: [
      'ঘুমানোর ৪৫ মিনিট আগে মোবাইল ও কম্পিউটার স্ক্রিনের উজ্জ্বল আলো বন্ধ বা ডিম করুন।',
      'শোবার ঘরটি ঠান্ডা, শান্ত এবং অন্ধকার রাখুন।',
      'আগামীকালের প্রধান ৩টি কাজ কাগজে লিখে রাখুন যাতে মনের ওপর চাপ না থাকে।',
      'সন্ধ্যার পর চা, কফি বা অতিরিক্ত মিষ্টি খাবার পরিহার করুন।',
      'বিছানায় শুয়ে ৫ মিনিট কাঁধ ও ঘাড়ের হালকা স্ট্রেচিং করুন।'
    ],
    audioSupported: false
  },
  {
    id: 'act_body_scan',
    titleEn: 'Mindful Body Scan',
    titleBn: 'মননশীল বডি স্ক্যান',
    category: 'mindfulness',
    durationMinutes: 8,
    descriptionEn: 'Notice sensations from your feet to your face without judging or changing them.',
    descriptionBn: 'পা থেকে মুখ পর্যন্ত শরীরের অনুভূতিগুলো বিচার না করে লক্ষ্য করুন।',
    instructionsEn: [
      'Sit or lie down comfortably and take three easy breaths.',
      'Move attention slowly from your feet to your head.',
      'Notice warmth, pressure, tension, or ease without needing to fix anything.'
    ],
    instructionsBn: [
      'আরাম করে বসুন বা শুয়ে তিনটি স্বাভাবিক শ্বাস নিন।',
      'ধীরে ধীরে পা থেকে মাথা পর্যন্ত মনোযোগ নিন।',
      'উষ্ণতা, চাপ বা টান লক্ষ্য করুন—কিছু পরিবর্তন করার দরকার নেই।'
    ]
  },
  {
    id: 'act_gratitude_reset',
    titleEn: 'Three-Minute Gratitude Reset',
    titleBn: '৩ মিনিটের কৃতজ্ঞতা অনুশীলন',
    category: 'mindfulness',
    durationMinutes: 3,
    descriptionEn: 'Gently shift attention toward small supportive moments in your day.',
    descriptionBn: 'দিনের ছোট সহায়ক মুহূর্তগুলোর দিকে কোমলভাবে মনোযোগ ফেরান।',
    instructionsEn: [
      'Name one person, place, or thing that supported you today.',
      'Write one small moment that felt okay or comforting.',
      'Take one breath and choose one kind action for yourself.'
    ],
    instructionsBn: [
      'আজ আপনাকে সহায়তা করেছে এমন একজন, স্থান বা জিনিসের নাম বলুন।',
      'স্বস্তিদায়ক একটি ছোট মুহূর্ত লিখুন।',
      'একটি শ্বাস নিয়ে নিজের জন্য একটি যত্নশীল কাজ বেছে নিন।'
    ]
  },
  {
    id: 'act_mindful_walk',
    titleEn: 'Mindful Walking Reset',
    titleBn: 'মননশীল হাঁটার বিরতি',
    category: 'mindfulness',
    durationMinutes: 10,
    descriptionEn: 'Use a gentle walk to reconnect with your body, surroundings, and breathing.',
    descriptionBn: 'হালকা হাঁটার মাধ্যমে শরীর, চারপাশ ও শ্বাসের সঙ্গে সংযোগ তৈরি করুন।',
    instructionsEn: [
      'Walk at an easy pace and notice each foot touching the ground.',
      'Name three things you can see and two sounds you can hear.',
      'Let your shoulders soften and return attention to your breathing.'
    ],
    instructionsBn: [
      'ধীরে হাঁটুন এবং প্রতিটি পা মাটিতে পড়ার অনুভূতি লক্ষ্য করুন।',
      'দেখতে পাওয়া ৩টি জিনিস ও শোনা ২টি শব্দ চিহ্নিত করুন।',
      'কাঁধ শিথিল করে শ্বাসের দিকে মনোযোগ ফিরিয়ে আনুন।'
    ]
  }
];

export const PROFESSIONAL_DIRECTORY: ProfessionalContact[] = [
  {
    id: 'hl_16122',
    nameEn: 'National Mental Health Helpline (NIMH & DGHS)',
    nameBn: 'জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন (১৬১২২)',
    titleEn: 'Government Toll-Free Mental Health Support',
    titleBn: 'সরকারি বিনামূল্যে মানসিক স্বাস্থ্য সহায়তা সেবা',
    organization: 'Directorate General of Health Services (DGHS), Bangladesh',
    qualification: 'Certified Clinical Psychologists & Medical Officers',
    specialtyEn: 'Immediate psychological first-aid, stress, depression & anxiety counseling',
    specialtyBn: 'জরুরি মানসিক প্রাথমিক চিকিৎসা, বিষণ্ণতা ও উদ্বেগ দূরীকরণে পরামর্শ',
    locationEn: 'Nationwide (Bangladesh)',
    locationBn: 'সারাদেশে (বাংলাদেশ)',
    phone: '16122',
    isEmergencyHelpline: true,
    tollFree: true,
    verified: true,
    verifiedDate: '2026-10-01'
  },
  {
    id: 'hl_kaan_pete_roi',
    nameEn: 'Kaan Pete Roi (কান পেতে রই)',
    nameBn: 'কান পেতে রই (ইমোশনাল সাপোর্ট হেল্পলাইন)',
    titleEn: 'First Emotional Support & Suicide Prevention Helpline in Bangladesh',
    titleBn: 'বাংলাদেশের প্রথম ইমোশনাল সাপোর্ট ও সুইসাইড প্রিভেনশন হেল্পলাইন',
    organization: 'Kaan Pete Roi Emotional Helpline Initiative',
    qualification: 'Trained Active Listening Volunteers & Crisis Counselors',
    specialtyEn: 'Confidential empathetic listening, acute emotional distress, loneliness',
    specialtyBn: 'গোপনীয় সহানুভূতিশীল শ্রবণ, তীব্র মানসিক কষ্ট ও একাকীত্ব লাঘবে সমর্থন',
    locationEn: 'Dhaka, Bangladesh (Phone-based)',
    locationBn: 'ঢাকা, বাংলাদেশ (ফোন সেবা)',
    phone: '+880 1779 554391',
    email: 'help@kaanpeteroi.org',
    isEmergencyHelpline: true,
    tollFree: false,
    verified: true,
    verifiedDate: '2026-09-15'
  },
  {
    id: 'hl_national_999',
    nameEn: 'National Emergency Service (Bangladesh 999)',
    nameBn: 'জাতীয় জরুরি সেবা (৯৯৯)',
    titleEn: 'Immediate Crisis, Police, Fire & Medical Ambulance Dispatch',
    titleBn: 'পুলিশ, ফায়ার সার্ভিস ও জরুরি অ্যাম্বুলেন্স সেবা',
    organization: 'Bangladesh Police',
    qualification: 'Emergency Response Operators',
    specialtyEn: 'Immediate physical danger, critical medical emergencies',
    specialtyBn: 'তাৎক্ষণিক জীবনের ঝুঁকি ও জরুরি শারীরিক চিকিৎসা প্রয়োজন',
    locationEn: 'All Districts of Bangladesh',
    locationBn: 'বাংলাদেশের সকল জেলা',
    phone: '999',
    isEmergencyHelpline: true,
    tollFree: true,
    verified: true,
    verifiedDate: '2026-11-01'
  },
  {
    id: 'dr_nimh',
    nameEn: 'National Institute of Mental Health (NIMH)',
    nameBn: 'জাতীয় মানসিক স্বাস্থ্য ইনস্টিটিউট ও হাসপাতাল',
    titleEn: 'Apex Government Psychiatric Teaching Hospital',
    titleBn: 'দেশের শীর্ষস্থানীয় সরকারি মানসিক স্বাস্থ্য চিকিৎসা কেন্দ্র',
    organization: 'NIMH Dhaka',
    qualification: 'FCPS, MD (Psychiatry), MPhil (Clinical Psychology)',
    specialtyEn: 'Comprehensive outpatient & inpatient psychiatric care, psychometry',
    specialtyBn: 'বহির্বিভাগ ও অন্তর্বিভাগ চিকিৎসা, সাইকোথেরাপি ও কাউন্সিলিং',
    locationEn: 'Sher-e-Bangla Nagar, Dhaka-1207, Bangladesh',
    locationBn: 'শেরেবাংলা নগর, ঢাকা-১২০৭, বাংলাদেশ',
    phone: '+880 2-9118171',
    isEmergencyHelpline: false,
    tollFree: false,
    verified: true,
    verifiedDate: '2026-08-20'
  },
  {
    id: 'dr_du_csc',
    nameEn: 'Dhaka University Student Counseling & Guidance Center',
    nameBn: 'ঢাকা বিশ্ববিদ্যালয় ছাত্র নির্দেশনা ও পরামর্শদান দফতর',
    titleEn: 'Youth & Academic Psychological Support Center',
    titleBn: 'শিক্ষার্থী ও তরুণদের মানসিক স্বাস্থ্য সেবা কেন্দ্র',
    organization: 'University of Dhaka',
    qualification: 'Senior Clinical & Educational Psychologists',
    specialtyEn: 'Academic stress, youth career anxiety, relationship counseling',
    specialtyBn: 'পড়াশোনার চাপ, ক্যারিয়ার উদ্বেগ ও ব্যক্তিত্ব বিকাশ',
    locationEn: 'Teacher-Student Centre (TSC), University of Dhaka',
    locationBn: 'টিএসসি, ঢাকা বিশ্ববিদ্যালয়',
    phone: '+880 1711 000000',
    isEmergencyHelpline: false,
    tollFree: false,
    verified: true,
    verifiedDate: '2026-07-10'
  },
  {
    id: 'hl_intl_988',
    nameEn: '988 Suicide & Crisis Lifeline (North America)',
    nameBn: '৯৮৮ সুইসাইড ও ক্রাইসিস লাইফলাইন (আন্তর্জাতিক)',
    titleEn: 'Free, Confidential 24/7 Crisis Response',
    titleBn: '২৪/৭ সার্বক্ষণিক বিনামূল্যে জরুরি ক্রাইসিস সাপোর্ট',
    organization: 'SAMHSA / Vibrant Emotional Health',
    qualification: 'Certified Crisis Workers',
    specialtyEn: 'Free, confidential support for people in suicidal crisis or emotional distress',
    specialtyBn: 'আন্তর্জাতিক ব্যবহারকারীদের জন্য জরুরি সহায়তা',
    locationEn: 'United States & Canada',
    locationBn: 'যুক্তরাষ্ট্র ও কানাডা',
    phone: '988',
    isEmergencyHelpline: true,
    tollFree: true,
    verified: true,
    verifiedDate: '2026-10-10'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud_1',
    actor: 'system',
    action: 'INSTRUMENT_VERIFICATION',
    resourceType: 'ScreeningInstrument',
    timestamp: '2026-11-06T10:00:00Z',
    outcome: 'success',
    details: 'Verified PHQ-9 and GAD-7 translations and boundary scoring metrics.'
  },
  {
    id: 'aud_2',
    actor: 'user_sudipto',
    action: 'AI_CONSENT_UPDATE',
    resourceType: 'ConsentRecord',
    timestamp: '2026-11-05T14:22:10Z',
    outcome: 'success',
    details: 'User updated chatbot memory consent to TRUE and Journal consent to FALSE.'
  },
  {
    id: 'aud_3',
    actor: 'system_security',
    action: 'DATA_MINIMIZATION_SCAN',
    resourceType: 'PrivacyFilter',
    timestamp: '2026-11-05T00:00:00Z',
    outcome: 'success',
    details: 'Automated policy confirmed zero plain journal text recorded into routine access logs.'
  }
];

export const WELLNESS_ARTICLES: Article[] = [
  {
    id: 'art_1',
    titleEn: 'Understanding Panic Attacks & The 4-7-8 Breathing Reset',
    titleBn: 'প্যানিক অ্যাটাকের লক্ষণ ও ৪-৭-৮ শ্বাস নিয়ন্ত্রণের বৈজ্ঞানিক উপায়',
    categoryEn: 'Anxiety Relief',
    categoryBn: 'উদ্বেগ প্রশমন',
    readTimeMinutes: 4,
    summaryEn: 'Why your nervous system enters fight-or-flight without physical danger, and how diaphragmatic breath control restores heart rate variability.',
    summaryBn: 'কেন বাস্তব বিপদের অনুপস্থিতিতেও স্নায়ুতন্ত্র আতঙ্কিত হয়ে পড়ে এবং কীভাবে ৪-৭-৮ শ্বাসপদ্ধতি রক্তচাপ ও হৃদস্পন্দন শান্ত করে।',
    contentEn: `A panic attack is a sudden surge of overwhelming fear or discomfort that peaks within minutes. Physical symptoms often include a pounding heart, shortness of breath, trembling, and dizziness. 

Crucially, while intensely uncomfortable, panic attacks are physiological alarm responses and not medically fatal. When the sympathetic nervous system triggers, adrenaline floods the bloodstream. 

The most effective, accessible tool is physiological pacing: 
1. Breathe in through your nose for 4 seconds.
2. Hold gently for 7 seconds without straining.
3. Exhale with a soft whoosh for 8 seconds.

Lengthening the exhalation directly stimulates the vagus nerve, sending a biochemical signal to your heart that you are physically safe. Repeat for 4 full cycles.`,
    contentBn: `প্যানিক অ্যাটাক হলো কোনো কারণ ছাড়াই হঠাৎ করে তীব্র আতঙ্ক বা ভয়ের ঢেউ আসা, যা সাধারণত ১০ মিনিটের মধ্যে সর্বোচ্চ পর্যায়ে পৌঁছায়। এর লক্ষণগুলোর মধ্যে রয়েছে বুক ধড়ফড় করা, শ্বাসকষ্টের অনুভূতি, মাথা ঘোরা এবং শরীর ঘেমে যাওয়া।

মনে রাখা জরুরি: এটি মারাত্মক শারীরিক কোনো ক্ষতি করে না, বরং এটি আমাদের মস্তিষ্কের একটি সাময়িক 'অ্যালার্ম রেসপন্স'। 

তাৎক্ষণিক শান্ত হওয়ার সবচেয়ে কার্যকর উপায়:
১. নাক দিয়ে ৪ সেকেন্ড ধরে শ্বাস নিন।
২. ৭ সেকেন্ড ধরে স্বাভাবিকভাবে শ্বাস ধরে রাখুন।
৩. মুখ দিয়ে ৮ সেকেন্ডে ধীরে ধীরে বাতাস ছেড়ে দিন।

শ্বাস ছাড়ার সময় বেশি সময় নিলে 'ভেগাস নার্ভ' সক্রিয় হয়ে ওঠে, যা হৃদস্পন্দনকে দ্রুত স্বাভাবিক অবস্থায় ফিরিয়ে আনে। এটি পরপর ৪ বার অনুশীলন করুন।`,
    publishedDate: '2026-10-20',
    author: 'Dr. Farhana Rahman, Clinical Psychologist'
  },
  {
    id: 'art_2',
    titleEn: 'Sleep Hygiene 101: Circadian Alignment in Urban Living',
    titleBn: 'নিবিড় ঘুমের বৈজ্ঞানিক নিয়মাবলী: আধুনিক নাগরিক জীবনের ঘুম সুরক্ষা',
    categoryEn: 'Rest & Recovery',
    categoryBn: 'ঘুম ও বিশ্রাম',
    readTimeMinutes: 5,
    summaryEn: 'How blue light, caffeine timing, and sleep debt affect emotional resilience, memory consolidation, and daytime anxiety.',
    summaryBn: 'স্মার্টফোনের নীল আলো, ক্যাফেইনের প্রভাব এবং পর্যাপ্ত ঘুম কীভাবে মানসিক ভারসাম্য ও মেজাজ নিয়ন্ত্রণ করে।',
    contentEn: `Quality sleep is not merely rest—it is the biological foundation of emotional regulation. During slow-wave and REM sleep, the brain consolidates memories, clears metabolic waste, and recalibrates emotional sensitivity.

Practical steps for restorative sleep:
• Consistent Wake-up Time: Wake up at the same hour every day, even on weekends, to anchor your internal circadian clock.
• Morning Sunlight: Expose your eyes to outdoor sunlight within 30 minutes of waking to trigger natural melatonin shutdown.
• The 10-Hour Caffeine Rule: Discontinue tea, coffee, and energy drinks at least 10 hours before sleep; caffeine has an average half-life of 5-7 hours.
• Night Screen Boundary: Blue light from phone screens tricks the pineal gland into perceiving daylight, suppressing sleep hormones. Dim screens 45 minutes prior to bed.`,
    contentBn: `ঘুম কেবল ক্লান্তি মেটানো নয়, এটি মস্তিষ্কের আবেগ নিয়ন্ত্রণের মূল ভিত্তি। গভীর ঘুমের সময় মস্তিষ্ক তথ্য প্রক্রিয়া করে এবং মানসিক চাপ সৃষ্টিকারী হরমোনগুলোকে নিয়ন্ত্রণে আনে।

স্বাস্থ্যকর ঘুমের মূল নিয়মাবলী:
• প্রতিদিন নির্দিষ্ট সময়ে ঘুম থেকে ওঠা: ছুটির দিনেও একই সময়ে উঠলে শরীরের বায়োলজিক্যাল ঘড়ি ঠিক থাকে।
• সকালে প্রাকৃতিক সূর্যের আলো: ঘুম ভাঙার আধা ঘণ্টার মধ্যে আলোতে গেলে ঘুমের চক্র সক্রিয় থাকে।
• সন্ধ্যার পর চা বা কফি পরিহার: ক্যাফেইনের প্রভাব শরীরে ৬ থেকে ৮ ঘণ্টা স্থায়ী হতে পারে। ঘুমানোর অন্তত ৭-৮ ঘণ্টা আগে কফি বন্ধ করুন।
• মোবাইল স্ক্রিন বন্ধ রাখা: ঘুমানোর ৪৫ মিনিট আগে মোবাইল ফোনের উজ্জ্বল আলো এড়িয়ে চলুন, কারণ এটি ঘুমের জন্য প্রয়োজনীয় মেলাটোনিন হরমোন নিঃসরণে বাধা দেয়।`,
    publishedDate: '2026-10-28',
    author: 'MindCare Clinical Review Board'
  },
  {
    id: 'art_3',
    titleEn: 'Academic & Professional Burnout: Restoring Boundaries',
    titleBn: 'কর্মক্ষেত্রে বা পড়াশোনায় বার্নআউট: মানসিক শক্তি পুনরুদ্ধারের কৌশল',
    categoryEn: 'Work-Life Balance',
    categoryBn: 'কাজের ভারসাম্য',
    readTimeMinutes: 4,
    summaryEn: 'Recognizing chronic emotional exhaustion before it develops into clinical depression, and setting sustainable psychological boundaries.',
    summaryBn: 'দীর্ঘস্থায়ী কাজের চাপ কীভাবে বার্নআউটে রূপ নেয় এবং তা থেকে উত্তরণে সুস্থ সীমারেখা তৈরির উপায়।',
    contentEn: `Burnout is recognized by the World Health Organization as an occupational phenomenon resulting from chronic workplace stress that has not been successfully managed.

Key indicators of burnout:
1. Feelings of chronic energy depletion or exhaustion.
2. Increased mental distance, cynicism, or negative feelings toward one's job or studies.
3. A sense of ineffectiveness and reduced professional or academic efficacy.

Unlike temporary tiredness, burnout is not resolved by a single night of sleep. It requires psychological boundaries: scheduling non-negotiable micro-breaks every 90 minutes, separating work devices from living areas, and intentionally disconnecting from notifications after work hours.`,
    contentBn: `বিশ্ব স্বাস্থ্য সংস্থা (WHO)-এর মতে, বার্নআউট হলো দীর্ঘস্থায়ী কর্মক্ষেত্র বা পড়াশোনার চাপ সঠিকভাবে সামাল না দিতে পারার ফলশ্রুতি।

বার্নআউটের প্রধান লক্ষণসমূহ:
১. সারাক্ষণ শারীরিক ও মানসিকভাবে ক্লান্ত বোধ করা।
২. কাজের বা পড়াশোনার প্রতি তীব্র অনীহা, বিরক্তি বা অর্থহীন মনে হওয়া।
৩. নিজের কর্মক্ষমতার ওপর আস্থা কমে যাওয়া।

বার্নআউট কাটাতে করণীয়: প্রতি ৯০ মিনিট কাজের পর ৫ মিনিটের জন্য মনকে পুরোপুরি বিরতি দিন, ছুটির দিনে কাজের মেসেজ বা ইমেইল থেকে নিজেকে বিরত রাখুন এবং নিজের শখের কাজের জন্য কিছুটা সময় বরাদ্দ রাখুন।`,
    publishedDate: '2026-11-02',
    author: 'MindCare Wellness Editorial'
  }
];
