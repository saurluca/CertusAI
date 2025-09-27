// API Types
export interface DocumentAnalysisResult {
  case_id: string;
  entities: string[];
  status: string;
  analysis?: LegalAnalysis;
  suggestions?: string[];
}

export interface LegalAnalysis {
  summary: string;
  confidence: number;
  legal_domains: string[];
  legal_references: string[];
  ai_suggestions: string[];
  authenticity?: AuthenticityResult;
  compliance?: ComplianceResult;
}

export interface AuthenticityResult {
  verified: boolean;
  confidence: number;
  details: string;
}

export interface ComplianceResult {
  overall_compliant: boolean;
  summary: string;
  checks: ComplianceCheck[];
  recommendations: string[];
}

export interface ComplianceCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface SearchResult {
  id: string;
  title_de: string;
  title_fr: string;
  title_it: string;
  eli_uri: string;
  date_document: string;
  authority_level: number;
  trust_score: number;
  similarity_score: number;
  classification: string[];
  text_preview: string;
}

export interface TrustScore {
  overall: number;
  breakdown: {
    legal_authority: number;
    recency: number;
    citation_count: number;
    consistency: number;
  };
}

export interface Suggestion {
  text: string;
  type: 'legal_reference' | 'related_domain' | 'similar_case' | 'compliance';
  confidence: number;
  source: 'qwen' | 'swisscom';
}

// AI Service Types
export interface QwenAnalysis {
  summary: string;
  confidence: number;
  legal_references: string[];
  legal_domains: string[];
  suggestions: string[];
}

export interface SwisscomAnalysis {
  summary: string;
  confidence: number;
  legal_domains: string[];
  authenticity: AuthenticityResult;
  compliance: ComplianceResult;
}

export interface ComprehensiveAnalysis {
  qwen_insights: QwenAnalysis;
  swisscom_insights: SwisscomAnalysis;
  combined_confidence: number;
  recommendations: Suggestion[];
}

// Prompt Improvement Types
export interface ImprovementStep {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text_input' | 'context_gathering';
  options?: string[];
  required: boolean;
}

export interface ImprovementSession {
  session_id: string;
  original_question: string;
  language: string;
  steps: ImprovementStep[];
  current_step: number;
  improved_question?: string;
}

export interface Subject {
  name: string;
  category: string;
  confidence: number;
}

// Admin Types
export interface AnalyticsDashboard {
  total_documents: number;
  analyzed_today: number;
  avg_accuracy: number;
  active_users: number;
  legal_domain_distribution: Record<string, number>;
  query_patterns: QueryPattern[];
}

export interface QueryPattern {
  query: string;
  frequency: number;
  success_rate: number;
}

export interface DocumentAnalysis {
  document_id: string;
  document_title: string;
  ai_summary: string;
  confidence: number;
  ai_tags: string[];
  legal_domains: string[];
}

export interface AITag {
  name: string;
  category: string;
  confidence: number;
}

// UI Types
export interface HybridInputData {
  type: 'text' | 'file';
  content?: string;
  file?: File;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

// Language configuration
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'de', name: 'Schweizerdeutsch', flag: 'https://flagcdn.com/w320/ch.png' },
  { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w320/fr.png' },
  { code: 'it', name: 'Italiano', flag: 'https://flagcdn.com/w320/it.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w320/gb.png' },
];

export const DEFAULT_LANGUAGE = 'de'; // Swiss German

// Component Props
export interface SwissHeaderProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export interface HybridInputProps {
  onAnalyze: (data: HybridInputData) => void;
  isProcessing: boolean;
}

export interface TrustScoreProps {
  score: TrustScore;
}

export interface LegalCardProps {
  document: SearchResult;
  onClick?: () => void;
}

export interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export interface SuggestionPanelProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
}

export interface PromptImprovementProps {
  originalQuestion: string;
  onImprovedQuestion: (question: string) => void;
}

export interface AdminDashboardProps {
  analytics: AnalyticsDashboard;
  onBatchAnalysis: (documentIds: string[]) => void;
}
