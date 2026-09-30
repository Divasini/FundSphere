import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../../api/categories';
import { Category } from '../../types';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<string>('Cpu');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesApi.getAll(true); // fetch all including inactive
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Cpu');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Cpu');
    setIsActive(cat.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }

    try {
      setIsSaving(true);
      setFormError(null);

      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
          isActive,
        });
      } else {
        await categoriesApi.create({
          name: name.trim(),
          description: description.trim() || undefined,
          icon,
        });
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (e: any) {
      setFormError(e.message || 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      setIsDeleting(true);
      await categoriesApi.delete(deletingCategory.id);
      setDeletingCategory(null);
      fetchCategories();
    } catch (e: any) {
      alert(e.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading categories..." className="py-24" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-cloud-900">Category Taxonomy ({categories.length})</h2>
          <p className="text-xs text-cloud-800/70 mt-0.5">
            Manage funding verticals stored directly in PostgreSQL and served to the discovery filters.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white border border-cloud-200 rounded-3xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cloud-50/70 border-b border-cloud-200 text-cloud-800 font-bold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Icon Key</th>
                <th className="p-4">Active Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cloud-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-cloud-50/50 transition">
                  <td className="p-4 font-bold text-cloud-900 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-ice-500" />
                    {cat.name}
                  </td>
                  <td className="p-4 font-mono text-cloud-600">{cat.slug}</td>
                  <td className="p-4 text-cloud-800/80 max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-cloud-700">{cat.icon || '—'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        cat.isActive
                          ? 'bg-mint-100 text-mint-700'
                          : 'bg-cloud-200 text-cloud-700'
                      }`}
                    >
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-cloud-500 hover:text-ice-600 hover:bg-ice-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="p-1.5 text-cloud-500 hover:text-softpink-600 hover:bg-softpink-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cloud-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-cloud-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-soft-lg space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-cloud-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-cloud-400 hover:text-cloud-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-softpink-50 border border-softpink-200 rounded-xl text-xs text-softpink-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-cloud-900 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-cloud-50 border border-cloud-200 rounded-xl font-medium focus:ring-2 focus:ring-ice-500"
                />
              </div>

              <div>
                <label className="block font-bold text-cloud-900 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short explanation of this funding vertical..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-cloud-50 border border-cloud-200 rounded-xl font-medium focus:ring-2 focus:ring-ice-500"
                />
              </div>

              <div>
                <label className="block font-bold text-cloud-900 mb-1">Lucide Icon Key</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full p-2.5 bg-cloud-50 border border-cloud-200 rounded-xl font-medium focus:ring-2 focus:ring-ice-500"
                >
                  <option value="Cpu">Cpu (Technology / Hardware)</option>
                  <option value="Activity">Activity (Health / Medical)</option>
                  <option value="Sprout">Sprout (Agriculture / Food)</option>
                  <option value="GraduationCap">GraduationCap (Education)</option>
                  <option value="Leaf">Leaf (Clean Energy / Planet)</option>
                  <option value="HeartHandshake">HeartHandshake (Social Impact)</option>
                  <option value="Palette">Palette (Creative Arts / Design)</option>
                  <option value="Briefcase">Briefcase (Commerce / Enterprise)</option>
                </select>
              </div>

              {editingCategory && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-ice-600"
                  />
                  <span className="font-semibold text-cloud-800">
                    Category is Active (Visible to creators & backers)
                  </span>
                </label>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-cloud-700 hover:bg-cloud-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-ice-600 hover:bg-ice-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Campaigns linked to this category may prevent deletion if active.`}
        confirmLabel="Delete Category"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategory(null)}
      />
    </div>
  );
};
