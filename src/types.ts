export type GameMode = 'HARD' | 'EXTREME';

export interface Question {
  id: string;
  mode: GameMode;
  category: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0..3
  explanation: string;
  trapType: string;
  trapExplanation: string;
  createdAt: string;
  hash?: string;
}

export type ClientQuestion = Pick<Question, 'id' | 'mode' | 'category' | 'question' | 'options'>;

export interface QuestionAnswerRecord {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  trapType: string;
  trapExplanation: string;
}

export interface VideoRewardRule {
  id: string;
  title: string;
  mode: GameMode;
  minScore: number;
  maxScore: number;
  videoUrl: string;
  description?: string;
  createdAt: string;
}

export interface PlayerSession {
  id: string;
  deviceId: string;
  playerName: string;
  playerAge: number;
  mode: GameMode;
  questionIds: string[];
  currentQuestionIndex: number;
  answers: QuestionAnswerRecord[];
  score: number;
  totalQuestions: number;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  iqEstimate?: string;
  videoReward?: VideoRewardRule | null;
}

export interface LeaderboardEntry {
  id: string;
  sessionId: string;
  playerName: string;
  playerAge: number;
  mode: GameMode;
  score: number;
  totalQuestions: number;
  durationMs: number;
  iqEstimate: string;
  createdAt: string;
}

export interface DbStatusInfo {
  type: 'firebase' | 'local';
  connected: boolean;
  message: string;
  totalQuestions: number;
  hardQuestions: number;
  extremeQuestions: number;
  allocatedQuestions: number;
  availableQuestions: number;
  totalSessions: number;
  totalLeaderboard: number;
  videoRulesCount: number;
  firebaseConfigured: boolean;
}
