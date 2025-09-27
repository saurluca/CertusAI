import React from 'react';
import { TrustScoreProps } from '../../types';

const SwissTrustScore: React.FC<TrustScoreProps> = ({ score }) => {
  const { overall, breakdown } = score;

  const getScoreColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.6) return 'bg-yellow-500';
    if (value >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 0.8) return 'Sehr hoch';
    if (value >= 0.6) return 'Hoch';
    if (value >= 0.4) return 'Mittel';
    return 'Niedrig';
  };

  const formatScore = (value: number) => {
    return Math.round(value * 100);
  };

  return (
    <div className="swiss-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Vertrauenswertung</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getScoreColor(overall)}`}></div>
          <span className="text-sm font-medium text-slate-700">
            {overall.toFixed(1)}/5.0
          </span>
          <span className="text-xs text-slate-500">
            ({getScoreLabel(overall)})
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Legal Authority */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Rechtliche Autorität</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-slate-200 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getScoreColor(breakdown.legal_authority)}`}
                style={{ width: `${breakdown.legal_authority * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right">
              {formatScore(breakdown.legal_authority)}%
            </span>
          </div>
        </div>

        {/* Recency */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Aktualität</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-slate-200 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getScoreColor(breakdown.recency)}`}
                style={{ width: `${breakdown.recency * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right">
              {formatScore(breakdown.recency)}%
            </span>
          </div>
        </div>

        {/* Citation Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Zitierhäufigkeit</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-slate-200 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getScoreColor(breakdown.citation_count)}`}
                style={{ width: `${breakdown.citation_count * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right">
              {formatScore(breakdown.citation_count)}%
            </span>
          </div>
        </div>

        {/* Consistency */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Konsistenz</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-slate-200 rounded-full">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getScoreColor(breakdown.consistency)}`}
                style={{ width: `${breakdown.consistency * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-8 text-right">
              {formatScore(breakdown.consistency)}%
            </span>
          </div>
        </div>
      </div>

      {/* Overall Score Bar */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Gesamtbewertung</span>
          <span className="text-sm font-semibold text-slate-900">
            {overall.toFixed(1)}/5.0
          </span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(overall)}`}
            style={{ width: `${(overall / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SwissTrustScore;
