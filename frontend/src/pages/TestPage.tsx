import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  Bot, 
  Shield, 
  BarChart3, 
  Car, 
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Download,
  Trash2,
  Copy,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp?: string;
  duration?: number;
  data?: any;
  error?: string;
}

interface TestSection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  tests: TestResult[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warning';
  section: string;
  message: string;
  details?: any;
}

const TestPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('auth');
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>({});
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [allTestsCompleted, setAllTestsCompleted] = useState<boolean>(false);

  // Test sections configuration
  const testSections: TestSection[] = [
    {
      id: 'auth',
      name: 'System Health',
      description: 'Test basic system health and connectivity',
      icon: Shield,
      tests: []
    },
    {
      id: 'upload',
      name: 'Document Upload',
      description: 'Test file upload and document processing',
      icon: Upload,
      tests: []
    },
    {
      id: 'analysis',
      name: 'Document Analysis',
      description: 'Test AI-powered document analysis',
      icon: FileText,
      tests: []
    },
    {
      id: 'search',
      name: 'Search & RAG',
      description: 'Test search functionality and RAG system',
      icon: Search,
      tests: []
    },
    {
      id: 'ai',
      name: 'AI Services',
      description: 'Test AI-powered features and prompt improvement',
      icon: Bot,
      tests: []
    },
    {
      id: 'admin',
      name: 'Admin Functions',
      description: 'Test administrative features and analytics',
      icon: BarChart3,
      tests: []
    },
    {
      id: 'traffic',
      name: 'Traffic Analysis',
      description: 'Test traffic violation analysis features',
      icon: Car,
      tests: []
    },
    {
      id: 'health',
      name: 'Health & Compliance',
      description: 'Test system health and compliance checks',
      icon: Heart,
      tests: []
    },
    {
      id: 'swiss-rag',
      name: 'Swiss Law RAG',
      description: 'Test Swiss Law RAG system with progress indicators',
      icon: Bot,
      tests: []
    }
  ];

  // API base URL  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Logging functions
  const addLog = (level: LogEntry['level'], section: string, message: string, details?: any) => {
    const logEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      section,
      message,
      details
    };
    setLogs(prev => [...prev, logEntry]);
  };

  const clearLogs = () => {
    setLogs([]);
    setAllTestsCompleted(false);
  };

  const copyLogsToClipboard = async () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()} [${log.section}] ${log.message}${
        log.details ? '\n' + JSON.stringify(log.details, null, 2) : ''
      }`
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(logText);
      addLog('success', 'System', 'Logs copied to clipboard');
    } catch (err) {
      addLog('error', 'System', 'Failed to copy logs to clipboard');
    }
  };

  // Helper function to make API requests
  const makeApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.detail || data.message || 'Unknown error'}`);
    }
    
    return data;
  };

  // Update test result
  const updateTestResult = (sectionId: string, testId: string, result: Partial<TestResult>) => {
    setTestResults(prev => ({
      ...prev,
      [sectionId]: prev[sectionId]?.map(test => 
        test.id === testId ? { ...test, ...result } : test
      ) || []
    }));
  };

  // Add test result
  const addTestResult = (sectionId: string, test: TestResult) => {
    setTestResults(prev => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), test]
    }));
  };

  // Clear test results
  const clearTestResults = (sectionId: string) => {
    setTestResults(prev => ({
      ...prev,
      [sectionId]: []
    }));
  };

  // Helper function to run tests with logging
  const runTestsWithLogging = async (sectionId: string, tests: any[]) => {
    addLog('info', sectionId, `Starting ${sectionId} tests...`);
    
    for (const test of tests) {
      const testResult: TestResult = {
        id: test.id,
        name: test.name,
        status: 'running',
        timestamp: new Date().toLocaleTimeString()
      };
      
      addTestResult(sectionId, testResult);
      addLog('info', sectionId, `Running test: ${test.name}`);

      try {
        const startTime = performance.now();
        const data = await test.test();
        const duration = Math.round(performance.now() - startTime);

        updateTestResult(sectionId, test.id, {
          status: 'success',
          duration,
          data
        });
        addLog('success', sectionId, `✅ PASS: ${test.name} (${duration}ms)`, { duration, dataKeys: data ? Object.keys(data) : [] });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateTestResult(sectionId, test.id, {
          status: 'error',
          error: errorMessage
        });
        addLog('error', sectionId, `❌ FAIL: ${test.name} - ${errorMessage}`, { error: errorMessage });
      }
    }
    
    addLog('info', sectionId, `${sectionId} tests completed`);
  };

  // System Health Tests
  const runAuthTests = async () => {
    const sectionId = 'auth';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'health-check',
        name: 'Health Check',
        test: () => makeApiRequest('/health')
      },
      {
        id: 'root-endpoint',
        name: 'Root Endpoint Check',
        test: () => makeApiRequest('/')
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Document Upload Tests
  const runUploadTests = async () => {
    const sectionId = 'upload';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'text-upload',
        name: 'Text Upload Test',
        test: () => {
          const formData = new FormData();
          formData.append('text', 'Artikel 1 des Schweizerischen Zivilgesetzbuches besagt, dass das Gesetz auf alle Rechtsfragen Anwendung findet, für die es nach Wortlaut oder Auslegung eine Bestimmung enthält.');
          formData.append('language', 'de');
          formData.append('canton', 'ZH');
          
          return fetch(`${API_BASE_URL}/api/v1/upload/text`, {
            method: 'POST',
            body: formData
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          });
        }
      },
      {
        id: 'upload-status',
        name: 'Check Upload Status',
        test: () => makeApiRequest('/api/v1/upload/status/test-case-123')
      },
      {
        id: 'hybrid-upload',
        name: 'Hybrid Upload Test',
        test: () => {
          const formData = new FormData();
          formData.append('text', 'Test text for hybrid upload functionality.');
          formData.append('language', 'de');
          
          return fetch(`${API_BASE_URL}/api/v1/upload/hybrid`, {
            method: 'POST',
            body: formData
          }).then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          });
        }
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Document Analysis Tests
  const runAnalysisTests = async () => {
    const sectionId = 'analysis';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'analyze-sample',
        name: 'Analyze Sample Document',
        test: () => makeApiRequest('/api/v1/analysis/analyze', {
          method: 'POST',
          body: JSON.stringify({
            case_id: 'test-case-123',
            query: 'Analyse des Verkehrsrechts',
            language: 'de',
            limit: 5,
            threshold: 0.7
          })
        })
      },
      {
        id: 'trust-score',
        name: 'Calculate Trust Score',
        test: () => makeApiRequest('/api/v1/analysis/trust-score?case_id=test-doc-id')
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Search & RAG Tests
  const runSearchTests = async () => {
    const sectionId = 'search';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'document-search',
        name: 'Document Search',
        test: () => makeApiRequest('/api/v1/search/?query=Verkehrsrecht&language=de&limit=5')
      },
      {
        id: 'rag-search',
        name: 'RAG Search Test',
        test: () => makeApiRequest('/api/v1/search/rag', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Was sind die Strafen für Geschwindigkeitsüberschreitungen in der Schweiz?',
            language: 'de',
            enable_verification: true,
            max_context_length: 4000,
            include_sources: true
          })
        })
      },
      {
        id: 'similar-documents',
        name: 'Find Similar Documents',
        test: () => makeApiRequest('/api/v1/search/similar/test-case-id?limit=5&threshold=0.7')
      },
      {
        id: 'swiss-law-rag',
        name: 'Swiss Law RAG Test',
        test: () => makeApiRequest('/api/v1/analysis/swiss-law-analysis', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Was sind die Grundrechte in der Schweiz?',
            language: 'de',
            enable_citations: true
          })
        })
      },
      {
        id: 'swiss-law-rag-verkehr',
        name: 'Swiss Law RAG - Verkehrsrecht',
        test: () => makeApiRequest('/api/v1/analysis/swiss-law-analysis', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Welche Strafen gibt es für Geschwindigkeitsüberschreitungen?',
            language: 'de',
            enable_citations: true
          })
        })
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // AI Services Tests
  const runAITests = async () => {
    const sectionId = 'ai';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'qwen-question',
        name: 'Qwen AI Question',
        test: () => makeApiRequest('/api/v1/ai/question', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Was ist das Schweizer Strafgesetzbuch?',
            context: 'Legal document analysis',
            language: 'de'
          })
        })
      },
      {
        id: 'improve-prompt',
        name: 'Improve Prompt',
        test: () => makeApiRequest('/api/v1/ai/improve-prompt', {
          method: 'POST',
          body: JSON.stringify({
            original_question: 'Verkehrsrecht Schweiz',
            language: 'de',
            improvement_type: 'step_by_step'
          })
        })
      },
      {
        id: 'comprehensive-analysis',
        name: 'Comprehensive AI Analysis',
        test: () => makeApiRequest('/api/v1/ai/analyze', {
          method: 'POST',
          body: JSON.stringify({
            text: 'Ein Autofahrer wurde beim Überschreiten der Geschwindigkeitsbegrenzung um 25 km/h erwischt.',
            language: 'de'
          })
        })
      },
      {
        id: 'generate-subjects',
        name: 'Generate AI Subjects',
        test: () => makeApiRequest('/api/v1/ai/generate-subjects', {
          method: 'POST',
          body: JSON.stringify({
            improved_question: 'Schweizer Verkehrsrecht: Geschwindigkeitsüberschreitungen und Bußgelder',
            language: 'de'
          })
        })
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Admin Tests
  const runAdminTests = async () => {
    const sectionId = 'admin';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'analytics',
        name: 'Get Analytics',
        test: () => makeApiRequest('/api/v1/admin/analytics?date_range=7d')
      },
      {
        id: 'batch-analysis',
        name: 'Batch Analysis Test',
        test: () => makeApiRequest('/api/v1/admin/analyze-batch', {
          method: 'POST',
          body: JSON.stringify({
            document_ids: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
            analysis_type: 'basic'
          })
        })
      },
      {
        id: 'generate-tags',
        name: 'Generate AI Tags',
        test: () => makeApiRequest('/api/v1/admin/generate-tags', {
          method: 'POST',
          body: JSON.stringify({
            document_id: '550e8400-e29b-41d4-a716-446655440000',
            tag_categories: ['legal_domain', 'document_type', 'topics']
          })
        })
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Traffic Analysis Tests
  const runTrafficTests = async () => {
    const sectionId = 'traffic';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'analyze-violation',
        name: 'Analyze Traffic Violation',
        test: () => makeApiRequest('/api/v1/traffic/analyze', {
          method: 'POST',
          body: JSON.stringify({
            ticket_text: 'Geschwindigkeitsüberschreitung: 25 km/h über dem Limit auf der Autobahn A1, Busse CHF 250',
            canton: 'zh',
            language: 'de'
          })
        })
      },
      {
        id: 'defense-strategies',
        name: 'Get Defense Strategies',
        test: () => makeApiRequest('/api/v1/traffic/defense-strategies', {
          method: 'POST',
          body: JSON.stringify({
            violation_type: 'speeding',
            severity: 'moderate',
            fine_amount_chf: 250,
            canton: 'zh',
            language: 'de'
          })
        })
      },
      {
        id: 'appeal-letter',
        name: 'Generate Appeal Letter',
        test: () => makeApiRequest('/api/v1/traffic/appeal-letter', {
          method: 'POST',
          body: JSON.stringify({
            analysis_id: '550e8400-e29b-41d4-a716-446655440000',
            personal_info: {
              name: 'Max Mustermann',
              address: 'Musterstrasse 123',
              city: 'Zürich',
              postal_code: '8001'
            },
            circumstances: 'Dies war meine erste Verkehrsübertretung. Ich bin normalerweise ein sehr vorsichtiger Fahrer und bedauere den Vorfall zutiefst.',
            requested_outcome: 'reduction',
            language: 'de'
          })
        })
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Health & Compliance Tests
  const runHealthTests = async () => {
    const sectionId = 'health';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'health-check',
        name: 'System Health Check',
        test: () => makeApiRequest('/health')
      },
      {
        id: 'metrics',
        name: 'System Metrics',
        test: () => makeApiRequest('/metrics')
      },
      {
        id: 'compliance-status',
        name: 'Compliance Status',
        test: () => makeApiRequest('/api/v1/compliance/status')
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Swiss Law RAG Tests
  const runSwissRAGTests = async () => {
    const sectionId = 'swiss-rag';
    clearTestResults(sectionId);

    const tests = [
      {
        id: 'swiss-law-grundrechte',
        name: 'Grundrechte Test',
        test: () => makeApiRequest('/api/v1/analysis/swiss-law-analysis', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Was sind die Grundrechte in der Schweiz?',
            language: 'de',
            enable_citations: true
          })
        })
      },
      {
        id: 'swiss-law-verkehr',
        name: 'Verkehrsrecht Test',
        test: () => makeApiRequest('/api/v1/analysis/swiss-law-analysis', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Welche Strafen gibt es für Geschwindigkeitsüberschreitungen?',
            language: 'de',
            enable_citations: true
          })
        })
      },
      {
        id: 'swiss-law-verfassung',
        name: 'Verfassungsrecht Test',
        test: () => makeApiRequest('/api/v1/analysis/swiss-law-analysis', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Was ist die Schweizer Bundesverfassung?',
            language: 'de',
            enable_citations: true
          })
        })
      },
      {
        id: 'swiss-law-zivilrecht',
        name: 'Zivilrecht Test',
        test: () => makeApiRequest('/api/v1/analysis/swiss-law-analysis', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Was regelt das Schweizer Zivilgesetzbuch?',
            language: 'de',
            enable_citations: true
          })
        })
      },
      {
        id: 'swiss-law-strafrecht',
        name: 'Strafrecht Test',
        test: () => makeApiRequest('/api/v1/analysis/swiss-law-analysis', {
          method: 'POST',
          body: JSON.stringify({
            question: 'Was sind die wichtigsten Straftaten im Schweizer Strafgesetzbuch?',
            language: 'de',
            enable_citations: true
          })
        })
      }
    ];

    await runTestsWithLogging(sectionId, tests);
  };

  // Run tests for a specific section
  const runSectionTests = async (sectionId: string) => {
    setIsRunningTests(true);
    
    try {
      switch (sectionId) {
        case 'auth':
          await runAuthTests();
          break;
        case 'upload':
          await runUploadTests();
          break;
        case 'analysis':
          await runAnalysisTests();
          break;
        case 'search':
          await runSearchTests();
          break;
        case 'ai':
          await runAITests();
          break;
        case 'admin':
          await runAdminTests();
          break;
        case 'traffic':
          await runTrafficTests();
          break;
        case 'health':
          await runHealthTests();
          break;
        case 'swiss-rag':
          await runSwissRAGTests();
          break;
        default:
          console.warn(`Unknown section: ${sectionId}`);
      }
    } catch (error) {
      console.error(`Error running tests for section ${sectionId}:`, error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true);
    setAllTestsCompleted(false);
    clearLogs();
    addLog('info', 'System', '🚀 Starting comprehensive API test suite...');
    
    const startTime = performance.now();
    let totalTests = 0;
    let passedTests: string[] = [];
    let failedTests: string[] = [];
    
    for (const section of testSections) {
      setActiveSection(section.id);
      addLog('info', 'System', `📋 Testing section: ${section.name}`);
      await runSectionTests(section.id);
      
      // Count results for this section
      const sectionResults = testResults[section.id] || [];
      totalTests += sectionResults.length;
      
      // Track individual test results
      sectionResults.forEach(test => {
        if (test.status === 'success') {
          passedTests.push(`${section.name}: ${test.name}`);
        } else if (test.status === 'error') {
          failedTests.push(`${section.name}: ${test.name} (${test.error})`);
        }
      });
      
      // Add section summary
      const sectionPassed = sectionResults.filter(t => t.status === 'success').length;
      const sectionFailed = sectionResults.filter(t => t.status === 'error').length;
      
      if (sectionFailed === 0) {
        addLog('success', 'System', `✅ ${section.name} SECTION: All ${sectionPassed} tests PASSED`);
      } else {
        addLog('warning', 'System', `⚠️ ${section.name} SECTION: ${sectionPassed} PASSED, ${sectionFailed} FAILED`);
      }
      
      // Add a small delay between sections
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const totalTime = Math.round(performance.now() - startTime);
    
    // Detailed Final Summary
    addLog('info', 'System', '═══════════════════════════════════════');
    addLog('info', 'System', `🏁 TEST SUITE COMPLETED in ${totalTime}ms`);
    addLog('info', 'System', `📊 TOTAL SUMMARY: ${totalTests} tests - ${passedTests.length} PASSED, ${failedTests.length} FAILED`);
    
    // Show passed tests
    if (passedTests.length > 0) {
      addLog('success', 'System', '✅ PASSED TESTS:');
      passedTests.forEach(test => {
        addLog('success', 'Results', `  ✓ ${test}`);
      });
    }
    
    // Show failed tests
    if (failedTests.length > 0) {
      addLog('error', 'System', '❌ FAILED TESTS:');
      failedTests.forEach(test => {
        addLog('error', 'Results', `  ✗ ${test}`);
      });
    }
    
    // Overall result
    if (failedTests.length === 0) {
      addLog('success', 'System', '🎉 ALL TESTS PASSED! System is working correctly.');
    } else {
      addLog('warning', 'System', `⚠️ ${failedTests.length} tests failed. See details above.`);
    }
    
    setIsRunningTests(false);
    setAllTestsCompleted(true);
    setShowLogs(true);
  };

  // Get status icon
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const activeSection_ = testSections.find(s => s.id === activeSection);
  const currentResults = testResults[activeSection] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-swiss-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">CH</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  CertusAI API Test Suite
                </h1>
                <p className="text-sm text-gray-500">
                  Comprehensive testing for all backend features
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="px-4 py-2 bg-swiss-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isRunningTests ? 'Running...' : 'Run All Tests'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Test Sections */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Sections</h2>
              <nav className="space-y-2">
                {testSections.map((section) => {
                  const Icon = section.icon;
                  const sectionResults = testResults[section.id] || [];
                  const totalTests = sectionResults.length;
                  const successTests = sectionResults.filter(t => t.status === 'success').length;
                  const errorTests = sectionResults.filter(t => t.status === 'error').length;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        activeSection === section.id
                          ? 'bg-swiss-red text-white border-swiss-red'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="font-medium">{section.name}</div>
                          {totalTests > 0 && (
                            <div className="text-xs mt-1 opacity-75">
                              {successTests} ✓ {errorTests > 0 && `${errorTests} ✗`} / {totalTests}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content - Test Results */}
          <div className="lg:col-span-3">
            {activeSection_ && (
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Section Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <activeSection_.icon className="w-6 h-6 text-swiss-red" />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {activeSection_.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {activeSection_.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => clearTestResults(activeSection)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear</span>
                      </button>
                      <button
                        onClick={() => runSectionTests(activeSection)}
                        disabled={isRunningTests}
                        className="px-4 py-2 bg-swiss-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Run Tests</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="p-6">
                  {currentResults.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tests run yet
                      </h3>
                      <p className="text-gray-500">
                        Click "Run Tests" to start testing this section
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentResults.map((result) => (
                        <div
                          key={result.id}
                          className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(result.status)}
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {result.name}
                                </h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>{result.timestamp}</span>
                                  {result.duration && (
                                    <span>{result.duration}ms</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {result.data && (
                              <button
                                onClick={() => {
                                  const dataStr = JSON.stringify(result.data, null, 2);
                                  const blob = new Blob([dataStr], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${result.id}-result.json`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          {result.error && (
                            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-800 font-mono">
                                {result.error}
                              </p>
                            </div>
                          )}
                          
                          {result.data && (
                            <details className="mt-3">
                              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                View Response Data
                              </summary>
                              <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                                <pre className="text-xs text-gray-800 overflow-x-auto">
                                  {JSON.stringify(result.data, null, 2)}
                                </pre>
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs Panel */}
      {(allTestsCompleted || logs.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Terminal className="w-5 h-5 text-swiss-red" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Test Execution Logs
                  </h3>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {logs.length} entries
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyLogsToClipboard}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Logs</span>
                  </button>
                  
                  <button
                    onClick={clearLogs}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                  
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{showLogs ? 'Collapse' : 'Expand'}</span>
                  </button>
                </div>
              </div>
            </div>
            
            {showLogs && (
              <div className="p-4">
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No logs yet. Run tests to see execution details.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log) => {
                        const getLogColor = (level: LogEntry['level']) => {
                          switch (level) {
                            case 'success': return 'text-green-400';
                            case 'error': return 'text-red-400';
                            case 'warning': return 'text-yellow-400';
                            default: return 'text-blue-400';
                          }
                        };

                        return (
                          <div key={log.id} className="font-mono text-sm">
                            <span className="text-gray-500">[{log.timestamp}]</span>
                            <span className={`ml-2 font-semibold ${getLogColor(log.level)}`}>
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-purple-400 ml-2">[{log.section}]</span>
                            <span className="text-gray-300 ml-2">{log.message}</span>
                            {log.details && (
                              <details className="ml-8 mt-1">
                                <summary className="cursor-pointer text-gray-500 hover:text-gray-300">
                                  Details
                                </summary>
                                <pre className="mt-1 text-xs text-gray-400 bg-gray-800 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
