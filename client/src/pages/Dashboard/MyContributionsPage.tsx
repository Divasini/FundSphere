import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { contributionsApi } from '../../api/contributions';
import { refundsApi } from '../../api/refunds';
import { Contribution, Refund } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export const MyContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [contribData, refundData] = await Promise.all([
          contributionsApi.getMy(),
          refundsApi.getMy(),
        ]);
        setContributions(contribData);
        setRefunds(refundData);
      } catch (e) {
        console.error('Failed to load contributions history:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading your contribution history..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cloud-900">My Contributions</h2>
        <p className="text-xs text-cloud-800/70 mt-0.5">
          Complete ledger of your backed campaigns, payment references, and automated refund receipts.
        </p>
      </div>

      {contributions.length === 0 ? (
        <EmptyState
          title="You haven't contributed to any campaigns yet."
          description="Browse active projects to support innovative founders and causes you care about."
          actionLabel="Explore Campaigns"
          actionHref="/discover"
        />
      ) : (
        <div className="bg-white border border-cloud-200 rounded-3xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cloud-50/70 border-b border-cloud-200 text-cloud-800 font-bold">
                <tr>
                  <th className="p-4">Campaign</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-cloud-50/50 transition">
                    <td className="p-4 font-semibold text-cloud-900 max-w-xs">
                      <Link
                        to={`/campaigns/${c.campaign?.id}`}
                        className="hover:text-ice-600 line-clamp-1 flex items-center gap-1"
                      >
                        {c.campaign?.title}
                        <ExternalLink className="w-3 h-3 text-cloud-400 shrink-0" />
                      </Link>
                    </td>

                    <td className="p-4 font-extrabold text-cloud-900">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      {c.paymentStatus === 'SUCCESS' && (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-mint-100 text-mint-700">
                          SUCCESS
                        </span>
                      )}
                      {c.paymentStatus === 'REFUNDED' && (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-softpink-100 text-softpink-700 flex items-center gap-1 w-max">
                            <RefreshCw className="w-3 h-3" /> REFUNDED
                          </span>
                          {c.refund && (
                            <span className="text-[10px] text-softpink-700 block font-mono">
                              Ref: {c.refund.refundReference}
                            </span>
                          )}
                        </div>
                      )}
                      {c.paymentStatus === 'FAILED' && (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-100 text-red-700">
                          FAILED
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px] text-cloud-800">
                      {c.transactionReference}
                    </td>

                    <td className="p-4 text-cloud-800/70">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4">
                      <Link
                        to={`/campaigns/${c.campaign?.id}`}
                        className="text-xs font-semibold text-ice-600 hover:text-ice-700"
                      >
                        View
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
