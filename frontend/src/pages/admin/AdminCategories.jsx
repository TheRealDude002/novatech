import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi';
import { categoryApi } from '../../services/api';
import { Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', icon: '', order: 0, isActive: true };

/* ------------------------------------------------------------------ */
/*  Category card (mobile)                                            */
/* ------------------------------------------------------------------ */
function CategoryCard({ c, onEdit, onRemove }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-paper/5 p-4 first:border-t">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-paper">{c.name}</p>
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-2xs uppercase tracking-mono ${
              c.isActive ? 'text-emerald-400' : 'text-accent'
            }`}
          >
            {c.isActive ? 'Active' : 'Hidden'}
          </span>
        </div>
        {c.description && (
          <p className="mt-0.5 truncate text-sm text-paper/50">{c.description}</p>
        )}
        <p className="mt-1 font-mono text-2xs text-paper/40">
          /{c.slug} · order {c.order}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => onEdit(c)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-paper/15 text-paper/70 active:bg-paper/10"
          aria-label="Edit category"
        >
          <FiEdit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onRemove(c)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-paper/15 text-paper/70 active:bg-accent/10 active:text-accent"
          aria-label="Delete category"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category edit drawer                                              */
/* ------------------------------------------------------------------ */
function CategoryDrawer({ category, setCategory, onClose, onSave }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-ink text-paper"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-paper/10 bg-ink p-4 sm:p-5">
          <h2 className="font-display text-lg font-medium sm:text-xl">
            {category._id ? 'Edit category' : 'New category'}
          </h2>
          <button
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-paper/70 active:bg-paper/10"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4 p-4 sm:p-5">
          {/* Name */}
          <div>
            <label className="field-label text-paper/60">Name</label>
            <input
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={category.name}
              onChange={(e) => setCategory({ ...category, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="field-label text-paper/60">Description</label>
            <textarea
              rows={3}
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={category.description}
              onChange={(e) => setCategory({ ...category, description: e.target.value })}
            />
          </div>

          {/* Icon + Order — stack on mobile, row on sm+ */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label text-paper/60">Icon name</label>
              <input
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                placeholder="e.g. phone-case"
                value={category.icon}
                onChange={(e) => setCategory({ ...category, icon: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label text-paper/60">Order</label>
              <input
                type="number"
                inputMode="numeric"
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={category.order}
                onChange={(e) => setCategory({ ...category, order: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={category.isActive}
              onChange={(e) => setCategory({ ...category, isActive: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
            Active
          </label>

          {/* Submit */}
          <div className="flex gap-2 border-t border-paper/10 pt-4">
            <button type="submit" className="btn-accent flex-1">
              Save category
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost min-h-[44px] px-4 text-paper"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.categories || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    if (!editing.name) {
      toast.error('Name is required.');
      return;
    }
    try {
      if (editing._id) {
        await categoryApi.update(editing._id, editing);
        toast.success('Category updated.');
      } else {
        await categoryApi.create(editing);
        toast.success('Category created.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save category.');
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? Products in this category will be uncategorized.`))
      return;
    try {
      await categoryApi.remove(c._id);
      toast.success('Category deleted.');
      load();
    } catch {
      toast.error('Could not delete category.');
    }
  };

  if (loading) {
    return (
      <div className="grid h-96 place-items-center">
        <Spinner className="h-6 w-6 text-paper" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-paper/10 pb-5 sm:mb-8 sm:pb-6">
        <div>
          <p className="eyebrow text-paper/50">// Taxonomy</p>
          <h1 className="mt-2 font-display text-2xl font-medium tracking-tightest sm:text-3xl md:text-4xl">
            Categories
          </h1>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-accent">
          <FiPlus className="h-4 w-4" /> Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={FiTag}
          title="No categories yet."
          message="Add your first category to organize products."
        />
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="border border-paper/10 sm:hidden">
            {categories.map((c) => (
              <CategoryCard key={c._id} c={c} onEdit={setEditing} onRemove={remove} />
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto border border-paper/10 sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-soft/40 font-mono text-2xs uppercase tracking-mono text-paper/60">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper/5">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-ink-soft/30">
                    <td className="px-4 py-3">
                      <div className="text-paper">{c.name}</div>
                      <div className="font-mono text-2xs text-paper/50">{c.description}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-2xs text-paper/70">{c.slug}</td>
                    <td className="px-4 py-3 text-paper/70">{c.order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono text-2xs uppercase tracking-mono ${
                          c.isActive ? 'text-emerald-400' : 'text-accent'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setEditing(c)}
                          className="grid h-8 w-8 place-items-center text-paper/70 hover:text-paper"
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="grid h-8 w-8 place-items-center text-paper/70 hover:text-accent"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {editing && (
          <CategoryDrawer
            category={editing}
            setCategory={setEditing}
            onClose={() => setEditing(null)}
            onSave={save}
          />
        )}
      </AnimatePresence>
    </div>
  );
}