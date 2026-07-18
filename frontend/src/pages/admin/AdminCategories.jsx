import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi';
import { categoryApi } from '../../services/api';
import { Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', icon: '', order: 0, isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    categoryApi.list().then(({ data }) => setCategories(data.categories || [])).finally(() => setLoading(false));
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
    if (!window.confirm(`Delete "${c.name}"? Products in this category will be uncategorized.`)) return;
    try {
      await categoryApi.remove(c._id);
      toast.success('Category deleted.');
      load();
    } catch {
      toast.error('Could not delete category.');
    }
  };

  if (loading)
    return (
      <div className="grid h-96 place-items-center">
        <Spinner className="h-6 w-6 text-paper" />
      </div>
    );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-paper/10 pb-6">
        <div>
          <p className="eyebrow text-paper/50">// Taxonomy</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tightest sm:text-4xl">Categories</h1>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-accent">
          <FiPlus className="h-4 w-4" /> Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={FiTag} title="No categories yet." message="Add your first category to organize products." />
      ) : (
        <div className="overflow-x-auto border border-paper/10">
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
                    <span className={`font-mono text-2xs uppercase tracking-mono ${
                      c.isActive ? 'text-emerald-400' : 'text-accent'
                    }`}>
                      {c.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(c)} className="grid h-8 w-8 place-items-center text-paper/70 hover:text-paper">
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c)} className="grid h-8 w-8 place-items-center text-paper/70 hover:text-accent">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-ink text-paper">
            <div className="sticky top-0 flex items-center justify-between border-b border-paper/10 bg-ink p-5">
              <h2 className="font-display text-xl font-medium">{editing._id ? 'Edit category' : 'New category'}</h2>
              <button onClick={() => setEditing(null)}><FiX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4 p-5">
              <div>
                <label className="field-label text-paper/60">Name</label>
                <input className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
              </div>
              <div>
                <label className="field-label text-paper/60">Description</label>
                <textarea rows={3} className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label text-paper/60">Icon name</label>
                  <input className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" placeholder="e.g. phone-case" value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
                </div>
                <div>
                  <label className="field-label text-paper/60">Order</label>
                  <input type="number" className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="h-4 w-4 accent-accent" />
                Active
              </label>
              <div className="flex gap-2 border-t border-paper/10 pt-4">
                <button type="submit" className="btn-accent flex-1">Save category</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost text-paper">Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
