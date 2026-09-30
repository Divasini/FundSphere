import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { Refund } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export const AdminRefundsPage: React.FC = () => {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        setIsLoading(true);
        const data = await adminApi.getRefunds();
        setRefunds(data);
      } catch (e) {
        console.error('Failed to load refunds:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRefunds();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading platform refund audit log..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cloud-900">Refunds Audit Log ({refunds.length})</h2>
        <p className="text-xs text-cloud-800/70 mt-0.5">
          All automated refunds processed for failed campaigns with idempotent tracking numbers.
        </p>
      </div>

      {refunds.length === 0 ? (
        <EmptyState title="No refunds recorded" description="No refund transactions have been initiated." />
      ) : (
        <div className="bg-white border border-cloud-200 rounded-3xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cloud-50/70 border-b border-cloud-200 text-cloud-800 font-bold">
                <tr>
                  <th className="p-4">Refund Ref</th>
                  <th className="p-4">Beneficiary</th>
                  <th className="p-4">Failed Campaign</th>
                  <th className="p-4">Amount Refunded</th>
                  <th className="p-4">Refund Status</th>
                  <th className="p-4">Processed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cloud-100">
                {refunds.map((r) => (
                  <tr key={r.id} className="hover:bg-cloud-50/50 transition">
                    <td className="p-4 font-mono font-bold text-softpink-700">
                      {r.refundReference}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-cloud-900 block">
                        {r.contribution?.contributor?.name}
                      </span>
                      <span className="text-[11px] text-cloud-800/60 block">
                        {r.contribution?.contributor?.email}
                      </span>
                    </td>

                    <td className="p-4 font-medium text-cloud-900 max-w-xs truncate">
                      {r.contribution?.campaign?.title}
                    </td>

                    <td className="p-4 font-extrabold text-cloud-900">
                      ₹{r.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-mint-100 text-mint-700 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {r.status}
                      </span>
                    </td>

                    <td className="p-4 text-cloud-800/70">
                      {new Date(r.processedAt).toLocaleString('en-IN', {
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
