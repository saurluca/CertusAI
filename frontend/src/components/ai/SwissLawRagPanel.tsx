import React, { useEffect, useRef, useState } from 'react';
import { Search, BookOpen, Languages, Settings2, Link as LinkIcon } from 'lucide-react';
import apiService from '../../services/api';
import { useTranslation } from '../../hooks/useTranslation';
import { useLocation } from 'react-router-dom';

interface Citation {
  title?: string;
  article_refs?: string[];
  article_quotes?: string[];
  doc_id?: string;
  law_marker?: string;
  snippet?: string;
  score?: number;
  source_kind?: string;
}

interface RagResult {
  answer: string;
  confidence: number;
  citations?: Citation[];
  retrieved?: Citation[];
  language?: string;
}

const SwissLawRagPanel: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState<'de' | 'fr' | 'it' | 'all'>('de');
  const [retrieval, setRetrieval] = useState<'bm25' | 'semantic' | 'hybrid'>('bm25');
  const [numDocs, setNumDocs] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RagResult | null>(null);
  const hasAutoRun = useRef(false);

  const onAsk = async () => {
    setError(null);
    setResult(null);
    if (!question.trim()) {
      setError(t('ragPanel.errorEmpty'));
      return;
    }
    try {
      setLoading(true);
      const data = await apiService.searchSwissLaw(question, language, numDocs, retrieval);
      setResult(data);
    } catch (e: any) {
      setError(e?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Auto-run if query params provide question/language
  useEffect(() => {
    if (hasAutoRun.current) return;
    const params = new URLSearchParams(location.search);
    const q = params.get('question');
    const lang = params.get('language') as 'de' | 'fr' | 'it' | 'all' | null;
    if (q) {
      setQuestion(q);
      if (lang && ['de', 'fr', 'it', 'all'].includes(lang)) {
        setLanguage(lang);
      }
      hasAutoRun.current = true;
      // Defer to ensure state is applied before running
      setTimeout(() => {
        onAsk();
      }, 0);
    }
  }, [location.search]);

  return (
    <div className="swiss-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-slate-700" />
          <h3 className="text-lg font-semibold text-slate-900">{t('ragPanel.title')}</h3>
        </div>
        <div className="text-xs text-slate-500">{t('ragPanel.experimental')}</div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">{t('ragPanel.questionLabel')}</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('ragPanel.placeholder')}
            className="w-full min-h-[90px] rounded-md border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 p-3 text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Languages className="w-4 h-4" /> {t('ragPanel.language')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="w-full rounded-md border border-slate-200 bg-white p-2 focus:ring-2 focus:ring-sky-500"
            >
              <option value="de">{t('ragPanel.languages.de')}</option>
              <option value="fr">{t('ragPanel.languages.fr')}</option>
              <option value="it">{t('ragPanel.languages.it')}</option>
              <option value="all">{t('ragPanel.languages.all')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Settings2 className="w-4 h-4" /> {t('ragPanel.retrieval')}
            </label>
            <select
              value={retrieval}
              onChange={(e) => setRetrieval(e.target.value as any)}
              className="w-full rounded-md border border-slate-200 bg-white p-2 focus:ring-2 focus:ring-sky-500"
            >
              <option value="bm25">{t('ragPanel.retrievalOptions.bm25')}</option>
              <option value="semantic">{t('ragPanel.retrievalOptions.semantic')}</option>
              <option value="hybrid">{t('ragPanel.retrievalOptions.hybrid') || 'Hybrid'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('ragPanel.documents')}: {numDocs}</label>
            <input
              type="range"
              min={3}
              max={20}
              value={numDocs}
              onChange={(e) => setNumDocs(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAsk}
            disabled={loading}
            className="swiss-button flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> {loading ? t('ragPanel.searching') : t('ragPanel.search')}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-md border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{t('ragPanel.answer')}</h4>
                <span className="text-xs text-slate-500">{t('ragPanel.confidence')}: {(result.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="text-slate-800 whitespace-pre-wrap">{result.answer}</p>
            </div>

            {result.citations && result.citations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900">{t('ragPanel.sourcesAndCitations')}</h4>
                <div className="space-y-2">
                  {result.citations.map((c, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900">{c.title || c.law_marker || 'Quelle'}</div>
                        {typeof c.score === 'number' && (
                          <span className="text-xs text-slate-500">{t('ragPanel.score')}: {c.score.toFixed(2)}</span>
                        )}
                      </div>
                      {c.article_refs && c.article_refs.length > 0 && (
                        <div className="mt-2 text-sm text-slate-700">
                          <div className="font-medium">{t('ragPanel.articles')}:</div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {c.article_refs.map((r, i) => (
                              <span key={i} className="swiss-badge swiss-badge-blue">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.article_quotes && c.article_quotes.length > 0 && (
                        <div className="mt-2 text-sm text-slate-700">
                          <div className="font-medium">{t('ragPanel.quotes')}:</div>
                          <ul className="list-disc list-inside space-y-1 mt-1">
                            {c.article_quotes.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {c.snippet && (
                        <div className="mt-2 text-sm text-slate-600 flex items-start gap-2">
                          <LinkIcon className="w-4 h-4 mt-[2px]" />
                          <span>{c.snippet}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwissLawRagPanel;
