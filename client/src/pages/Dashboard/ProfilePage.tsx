import React, { useState } from 'react';
import { User, Mail, Shield, Check, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await authApi.updateProfile({ name, bio, avatar });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-cloud-200 rounded-3xl p-8 shadow-soft space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cloud-900">Profile Settings</h2>
        <p className="text-xs text-cloud-800/70 mt-0.5">
          Update your public creator profile and bio.
        </p>
      </div>

      {success && (
        <div className="p-3.5 bg-mint-50 border border-mint-200 rounded-2xl flex items-center gap-2 text-xs text-mint-800">
          <Check className="w-4 h-4 text-mint-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-softpink-50 border border-softpink-200 rounded-2xl flex items-center gap-2 text-xs text-softpink-700">
          <AlertCircle className="w-4 h-4 text-softpink-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-cloud-900 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl font-medium focus:ring-2 focus:ring-ice-500"
          />
        </div>

        <div>
          <label className="block font-bold text-cloud-900 mb-1">Email (Cannot be modified)</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full p-3 bg-cloud-100 border border-cloud-200 rounded-xl text-cloud-600 cursor-not-allowed font-medium"
          />
        </div>

        <div>
          <label className="block font-bold text-cloud-900 mb-1">Avatar Image URL</label>
          <input
            type="url"
            value={avatar}
            placeholder="https://images.unsplash.com/..."
            onChange={(e) => setAvatar(e.target.value)}
            className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl font-medium focus:ring-2 focus:ring-ice-500"
          />
        </div>

        <div>
          <label className="block font-bold text-cloud-900 mb-1">Bio / Headline</label>
          <textarea
            rows={3}
            value={bio}
            placeholder="Tell backers about your background, expertise, or mission..."
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 bg-cloud-50/70 border border-cloud-200 rounded-xl font-medium focus:ring-2 focus:ring-ice-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 disabled:opacity-50 rounded-xl shadow-sm transition"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};
