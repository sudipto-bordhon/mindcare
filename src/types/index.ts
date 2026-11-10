export type Language = 'en' | 'bn';

export type Theme = 'light' | 'dark';

export type AgeBand = 'child_teen' | 'young_adult' | 'adult' | 'senior';

export type Role = 'user' | 'counselor' | 'admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ageBand: AgeBand;
  preferredLanguage: Language;
  theme: Theme;
  role: Role;
  adminToken?: string;
  createdAt: string;
  streakDays: number;
}

export interface ConsentSettings {
  aiMemoryConsent: boolean;
  journalAnalysisConsent: boolean;
  analyticsConsent: boolean;
  lastUpdated: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  date: string; // ISO date string or YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;
  mood: number; // 1 to 5
  moodLabel: string;
  sleepHours: number;
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel: number; // 1 to 10
  energyLevel: number; // 1 to 10
  focusLevel: number; // 1 to 10
  tags: string[];
  optionalNote?: string;
}

export interface ScreeningQuestion {
  id: number;
  textEn: string;
  textBn: string;
}

export interface ScreeningInstrument {
  id: 'phq9' | 'gad7' | 'burnout';
  code: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  disclaimerEn: string;
  disclaimerBn: string;
  isStandardized: boolean;
  licenseInfo: string;
  questions: ScreeningQuestion[];
  optionsEn: string[];
  optionsBn: string[];
  scoringBands: {
    min: number;
    max: number;
    bandEn: string;
    bandBn: string;
    color: string;
    recommendationEn: string;
    recommendationBn: string;
  }[];
}

export interface ScreeningAttempt {
  id: string;
  userId: string;
  instrumentId: 'phq9' | 'gad7' | 'burnout';
  instrumentTitle: string;
  date: string;
  answers: Record<number, number>;
  totalScore: number;
  maxScore: number;
  band: string;
  bandColor: string;
  recommendation: string;
  flaggedSafetyQuestion?: boolean;
  isManualRefresh?: boolean;
  cycleAnchorDate?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  moodTag: string;
  category: string;
  aiReflection?: string;
  revisions?: JournalEntryRevision[];
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryRevision {
  title: string;
  content: string;
  date: string;
  moodTag: string;
  category: string;
  aiReflection?: string;
  savedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isCrisis?: boolean;
  source?: string;
}

export interface WellnessActivity {
  id: string;
  titleEn: string;
  titleBn: string;
  category: 'breathing' | 'grounding' | 'relaxation' | 'sleep' | 'mindfulness';
  durationMinutes: number;
  descriptionEn: string;
  descriptionBn: string;
  instructionsEn: string[];
  instructionsBn: string[];
  audioSupported?: boolean;
}

export interface AmbientSoundscape {
  id: string;
  titleEn: string;
  titleBn: string;
  source: 'synth' | 'audio';
  soundType?: 'rain' | 'ocean' | 'forest' | 'birds' | 'whitenoise';
  audioUrl?: string;
}

export interface MentalWellnessKnowledge {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
  category: string;
  createdAt: string;
}

export interface ProfessionalContact {
  id: string;
  nameEn: string;
  nameBn: string;
  titleEn: string;
  titleBn: string;
  organization: string;
  qualification: string;
  specialtyEn: string;
  specialtyBn: string;
  locationEn: string;
  locationBn: string;
  phone: string;
  email?: string;
  isEmergencyHelpline: boolean;
  tollFree?: boolean;
  verified: boolean;
  verifiedDate: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  timestamp: string;
  outcome: 'success' | 'failure';
  details: string;
}

export interface Article {
  id: string;
  titleEn: string;
  titleBn: string;
  categoryEn: string;
  categoryBn: string;
  readTimeMinutes: number;
  summaryEn: string;
  summaryBn: string;
  contentEn: string;
  contentBn: string;
  publishedDate: string;
  author: string;
}
