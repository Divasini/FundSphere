import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Target,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { InnovationAnalysis } from '../types';

interface InnovationScoreCardProps {
  analysis: InnovationAnalysis;
  className?: string;
}

export const InnovationScoreCard: React.FC<InnovationScoreCardProps> = ({
  analysis,
  className = '',
}) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'LOW_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-mint-100 text-mint-800 border border-mint-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Low Capital Risk
          </span>
        );
      case 'MODERATE_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-peach-100 text-peach-800 border border-peach-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Moderate Prototype Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-softpink-100 text-softpink-800 border border-softpink-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Elevated Innovation Risk
          </span>
        );
    }
  };

  return (
    <div
      className={`p-6 sm:p-8 bg-gradient-to-br from-white via-ice-50/30 to-lavender-50/30 border border-ice-200 rounded-3xl shadow-soft space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ice-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ice-600 to-mint-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-cloud-900">
                Innovation Intelligence Matrix
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-ice-100 text-ice-700">
                AI Verified
              </span>
            </div>
            <p className="text-xs text-cloud-800/70 mt-0.5">
              Automated heuristic evaluation of technical feasibility, budget realism, and impact.
            </p>
          </div>
        </div>

        <div>{getRiskBadge(analysis.riskLevel)}</div>
      </div>

      {/* Main Score Bar & Radial Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-white/90 border border-ice-100 rounded-2xl shadow-xs">
        <div className="sm:border-r sm:border-cloud-100 pr-4 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-cloud-800/70 uppercase tracking-wide">
            Innovation Index
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-ice-600">{analysis.overallScore}</span>
            <span className="text-xs text-cloud-800/50 font-bold">/ 100</span>
          </div>
          <span className="text-[10px] text-mint-700 font-semibold mt-1">
            Top 10% Innovation Tier
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-cloud-800/70">Technical Feasibility</span>
            <span className="font-bold text-cloud-900">{analysis.feasibilityScore}%</span>
          </div>
          <div className="w-full bg-cloud-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-ice-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.feasibilityScore}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-cloud-800/70">Societal Impact</span>
            <span className="font-bold text-cloud-900">{analysis.impactScore}%</span>
          </div>
          <div className="w-full bg-cloud-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-mint-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.impactScore}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-cloud-800/70">Market Viability</span>
            <span className="font-bold text-cloud-900">{analysis.marketViabilityScore}%</span>
          </div>
          <div className="w-full bg-cloud-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-lavender-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.marketViabilityScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {analysis.badges.map((b, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-xl bg-white border border-ice-200 text-xs font-bold text-ice-800 shadow-2xs flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-ice-600" />
            {b}
          </span>
        ))}
      </div>

      {/* AI Verdict */}
      <div className="p-4 bg-ice-50/60 border border-ice-100 rounded-2xl text-xs space-y-1">
        <span className="font-bold text-ice-900 block">AI Evaluation Verdict:</span>
        <p className="text-cloud-800/80 leading-relaxed font-medium">{analysis.verdict}</p>
      </div>

      {/* Two Column Grid: Strengths & Milestone Tranche Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Strengths */}
        <div className="p-4 bg-white border border-cloud-200/80 rounded-2xl space-y-2">
          <h4 className="font-bold text-cloud-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-mint-600" /> Core Innovation Strengths
          </h4>
          <ul className="space-y-1.5 text-cloud-800/80">
            {analysis.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-mint-600 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Milestone Tranche Plan */}
        <div className="p-4 bg-white border border-cloud-200/80 rounded-2xl space-y-2">
          <h4 className="font-bold text-cloud-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-ice-600" /> Capital Milestone Roadmap
          </h4>
          <div className="space-y-2 divide-y divide-cloud-100">
            {analysis.milestones.map((m, idx) => (
              <div key={idx} className="pt-1.5 first:pt-0">
                <div className="flex items-center justify-between font-bold text-cloud-900 text-[11px]">
                  <span>{m.phase}</span>
                  <span className="text-ice-600">{m.capitalShare}</span>
                </div>
                <span className="text-[10px] text-cloud-800/60 block">{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
