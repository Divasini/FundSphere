import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { Contribution } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { CreditCard, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        setIsLoading(true);
        const data = await adminApi.getContributions();
        setContributions(data);
      } catch (e) {
        console.error('Failed to load contributions:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContributions();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading contributions audit ledger..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cloud-900">Contributions Audit Ledger ({contributions.length})</h2>
        <p className="text-xs text-cloud-800/70 mt-0.5">
          All financial contributions, payment statuses, and generated transaction IDs.
        </p>
      </div>

      {contributions.length === 0 ? (
        <EmptyState title="No contributions recorded" description="No contribution transactions exist in database." />
      ) : (
        <div className="bg-white border border-cloud-200 rounded-3xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cloud-50/70 border-b border-cloud-200 text-cloud-800 font-bold">
                <tr>
                  <th className="p-4">Transaction Ref</th>
                  <th className="p-4">Contributor</th>
                  <th className="p-4">Campaign</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-cloud-50/50 transition">
                    <td className="p-4 font-mono font-bold text-cloud-900">
                      {c.transactionReference}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-cloud-900 block">{c.contributor?.name}</span>
                      <span className="text-[11px] text-cloud-800/60 block">{c.contributor?.email}</span>
                    </td>

                    <td className="p-4 font-semibold text-cloud-900 max-w-xs truncate">
                      <Link
                        to={`/campaigns/${c.campaign?.id}`}
                        target="_blank"
                        className="hover:text-ice-600 inline-flex items-center gap-1"
                      >
                        {c.campaign?.title}
                        <ExternalLink className="w-3 h-3 text-cloud-400" />
                      </Link>
                    </td>

                    <td className="p-4 font-extrabold text-cloud-900">
                      ₹{c.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                          c.paymentStatus === 'SUCCESS'
                            ? 'bg-mint-100 text-mint-700'
                            : c.paymentStatus === 'REFUNDED'
                            ? 'bg-softpink-100 text-softpink-700'
                            : 'bg-cloud-100 text-cloud-700'
                        }`}
                      >
                        {c.paymentStatus}
                      </span>
                    </td>

                    <td className="p-4 text-cloud-800/70">
                      {new Date(c.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
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
