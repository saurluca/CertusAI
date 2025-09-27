import { 
  DocumentAnalysisResult, 
  SearchResult, 
  ImprovementSession, 
  AnalyticsDashboard,
  AITag,
  DocumentAnalysis,
  DEFAULT_LANGUAGE
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to extract backend error message
        let message = `HTTP error! status: ${response.status}`;
        try {
          const data = await response.json();
          const detail = (data && (data.detail || data.error || data.message)) as any;
          if (typeof detail === 'string') {
            message = `${message} - ${detail}`;
          } else if (detail && typeof detail === 'object') {
            const parts = [detail.message, detail.error].filter(Boolean);
            if (parts.length) message = `${message} - ${parts.join(' | ')}`;
          }
        } catch {
          // ignore JSON parse failure
        }
        throw new Error(message);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Document Upload & Analysis
  async uploadDocument(file: File): Promise<DocumentAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return await response.json();
  }

  async analyzeText(text: string, language: string = DEFAULT_LANGUAGE): Promise<DocumentAnalysisResult> {
    return this.request<DocumentAnalysisResult>('/analysis/analyze', {
      method: 'POST',
      body: JSON.stringify({ 
        case_id: `text-analysis-${Date.now()}`,
        query: text, 
        language,
        limit: 10
      }),
    });
  }

  // Swiss Law RAG Analysis
  async analyzeSwissLaw(text: string, language: string = DEFAULT_LANGUAGE): Promise<any> {
    return this.request('/analysis/swiss-law-analysis', {
      method: 'POST',
      body: JSON.stringify({ 
        question: text,
        language,
        enable_citations: true
      }),
    });
  }

  // Swiss Law RAG Search
  async searchSwissLaw(
    question: string,
    language: string = DEFAULT_LANGUAGE,
    numDocs: number = 10,
    retrieval: 'bm25' | 'semantic' | 'hybrid' = 'bm25'
  ): Promise<any> {
    const params = new URLSearchParams({
      question,
      language,
      num_docs: String(numDocs),
      retrieval,
    });
    // Use GET variant with query params to avoid method mismatch issues
    return this.request(`/search/swiss-law-rag?${params.toString()}`, {
      method: 'GET',
    });
  }

  // Swiss Law Status
  async getSwissLawStatus(): Promise<any> {
    return this.request('/search/swiss-law-status', {
      method: 'GET',
    });
  }

  // Build or rebuild Swiss Law RAG index
  async buildSwissLawIndex(fraction?: string): Promise<{ initialized: boolean; documents?: number; retrieval?: string; num_docs?: number; error?: string; applied_fraction?: string; effective_index_limit?: number }> {
    // force=true ensures a fresh rebuild from scratch; optional fraction controls partial build
    const qs = new URLSearchParams({ force: 'true' });
    if (fraction) qs.set('fraction', fraction);
    return this.request(`/search/swiss-law-build?${qs.toString()}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async analyzeHybrid(data: { text?: string; file?: File }): Promise<DocumentAnalysisResult> {
    if (data.file) {
      return this.uploadDocument(data.file);
    } else if (data.text) {
      return this.analyzeText(data.text);
    }
    throw new Error('Either text or file must be provided');
  }

  // Search & RAG
  async searchRAG(question: string, language: string = DEFAULT_LANGUAGE, enableVerification: boolean = true): Promise<{ similar_cases: SearchResult[] }> {
    return this.request<{ similar_cases: SearchResult[] }>('/search/rag', {
      method: 'POST',
      body: JSON.stringify({ question, language, enable_verification: enableVerification }),
    });
  }

  async getAnalysis(caseId: string) {
    return this.request(`/analysis/${caseId}`);
  }

  async getSuggestions(caseId: string) {
    return this.request(`/suggestions/${caseId}`);
  }

  // AI Services
  async askQwenAI(question: string, context: string) {
    return this.request('/ai/question', {
      method: 'POST',
      body: JSON.stringify({ question, context }),
    });
  }

  async analyzeWithSwisscom(text: string, language: string = DEFAULT_LANGUAGE) {
    return this.request('/swisscom/analyze', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    });
  }

  async getComprehensiveAnalysis(text: string, language: string = DEFAULT_LANGUAGE) {
    return this.request('/ai/comprehensive', {
      method: 'POST',
      body: JSON.stringify({ text, language }),
    });
  }

  async checkSwissCompliance(documentId: string) {
    return this.request(`/swisscom/compliance/${documentId}`);
  }

  // Prompt Improvement
  async improvePrompt(originalQuestion: string, language: string = DEFAULT_LANGUAGE): Promise<ImprovementSession> {
    return this.request<ImprovementSession>('/ai/improve-prompt', {
      method: 'POST',
      body: JSON.stringify({ 
        original_question: originalQuestion,
        language,
        improvement_type: 'step_by_step'
      }),
    });
  }

  async processStepResponse(sessionId: string, stepIndex: number, userResponse: string): Promise<ImprovementSession> {
    return this.request<ImprovementSession>('/ai/improve-prompt/step', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        step_index: stepIndex,
        user_response: userResponse
      }),
    });
  }

  async generateSubjects(improvedQuestion: string, language: string = DEFAULT_LANGUAGE) {
    return this.request('/ai/generate-subjects', {
      method: 'POST',
      body: JSON.stringify({ improved_question: improvedQuestion, language }),
    });
  }

  // Admin Services
  async getAnalytics(dateRange?: string, filters?: Record<string, any>): Promise<{ analytics: AnalyticsDashboard }> {
    return this.request<{ analytics: AnalyticsDashboard }>('/admin/analytics', {
      method: 'GET',
      body: JSON.stringify({ date_range: dateRange, filters }),
    });
  }

  async analyzeBatch(documentIds: string[], analysisType: string = 'comprehensive'): Promise<{ analyses: DocumentAnalysis[] }> {
    return this.request<{ analyses: DocumentAnalysis[] }>('/admin/analyze-batch', {
      method: 'POST',
      body: JSON.stringify({ document_ids: documentIds, analysis_type: analysisType }),
    });
  }

  async generateTags(documentId: string, tagCategories: string[] = ['legal_domain', 'document_type', 'topics', 'authority_level']): Promise<{ ai_tags: AITag[] }> {
    return this.request<{ ai_tags: AITag[] }>('/admin/generate-tags', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId, tag_categories: tagCategories }),
    });
  }

  async ingestDocuments(sourcePath: string, docTypes: string[]) {
    return this.request('/admin/ingest', {
      method: 'POST',
      body: JSON.stringify({ source_path: sourcePath, doc_types: docTypes }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
