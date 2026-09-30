import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-cloud-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-ice-600 to-mint-500 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-cloud-900">FundSphere</span>
            </div>
            <p className="text-sm font-medium text-cloud-800/80 max-w-sm">
              Discover ideas. Support innovation. Make an impact.
            </p>
            <p className="text-xs text-cloud-800/60 max-w-md leading-relaxed">
              FundSphere connects visionary creators with passionate supporters across technology, health, education, agriculture, and social impact.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cloud-900">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-cloud-800/70">
              <li>
                <Link to="/discover" className="hover:text-ice-600 transition">
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link to="/campaigns/create" className="hover:text-ice-600 transition">
                  Start a Campaign
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-ice-600 transition">
                  Creator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cloud-900">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-xs text-cloud-800/70">
              <li className="flex items-center gap-1.5 text-mint-700">
                <Shield className="w-3.5 h-3.5" />
                <span>Automated Refunds on Unmet Goals</span>
              </li>
              <li className="flex items-center gap-1.5 text-ice-700">
                <Heart className="w-3.5 h-3.5" />
                <span>Zero Fake Data Guarantee</span>
              </li>
              <li>
                <span className="text-cloud-800/50">
                  Production-style ACID database transactions
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-cloud-100 flex flex-col sm:flex-row items-center justify-between text-xs text-cloud-800/60 gap-4">
          <p>© {new Date().getFullYear()} FundSphere. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-[11px] bg-ice-50 text-ice-700 px-2.5 py-0.5 rounded-full border border-ice-100">
              PostgreSQL + Prisma Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
