import React, { useMemo, useState } from 'react';
import SwissScalesIcon from '../components/icons/SwissScalesIcon';
import { useAppStore } from '../store';

const DataPlusPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] bg-snow-white px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <SwissScalesIcon size={22} variant="idle" stroke="#111111" fill="#111111" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">DataPlus</h1>
              <p className="text-slate-600 text-sm">Swiss‑style data utilities and insights</p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-900">Index Status</h2>
            <p className="text-sm text-slate-600 mt-1">Check Swiss Law RAG service health and corpus info.</p>
            <div className="mt-4">
              <button className="px-4 py-2 rounded-lg bg-swiss-red text-white hover:bg-swiss-red-dark">Refresh</button>
            </div>
          </div>

          <DataToolsCard />

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-slate-900">Utilities</h2>
            <ul className="mt-2 text-sm text-slate-700 list-disc list-inside space-y-1">
              <li>Quick status checks</li>
              <li>Lightweight dataset views</li>
              <li>Swiss‑clean UI for operations</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DataPlusPage;

// Internal component: Data Tools card with JSON export capability
const DataToolsCard: React.FC = () => {
  const {
    currentAnalysis,
    searchResults,
    comprehensiveAnalysis,
    improvementSession,
    analytics,
    currentLanguage,
  } = useAppStore((s) => ({
    currentAnalysis: s.currentAnalysis,
    searchResults: s.searchResults,
    comprehensiveAnalysis: s.comprehensiveAnalysis,
    improvementSession: s.improvementSession,
    analytics: s.analytics,
    currentLanguage: s.currentLanguage,
  }));

  const hasData = !!(currentAnalysis || (searchResults && searchResults.length) || comprehensiveAnalysis || improvementSession || analytics);
  const [showJson, setShowJson] = useState<boolean>(false);
  const [justDownloaded, setJustDownloaded] = useState<boolean>(false);

  const jsonPayload = useMemo(() => {
    return {
      generated_at: new Date().toISOString(),
      language: currentLanguage,
      data: {
        currentAnalysis: currentAnalysis || undefined,
        comprehensiveAnalysis: comprehensiveAnalysis || undefined,
        searchResults: (searchResults && searchResults.length) ? searchResults : undefined,
        improvementSession: improvementSession || undefined,
        analytics: analytics || undefined,
      },
    };
  }, [currentAnalysis, comprehensiveAnalysis, searchResults, improvementSession, analytics, currentLanguage]);

  const handleCreateJson = () => {
    try {
      // System-determined storage: persist to localStorage (no download prompt)
      localStorage.setItem('certusai:dataSnapshot', JSON.stringify(jsonPayload));
      // Also open inline log panel
      setShowJson(true);
      setJustDownloaded(true);
      setTimeout(() => setJustDownloaded(false), 1500);
    } catch (e) {
      console.error('Failed to create JSON:', e);
      alert('Failed to create JSON file.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2));
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold text-slate-900">Data Tools</h2>
      <p className="text-sm text-slate-600 mt-1">Create a JSON snapshot to system storage for later internal use.</p>
      <div className="mt-4 flex gap-2 items-center">
        <button
          onClick={handleCreateJson}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black"
          title={'Create JSON Data'}
        >
          Create JSON Data
        </button>
        <button
          onClick={() => setShowJson((v) => !v)}
          disabled={!hasData}
          className={`px-3 py-2 rounded-lg border ${hasData ? 'border-slate-300 text-slate-700 hover:bg-slate-50' : 'border-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          {showJson ? 'Hide JSON' : 'Show JSON'}
        </button>
        {!hasData && (
          <span className="text-xs text-slate-500">No in-app data detected. A minimal snapshot will be created.</span>
        )}
      </div>

      {showJson && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs ${justDownloaded ? 'text-swiss-red' : 'text-slate-500'}`}>{justDownloaded ? 'Saved to system storage (local) and showing latest snapshot' : 'JSON preview (read-only)'}</span>
            <button onClick={handleCopy} className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50">Copy</button>
          </div>
          <pre className="h-56 md:h-64 overflow-auto bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800">
{JSON.stringify(jsonPayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
