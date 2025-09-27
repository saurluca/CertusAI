import React from 'react';
import { Bot, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ComprehensiveAnalysis } from '../../types';

interface AIAnalysisResultProps {
  result: ComprehensiveAnalysis;
  isLoading?: boolean;
}

const HybridAIAnalysis: React.FC<AIAnalysisResultProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="swiss-card p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin text-swiss-red" />
          <span className="text-slate-600">KI-Analyse läuft...</span>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    if (confidence >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Combined Confidence Score */}
      <div className="swiss-card p-6 bg-gradient-to-r from-red-50 to-blue-50">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          Kombinierte KI-Analyse
          <span className={`ml-2 px-3 py-1 text-sm rounded-full ${getConfidenceColor(result.combined_confidence)}`}>
            {result.combined_confidence}% Vertrauen
          </span>
        </h3>
        <p className="text-slate-700">
          Analyse kombiniert von Qwen AI und Swisscom Apertus für maximale Genauigkeit
        </p>
      </div>

      {/* Qwen AI Analysis */}
      <div className="swiss-card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          Qwen AI Analyse
          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getConfidenceColor(result.qwen_insights.confidence)}`}>
            {result.qwen_insights.confidence}% Vertrauen
          </span>
        </h3>
        <p className="text-blue-800 mb-3">{result.qwen_insights.summary}</p>
        
        {/* Legal References */}
        {result.qwen_insights.legal_references.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Rechtsreferenzen:</h4>
            <div className="flex flex-wrap gap-2">
              {result.qwen_insights.legal_references.map(ref => (
                <span key={ref} className="swiss-badge swiss-badge-blue">
                  {ref}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Legal Domains */}
        {result.qwen_insights.legal_domains.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Rechtsgebiete:</h4>
            <div className="flex flex-wrap gap-2">
              {result.qwen_insights.legal_domains.map(domain => (
                <span key={domain} className="swiss-badge swiss-badge-blue">
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Swisscom Apertus Analysis */}
      <div className="swiss-card p-6 bg-red-50 border-red-200">
        <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Swisscom Apertus Analyse
          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getConfidenceColor(result.swisscom_insights.confidence)}`}>
            {result.swisscom_insights.confidence}% Vertrauen
          </span>
        </h3>
        <p className="text-red-800 mb-3">{result.swisscom_insights.summary}</p>
        
        {/* Document Authenticity */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-red-900">Dokumentenauthentizität:</span>
            {getComplianceIcon(result.swisscom_insights.authenticity.verified)}
            <span className={`px-2 py-1 text-xs rounded-full ${
              result.swisscom_insights.authenticity.verified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {result.swisscom_insights.authenticity.verified ? 'Verifiziert' : 'Überprüfung erforderlich'}
            </span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            {result.swisscom_insights.authenticity.details}
          </p>
        </div>

        {/* Swiss Compliance */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-red-900">Schweizer Compliance:</span>
            {getComplianceIcon(result.swisscom_insights.compliance.overall_compliant)}
            <span className={`px-2 py-1 text-xs rounded-full ${
              result.swisscom_insights.compliance.overall_compliant 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {result.swisscom_insights.compliance.overall_compliant ? 'Konform' : 'Nicht konform'}
            </span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            {result.swisscom_insights.compliance.summary}
          </p>
        </div>

        {/* Legal Domains */}
        {result.swisscom_insights.legal_domains.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-900 mb-2">Rechtsgebiete:</h4>
            <div className="flex flex-wrap gap-2">
              {result.swisscom_insights.legal_domains.map(domain => (
                <span key={domain} className="swiss-badge swiss-badge-red">
                  {domain}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Combined Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="swiss-card p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Kombinierte Empfehlungen
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li key={index} className="text-green-800 flex items-start space-x-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="flex-1">{rec.text}</span>
                <span className="text-xs text-green-600 ml-auto">
                  {rec.source === 'qwen' ? 'Qwen AI' : 'Swisscom Apertus'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HybridAIAnalysis;
