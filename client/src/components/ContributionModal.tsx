import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react';
import { Campaign } from '../types';
import { contributionsApi } from '../api/contributions';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ContributionModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  // DO NOT prefill with a default amount! Must be initially empty string
  const [amount, setAmount] = useState<string>('');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickSelect = (value: number) => {
    // Quick buttons only fill the input, do not submit automatically!
    setAmount(value.toString());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid contribution amount greater than ₹0');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await contributionsApi.create({
        campaignId: campaign.id,
        amount: numAmount,
        simulateFailure,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment simulation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cloud-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-cloud-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-lg space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-ice-600 bg-ice-50 px-2.5 py-0.5 rounded-full border border-ice-100">
              Support Project
            </span>
            <h3 className="text-lg font-bold text-cloud-900 mt-1 line-clamp-1">
              {campaign.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-cloud-400 hover:text-cloud-600 p-1.5 rounded-xl hover:bg-cloud-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Campaign Financial Status */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-cloud-50/70 border border-cloud-200/80 rounded-2xl text-xs">
          <div>
            <span className="text-cloud-800/60 block">Current Raised</span>
            <span className="text-sm font-extrabold text-cloud-900">
              ₹{campaign.amountRaised.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-cloud-800/60 block">Funding Goal</span>
            <span className="text-sm font-extrabold text-cloud-900">
              ₹{campaign.fundingGoal.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-cloud-800/60 block">Campaign Status</span>
            <span className="text-xs font-bold text-mint-600 uppercase">
              {campaign.status}
            </span>
          </div>
          <div>
            <span className="text-cloud-800/60 block">Supporters</span>
            <span className="text-xs font-bold text-cloud-900">
              {campaign.supporterCount}
            </span>
          </div>
        </div>

        {!user ? (
          <div className="p-4 bg-ice-50 border border-ice-200 rounded-2xl text-center space-y-2">
            <p className="text-xs text-cloud-800 font-medium">
              You must be logged in to contribute to this campaign.
            </p>
            <Link
              to="/login"
              className="inline-block px-4 py-2 text-xs font-semibold text-white bg-ice-600 hover:bg-ice-700 rounded-xl transition"
            >
              Sign In to Continue
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-softpink-50 border border-softpink-200 rounded-xl flex items-center gap-2 text-xs text-softpink-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick shortcuts (do not default, merely click-to-populate) */}
            <div>
              <label className="block text-xs font-semibold text-cloud-800/80 mb-2">
                Quick Shortcuts (Click to enter amount)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 500, 1000, 2500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickSelect(val)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      amount === val.toString()
                        ? 'bg-ice-500 text-white border-ice-600'
                        : 'bg-white text-cloud-800 border-cloud-200 hover:border-ice-300 hover:bg-ice-50/50'
                    }`}
                  >
                    ₹{val}
                  </button>
                ))}
              </div>
            </div>

            {/* Explicit Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-cloud-900 mb-1">
                Enter Contribution Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-cloud-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 500 (No default prefilled)"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-white border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ice-500 font-semibold text-cloud-900"
                  required
                />
              </div>
              <p className="text-[11px] text-cloud-800/60 mt-1">
                Amount must be strictly positive and entered by you.
              </p>
            </div>

            {/* Simulated Payment Gateway Notice & Testing Toggle */}
            <div className="p-3.5 bg-ice-50/70 border border-ice-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-ice-800">
                <ShieldCheck className="w-4 h-4 text-ice-600" />
                <span>Simulated Escrow Payment (Hackathon Sandbox)</span>
              </div>
              <p className="text-[11px] text-cloud-800/70 leading-relaxed">
                Transactions generate real cryptographic database records and update campaign funding dynamically in an ACID transaction.
              </p>

              {/* Hackathon demo toggle to test payment gateway decline & rollback */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-ice-600 border-cloud-300 focus:ring-ice-500"
                />
                <span className="text-[11px] font-medium text-cloud-700">
                  Simulate Gateway Failure (Tests transaction rollback)
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-cloud-700 hover:bg-cloud-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !amount}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                {isSubmitting ? 'Processing Payment...' : 'Confirm Contribution'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
