export interface InnovationAnalysis {
  overallScore: number; // 0 - 100
  feasibilityScore: number; // 0 - 100
  impactScore: number; // 0 - 100
  marketViabilityScore: number; // 0 - 100
  riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'ELEVATED_RISK';
  verdict: string;
  strengths: string[];
  recommendations: string[];
  badges: string[];
  milestones: Array<{ phase: string; title: string; capitalShare: string }>;
}

export const analyzeCampaignInnovation = (campaign: {
  title: string;
  shortDescription: string;
  description: string;
  fundingGoal: number;
  categoryName?: string;
  deadline?: Date | string;
}): InnovationAnalysis => {
  const text = `${campaign.title} ${campaign.shortDescription} ${campaign.description}`.toLowerCase();
  const goal = Number(campaign.fundingGoal);

  // 1. Novelty & Tech Keywords Analysis
  const techKeywords = ['ai', 'solar', 'iot', 'hardware', 'sensor', 'portable', 'algorithm', 'automated', 'nanotech', 'biomedical', 'battery', 'renewable', 'clean', 'machine learning', 'robotics'];
  const impactKeywords = ['rural', 'clinic', 'farmers', 'affordable', 'open source', 'literacy', 'water', 'health', 'sustainable', 'empowerment', 'education', 'waste', 'community'];

  const matchedTech = techKeywords.filter(k => text.includes(k));
  const matchedImpact = impactKeywords.filter(k => text.includes(k));

  // 2. Score Calculations (Relational heuristic)
  const techBonus = Math.min(matchedTech.length * 8, 35);
  const impactBonus = Math.min(matchedImpact.length * 8, 35);
  const detailBonus = Math.min(Math.floor((campaign.description.length / 500) * 15), 20);

  // Overall Score between 65 and 98 for thoughtful submissions
  const overallScore = Math.min(Math.max(50 + techBonus + detailBonus, 55), 98);
  const impactScore = Math.min(Math.max(45 + impactBonus + (campaign.categoryName ? 15 : 5), 50), 99);
  
  // Feasibility depends on realistic funding goal and description depth
  let feasibilityScore = 70;
  if (goal >= 10000 && goal <= 500000) {
    feasibilityScore += 18; // Sweet spot for seed crowdfunding prototypes
  } else if (goal > 1000000 && campaign.description.length < 300) {
    feasibilityScore -= 20; // High goal with brief description is risky
  } else {
    feasibilityScore += 5;
  }
  feasibilityScore = Math.min(Math.max(feasibilityScore, 40), 95);

  const marketViabilityScore = Math.round((overallScore * 0.4 + impactScore * 0.3 + feasibilityScore * 0.3));

  // Risk Rating
  let riskLevel: 'LOW_RISK' | 'MODERATE_RISK' | 'ELEVATED_RISK' = 'LOW_RISK';
  if (feasibilityScore < 60 || goal > 800000) {
    riskLevel = 'MODERATE_RISK';
  }
  if (feasibilityScore < 50) {
    riskLevel = 'ELEVATED_RISK';
  }

  // Badges
  const badges: string[] = [];
  if (matchedTech.length >= 2) badges.push('DeepTech Innovation');
  if (matchedImpact.length >= 2) badges.push('High Social Impact');
  if (feasibilityScore >= 80) badges.push('Verified Prototype Feasibility');
  if (goal <= 300000) badges.push('Lean Capital Efficiency');
  if (badges.length === 0) badges.push('Early Stage Concept');

  // Strengths
  const strengths: string[] = [];
  if (matchedTech.length > 0) {
    strengths.push(`Strong technological foundation in ${matchedTech.slice(0, 3).join(', ')}.`);
  }
  if (matchedImpact.length > 0) {
    strengths.push(`High target impact addressing critical needs in ${matchedImpact.slice(0, 3).join(', ')}.`);
  }
  strengths.push(`Structured capital requirements of ₹${goal.toLocaleString('en-IN')} aligned with milestone deliverables.`);

  // Recommendations
  const recommendations: string[] = [
    'Publish monthly open telemetry/field testing updates to keep backer trust high.',
    'Form local institutional partnerships to pilot test initial manufacturing batches.',
  ];

  // Milestones Tranche Plan
  const milestones = [
    { phase: 'Phase 1: Component Sourcing & Tooling', title: 'Hardware Architecture & Testing', capitalShare: '35% of Raised Capital' },
    { phase: 'Phase 2: Pilot Batch Assembly', title: 'Quality Assurance & Calibration', capitalShare: '40% of Raised Capital' },
    { phase: 'Phase 3: Field Deployment & Backer Delivery', title: 'User Verification & Logistics', capitalShare: '25% of Raised Capital' },
  ];

  const verdict =
    overallScore >= 80
      ? 'Exceptional Innovation: High market relevance, strong societal value proposition, and realistic capital allocation.'
      : 'Solid Initiative: Feasible roadmap with promising technology; recommended for community support and milestone monitoring.';

  return {
    overallScore,
    feasibilityScore,
    impactScore,
    marketViabilityScore,
    riskLevel,
    verdict,
    strengths,
    recommendations,
    badges,
    milestones,
  };
};
