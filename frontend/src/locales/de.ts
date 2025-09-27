// German (Swiss) translations
export const de = {
  // Header
  header: {
    subtitle: 'Schweizer Rechtsanalyse',
  },
  
  // Navigation
  nav: {
    home: 'Hauptseite',
    welcome: 'Willkommen',
    analysis: 'Analyse',
    search: 'Suche',
    admin: 'Admin',
    test: 'API Tests',
  },
  
  // Welcome Page
  welcome: {
    title: 'Willkommen',
    subtitle: 'Schweizer Rechtsanalyse',
    enter: 'CertusAI betreten',
    tagline: 'Schweizer Rechtsintelligenz',
    poweredBy: 'powered by Apertus AI',
    inputPlaceholder: 'Fragen Sie nach Schweizer Recht...',
    analyzeButton: 'Analysieren',
    uploadButton: 'Dokument hochladen',
    searchButton: 'Rechtssuche starten',
    madeInSwitzerland: 'Hergestellt in der Schweiz',
    skipButton: 'Überspringen',
  },

  // Common
  common: {
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolgreich',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Vorherige',
    close: 'Schließen',
  },
  
  // Upload
  upload: {
    title: 'Rechtsdokument analysieren',
    textInput: 'Text eingeben',
    fileUpload: 'Datei hochladen',
    dragDrop: 'PDF oder DOCX Datei hier ablegen oder auswählen',
    supportedFormats: 'Unterstützte Formate: PDF, DOCX • Max. 10MB',
    selectFile: 'Datei auswählen',
    processing: 'Verarbeitung...',
    analyze: 'Analysieren',
    analyzing: 'Analysiere...',
    characters: 'Zeichen',
  },
  
  // Buttons
  buttons: {
    contractAnalysis: 'Analysiere dieses Vertragsdokument auf rechtliche Risiken...',
    contractAnalysisLabel: 'Vertragsanalyse',
    complianceCheck: 'Überprüfe diese Klausel auf Compliance mit schweizerischem Recht...',
    complianceCheckLabel: 'Compliance Check',
    legalImplications: 'Erkläre mir die rechtlichen Auswirkungen von...',
    legalImplicationsLabel: 'Rechtsauswirkungen',
  },
  
  // Footer
  footer: {
    madeIn: 'Made in Switzerland',
    tagline: 'CertusAI - Intelligente Rechtsanalyse für die Schweiz',
    privacy: 'Datenschutz',
    imprint: 'Impressum',
    terms: 'AGB',
    contact: 'Kontakt',
    rights: 'Alle Rechte vorbehalten',
    poweredBy: 'Powered by Qwen AI & Swisscom Apertus',
  },
  
  // Map
  map: {
    title: 'Schweiz Karte',
    subtitle: 'Rechtsaktivität nach Kanton',
    low: 'Niedrig',
    high: 'Hoch',
    cantons: 'Kantone',
    inhabitants: 'Einwohner',
  },
  
  // Chat
  chat: {
    welcome: 'Willkommen bei CertusAI',
    description: 'Stellen Sie Ihre Rechtsfrage und erhalten Sie eine umfassende Analyse basierend auf schweizerischem Recht.',
    aiResponse: 'Ich analysiere Ihre Anfrage: "{content}"\n\nBasierend auf schweizerischem Recht kann ich Ihnen folgende Einschätzung geben:\n\n• **Rechtliche Grundlage**: Die Anfrage betrifft grundsätzlich geltendes Schweizer Recht\n• **Relevante Gesetze**: ZGB, OR, StGB (je nach Kontext)\n• **Empfehlung**: Weitere spezifische Analyse erforderlich\n\nMöchten Sie, dass ich tiefer in einen bestimmten Aspekt eingehe?',
    placeholder: 'Fragen Sie zu Schweizer Rechtsangelegenheiten...',
    send: 'Senden',
    buttons: {
      legalBasis: 'Rechtliche Grundlage',
      relevantLaws: 'Relevante Gesetze',
      recommendation: 'Empfehlung',
    },
    prompts: {
      legalBasis: 'Bitte geben Sie eine detaillierte Erklärung der rechtlichen Grundlage für diese Angelegenheit nach schweizerischem Recht, einschließlich spezifischer Artikel und Präzedenzfälle.',
      relevantLaws: 'Bitte listen Sie alle relevanten schweizerischen Gesetze, Verordnungen und Rechtsrahmen auf, die für diese Situation gelten, und erklären Sie diese.',
      recommendation: 'Bitte geben Sie spezifische Empfehlungen und nächste Schritte zur Behandlung dieser Rechtsangelegenheit, einschließlich potenzieller Risiken und Compliance-Anforderungen.',
    },
  },
  
  // Swiss Law RAG Panel
  ragPanel: {
    title: 'Swiss Law RAG',
    experimental: 'Experimentell',
    questionLabel: 'Rechtsfrage',
    placeholder: 'Stellen Sie Ihre Rechtsfrage hier...',
    language: 'Sprache',
    languages: {
      de: 'Deutsch',
      fr: 'Französisch',
      it: 'Italienisch',
      all: 'Alle',
    },
    retrieval: 'Retrieval',
    retrievalOptions: {
      bm25: 'BM25 (empfohlen)',
      semantic: 'Semantisch',
      hybrid: 'Hybrid',
    },
    documents: 'Dokumente',
    search: 'Suchen',
    searching: 'Suche...',
    errorEmpty: 'Bitte geben Sie eine Rechtsfrage ein.',
    answer: 'Antwort',
    confidence: 'Confidence',
    sourcesAndCitations: 'Quellen & Zitate',
    articles: 'Artikel',
    quotes: 'Zitate',
    score: 'Score',
  },
  
  // Analysis
  analysis: {
    title: 'Analyse-Ergebnisse',
    trustScore: 'Vertrauenswertung',
    similarCases: 'Ähnliche Fälle',
    aiAnalysis: 'KI-Analyse',
    extractedEntities: 'Erkannte Entitäten',
    quickActions: 'Schnellaktionen',
    analysis: {
      title: 'Rechtliche Analyse',
      analyzeAll: 'Alle Dokumente analysieren',
      buildingIndex: 'Index wird erstellt...',
      indexBuilt: 'Index erfolgreich erstellt mit {count} Dokumenten',
      loadingSteps: {
        dataCollection: 'Schweizer Rechtsdokumente werden gesammelt...',
        swisscomProcessing: 'Daten werden über Swisscom Apertus AI verarbeitet...',
        indexing: 'Suchindex wird erstellt...',
        finalizing: 'Analysesystem wird finalisiert...',
        completed: 'Analysesystem bereit!'
      },
      progress: {
        title: 'Analyse-Fortschritt',
        documentsProcessed: 'Verarbeitete Dokumente',
        estimatedTime: 'Geschätzte Restzeit'
      }
    },
    newSearch: 'Neue Suche starten',
    checkCompliance: 'Compliance prüfen',
    contactExpert: 'Experte kontaktieren',
    legalDisclaimer: 'Rechtlicher Hinweis',
    disclaimerText: 'Diese Analyse dient nur zu Informationszwecken und stellt keine Rechtsberatung dar. Konsultieren Sie einen qualifizierten Anwalt für spezifische rechtliche Fragen.',
  },
  // Search
  search: {
    title: 'Rechtsdatenbank durchsuchen',
    subtitle: 'Finden Sie relevante Rechtsprechung und Gesetze mit intelligenter Suche',
    filter: 'Filter',
    enterQuestion: 'Rechtsfrage eingeben',
    placeholder: 'Stellen Sie Ihre Rechtsfrage hier...',
    search: 'Suchen',
    searching: 'Suche...',
    improveAI: 'ImproveAI',
    documentTypes: 'Dokumenttypen',
    legalAreas: 'Rechtsgebiete',
    timePeriod: 'Zeitraum',
    from: 'Von',
    to: 'Bis',
    sortBy: 'Sortieren nach',
    sortOptions: {
      relevance: 'Relevanz',
      date: 'Datum',
      trustScore: 'Vertrauenswertung',
      citations: 'Zitierungen',
    },
    results: 'Suchergebnisse',
    previous: 'Vorherige',
    next: 'Nächste',
    pageOf: 'Seite {current} von {total}',
    noResults: 'Keine Ergebnisse gefunden',
    noResultsDescription: 'Versuchen Sie andere Suchbegriffe oder nutzen Sie ImproveAI für bessere Ergebnisse.',
    readyForSearch: 'Bereit für die Suche',
    readyForSearchDescription: 'Geben Sie Ihre Rechtsfrage ein, um relevante Dokumente zu finden.',
    searchingDatabase: 'Durchsuche die Rechtsdatenbank',
    filters: {
      federalConstitution: 'Bundesverfassung',
      federalLaws: 'Bundesgesetze',
      ordinances: 'Verordnungen',
      federalCourtDecisions: 'BGE',
    },
  },
  
  // Admin
  admin: {
    title: 'CertusAI - Admin Dashboard',
    subtitle: 'Dokumentenanalyse und KI-gesteuerte Verschlagwortung',
    totalDocuments: 'Gesamte Dokumente',
    analyzedToday: 'Heute analysiert',
    avgAccuracy: 'Durchschnittliche Genauigkeit',
    activeUsers: 'Aktive Benutzer',
    batchAnalysis: 'KI-Batch-Analyse',
    selectDocuments: 'Dokumente für Analyse auswählen',
    startBatchAnalysis: 'Batch-Analyse starten',
    aiTagging: 'KI-Verschlagwortung',
    selectDocument: 'Dokument auswählen',
    generateTags: 'KI-Tags generieren',
    generatingTags: 'Generiere Tags...',
    generatedTags: 'Generierte Tags:',
    legalDomainDistribution: 'Rechtsgebiete Verteilung',
    batchResults: 'Batch-Analyse Ergebnisse',
    confidence: 'Vertrauen',
  },
  
  // AI Features
  ai: {
    improvePrompt: 'ImproveAI',
    improving: 'Verbessere...',
    combinedAnalysis: 'Kombinierte KI-Analyse',
    qwenAnalysis: 'Qwen AI Analyse',
    swisscomAnalysis: 'Swisscom Apertus Analyse',
    documentAuthenticity: 'Dokumentenauthentizität',
    swissCompliance: 'Schweizer Compliance',
    verified: 'Verifiziert',
    verificationRequired: 'Überprüfung erforderlich',
    compliant: 'Konform',
    notCompliant: 'Nicht konform',
    legalReferences: 'Rechtsreferenzen',
    legalDomains: 'Rechtsgebiete',
    combinedRecommendations: 'Kombinierte Empfehlungen',
    confidence: 'Vertrauen',
  },
  
  // Trust Score
  trustScore: {
    title: 'Vertrauenswertung',
    legalAuthority: 'Rechtliche Autorität',
    recency: 'Aktualität',
    citationCount: 'Zitierhäufigkeit',
    consistency: 'Konsistenz',
    overall: 'Gesamtbewertung',
    veryHigh: 'Sehr hoch',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
  },
  
  // Document Types
  documentTypes: {
    constitution: 'Bundesverfassung',
    federalLaw: 'Bundesgesetz',
    ordinance: 'Verordnung',
    federalGazette: 'Bundesblatt',
  },
  
  // Legal Domains
  legalDomains: {
    zgb: 'ZGB',
    or: 'OR',
    stgb: 'StGB',
    dsg: 'DSG',
  },
};
