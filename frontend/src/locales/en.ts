// English translations
export const en = {
  // Header
  header: {
    subtitle: 'Swiss Legal Analysis',
  },
  
  // Swiss Law RAG Panel
  ragPanel: {
    title: 'Swiss Law RAG',
    experimental: 'Experimental',
    questionLabel: 'Legal Question',
    placeholder: 'Ask your legal question here...',
    language: 'Language',
    languages: {
      de: 'German',
      fr: 'French',
      it: 'Italian',
      all: 'All',
    },
    retrieval: 'Retrieval',
    retrievalOptions: {
      bm25: 'BM25 (recommended)',
      semantic: 'Semantic',
    },
    documents: 'Documents',
    search: 'Search',
    searching: 'Searching...',
    errorEmpty: 'Please enter a legal question.',
    answer: 'Answer',
    confidence: 'Confidence',
    sourcesAndCitations: 'Sources & Citations',
    articles: 'Articles',
    quotes: 'Quotes',
    score: 'Score',
  },
  
  // Navigation
  nav: {
    home: 'Home',
    welcome: 'Welcome',
    analysis: 'Analysis',
    search: 'Search',
    admin: 'Admin',
    test: 'API Tests',
  },
  
  // Welcome Page
  welcome: {
    title: 'Welcome',
    subtitle: 'Swiss Legal Analysis',
    enter: 'Enter CertusAI',
    tagline: 'Swiss Legal Intelligence',
    poweredBy: 'powered by Apertus AI',
    inputPlaceholder: 'Ask about Swiss law...',
    analyzeButton: 'Analyze',
    uploadButton: 'Upload document',
    searchButton: 'Start legal search',
    madeInSwitzerland: 'Made in Switzerland',
    skipButton: 'Skip',
  },

  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
  },
  
  // Upload
  upload: {
    title: 'Analyze Legal Document',
    textInput: 'Enter text',
    fileUpload: 'Upload file',
    dragDrop: 'Drop PDF or DOCX file here or select it',
    supportedFormats: 'Supported formats: PDF, DOCX • Max. 10MB',
    selectFile: 'Select file',
    processing: 'Processing...',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    characters: 'Characters',
  },
  
  // Buttons
  buttons: {
    contractAnalysis: 'Analyze this contract document for legal risks...',
    contractAnalysisLabel: 'Contract Analysis',
    complianceCheck: 'Check this clause for compliance with Swiss law...',
    complianceCheckLabel: 'Compliance Check',
    legalImplications: 'Explain the legal implications of...',
    legalImplicationsLabel: 'Legal Implications',
  },
  
  // Footer
  footer: {
    madeIn: 'Made in Switzerland',
    tagline: 'CertusAI - Intelligent Legal Analysis for Switzerland',
    privacy: 'Privacy',
    imprint: 'Imprint',
    terms: 'Terms',
    contact: 'Contact',
    rights: 'All rights reserved',
    poweredBy: 'Powered by Qwen AI & Swisscom Apertus',
  },
  
  // Map
  map: {
    title: 'Switzerland Map',
    subtitle: 'Legal activity by Canton',
    low: 'Low',
    high: 'High',
    cantons: 'Cantons',
    inhabitants: 'Inhabitants',
  },
  
  // Chat
  chat: {
    welcome: 'Welcome to CertusAI',
    description: 'Ask your legal question and receive a comprehensive analysis based on Swiss law.',
    aiResponse: 'I am analyzing your request: "{content}"\n\nBased on Swiss law, I can provide you with the following assessment:\n\n• **Legal Basis**: The request generally concerns applicable Swiss law\n• **Relevant Laws**: ZGB, OR, StGB (depending on context)\n• **Recommendation**: Further specific analysis required\n\nWould you like me to go deeper into a specific aspect?',
    placeholder: 'Ask about Swiss legal matters...',
    send: 'Send',
    buttons: {
      legalBasis: 'Legal Basis',
      relevantLaws: 'Relevant Laws',
      recommendation: 'Recommendation',
    },
    prompts: {
      legalBasis: 'Please provide a detailed explanation of the legal basis for this matter under Swiss law, including specific articles and precedents.',
      relevantLaws: 'Please list and explain all relevant Swiss laws, regulations, and legal frameworks that apply to this situation.',
      recommendation: 'Please provide specific recommendations and next steps for addressing this legal matter, including potential risks and compliance requirements.',
    },
  },
  
  // Analysis
  analysis: {
    title: 'Analysis Results',
    caseId: 'Case ID',
    trustScore: 'Trust Score',
    similarCases: 'Similar Cases',
    aiAnalysis: 'AI Analysis',
    extractedEntities: 'Extracted Entities',
    analysis: {
      title: 'Legal Analysis',
      analyzeAll: 'Analyze All Documents',
      buildingIndex: 'Building index...',
      indexBuilt: 'Index built successfully with {count} documents',
      loadingSteps: {
        dataCollection: 'Collecting Swiss legal documents...',
        swisscomProcessing: 'Processing data via Swisscom Apertus AI...',
        indexing: 'Building search index...',
        finalizing: 'Finalizing analysis system...',
        completed: 'Analysis system ready!'
      },
      progress: {
        title: 'Analysis Progress',
        documentsProcessed: 'Documents processed',
        estimatedTime: 'Estimated time remaining'
      }
    },
    newSearch: 'New Search',
    checkCompliance: 'Check Compliance',
    contactExpert: 'Contact Expert',
    legalDisclaimer: 'Legal Disclaimer',
    disclaimerText: 'This analysis is provided for informational purposes only and does not constitute legal advice. Consult a qualified attorney for specific legal questions.',
  },
  
  // Search
  search: {
    title: 'Search Legal Database',
    subtitle: 'Find relevant case law and legislation with intelligent search',
    filter: 'Filter',
    enterQuestion: 'Enter Legal Question',
    placeholder: 'Ask your legal question here...',
    search: 'Search',
    searching: 'Searching...',
    improveAI: 'ImproveAI',
    documentTypes: 'Document Types',
    legalAreas: 'Legal Areas',
    timePeriod: 'Time Period',
    from: 'From',
    to: 'To',
    sortBy: 'Sort by',
    sortOptions: {
      relevance: 'Relevance',
      date: 'Date',
      trustScore: 'Trust Score',
      citations: 'Citations',
    },
    results: 'Search Results',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {current} of {total}',
    noResults: 'No results found',
    noResultsDescription: 'Try different search terms or use ImproveAI for better results.',
    readyForSearch: 'Ready for Search',
    readyForSearchDescription: 'Enter your legal question to find relevant documents.',
    searchingDatabase: 'Searching the legal database',
    filters: {
      federalConstitution: 'Federal Constitution',
      federalLaws: 'Federal Laws',
      ordinances: 'Ordinances',
      federalCourtDecisions: 'Federal Court Decisions',
    },
  },
  
  // Admin
  admin: {
    title: 'CertusAI - Admin Dashboard',
    subtitle: 'Document analysis and AI-driven tagging',
    totalDocuments: 'Total Documents',
    analyzedToday: 'Analyzed Today',
    avgAccuracy: 'Average Accuracy',
    activeUsers: 'Active Users',
    batchAnalysis: 'AI Batch Analysis',
    selectDocuments: 'Select documents for analysis',
    startBatchAnalysis: 'Start Batch Analysis',
    aiTagging: 'AI Tagging',
    selectDocument: 'Select document',
    generateTags: 'Generate AI Tags',
    generatingTags: 'Generating tags...',
    generatedTags: 'Generated tags:',
    legalDomainDistribution: 'Legal Domain Distribution',
    batchResults: 'Batch Analysis Results',
    confidence: 'Confidence',
  },
  
  // AI Features
  ai: {
    improvePrompt: 'ImproveAI',
    improving: 'Improving...',
    combinedAnalysis: 'Combined AI Analysis',
    qwenAnalysis: 'Qwen AI Analysis',
    swisscomAnalysis: 'Swisscom Apertus Analysis',
    documentAuthenticity: 'Document Authenticity',
    swissCompliance: 'Swiss Compliance',
    verified: 'Verified',
    verificationRequired: 'Verification required',
    compliant: 'Compliant',
    notCompliant: 'Not compliant',
    legalReferences: 'Legal References',
    legalDomains: 'Legal Domains',
    combinedRecommendations: 'Combined Recommendations',
    confidence: 'Confidence',
  },
  
  // Trust Score
  trustScore: {
    title: 'Trust Score',
    legalAuthority: 'Legal Authority',
    recency: 'Recency',
    citationCount: 'Citation Count',
    consistency: 'Consistency',
    overall: 'Overall Rating',
    veryHigh: 'Very High',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  },
  
  // Document Types
  documentTypes: {
    constitution: 'Federal Constitution',
    federalLaw: 'Federal Law',
    ordinance: 'Ordinance',
    federalGazette: 'Federal Gazette',
  },
  
  // Legal Domains
  legalDomains: {
    zgb: 'CC',
    or: 'CO',
    stgb: 'CP',
    dsg: 'DPA',
  },
};
