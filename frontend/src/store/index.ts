import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocumentAnalysisResult, SearchResult, ComprehensiveAnalysis, ImprovementSession, AnalyticsDashboard, DEFAULT_LANGUAGE } from '../types';

interface AppState {
  // Current analysis state
  currentAnalysis: DocumentAnalysisResult | null;
  searchResults: SearchResult[];
  comprehensiveAnalysis: ComprehensiveAnalysis | null;
  isProcessing: boolean;
  
  // UI state
  currentLanguage: string;
  sidebarOpen: boolean;
  currentPage: string;
  
  // Prompt improvement state
  improvementSession: ImprovementSession | null;
  
  // Admin state
  analytics: AnalyticsDashboard | null;
  
  // Actions
  setCurrentAnalysis: (analysis: DocumentAnalysisResult | null) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setComprehensiveAnalysis: (analysis: ComprehensiveAnalysis | null) => void;
  setProcessing: (processing: boolean) => void;
  setLanguage: (language: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: string) => void;
  setImprovementSession: (session: ImprovementSession | null) => void;
  setAnalytics: (analytics: AnalyticsDashboard | null) => void;
  
  // Complex actions
  analyzeDocument: (data: { text?: string; file?: File }) => Promise<void>;
  searchSimilarCases: (question: string) => Promise<void>;
  improvePrompt: (question: string) => Promise<void>;
  loadAnalytics: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentAnalysis: null,
      searchResults: [],
      comprehensiveAnalysis: null,
      isProcessing: false,
      currentLanguage: DEFAULT_LANGUAGE, // Swiss German as default
      sidebarOpen: false,
      currentPage: 'home',
      improvementSession: null,
      analytics: null,
      
      // Basic setters
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      setSearchResults: (results) => set({ searchResults: results }),
      setComprehensiveAnalysis: (analysis) => set({ comprehensiveAnalysis: analysis }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setLanguage: (language) => set({ currentLanguage: language }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setImprovementSession: (session) => set({ improvementSession: session }),
      setAnalytics: (analytics) => set({ analytics: analytics }),
      
      // Complex actions
      analyzeDocument: async (data) => {
        set({ isProcessing: true });
        try {
          const { apiService } = await import('../services/api');
          const result = await apiService.analyzeHybrid(data);
          set({ currentAnalysis: result });
        } catch (error) {
          console.error('Analysis failed:', error);
        } finally {
          set({ isProcessing: false });
        }
      },
      
      searchSimilarCases: async (question) => {
        set({ isProcessing: true });
        try {
          const { apiService } = await import('../services/api');
          const { currentLanguage } = get();
          const result = await apiService.searchRAG(question, currentLanguage);
          set({ searchResults: result.similar_cases || [] });
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          set({ isProcessing: false });
        }
      },
      
      improvePrompt: async (question) => {
        set({ isProcessing: true });
        try {
          const { apiService } = await import('../services/api');
          const { currentLanguage } = get();
          const session = await apiService.improvePrompt(question, currentLanguage);
          set({ improvementSession: session });
        } catch (error) {
          console.error('Prompt improvement failed:', error);
        } finally {
          set({ isProcessing: false });
        }
      },
      
      loadAnalytics: async () => {
        try {
          const { apiService } = await import('../services/api');
          const analytics = await apiService.getAnalytics();
          set({ analytics: analytics.analytics });
        } catch (error) {
          console.error('Failed to load analytics:', error);
        }
      },
    }),
    {
      name: 'certusai-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        currentLanguage: state.currentLanguage,
        sidebarOpen: state.sidebarOpen,
        currentPage: state.currentPage,
      }), // only persist language and UI state, not analysis data
    }
  )
);
