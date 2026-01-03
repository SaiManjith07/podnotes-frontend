export interface User {
  id: string;
  email: string;
  interests: string[];
  createdAt: Date;
}

export interface Transcript {
  id: string;
  userId: string;
  youtubeUrl: string;
  title: string;
  thumbnail: string;
  transcript: string;
  duration: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  userId: string;
  transcriptId: string;
  youtubeUrl: string;
  title: string;
  thumbnail: string;
  questions: string[];
  answers: Record<string, string>;
  summary: string;
  keyTakeaways: string[];
  createdAt: Date;
}

export const INTEREST_CATEGORIES = [
  { id: 'technology', label: 'Technology', icon: '💻', color: 'bg-blue-500' },
  { id: 'business', label: 'Business', icon: '💼', color: 'bg-green-500' },
  { id: 'health', label: 'Health & Wellness', icon: '🧘', color: 'bg-pink-500' },
  { id: 'education', label: 'Education', icon: '📚', color: 'bg-yellow-500' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'bg-purple-500' },
  { id: 'science', label: 'Science', icon: '🔬', color: 'bg-cyan-500' },
  { id: 'sports', label: 'Sports', icon: '⚽', color: 'bg-orange-500' },
  { id: 'finance', label: 'Finance', icon: '💰', color: 'bg-emerald-500' },
  { id: 'politics', label: 'Politics', icon: '🏛️', color: 'bg-red-500' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '✨', color: 'bg-indigo-500' },
  { id: 'comedy', label: 'Comedy', icon: '😂', color: 'bg-amber-500' },
  { id: 'music', label: 'Music', icon: '🎵', color: 'bg-violet-500' },
] as const;

export const PREDEFINED_QUESTIONS = [
  "What are the main topics discussed?",
  "What are the key takeaways?",
  "Who are the speakers/guests?",
  "What actionable advice is given?",
  "Summary in 3 bullet points",
] as const;
