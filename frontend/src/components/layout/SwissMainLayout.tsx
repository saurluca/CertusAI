import React, { useEffect, useRef, useState } from 'react';
import SwissChatInterface from '../chat/SwissChatInterface';
import SwissFooter from './SwissFooter';
import { useTranslation } from '../../hooks/useTranslation';
import { apiService } from '../../services/api';
import { useLocation } from 'react-router-dom';

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

const SwissMainLayout: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { t, currentLanguage } = useTranslation();
  const location = useLocation();
  const hasAutoRun = useRef(false);

  // Swiss Law RAG controls for Home page
  const [ragLanguage, setRagLanguage] = useState<'de' | 'fr' | 'it' | 'all'>(
    (currentLanguage as any) || 'de'
  );
  const [retrieval, setRetrieval] = useState<'bm25' | 'semantic' | 'hybrid'>('bm25');
  const [numDocs, setNumDocs] = useState(8);

  const handleSendMessage = async (content: string, file?: File) => {
    // Create user message content
    const displayContent = file 
      ? `${content ? content + '\n\n' : ''}📎 ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
      : content;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: displayContent,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      let response;
      
      if (file) {
        // Handle file upload
        response = await apiService.uploadDocument(file);
      } else {
        // Minimal call to backend /ask endpoint
        response = await apiService.askSwissLaw(content, ragLanguage, numDocs, retrieval);
      }

      // Create AI response with real data
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer || response.analysis?.summary || 'Analyse abgeschlossen. Weitere Details finden Sie in den Ergebnissen.',
        sender: 'ai',
        timestamp: new Date(),
        interactiveButtons: [
          {
            id: 'legal-basis',
            label: t('chat.buttons.legalBasis') || 'Rechtsgrundlage',
            prompt: 'Welche Rechtsgrundlagen sind für diesen Fall relevant?'
          },
          {
            id: 'relevant-laws',
            label: t('chat.buttons.relevantLaws') || 'Anwendbare Gesetze',
            prompt: 'Welche Gesetze und Verordnungen sind hier anwendbar?'
          },
          {
            id: 'recommendation',
            label: t('chat.buttons.recommendation') || 'Empfehlung',
            prompt: 'Was empfehlen Sie in diesem Fall?'
          }
        ]
      };

      // Add Swiss Law specific information if available
      if (response.citations && response.citations.length > 0) {
        aiMessage.content += `\n\nSources:\n${response.citations.map((citation: string, index: number) => `${index + 1}. ${citation}`).join('\n')}`;
      }
      
      if (response.confidence) {
        aiMessage.content += `\n\nConfidence: ${Math.round(response.confidence * 100)}%`;
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '❌ Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInteractiveButtonClick = async (prompt: string) => {
    await handleSendMessage(prompt);
  };

  // Auto-run Swiss Law RAG when navigated with a query param (from Welcome page)
  useEffect(() => {
    if (hasAutoRun.current) return;
    const params = new URLSearchParams(location.search);
    const q = params.get('question');
    const lang = params.get('language') as 'de' | 'fr' | 'it' | 'all' | null;
    const ret = params.get('retrieval') as 'bm25' | 'semantic' | 'hybrid' | null;
    const nd = params.get('num_docs');
    if (lang && ['de','fr','it','all'].includes(lang)) setRagLanguage(lang);
    if (ret && ['bm25','semantic','hybrid'].includes(ret)) setRetrieval(ret);
    if (nd && !Number.isNaN(parseInt(nd))) setNumDocs(Math.min(20, Math.max(3, parseInt(nd))));
    if (q) {
      hasAutoRun.current = true;
      handleSendMessage(q);
    }
  }, [location.search]);

  return (
    <div className="bg-snow-white flex flex-col">
      {/* Main Content Area - Full Width Chat Interface */}
      <div className="flex-1 flex flex-col py-12 md:py-16">
        <SwissChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          onInteractiveButtonClick={handleInteractiveButtonClick}
          isProcessing={isProcessing}
          placeholder={t('chat.placeholder')}
          controls={
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('ragPanel.language') || 'Language'}</label>
                <select
                  value={ragLanguage}
                  onChange={(e) => setRagLanguage(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm shadow-sm focus:ring-2 focus:ring-swiss-red focus:border-swiss-red"
                >
                  <option value="de">{t('ragPanel.languages.de') || 'Deutsch'}</option>
                  <option value="fr">{t('ragPanel.languages.fr') || 'Français'}</option>
                  <option value="it">{t('ragPanel.languages.it') || 'Italiano'}</option>
                  <option value="all">{t('ragPanel.languages.all') || 'All'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">{t('ragPanel.retrieval') || 'Retrieval'}</label>
                <select
                  value={retrieval}
                  onChange={(e) => setRetrieval(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm shadow-sm focus:ring-2 focus:ring-swiss-red focus:border-swiss-red"
                >
                  <option value="bm25">{t('ragPanel.retrievalOptions.bm25') || 'BM25'}</option>
                  <option value="semantic">{t('ragPanel.retrievalOptions.semantic') || 'Semantic'}</option>
                  <option value="hybrid">{(t('ragPanel.retrievalOptions.hybrid') as any) || 'Hybrid'}</option>
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-600">{t('ragPanel.documents') || 'Documents'}</span>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full bg-slate-100 text-slate-700 border border-slate-200">{numDocs}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={numDocs}
                  onChange={(e) => setNumDocs(parseInt(e.target.value))}
                  className="w-full swiss-range cursor-pointer"
                  aria-label="Documents to retrieve"
                />
              </div>
            </div>
          }
        />
      </div>
      
      {/* Swiss Footer */}
      <SwissFooter />
    </div>
  );
};
export default SwissMainLayout;
