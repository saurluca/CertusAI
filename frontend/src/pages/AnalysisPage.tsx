import React, { useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import apiService from '../services/api';
import SwissFooter from '../components/layout/SwissFooter';

// Loading Spinner Component
const LoadingSpinner: React.FC<{ size?: number }> = ({ size = 120 }) => {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div className="animate-spin" style={{ width: size * 0.8, height: size * 0.8 }}>
        <svg
          width={size * 0.8}
          height={size * 0.8}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Spinning bars */}
          <rect x="11" y="1" width="2" height="6" rx="1" fill="rgb(220, 38, 38)" opacity="1">
            <animate attributeName="opacity" values="1;0.2" dur="1s" begin="0s" repeatCount="indefinite"/>
          </rect>
          <rect x="16.24" y="3.76" width="2" height="6" rx="1" fill="rgb(220, 38, 38)" opacity="0.875" transform="rotate(45 17.24 6.76)">
            <animate attributeName="opacity" values="0.875;0.2" dur="1s" begin="0.125s" repeatCount="indefinite"/>
          </rect>
          <rect x="17" y="11" width="6" height="2" rx="1" fill="rgb(220, 38, 38)" opacity="0.75">
            <animate attributeName="opacity" values="0.75;0.2" dur="1s" begin="0.25s" repeatCount="indefinite"/>
          </rect>
          <rect x="16.24" y="16.24" width="2" height="6" rx="1" fill="rgb(220, 38, 38)" opacity="0.625" transform="rotate(135 17.24 19.24)">
            <animate attributeName="opacity" values="0.625;0.2" dur="1s" begin="0.375s" repeatCount="indefinite"/>
          </rect>
          <rect x="11" y="17" width="2" height="6" rx="1" fill="rgb(220, 38, 38)" opacity="0.5">
            <animate attributeName="opacity" values="0.5;0.2" dur="1s" begin="0.5s" repeatCount="indefinite"/>
          </rect>
          <rect x="3.76" y="16.24" width="2" height="6" rx="1" fill="rgb(220, 38, 38)" opacity="0.375" transform="rotate(225 4.76 19.24)">
            <animate attributeName="opacity" values="0.375;0.2" dur="1s" begin="0.625s" repeatCount="indefinite"/>
          </rect>
          <rect x="1" y="11" width="6" height="2" rx="1" fill="rgb(220, 38, 38)" opacity="0.25">
            <animate attributeName="opacity" values="0.25;0.2" dur="1s" begin="0.75s" repeatCount="indefinite"/>
          </rect>
          <rect x="3.76" y="3.76" width="2" height="6" rx="1" fill="rgb(220, 38, 38)" opacity="0.125" transform="rotate(315 4.76 6.76)">
            <animate attributeName="opacity" values="0.125;0.2" dur="1s" begin="0.875s" repeatCount="indefinite"/>
          </rect>
        </svg>
      </div>
    </div>
  );
};

const AnalysisPage: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [building, setBuilding] = React.useState(false);
  const [buildState, setBuildState] = React.useState<
    | { status: 'idle' }
    | { status: 'building' }
    | { status: 'done'; count: number }
    | { status: 'error'; message: string }
  >({ status: 'idle' });
  const [progress, setProgress] = React.useState<{ documents: number; index_limit: number } | null>(null);
  const [fraction, setFraction] = React.useState<string>('full');
  const [recentTitles, setRecentTitles] = React.useState<string[]>([]);
  const [recentIds, setRecentIds] = React.useState<string[]>([]);
  const [showMatrix, setShowMatrix] = React.useState(true);
  const [matrixLines, setMatrixLines] = React.useState<string[]>([]);
  const matrixRef = React.useRef<HTMLDivElement | null>(null);
  const openedRef = React.useRef<HTMLDivElement | null>(null);
  const buildStartRef = React.useRef<number>(0);
  const [panelCollapsed, setPanelCollapsed] = React.useState<boolean>(false);
  const [appliedInfo, setAppliedInfo] = React.useState<{ applied_fraction?: string; effective_index_limit?: number } | null>(null);
  
  // Loading steps state
  const [currentStep, setCurrentStep] = React.useState<number>(0);
  const [loadingProgress, setLoadingProgress] = React.useState<number>(0);
  
  const loadingSteps = [
    'dataCollection',
    'swisscomProcessing', 
    'indexing',
    'finalizing',
    'completed'
  ];

  // Poll backend status during building to visualize progress
  useEffect(() => {
    let timer: any;
    const poll = async () => {
      try {
        const status = await apiService.getSwissLawStatus();
        const docs = status?.corpus_stats?.documents ?? 0;
        const limit = status?.corpus_stats?.index_limit ?? 0;
        setProgress({ documents: docs, index_limit: limit });
        if (Array.isArray(status?.recent_titles)) {
          setRecentTitles(status.recent_titles as string[]);
        }
        if (Array.isArray(status?.recent_ids)) {
          setRecentIds(status.recent_ids as string[]);
        }
        
        // Update loading progress and steps
        if (building) {
          const progressPercent = limit > 0 ? Math.min(100, (docs / limit) * 100) : 0;
          setLoadingProgress(progressPercent);
          
          // Update current step based on progress
          if (progressPercent < 20) {
            setCurrentStep(0); // dataCollection
          } else if (progressPercent < 40) {
            setCurrentStep(1); // swisscomProcessing
          } else if (progressPercent < 80) {
            setCurrentStep(2); // indexing
          } else if (progressPercent < 100) {
            setCurrentStep(3); // finalizing
          } else {
            setCurrentStep(4); // completed
          }
        }
        
        // Auto-complete if initialized and we just finished building
        if (building && status?.initialized) {
          const elapsed = Date.now() - (buildStartRef.current || Date.now());
          if (elapsed >= 3500) {
            setBuildState({ status: 'done', count: docs });
            setBuilding(false);
            setCurrentStep(4); // completed
            setLoadingProgress(100);
          }
        }
      } catch (e) {
        // ignore polling errors
      }
    };
    if (building) {
      poll();
      timer = setInterval(poll, 1500);
    }
    return () => clearInterval(timer);
  }, [building]);

  // Auto-scroll opened files panel
  useEffect(() => {
    if (openedRef.current) {
      openedRef.current.scrollTop = openedRef.current.scrollHeight;
    }
  }, [recentIds]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" key={currentLanguage}>
      <div className="flex-1 max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-16 w-full">
        <div className="swiss-card p-8 text-center space-y-6">
          <h1 className="text-2xl font-semibold text-slate-900">{t('analysis.title')}</h1>
          <p className="text-slate-600">{t('analysis.readyForSearch') || 'Bereit für die Analyse'}</p>
          
          {/* Fraction selector: 300x / 500x / 700x / Full */}
          <div className="flex items-center justify-center gap-3">
            {([
              { label: '300x', value: '300' },
              { label: '500x', value: '500' },
              { label: '700x', value: '700' },
              { label: 'Full', value: 'full' },
            ]).map(opt => (
              <label key={opt.value} className={`px-3 py-1 rounded-full text-sm cursor-pointer border ${fraction === opt.value ? 'bg-swiss-red text-white border-swiss-red' : 'bg-white text-slate-700 border-slate-300 hover:border-swiss-red'}`}>
                <input
                  type="radio"
                  name="fraction"
                  value={opt.value}
                  checked={fraction === opt.value}
                  onChange={() => setFraction(opt.value)}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <button
            className="swiss-button w-full disabled:opacity-60"
            disabled={building}
            onClick={async () => {
              try {
                setBuildState({ status: 'building' });
                setBuilding(true);
                setCurrentStep(0);
                setLoadingProgress(0);
                buildStartRef.current = Date.now();
                const res = await apiService.buildSwissLawIndex(fraction);
                if (res.initialized) {
                  const count = res.documents ?? 0;
                  setBuildState({ status: 'done', count });
                  setAppliedInfo({ applied_fraction: res.applied_fraction, effective_index_limit: res.effective_index_limit });
                  setCurrentStep(4);
                  setLoadingProgress(100);
                } else {
                  setBuildState({ status: 'error', message: res.error || t('common.error') });
                }
              } catch (e: any) {
                setBuildState({ status: 'error', message: e?.message || t('common.error') });
              } finally {
                // keep building=true; polling effect will switch it off when initialized
              }
            }}
          >
            {t('analysis.analyzeAll') || 'Alle Dokumente analysieren'}
          </button>

          {/* Modern Loading Interface */}
          {buildState.status === 'building' && (
            <div className="flex flex-col items-center space-y-6 py-8">
              {/* Loading Spinner */}
              <LoadingSpinner size={140} />
              
              {/* Current Step Display */}
              <div className="text-center space-y-3">
                <h3 className="text-lg font-semibold text-slate-800">
                  {t(`analysis.progress.title`)}
                </h3>
                <p className="text-slate-600 text-base">
                  {t(`analysis.loadingSteps.${loadingSteps[currentStep]}`)}
                </p>
                
                {/* Step Indicators */}
                <div className="flex items-center justify-center space-x-2 mt-4">
                  {loadingSteps.slice(0, -1).map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index <= currentStep 
                          ? 'bg-swiss-red' 
                          : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Progress Stats */}
                {progress && (
                  <div className="text-sm text-slate-500 mt-4 space-y-1">
                    <div>{t('analysis.progress.documentsProcessed')}: {progress.documents.toLocaleString()}</div>
                    {progress.index_limit > 0 && (
                      <div>Total: {progress.index_limit.toLocaleString()}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {buildState.status === 'done' && (
            <div className="text-center py-6">
              <div className="text-green-600 text-lg font-semibold mb-2">
                ✅ {t('analysis.loadingSteps.completed')}
              </div>
              <div className="text-sm text-slate-600">
                {t('analysis.indexBuilt').replace('{count}', String(buildState.count))}
              </div>
            </div>
          )}
          
          {buildState.status === 'error' && (
            <div className="text-center py-6 animate-fade-in">
              <div className="text-red-600 text-lg font-semibold mb-2 animate-shake">
                ❌ Error
              </div>
              <div className="text-sm text-slate-600 animate-slide-up">
                {buildState.message}
              </div>
            </div>
          )}
          
          {/* Applied Info */}
          {appliedInfo && buildState.status !== 'building' && (
            <div className="text-xs text-slate-500 text-center mt-4">
              Applied: {appliedInfo.applied_fraction || 'n/a'} | Effective limit: {appliedInfo.effective_index_limit ?? 'n/a'}
            </div>
          )}
          
          {/* Absolute positioned live panel; keep visible after build if we have data */}
          {(building || recentIds.length > 0) && (
            <div
              style={{ position: 'absolute', width: '80%', left: '8%', height: panelCollapsed ? '6%' : '50%' }}
              className="mt-3 text-left z-40"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold text-slate-800">Opened files (live)</div>
                <button
                  className="px-2 py-0.5 text-xs rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                  onClick={() => setPanelCollapsed(v => !v)}
                  title={panelCollapsed ? 'Expand' : 'Collapse'}
                  aria-label={panelCollapsed ? 'Expand live panel' : 'Collapse live panel'}
                >
                  {panelCollapsed ? '↕' : '×'}
                </button>
              </div>
              <div
                ref={openedRef}
                className="w-full h-full bg-slate-950 text-emerald-200 rounded-md p-3 overflow-auto text-xs font-mono border border-slate-800 shadow-xl"
              >
                {recentIds.length === 0 ? (
                  <div className="opacity-80">Waiting for files…</div>
                ) : (
                  recentIds.map((rid, i) => {
                    const tail = rid.split('/').slice(-8).join('/');
                    const title = recentTitles[i] || '';
                    return (
                      <div key={`${rid}-${i}`} className="flex items-center gap-2 py-0.5">
                        <span className="text-emerald-400">{String(i + 1).padStart(2, '0')}.</span>
                        <span className="truncate" title={rid}>{tail}</span>
                        {title && <span className="opacity-70">• {title}</span>}
                        <button
                          className="ml-auto px-2 py-0.5 text-[10px] rounded border border-emerald-600 hover:bg-emerald-900/40"
                          onClick={() => navigator.clipboard.writeText(rid)}
                          title="Copy path"
                        >Copy</button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <SwissFooter />
    </div>
  );
};

export default AnalysisPage;
