import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Paperclip, X, Wand2, Loader2 } from 'lucide-react';
import SwissAlpsIcon from '../icons/SwissAlpsIcon';
import SwissScalesIcon from '../icons/SwissScalesIcon';
import { useTranslation } from '../../hooks/useTranslation';
import { apiService } from '../../services/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
  interactiveButtons?: InteractiveButton[];
}

interface InteractiveButton {
  id: string;
  label: string;
  prompt: string;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

interface SwissChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, file?: File) => void;
  onInteractiveButtonClick: (prompt: string) => void;
  isProcessing: boolean;
  placeholder?: string;
  controls?: React.ReactNode;
}

const SwissChatInterface: React.FC<SwissChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onInteractiveButtonClick,
  isProcessing,
  placeholder,
  controls
}) => {
  const [inputValue, setInputValue] = useState('');
  const [inputHeight, setInputHeight] = useState(120);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  // Two-step Improve Prompt flow state
  const [impSessionId, setImpSessionId] = useState<string | null>(null);
  const [impCurrentStep, setImpCurrentStep] = useState<number>(0);
  const [impQuestion, setImpQuestion] = useState<string>('');
  const [impOptions, setImpOptions] = useState<string[] | null>(null);
  const [impSelected, setImpSelected] = useState<string>('');
  const [impOpen, setImpOpen] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, currentLanguage } = useTranslation();

  // Quick actions: language-specific pool (>= 20). We display 10 and randomly swap one periodically.
  const quickActionPool = useMemo<QuickAction[]>(() => {
    const lang = (currentLanguage as string) || 'de';
    // Helper to create items with ids
    const mk = (label: string, prompt: string, idx: number): QuickAction => ({ id: `${lang}-${idx}`, label, prompt });

    if (lang === 'fr') {
      const items = [
        ['Analyse de contrat', "Analysez ce contrat pour l'intégralité et les risques juridiques."],
        ['Vérification de conformité', 'Vérifiez la conformité de ce document avec le droit suisse.'],
        ['Implications juridiques', 'Quelles sont les implications juridiques de ce document ?'],
        ['Résumé', 'Faites un résumé clair et concis du document.'],
        ['Points clés', 'Listez les 5 points juridiques clés.'],
        ['Risques', 'Identifiez les risques juridiques potentiels et leur impact.'],
        ['Clauses manquantes', 'Y a‑t‑il des clauses essentielles manquantes ?'],
        ['Droits et obligations', 'Quelles obligations et quels droits découlent du document ?'],
        ['Options', 'Quelles options recommandez‑vous pour avancer ?'],
        ['Sources', 'Citez les lois suisses pertinentes avec références.'],
        ['Traduction', 'Traduisez ce texte en français juridique clair.'],
        ['Clarté', 'Réécrivez le texte pour plus de clarté juridique.'],
        ['Check‑list', 'Créez une liste de contrôle pour ce type de dossier.'],
        ['Timeline', 'Élaborez une timeline procédurale.'],
        ['Coûts', 'Estimez les coûts et délais juridiques typiques.'],
        ['Modèle de courrier', 'Rédigez un modèle de lettre officielle.'],
        ['Questions suivantes', 'Quelles questions devrions‑nous poser au client ?'],
        ['Comparaison', 'Comparez avec la pratique habituelle en Suisse.'],
        ['Erreurs fréquentes', 'Quelles erreurs fréquentes faut‑il éviter ?'],
        ['Vérification finale', 'Faites une vérification finale des risques.'],
      ];
      return items.map(([l, p], i) => mk(l as string, p as string, i));
    }
    if (lang === 'it') {
      const items = [
        ['Analisi del contratto', 'Analizza questo contratto per completezza e rischi legali.'],
        ['Verifica di conformità', 'Verifica la conformità del documento al diritto svizzero.'],
        ['Implicazioni legali', 'Quali sono le implicazioni legali di questo documento?'],
        ['Riassunto', 'Fornisci un riassunto chiaro e conciso.'],
        ['Punti chiave', 'Elenca i 5 punti legali principali.'],
        ['Rischi', 'Individua i potenziali rischi legali e il loro impatto.'],
        ['Clausole mancanti', 'Ci sono clausole essenziali mancanti?'],
        ['Diritti e obblighi', 'Quali obblighi e diritti ne derivano?'],
        ['Opzioni', 'Quali opzioni consigli per procedere?'],
        ['Fonti', 'Cita le leggi svizzere pertinenti con riferimenti.'],
        ['Traduzione', 'Traduci il testo in italiano giuridico chiaro.'],
        ['Chiarezza', 'Riformula il testo per maggiore chiarezza giuridica.'],
        ['Checklist', 'Crea una checklist per questo tipo di pratica.'],
        ['Timeline', 'Elabora una timeline procedurale.'],
        ['Costi', 'Stima costi e tempi legali tipici.'],
        ['Modello di lettera', 'Redigi un modello di lettera ufficiale.'],
        ['Domande successive', 'Quali domande porre al cliente?'],
        ['Confronto', 'Confronta con la prassi usuale in Svizzera.'],
        ['Errori comuni', 'Quali errori comuni evitare?'],
        ['Verifica finale', 'Esegui una verifica finale dei rischi.'],
      ];
      return items.map(([l, p], i) => mk(l as string, p as string, i));
    }
    if (lang === 'en') {
      const items = [
        ['Contract analysis', 'Analyze this contract for completeness and legal risks.'],
        ['Compliance check', 'Check this document for compliance with Swiss law.'],
        ['Legal implications', 'What are the legal implications of this document?'],
        ['Summary', 'Provide a clear and concise summary.'],
        ['Key points', 'List the 5 key legal points.'],
        ['Risks', 'Identify potential legal risks and their impact.'],
        ['Missing clauses', 'Are any essential clauses missing?'],
        ['Rights and obligations', 'What rights and obligations arise from this?'],
        ['Next steps', 'What next steps do you recommend?'],
        ['Sources', 'Cite relevant Swiss laws with references.'],
        ['Translate', 'Translate this text into clear legal English.'],
        ['Clarify', 'Rewrite the text for better legal clarity.'],
        ['Checklist', 'Create a checklist for this case type.'],
        ['Timeline', 'Draft a procedural timeline.'],
        ['Costs', 'Estimate typical legal costs and timelines.'],
        ['Letter template', 'Draft a formal letter template.'],
        ['Follow-up questions', 'Which follow-up questions should we ask the client?'],
        ['Comparison', 'Compare with common Swiss practice.'],
        ['Common mistakes', 'What common mistakes should be avoided?'],
        ['Final review', 'Perform a final risk review.'],
      ];
      return items.map(([l, p], i) => mk(l as string, p as string, i));
    }
    // default 'de'
    const items = [
      ['Vertragsanalyse', 'Analysieren Sie diesen Vertrag auf Vollständigkeit und rechtliche Risiken.'],
      ['Compliance‑Prüfung', 'Prüfen Sie die Compliance dieses Dokuments mit Schweizer Recht.'],
      ['Rechtliche Auswirkungen', 'Welche rechtlichen Auswirkungen hat dieses Dokument?'],
      ['Zusammenfassung', 'Erstellen Sie eine klare und prägnante Zusammenfassung.'],
      ['Schlüsselpunkte', 'Listen Sie die 5 wichtigsten rechtlichen Punkte auf.'],
      ['Risiken', 'Identifizieren Sie potenzielle rechtliche Risiken und deren Auswirkungen.'],
      ['Fehlende Klauseln', 'Fehlen wesentliche Klauseln?'],
      ['Rechte und Pflichten', 'Welche Pflichten und Rechte ergeben sich?'],
      ['Empfehlung', 'Welche nächsten Schritte empfehlen Sie?'],
      ['Quellen', 'Nennen Sie relevante Schweizer Gesetze mit Verweisen.'],
      ['Übersetzen', 'Übersetzen Sie den Text in klares juristisches Deutsch.'],
      ['Klarheit', 'Formulieren Sie den Text juristisch klarer.'],
      ['Checkliste', 'Erstellen Sie eine Checkliste für diesen Falltyp.'],
      ['Zeitplan', 'Erstellen Sie einen prozessualen Zeitplan.'],
      ['Kosten', 'Schätzen Sie typische rechtliche Kosten und Fristen.'],
      ['Briefvorlage', 'Formulieren Sie eine formelle Briefvorlage.'],
      ['Rückfragen', 'Welche Rückfragen sollten wir dem Klienten stellen?'],
      ['Vergleich', 'Vergleichen Sie mit der üblichen Praxis in der Schweiz.'],
      ['Häufige Fehler', 'Welche häufigen Fehler sollten vermieden werden?'],
      ['Abschlussprüfung', 'Führen Sie eine abschließende Risiko‑Prüfung durch.'],
    ];
    return items.map(([l, p], i) => mk(l as string, p as string, i));
  }, [currentLanguage]);

  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [qaHighlightId, setQaHighlightId] = useState<string | null>(null);
  const qaHighlightTimer = useRef<number | null>(null);

  // Initialize 3 actions when language changes
  useEffect(() => {
    setQuickActions(quickActionPool.slice(0, 3));
  }, [quickActionPool]);

  // Every 3 seconds replace one random visible action with a new one from the pool
  useEffect(() => {
    const interval = setInterval(() => {
      if (quickActionPool.length <= 3) return;
      setQuickActions((prev) => {
        if (prev.length === 0) return prev;
        const existingIds = new Set(prev.map((x) => x.id));
        const candidates = quickActionPool.filter((x) => !existingIds.has(x.id));
        if (candidates.length === 0) return prev;
        const replaceIndex = Math.floor(Math.random() * prev.length);
        const replacement = candidates[Math.floor(Math.random() * candidates.length)];
        const next = [...prev];
        next[replaceIndex] = replacement;
        // transient highlight for the newly replaced suggestion
        setQaHighlightId(replacement.id);
        if (qaHighlightTimer.current) window.clearTimeout(qaHighlightTimer.current);
        qaHighlightTimer.current = window.setTimeout(() => setQaHighlightId(null), 800);
        return next;
      });
    }, 3000); // every 3s
    return () => clearInterval(interval);
  }, [quickActionPool]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 120), 300);
      setInputHeight(newHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputValue.trim() || selectedFile) && !isProcessing && !isUploading) {
      onSendMessage(inputValue.trim(), selectedFile || undefined);
      setInputValue('');
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/html'];
      if (!allowedTypes.includes(file.type)) {
        alert('Unterstützte Dateiformate: PDF, DOCX, TXT, HTML');
        return;
      }
      
      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        alert('Datei zu groß. Maximum: 50MB');
        return;
      }
      
      setSelectedFile(file);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-CH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImprovePrompt = async () => {
    if (!inputValue.trim() || isProcessing || isUploading || isImproving) return;
    try {
      setIsImproving(true);
      console.log('Starting improve prompt with:', inputValue, currentLanguage);
      const session = await apiService.improvePrompt(inputValue, (currentLanguage as string) || undefined);
      console.log('Received session:', session);
      
      // Begin interactive 2-step flow
      const steps = (session as any)?.steps || [];
      const first = steps[0];
      if (first && first.question) {
        console.log('Starting interactive flow with first step:', first);
        setImpSessionId((session as any).session_id as string);
        setImpCurrentStep(0);
        setImpQuestion(first.question as string);
        setImpOptions(Array.isArray(first.options) ? (first.options as string[]) : null);
        setImpSelected('');
        setImpOpen(true);
      } else if ((session as any)?.improved_question) {
        // If backend returned directly improved prompt
        console.log('Direct improvement received:', (session as any).improved_question);
        setInputValue((session as any).improved_question as string);
      } else {
        console.warn('No steps or improved question in response:', session);
        alert('No improvement steps received from AI. Please try again.');
      }
    } catch (e) {
      console.error('Prompt improvement failed', e);
      // Show detailed error to user
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      alert(`Prompt improvement failed: ${errorMsg}`);
    } finally {
      setIsImproving(false);
    }
  };

  const handleImproveNext = async () => {
    if (!impSessionId) return;
    // For multiple choice, ensure a selection; for text input, use impSelected (could be empty)
    const answer = impSelected || '';
    try {
      setIsImproving(true);
      const nextIndex = impCurrentStep + 1;
      const session = await apiService.processStepResponse(impSessionId, nextIndex, answer);
      const steps = (session as any)?.steps || [];
      if (nextIndex < steps.length && steps[nextIndex]) {
        const s = steps[nextIndex];
        setImpCurrentStep(nextIndex);
        setImpQuestion(s.question as string);
        setImpOptions(Array.isArray(s.options) ? (s.options as string[]) : null);
        setImpSelected('');
      } else {
        // Completed two steps or no more steps -> apply improved question if present
        const improved = (session as any)?.improved_question as string | undefined;
        if (improved && improved.trim()) setInputValue(improved);
        setImpOpen(false);
        setImpSessionId(null);
      }
    } catch (e) {
      console.error('Step processing failed', e);
      try { alert(t('common.error') || 'Step processing failed.'); } catch {}
    } finally {
      setIsImproving(false);
    }
  };

  const handleImproveCancel = () => {
    setImpOpen(false);
    setImpSessionId(null);
    setImpSelected('');
  };

  return (
    <div className="flex flex-col h-full bg-snow-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto swiss-scrollbar p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="mb-4">
              <SwissScalesIcon size={48} variant="idle" stroke="#E60000" />
            </div>

          
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {t('chat.welcome')}
            </h3>
            <p className="text-slate-600 max-w-md">
              {t('chat.description')}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user'
                      ? 'bg-slate-200'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-slate-600" />
                  ) : (
                    <SwissScalesIcon size={18} variant="idle" stroke="#111111" fill="#111111" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative px-5 py-4 rounded-2xl overflow-hidden swiss-hover-lift ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 rounded-br-md'
                      : 'bg-white border border-swiss-red-light rounded-bl-md'
                  } ${message.isLoading ? 'animate-pulse' : ''}`}
                >
                  {/* Swiss red accent for AI messages */}
                  {message.sender === 'ai' && (
                    <div className="pointer-events-none absolute left-0 top-2 bottom-2 w-[3px] bg-gradient-to-b from-swiss-red to-swiss-red-dark rounded-full shadow-[0_0_6px_rgba(230,0,0,0.25)]"></div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <SwissScalesIcon size={20} variant="loading" stroke="#E60000" />
                        <span className="text-slate-600">{t('common.loading')}</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-slate-800">
                        {message.content}
                      </div>
                    )}
                    
                    {/* Interactive Buttons for AI messages */}
                    {message.sender === 'ai' && message.interactiveButtons && message.interactiveButtons.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.interactiveButtons.map((button) => (
                          <button
                            key={button.id}
                            onClick={() => onInteractiveButtonClick(button.prompt)}
                            className="px-3 py-2 text-xs bg-swiss-red-pale hover:bg-swiss-red-light text-swiss-red-dark border border-swiss-red-light rounded-lg transition-colors flex items-center gap-1"
                          >
                            <span>{button.label}</span>
                            <span className="text-swiss-red">›</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div
                    className={`text-xs text-slate-500 mt-2 ${
                      message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Loading indicator for new messages */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="max-w-3xl flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                <SwissScalesIcon size={18} variant="idle" stroke="#111111" fill="#111111" />
              </div>
              <div className="bg-white border border-swiss-red-light rounded-2xl rounded-bl-md px-5 py-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-swiss-red animate-spin" />
                  <span className="text-slate-600">Verarbeite Ihre Anfrage...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white/70 backdrop-blur p-4">
        <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Optional Controls Above Prompt */}
          {controls && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
              {controls}
            </div>
          )}
          {/* File Display */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-swiss-red-pale border border-swiss-red-light rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-swiss-red rounded-full flex items-center justify-center">
                  <Paperclip className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-600">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}
          
          {/* Prompt Input */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || "Schreiben Sie Ihre Nachricht hier oder fügen Sie eine Datei an..."}
              disabled={isProcessing || isUploading}
              className="w-full resize-none border-2 border-slate-200 rounded-2xl px-5 py-4 pr-12 pb-16 text-base font-swiss bg-gradient-to-br from-slate-50 to-white shadow-sm transition-all duration-300 focus:border-swiss-red focus:shadow-swiss-red focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '120px', maxHeight: '300px' }}
            />

            {/* Attach Icon */}
            <button
              type="button"
              onClick={handleAttachClick}
              disabled={isProcessing || isUploading}
              className="absolute bottom-4 right-4 w-8 h-8 bg-swiss-red hover:bg-swiss-red-dark disabled:bg-slate-300 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 swiss-ripple"
              title="Datei anhängen"
            >
              <Paperclip className="w-4 h-4 text-white" />
            </button>
            
            {/* Character count removed per request */}

            {/* Inline Quick Actions inside prompt box */}
            <div className="absolute left-3 right-12 bottom-4 flex flex-wrap gap-2 pointer-events-auto">
              {quickActions.map((qa) => (
                <button
                  key={qa.id}
                  type="button"
                  onClick={() => setInputValue(qa.prompt)}
                  disabled={isProcessing || isUploading}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors disabled:opacity-50 ${
                    qa.id === qaHighlightId
                      ? 'bg-swiss-red text-white border-swiss-red'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                  title={qa.prompt}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          </div>
        


          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.html"
            className="hidden"
            disabled={isProcessing || isUploading}
            onChange={handleFileSelect}
          />

          {/* Improve & Send Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleImprovePrompt}
              disabled={!inputValue.trim() || isProcessing || isUploading || isImproving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-swiss-red text-swiss-red bg-white hover:bg-swiss-red hover:text-white focus:outline-none focus:ring-2 focus:ring-swiss-red/30 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={'Improve Prompt Via AI'}
            >
              {isImproving ? (
                <>
                  <SwissScalesIcon size={16} variant="loading" stroke="#E60000" />
                  <span>{t('ai.improving') || 'Improving...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>{'Improve Prompt Via AI'}</span>
                </>
              )}
            </button>

            <button
              type="submit"
              disabled={(!inputValue.trim() && !selectedFile) || isProcessing || isUploading}
              className="swiss-send-button swiss-ripple disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing || isUploading ? (
                <>
                  <SwissScalesIcon size={20} variant="loading" stroke="#FFFFFF" />
                  <span>{isUploading ? 'Lade hoch...' : 'Verarbeite...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{selectedFile ? 'Senden & Analysieren' : (t('chat.send') || 'Senden')}</span>
                </>
              )}
            </button>
          </div>
        </form>

        </div>
      </div>
      {/* Improve Prompt Modal */}
      {impOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={handleImproveCancel} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-swiss-red" />
                <h4 className="text-sm font-semibold text-slate-900">{t('ai.improvePromptTitle') || 'Improve your prompt'}</h4>
              </div>
              <button
                className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-slate-50"
                onClick={handleImproveCancel}
                title={t('common.cancel') || 'Cancel'}
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="text-xs text-slate-500">{(t('ai.step') || 'Step')} {impCurrentStep + 1}</div>
              <div className="text-slate-900 font-medium">{impQuestion || t('ai.answerTheFollowing') || 'Please answer the following:'}</div>

              {Array.isArray(impOptions) && impOptions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {impOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${impSelected === opt ? 'bg-swiss-red text-white border-swiss-red' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                      onClick={() => setImpSelected(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full min-h-[80px] rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-swiss-red"
                  placeholder={t('ai.typeYourAnswer') || 'Type your answer...'}
                  value={impSelected}
                  onChange={(e) => setImpSelected(e.target.value)}
                />
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleImproveCancel}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  disabled={isImproving}
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleImproveNext}
                  disabled={isImproving || (Array.isArray(impOptions) && impOptions.length > 0 && !impSelected)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs rounded-lg bg-swiss-red text-white hover:bg-swiss-red-dark disabled:opacity-50"
                >
                  {isImproving ? (
                    <>
                      <SwissScalesIcon size={14} variant="loading" stroke="#FFFFFF" />
                      <span>{t('common.loading') || 'Loading...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('common.next') || 'Next'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SwissChatInterface;
