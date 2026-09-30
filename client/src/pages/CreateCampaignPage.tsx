import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  Sparkles,
  Save,
  Send,
} from 'lucide-react';
import { categoriesApi } from '../api/categories';
import { campaignsApi } from '../api/campaigns';
import { Category, InnovationAnalysis } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from '../components/LoadingState';
import { InnovationScoreCard } from '../components/InnovationScoreCard';

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields — CRITICAL: DO NOT INITIALIZE WITH ARBITRARY DEFAULT BUSINESS VALUES!
  // All fields initially empty strings
  const [title, setTitle] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [fundingGoal, setFundingGoal] = useState<string>(''); // NOT 100000! Empty!
  const [deadline, setDeadline] = useState<string>(''); // NOT 30 days! Empty!
  const [coverImage, setCoverImage] = useState<string>('');

  // Live AI Innovation Draft Analysis
  const [draftAnalysis, setDraftAnalysis] = useState<InnovationAnalysis | null>(null);
  const [isAnalyzingDraft, setIsAnalyzingDraft] = useState<boolean>(false);

  const runAIAnalysis = async () => {
    try {
      setIsAnalyzingDraft(true);
      const selectedCat = categories.find((c) => c.id === categoryId);
      const analysis = await campaignsApi.analyzeDraft({
        title,
        shortDescription,
        description,
        fundingGoal: parseFloat(fundingGoal) || 0,
        categoryName: selectedCat?.name,
      });
      setDraftAnalysis(analysis);
    } catch (e) {
      console.error('Failed to run AI draft analysis:', e);
    } finally {
      setIsAnalyzingDraft(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const validateStep1 = () => {
    if (!title.trim() || title.length < 3) {
      setError('Title must be at least 3 characters');
      return false;
    }
    if (!shortDescription.trim() || shortDescription.length < 10) {
      setError('Short description must be at least 10 characters');
      return false;
    }
    if (!description.trim() || description.length < 30) {
      setError('Full description must be at least 30 characters');
      return false;
    }
    if (!categoryId) {
      setError('Please select a category from the dropdown');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    const goalNum = parseFloat(fundingGoal);
    if (!fundingGoal || isNaN(goalNum) || goalNum <= 0) {
      setError('Please enter a valid funding goal greater than 0');
      return false;
    }
    if (!deadline) {
      setError('Please choose a valid campaign deadline');
      return false;
    }
    const deadlineDate = new Date(deadline);
    if (deadlineDate.getTime() <= Date.now()) {
      setError('Deadline must be a future date and time');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
      runAIAnalysis();
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitCampaign = async (isDraft: boolean) => {
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await campaignsApi.create({
        title,
        shortDescription,
        description,
        categoryId,
        fundingGoal: parseFloat(fundingGoal),
        deadline: new Date(deadline).toISOString(),
        coverImage: coverImage.trim() || undefined,
        isDraft,
      });

      navigate(`/campaigns/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-ice-600 uppercase tracking-wider">
          Creator Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-cloud-900">
          Launch a New Campaign
        </h1>
        <p className="text-sm text-cloud-800/70 max-w-lg mx-auto">
          Share your innovation with the world and raise funding from real supporters.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 p-2 bg-white border border-cloud-200 rounded-2xl shadow-soft">
        {[
          { num: 1, label: 'Basic Info', icon: FileText },
          { num: 2, label: 'Funding', icon: DollarSign },
          { num: 3, label: 'Media', icon: ImageIcon },
          { num: 4, label: 'Preview', icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isCompleted = step > s.num;

          return (
            <div
              key={s.num}
              className={`p-3 rounded-xl flex items-center gap-2 transition ${
                isActive
                  ? 'bg-ice-50 border border-ice-200 text-ice-700'
                  : isCompleted
                  ? 'text-mint-700'
                  : 'text-cloud-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  isActive
                    ? 'bg-ice-600 text-white'
                    : isCompleted
                    ? 'bg-mint-100 text-mint-700'
                    : 'bg-cloud-100 text-cloud-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-xs font-bold hidden sm:inline">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-softpink-50 border border-softpink-200 rounded-2xl flex items-center gap-3 text-xs text-softpink-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-softpink-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Forms Container */}
      <div className="p-8 bg-white border border-cloud-200 rounded-3xl shadow-soft">
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-cloud-900 border-b border-cloud-100 pb-3">
              Step 1: Project Overview
            </h3>

            <div>
              <label className="block text-xs font-bold text-cloud-900 mb-1">
                Campaign Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ultra-Low-Cost Portable ECG for Rural Clinics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
              />
              <p className="text-[11px] text-cloud-800/60 mt-1">
                Clear, concise title representing your product or initiative.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-cloud-900 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              {isLoadingCategories ? (
                <div className="text-xs text-cloud-800/60 py-2">Loading categories...</div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
                >
                  <option value="">-- Choose Category (Loaded Dynamically) --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-[11px] text-cloud-800/60 mt-1">
                Categories are loaded strictly from PostgreSQL. No hardcoded frontend presets.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-cloud-900 mb-1">
                Short Description (Elevator Pitch) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="One or two sentences explaining the core innovation and benefit..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-cloud-900 mb-1">
                Full Description & Story <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Detail the problem, your solution, current prototype status, and how funds will be spent..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Funding & Deadline */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-cloud-900 border-b border-cloud-100 pb-3">
              Step 2: Funding Targets
            </h3>

            <div>
              <label className="block text-xs font-bold text-cloud-900 mb-1">
                Funding Goal (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-cloud-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 200000 (No default preset)"
                  value={fundingGoal}
                  onChange={(e) => setFundingGoal(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-ice-500"
                />
              </div>
              <p className="text-[11px] text-cloud-800/60 mt-1">
                Target capital needed to complete the project milestone.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-cloud-900 mb-1">
                Campaign Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
              />
              <p className="text-[11px] text-cloud-800/60 mt-1">
                Must be a future date and time. Unmet goals trigger automated refunds after deadline.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Media */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-cloud-900 border-b border-cloud-100 pb-3">
              Step 3: Cover Visual
            </h3>

            <div>
              <label className="block text-xs font-bold text-cloud-900 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-ice-500"
              />
              <p className="text-[11px] text-cloud-800/60 mt-1">
                Provide a valid high-resolution image URL for your project card and banner.
              </p>
            </div>

            {coverImage && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-cloud-800">Media Preview:</span>
                <div className="aspect-video max-w-md rounded-2xl overflow-hidden border border-cloud-200 bg-cloud-100">
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Preview */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-base font-bold text-cloud-900 border-b border-cloud-100 pb-3">
              Step 4: Review Your Campaign Details
            </h3>

            <div className="p-6 bg-cloud-50/70 border border-cloud-200 rounded-2xl space-y-4 text-xs">
              <div>
                <span className="text-cloud-800/60 block font-semibold">Title</span>
                <h4 className="text-base font-bold text-cloud-900 mt-0.5">{title}</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-cloud-800/60 block font-semibold">Category</span>
                  <span className="font-bold text-ice-600">
                    {selectedCategoryObj?.name || 'Not selected'}
                  </span>
                </div>
                <div>
                  <span className="text-cloud-800/60 block font-semibold">Funding Target</span>
                  <span className="font-bold text-cloud-900 text-sm">
                    ₹{parseFloat(fundingGoal || '0').toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-cloud-800/60 block font-semibold">Deadline</span>
                  <span className="font-medium text-cloud-900">
                    {deadline ? new Date(deadline).toLocaleString() : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-cloud-800/60 block font-semibold">Creator</span>
                  <span className="font-medium text-cloud-900">{user?.name}</span>
                </div>
              </div>

              <div>
                <span className="text-cloud-800/60 block font-semibold">Elevator Pitch</span>
                <p className="text-cloud-800 mt-0.5">{shortDescription}</p>
              </div>

              <div>
                <span className="text-cloud-800/60 block font-semibold">Full Story</span>
                <p className="text-cloud-800/80 mt-0.5 line-clamp-3 whitespace-pre-line">
                  {description}
                </p>
              </div>
            </div>

            {/* AI Innovation & Feasibility Pre-Check Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ice-600 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> AI Innovation & Feasibility Audit Pre-Check
                </h4>
                <button
                  type="button"
                  onClick={runAIAnalysis}
                  disabled={isAnalyzingDraft}
                  className="text-xs font-semibold text-ice-600 hover:text-ice-700 underline disabled:opacity-50"
                >
                  {isAnalyzingDraft ? 'Analyzing...' : 'Re-run Analysis'}
                </button>
              </div>

              {isAnalyzingDraft ? (
                <div className="p-6 bg-ice-50/50 border border-ice-100 rounded-3xl text-center space-y-2">
                  <Sparkles className="w-6 h-6 text-ice-600 mx-auto animate-spin" />
                  <p className="text-xs text-cloud-800/80 font-medium">
                    Analyzing campaign pitch against innovation heuristics, patent feasibility, and budget tranches...
                  </p>
                </div>
              ) : draftAnalysis ? (
                <InnovationScoreCard analysis={draftAnalysis} />
              ) : (
                <div className="p-4 bg-cloud-50 border border-cloud-200 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-cloud-800/70">
                    Get an instant AI Innovation Index & Risk rating before submitting.
                  </span>
                  <button
                    type="button"
                    onClick={runAIAnalysis}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl"
                  >
                    Analyze Now
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-ice-50/70 border border-ice-200 rounded-2xl flex items-center gap-3 text-xs text-ice-800">
              <Sparkles className="w-5 h-5 text-ice-600 shrink-0" />
              <span>
                Submitting for review puts your campaign into <strong>PENDING_REVIEW</strong>. An administrator will review and activate it for public contributions.
              </span>
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between pt-8 border-t border-cloud-100 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-cloud-700 hover:bg-cloud-100 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl shadow-sm transition"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmitCampaign(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-cloud-800 bg-cloud-100 hover:bg-cloud-200 rounded-xl transition"
              >
                <Save className="w-4 h-4" /> Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSubmitCampaign(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-mint-600 hover:bg-mint-700 rounded-xl shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
