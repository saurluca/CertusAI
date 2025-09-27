// French translations
export const fr = {
  // Header
  header: {
    subtitle: 'Analyse Juridique Suisse',
  },
  
  // Navigation
  nav: {
    home: 'Page principale',
    analysis: 'Analyse',
    search: 'Recherche',
    admin: 'Admin',
    test: 'Tests API',
  },
  
  // Welcome Page
  welcome: {
    title: 'Bienvenue',
    subtitle: 'Analyse Juridique Suisse',
    enter: 'Entrer dans CertusAI',
    tagline: 'Intelligence Juridique Suisse',
    poweredBy: 'powered by Apertus AI',
    inputPlaceholder: 'Posez vos questions sur le droit suisse...',
    analyzeButton: 'Analyser',
    uploadButton: 'Télécharger un document',
    searchButton: 'Commencer la recherche juridique',
    madeInSwitzerland: 'Fabriqué en Suisse',
    skipButton: 'Ignorer',
  },

  // Common
  common: {
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
  },
  
  // Upload
  upload: {
    title: 'Analyser un document juridique',
    textInput: 'Saisir du texte',
    fileUpload: 'Télécharger un fichier',
    dragDrop: 'Déposez un fichier PDF ou DOCX ici ou sélectionnez-le',
    supportedFormats: 'Formats supportés: PDF, DOCX • Max. 10MB',
    selectFile: 'Sélectionner un fichier',
    processing: 'Traitement...',
    analyze: 'Analyser',
    analyzing: 'Analyse...',
    characters: 'Caractères',
  },
  
  // Buttons
  buttons: {
    contractAnalysis: 'Analysez ce document contractuel pour les risques juridiques...',
    contractAnalysisLabel: 'Analyse de Contrat',
    complianceCheck: 'Vérifiez cette clause pour la conformité avec le droit suisse...',
    complianceCheckLabel: 'Vérification de Conformité',
    legalImplications: 'Expliquez les implications juridiques de...',
    legalImplicationsLabel: 'Implications Juridiques',
  },
  
  // Footer
  footer: {
    madeIn: 'Fabriqué en Suisse',
    tagline: 'CertusAI - Analyse Juridique Intelligente pour la Suisse',
    privacy: 'Protection des Données',
    imprint: 'Mentions Légales',
    terms: 'CGU',
    contact: 'Contact',
    rights: 'Tous droits réservés',
    poweredBy: 'Propulsé par Qwen AI & Swisscom Apertus',
  },
  
  // Map
  map: {
    title: 'Carte de la Suisse',
    subtitle: 'Activité juridique par canton',
    low: 'Faible',
    high: 'Élevé',
    cantons: 'Cantons',
    inhabitants: 'Habitants',
  },
  
  // Chat
  chat: {
    welcome: 'Bienvenue chez CertusAI',
    description: 'Posez votre question juridique et recevez une analyse complète basée sur le droit suisse.',
    aiResponse: 'J\'analyse votre demande : "{content}"\n\nBasé sur le droit suisse, je peux vous donner l\'évaluation suivante :\n\n• **Base légale** : La demande concerne généralement le droit suisse applicable\n• **Lois pertinentes** : CC, CO, CP (selon le contexte)\n• **Recommandation** : Analyse spécifique supplémentaire requise\n\nSouhaitez-vous que j\'approfondisse un aspect spécifique ?',
    placeholder: 'Posez des questions sur les questions juridiques suisses...',
    send: 'Envoyer',
    buttons: {
      legalBasis: 'Base Légale',
      relevantLaws: 'Lois Pertinentes',
      recommendation: 'Recommandation',
    },
    prompts: {
      legalBasis: 'Veuillez fournir une explication détaillée de la base légale de cette affaire selon le droit suisse, y compris les articles spécifiques et les précédents.',
      relevantLaws: 'Veuillez lister et expliquer toutes les lois, réglementations et cadres juridiques suisses pertinents qui s\'appliquent à cette situation.',
      recommendation: 'Veuillez fournir des recommandations spécifiques et les prochaines étapes pour traiter cette question juridique, y compris les risques potentiels et les exigences de conformité.',
    },
  },
  
  // Analysis
  analysis: {
    title: 'Résultats d\'analyse',
    caseId: 'ID du cas',
    trustScore: 'Score de confiance',
    similarCases: 'Cas similaires',
    aiAnalysis: 'Analyse IA',
    extractedEntities: 'Entités extraites',
    quickActions: 'Actions rapides',
    newSearch: 'Nouvelle recherche',
    checkCompliance: 'Vérifier la conformité',
    contactExpert: 'Contacter un expert',
    legalDisclaimer: 'Avertissement légal',
    disclaimerText: 'Cette analyse est fournie à titre informatif uniquement et ne constitue pas un conseil juridique. Consultez un avocat qualifié pour des questions juridiques spécifiques.',
    loadingSteps: {
      dataCollection: 'Collecte des documents juridiques suisses...',
      swisscomProcessing: 'Traitement des données via Swisscom Apertus AI...',
      indexing: 'Construction de l\'index de recherche...',
      finalizing: 'Finalisation du système d\'analyse...',
      completed: 'Système d\'analyse prêt!'
    },
    progress: {
      title: 'Progrès de l\'Analyse',
      documentsProcessed: 'Documents traités',
      estimatedTime: 'Temps restant estimé'
    }
  },
  
  // Search
  search: {
    title: 'Rechercher dans la base de données juridique',
    subtitle: 'Trouvez une jurisprudence et des lois pertinentes avec une recherche intelligente',
    filter: 'Filtre',
    enterQuestion: 'Entrer une Question Juridique',
    placeholder: 'Posez votre question juridique ici...',
    search: 'Rechercher',
    searching: 'Recherche...',
    improveAI: 'ImproveAI',
    documentTypes: 'Types de Documents',
    legalAreas: 'Domaines Juridiques',
    timePeriod: 'Période',
    from: 'De',
    to: 'À',
    sortBy: 'Trier par',
    sortOptions: {
      relevance: 'Pertinence',
      date: 'Date',
      trustScore: 'Score de Confiance',
      citations: 'Citations',
    },
    results: 'Résultats de Recherche',
    previous: 'Précédent',
    next: 'Suivant',
    pageOf: 'Page {current} sur {total}',
    noResults: 'Aucun résultat trouvé',
    noResultsDescription: 'Essayez d\'autres termes de recherche ou utilisez ImproveAI pour de meilleurs résultats.',
    readyForSearch: 'Prêt pour la Recherche',
    readyForSearchDescription: 'Entrez votre question juridique pour trouver des documents pertinents.',
    searchingDatabase: 'Recherche dans la base de données juridique',
    filters: {
      federalConstitution: 'Constitution Fédérale',
      federalLaws: 'Lois Fédérales',
      ordinances: 'Ordonnances',
      federalCourtDecisions: 'Arrêts du Tribunal Fédéral',
    },
  },
  
  // Admin
  admin: {
    title: 'CertusAI - Tableau de bord Admin',
    subtitle: 'Analyse de documents et étiquetage guidé par IA',
    totalDocuments: 'Total des documents',
    analyzedToday: 'Analysés aujourd\'hui',
    avgAccuracy: 'Précision moyenne',
    activeUsers: 'Utilisateurs actifs',
    batchAnalysis: 'Analyse par lots IA',
    selectDocuments: 'Sélectionner des documents pour l\'analyse',
    startBatchAnalysis: 'Démarrer l\'analyse par lots',
    aiTagging: 'Étiquetage IA',
    selectDocument: 'Sélectionner un document',
    generateTags: 'Générer des étiquettes IA',
    generatingTags: 'Génération d\'étiquettes...',
    generatedTags: 'Étiquettes générées:',
    legalDomainDistribution: 'Distribution des domaines juridiques',
    batchResults: 'Résultats d\'analyse par lots',
    confidence: 'Confiance',
  },
  
  // AI Features
  ai: {
    improvePrompt: 'AméliorerIA',
    improving: 'Amélioration...',
    combinedAnalysis: 'Analyse IA combinée',
    qwenAnalysis: 'Analyse Qwen AI',
    swisscomAnalysis: 'Analyse Swisscom Apertus',
    documentAuthenticity: 'Authenticité du document',
    swissCompliance: 'Conformité suisse',
    verified: 'Vérifié',
    verificationRequired: 'Vérification requise',
    compliant: 'Conforme',
    notCompliant: 'Non conforme',
    legalReferences: 'Références juridiques',
    legalDomains: 'Domaines juridiques',
    combinedRecommendations: 'Recommandations combinées',
    confidence: 'Confiance',
  },
  
  // Trust Score
  trustScore: {
    title: 'Score de confiance',
    legalAuthority: 'Autorité juridique',
    recency: 'Actualité',
    citationCount: 'Nombre de citations',
    consistency: 'Cohérence',
    overall: 'Évaluation globale',
    veryHigh: 'Très élevé',
    high: 'Élevé',
    medium: 'Moyen',
    low: 'Faible',
  },
  
  // Document Types
  documentTypes: {
    constitution: 'Constitution fédérale',
    federalLaw: 'Loi fédérale',
    ordinance: 'Ordonnance',
    federalGazette: 'Feuille fédérale',
  },
  
  // Legal Domains
  legalDomains: {
    zgb: 'CC',
    or: 'CO',
    stgb: 'CP',
    dsg: 'LPD',
  },
};
