import React from 'react';
import { Calendar, ExternalLink, Scale } from 'lucide-react';
import { LegalCardProps } from '../../types';

const SwissLegalCard: React.FC<LegalCardProps> = ({ document, onClick }) => {
  const getAuthorityBadge = (level: number) => {
    const badges = {
      1: { label: 'Bundesverfassung', color: 'bg-red-100 text-red-800' },
      2: { label: 'Bundesgesetz', color: 'bg-orange-100 text-orange-800' },
      3: { label: 'Verordnung', color: 'bg-yellow-100 text-yellow-800' },
      4: { label: 'Bundesblatt', color: 'bg-blue-100 text-blue-800' },
    };
    
    const badge = badges[level as keyof typeof badges] || badges[4];
    return (
      <span className={`swiss-badge ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH');
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    if (score >= 0.4) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div 
      className="swiss-card p-6 hover:shadow-swiss-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
            {document.title_de}
          </h4>
          <p className="text-sm text-slate-600 mb-3 line-clamp-1">
            {document.title_fr} • {document.title_it}
          </p>
        </div>
        <div className="ml-4 flex flex-col items-end space-y-2">
          {getAuthorityBadge(document.authority_level)}
          <div className="flex items-center space-x-1 text-xs text-slate-500">
            <Scale className="w-3 h-3" />
            <span className={getSimilarityColor(document.similarity_score)}>
              {Math.round(document.similarity_score * 100)}% Ähnlichkeit
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
        <div className="flex items-center space-x-1">
          <ExternalLink className="w-3 h-3" />
          <span className="truncate max-w-xs">
            {document.eli_uri.split('/').pop()}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(document.date_document)}</span>
        </div>
      </div>
      
      {/* Text Preview */}
      <div className="mb-4">
        <p className="text-sm text-slate-700 line-clamp-3">
          {document.text_preview}
        </p>
      </div>
      
      {/* Classification Tags */}
      <div className="flex flex-wrap gap-2">
        {document.classification?.slice(0, 3).map(cls => (
          <span key={cls} className="swiss-badge swiss-badge-gray">
            {cls}
          </span>
        ))}
        {document.classification && document.classification.length > 3 && (
          <span className="swiss-badge swiss-badge-gray">
            +{document.classification.length - 3} weitere
          </span>
        )}
      </div>

      {/* Trust Score */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Vertrauenswertung</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  document.trust_score >= 4 ? 'bg-green-500' :
                  document.trust_score >= 3 ? 'bg-yellow-500' :
                  document.trust_score >= 2 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${(document.trust_score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700">
              {document.trust_score.toFixed(1)}/5.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwissLegalCard;
