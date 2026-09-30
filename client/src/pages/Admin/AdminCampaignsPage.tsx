import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { campaignsApi } from '../../api/campaigns';
import { Campaign } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { ExternalLink, Tag } from 'lucide-react';

export const AdminCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const data = await campaignsApi.getAll(filterStatus ? { status: filterStatus } : {});
      setCampaigns(data);
    } catch (e) {
      console.error('Failed to load campaigns:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [filterStatus]);

  if (isLoading) {
    return <LoadingState message="Loading platform campaigns..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cloud-900">All Campaigns ({campaigns.length})</h2>
          <p className="text-xs text-cloud-800/70 mt-0.5">
            Complete database catalog of all project proposals and active initiatives.
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 bg-white border border-cloud-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-ice-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PENDING_REVIEW">PENDING_REVIEW</option>
          <option value="FUNDED">FUNDED</option>
          <option value="SUCCESSFUL">SUCCESSFUL</option>
          <option value="FAILED">FAILED</option>
          <option value="DRAFT">DRAFT</option>
          <option value="REJECTED">REJECTED</option>
        </select>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState title="No campaigns found" description="No records match the selected status." />
      ) : (
        <div className="bg-white border border-cloud-200 rounded-3xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cloud-50/70 border-b border-cloud-200 text-cloud-800 font-bold">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Goal</th>
                  <th className="p-4">Raised</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-cloud-50/50 transition">
                    <td className="p-4 font-bold text-cloud-900 max-w-xs truncate">
                      {camp.title}
                    </td>
                    <td className="p-4 text-cloud-800 font-medium">
                      {camp.creator?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-ice-600 font-semibold">
                      {camp.category?.name || 'N/A'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          camp.status === 'ACTIVE'
                            ? 'bg-mint-100 text-mint-700'
                            : camp.status === 'FUNDED'
                            ? 'bg-ice-100 text-ice-700'
                            : camp.status === 'SUCCESSFUL'
                            ? 'bg-lavender-100 text-lavender-700'
                            : camp.status === 'PENDING_REVIEW'
                            ? 'bg-peach-100 text-peach-700'
                            : camp.status === 'FAILED'
                            ? 'bg-softpink-100 text-softpink-700'
                            : 'bg-cloud-100 text-cloud-700'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-cloud-900">
                      ₹{camp.fundingGoal.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-bold text-ice-600">
                      ₹{camp.amountRaised.toLocaleString('en-IN')} ({camp.fundingPercentage}%)
                    </td>
                    <td className="p-4">
                      <Link
                        to={`/campaigns/${camp.id}`}
                        target="_blank"
                        className="text-xs font-semibold text-ice-600 hover:text-ice-700 inline-flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
