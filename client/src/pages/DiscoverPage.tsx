import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, Tag } from 'lucide-react';
import { campaignsApi } from '../api/campaigns';
import { categoriesApi } from '../api/categories';
import { Campaign, Category } from '../types';
import { CampaignCard } from '../components/CampaignCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || '');
  const [minGoal, setMinGoal] = useState<string>(searchParams.get('minGoal') || '');
  const [maxGoal, setMaxGoal] = useState<string>(searchParams.get('maxGoal') || '');
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'newest');

  // Data state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (e) {
        console.error('Failed to load categories:', e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch campaigns whenever query parameters change
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const params: Record<string, any> = {
          search: searchParams.get('search') || undefined,
          category: searchParams.get('category') || undefined,
          status: searchParams.get('status') || undefined,
          minGoal: searchParams.get('minGoal') || undefined,
          maxGoal: searchParams.get('maxGoal') || undefined,
          sortBy: searchParams.get('sortBy') || undefined,
        };

        const data = await campaignsApi.getAll(params);
        setCampaigns(data);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [searchParams]);

  const applyFilters = () => {
    const newParams: Record<string, string> = {};
    if (searchTerm) newParams.search = searchTerm;
    if (selectedCategory) newParams.category = selectedCategory;
    if (selectedStatus) newParams.status = selectedStatus;
    if (minGoal) newParams.minGoal = minGoal;
    if (maxGoal) newParams.maxGoal = maxGoal;
    if (sortBy && sortBy !== 'newest') newParams.sortBy = sortBy;

    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setMinGoal('');
    setMaxGoal('');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedCategory) ||
    Boolean(selectedStatus) ||
    Boolean(minGoal) ||
    Boolean(maxGoal) ||
    sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Header */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-ice-600 uppercase tracking-wider">
            Explore Opportunities
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-cloud-900">
            Discover Campaigns
          </h1>
          <p className="text-sm text-cloud-800/70 mt-1 max-w-xl">
            Browse and back breakthrough projects directly funded by real supporters.
          </p>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-cloud-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search campaigns by title, keywords or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-cloud-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-ice-500 shadow-soft"
            />
          </form>

          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition shadow-soft ${
              isFiltersOpen || hasActiveFilters
                ? 'bg-ice-50 border-ice-200 text-ice-700'
                : 'bg-white border-cloud-200 text-cloud-800 hover:bg-cloud-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters {hasActiveFilters && '(Active)'}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Category Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('');
            const params = new URLSearchParams(searchParams);
            params.delete('category');
            setSearchParams(params);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
            !selectedCategory
              ? 'bg-cloud-900 text-white shadow-sm'
              : 'bg-white text-cloud-800 border border-cloud-200 hover:bg-cloud-50'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.slug);
              const params = new URLSearchParams(searchParams);
              params.set('category', cat.slug);
              setSearchParams(params);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              selectedCategory === cat.slug
                ? 'bg-ice-600 text-white shadow-sm'
                : 'bg-white text-cloud-800 border border-cloud-200 hover:border-ice-300 hover:bg-ice-50/50'
            }`}
          >
            <Tag className="w-3 h-3" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Extended Filter Drawer */}
      {isFiltersOpen && (
        <div className="p-6 bg-white border border-cloud-200 rounded-3xl shadow-soft space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-cloud-100 pb-3">
            <h3 className="text-sm font-bold text-cloud-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-ice-600" />
              Detailed Campaign Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-softpink-600 hover:text-softpink-700 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reset all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Status Filter */}
            <div>
              <label className="block font-semibold text-cloud-800 mb-1.5">Funding Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 bg-cloud-50/80 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ice-500 font-medium"
              >
                <option value="">All Public Statuses</option>
                <option value="ACTIVE">Active (Accepting Funds)</option>
                <option value="FUNDED">Funded (Goal Met)</option>
                <option value="SUCCESSFUL">Successful</option>
                <option value="FAILED">Failed (Refunded)</option>
              </select>
            </div>

            {/* Min Goal */}
            <div>
              <label className="block font-semibold text-cloud-800 mb-1.5">Min Goal (₹)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={minGoal}
                onChange={(e) => setMinGoal(e.target.value)}
                className="w-full p-2.5 bg-cloud-50/80 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ice-500 font-medium"
              />
            </div>

            {/* Max Goal */}
            <div>
              <label className="block font-semibold text-cloud-800 mb-1.5">Max Goal (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500000"
                value={maxGoal}
                onChange={(e) => setMaxGoal(e.target.value)}
                className="w-full p-2.5 bg-cloud-50/80 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ice-500 font-medium"
              />
            </div>

            {/* Sorting */}
            <div>
              <label className="block font-semibold text-cloud-800 mb-1.5">Sort Results By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2.5 bg-cloud-50/80 border border-cloud-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ice-500 font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="endingSoon">Ending Soonest</option>
                <option value="mostFunded">Most Funded (₹)</option>
                <option value="goalAsc">Goal: Low to High</option>
                <option value="goalDesc">Goal: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-cloud-700 hover:bg-cloud-100 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={applyFilters}
              className="px-5 py-2 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl transition shadow-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Campaigns Grid */}
      {isLoading ? (
        <LoadingState message="Fetching campaigns from database..." className="py-20" />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No campaigns found' : 'No campaigns available yet.'}
          description={
            hasActiveFilters
              ? 'Try adjusting your search keywords, category, or funding filters.'
              : 'There are currently no campaigns published in this category.'
          }
          actionLabel={hasActiveFilters ? 'Clear all filters' : 'Start a Campaign'}
          onAction={hasActiveFilters ? clearFilters : undefined}
          actionHref={!hasActiveFilters ? '/campaigns/create' : undefined}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-cloud-800/70">
            <span>
              Showing <strong className="text-cloud-900">{campaigns.length}</strong>{' '}
              {campaigns.length === 1 ? 'campaign' : 'campaigns'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
