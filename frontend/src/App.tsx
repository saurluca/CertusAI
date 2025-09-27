import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import SwissHeader from './components/layout/SwissHeader';
import HomePage from './pages/HomePage';
import { LanguageProvider } from './contexts/LanguageContext';

// Lazy load other pages
const WelcomePage = React.lazy(() => import('./pages/WelcomePage'));
const AnalysisPage = React.lazy(() => import('./pages/AnalysisPage'));
const DataPlusPage = React.lazy(() => import('./pages/DataPlusPage'));
// Admin page removed

function AppContent() {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(true);
  const isWelcomeOnlyPage = location.pathname === '/welcome';
  const isHomePage = location.pathname === '/home' || location.pathname === '/';

  const handleWelcomeComplete = (shouldShowHeader: boolean) => {
    setShowHeader(shouldShowHeader);
  };

  const shouldShowHeader = () => {
    if (isWelcomeOnlyPage) return false;
    return true; // Show header on all pages except welcome
  };

  return (
    <div className="App">
      {shouldShowHeader() && <SwissHeader />}

      <React.Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-swiss-red rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">CH</span>
            </div>
            <div className="text-slate-600">Lädt...</div>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage onWelcomeComplete={handleWelcomeComplete} />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/home" element={<HomePage onWelcomeComplete={handleWelcomeComplete} />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/data-plus" element={<DataPlusPage />} />
          {/* Admin route removed */}
        </Routes>
      </React.Suspense>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;