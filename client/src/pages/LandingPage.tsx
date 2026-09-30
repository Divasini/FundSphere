import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Users,
  Target,
  ArrowRight,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { reportsApi } from '../api/reports';
import { categoriesApi } from '../api/categories';
import { campaignsApi } from '../api/campaigns';
import { LandingMetrics, Category, Campaign, RecommendationResponse } from '../types';
import { CampaignCard } from '../components/CampaignCard';
import { CategoryCard } from '../components/CategoryCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<LandingMetrics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [metricsData, categoriesData, campaignsData] = await Promise.all([
          reportsApi.getLandingMetrics(),
          categoriesApi.getAll(),
          campaignsApi.getAll({ status: 'ACTIVE', sortBy: 'mostFunded' }),
        ]);

        setMetrics(metricsData);
        setCategories(categoriesData.slice(0, 6));
        setFeaturedCampaigns(campaignsData.slice(0, 3));

        if (user) {
          try {
            const recData = await campaignsApi.getRecommendations();
            setRecommendations(recData);
          } catch (e) {
            // recommendation optional
          }
        }
      } catch (error) {
        console.error('Failed to load landing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, [user]);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-ice-50/70 via-cloud-50 to-transparent border-b border-cloud-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ice-100/80 border border-ice-200 text-ice-700 text-xs font-bold tracking-wide animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" />
            Discover ideas. Support innovation. Make an impact.
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-cloud-900 tracking-tight leading-tight sm:leading-none">
            Fund Ideas That <span className="text-ice-600">Matter.</span>
          </h1>

          <p className="text-base sm:text-lg text-cloud-800/80 max-w-2xl mx-auto leading-relaxed">
            Discover innovative projects, support creators, and help turn meaningful ideas into reality across technology, healthcare, education, and green innovation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/discover"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-2xl shadow-soft hover:shadow-soft-lg transition"
            >
              <Compass className="w-4 h-4" />
              Explore Campaigns
            </Link>
            <Link
              to="/campaigns/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-cloud-900 bg-white hover:bg-cloud-50 border border-cloud-200 rounded-2xl shadow-soft transition"
            >
              <PlusCircle className="w-4 h-4 text-mint-600" />
              Start a Campaign
            </Link>
          </div>
        </div>

        {/* Real Dynamic Platform Statistics Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="p-6 sm:p-8 bg-white border border-cloud-200/90 rounded-3xl shadow-soft-lg">
            {isLoading ? (
              <LoadingState message="Fetching live platform stats..." className="py-4" />
            ) : metrics && metrics.hasData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-cloud-900">
                    ₹{metrics.totalFundsRaised.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs font-semibold text-cloud-800/70 uppercase tracking-wider">
                    Total Funds Raised
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-cloud-900">
                    {metrics.totalCampaigns}
                  </p>
                  <p className="text-xs font-semibold text-cloud-800/70 uppercase tracking-wider">
                    Active & Funded Campaigns
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-ice-600">
                    {metrics.successfulCampaigns}
                  </p>
                  <p className="text-xs font-semibold text-cloud-800/70 uppercase tracking-wider">
                    Successful Campaigns
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-mint-600">
                    {metrics.totalSupporters}
                  </p>
                  <p className="text-xs font-semibold text-cloud-800/70 uppercase tracking-wider">
                    Total Supporters
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-cloud-800/70 text-sm font-medium">
                No platform data available yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Personalized Recommendation Section (When available) */}
      {user && recommendations && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 bg-gradient-to-r from-ice-50 via-lavender-50/50 to-white border border-ice-200 rounded-3xl shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-ice-600" />
              <h3 className="text-lg font-bold text-cloud-900">Personalized For You</h3>
            </div>
            <p className="text-xs text-cloud-800/70 mb-6">{recommendations.message}</p>

            {recommendations.recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.recommendations.map((camp) => (
                  <CampaignCard key={camp.id} campaign={camp} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-cloud-800/60 font-medium">
                Explore campaigns to personalize your recommendations.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Dynamic Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold text-ice-600 uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-cloud-900">
              Explore by Interest
            </h2>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-xs font-bold text-ice-600 hover:text-ice-700"
          >
            View all categories <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingState message="Loading categories..." />
        ) : categories.length === 0 ? (
          <EmptyState title="No categories found" description="Categories will appear once created." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Campaigns Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-bold text-ice-600 uppercase tracking-wider">
              Spotlight Projects
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-cloud-900">
              Featured Campaigns
            </h2>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1 text-xs font-bold text-ice-600 hover:text-ice-700"
          >
            Explore all campaigns <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <LoadingState message="Loading featured campaigns..." />
        ) : featuredCampaigns.length === 0 ? (
          <EmptyState
            title="No campaigns available yet."
            description="Be the first innovator to launch a crowdfunding campaign on FundSphere!"
            actionLabel="Start a Campaign"
            actionHref="/campaigns/create"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCampaigns.map((camp) => (
              <CampaignCard key={camp.id} campaign={camp} />
            ))}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-cloud-200/90 rounded-3xl p-8 sm:p-10 shadow-soft grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ice-50 border border-ice-100 flex items-center justify-center text-ice-600 shrink-0 mx-auto md:mx-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-cloud-900">Automated Refunds</h4>
              <p className="text-xs text-cloud-800/70 leading-relaxed">
                If a campaign deadline passes without achieving its target goal, supporters automatically receive full refunds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-mint-50 border border-mint-100 flex items-center justify-center text-mint-600 shrink-0 mx-auto md:mx-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-cloud-900">Verified Approvals</h4>
              <p className="text-xs text-cloud-800/70 leading-relaxed">
                Every campaign is reviewed by administrators to ensure authentic, high-impact innovations before accepting funds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-lavender-50 border border-lavender-100 flex items-center justify-center text-lavender-600 shrink-0 mx-auto md:mx-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-cloud-900">Transparent Updates</h4>
              <p className="text-xs text-cloud-800/70 leading-relaxed">
                Creators post real milestones and updates directly to backers with transparent progress metrics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
