import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiX,
  FiStar,
  FiUpload,
  FiBox,
} from 'react-icons/fi';
import { productApi, categoryApi, uploadApi, formatNaira } from '../../services/api';
import { Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = {
  title: '',
  shortDescription: '',
  description: '',
  category: '',
  brand: '',
  sku: '',
  price: 0,
  salePrice: '',
  stock: 0,
  warranty: '12 months',
  isFeatured: false,
  isActive: true,
  images: [],
  colors: [],
  specifications: [{ label: '', value: '' }],
  tags: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // product or EMPTY_PRODUCT
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    productApi
      .list({ limit: 48 })
      .then(({ data }) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    categoryApi.list().then(({ data }) => setCategories(data.categories || []));
  }, []);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => setEditing({ ...EMPTY_PRODUCT, category: categories[0]?._id || '' });
  const openEdit = (p) =>
    setEditing({
      ...p,
      salePrice: p.salePrice || '',
      specifications: p.specifications?.length ? p.specifications : [{ label: '', value: '' }],
      colors: p.colors || [],
      tags: p.tags || [],
    });

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.multiple(Array.from(files), 'products');
      setEditing((e) => ({ ...e, images: [...(e.images || []), ...data.files.map((f) => f.url)] }));
      toast.success(`${data.files.length} image(s) uploaded.`);
    } catch (err) {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editing.title || !editing.sku || !editing.category) {
      toast.error('Title, SKU and category are required.');
      return;
    }
    setSaving(true);
    const payload = {
      ...editing,
      price: Number(editing.price),
      salePrice: editing.salePrice ? Number(editing.salePrice) : null,
      stock: Number(editing.stock),
      specifications: editing.specifications.filter((s) => s.label && s.value),
      tags: Array.isArray(editing.tags) ? editing.tags : String(editing.tags).split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editing._id) {
        await productApi.update(editing._id, payload);
        toast.success('Product updated.');
      } else {
        await productApi.create(payload);
        toast.success('Product created.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await productApi.remove(p._id);
      toast.success('Product deleted.');
      load();
    } catch (err) {
      toast.error('Could not delete product.');
    }
  };

  const toggleFeatured = async (p) => {
    try {
      await productApi.update(p._id, { isFeatured: !p.isFeatured });
      toast.success(p.isFeatured ? 'Removed from featured.' : 'Marked as featured.');
      load();
    } catch {
      toast.error('Could not update.');
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
          <p className="eyebrow text-paper/50">// Catalog</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tightest sm:text-4xl">
            Products
          </h1>
        </div>
        <button onClick={openNew} className="btn-accent">
          <FiPlus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 border border-paper/15 bg-ink-soft/40 px-3">
        <FiSearch className="h-4 w-4 text-paper/50" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, SKU or brand…"
          className="flex-1 bg-transparent py-3 text-sm text-paper outline-none placeholder:text-paper/40"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FiBox}
          title="No products yet."
          message="Add your first product to start the catalog."
          action={<button onClick={openNew} className="btn-accent">Add product</button>}
        />
      ) : (
        <div className="overflow-x-auto border border-paper/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-soft/40 font-mono text-2xs uppercase tracking-mono text-paper/60">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/5">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-ink-soft/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="aspect-square w-10 shrink-0 overflow-hidden border border-paper/10 bg-ink">
                        <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="line-clamp-1 font-medium text-paper">{p.title}</p>
                        <p className="font-mono text-2xs text-paper/50">{p.brand} · {p.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-2xs text-paper/70">{p.sku}</td>
                  <td className="px-4 py-3">
                    <div>{formatNaira(p.salePrice || p.price)}</div>
                    {p.salePrice && p.salePrice > 0 && (
                      <div className="font-mono text-2xs text-paper/40 line-through">{formatNaira(p.price)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? 'text-accent' : 'text-paper'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFeatured(p)}
                      className={p.isFeatured ? 'text-accent' : 'text-paper/30 hover:text-paper/60'}
                      aria-label="Toggle featured"
                    >
                      <FiStar className={p.isFeatured ? 'h-4 w-4 fill-accent' : 'h-4 w-4'} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="grid h-8 w-8 place-items-center text-paper/70 hover:text-paper">
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(p)} className="grid h-8 w-8 place-items-center text-paper/70 hover:text-accent">
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

      <AnimatePresence>
        {editing && (
          <ProductDrawer
            product={editing}
            setProduct={setEditing}
            categories={categories}
            onClose={() => setEditing(null)}
            onSave={save}
            saving={saving}
            uploading={uploading}
            onUpload={handleUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductDrawer({ product, setProduct, categories, onClose, onSave, saving, uploading, onUpload }) {
  const isEdit = !!product._id;
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
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl overflow-y-auto bg-ink text-paper"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-paper/10 bg-ink p-5">
          <div>
            <p className="eyebrow text-paper/50">// {isEdit ? 'Edit' : 'New'} product</p>
            <h2 className="mt-1 font-display text-xl font-medium">{isEdit ? 'Edit product' : 'Add new product'}</h2>
          </div>
          <button onClick={onClose} aria-label="Close">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-5 p-5">
          <div>
            <label className="field-label text-paper/60">Title</label>
            <input
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper placeholder:text-paper/40"
              value={product.title}
              onChange={(e) => setProduct({ ...product, title: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label text-paper/60">SKU</label>
              <input
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper font-mono"
                value={product.sku}
                onChange={(e) => setProduct({ ...product, sku: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div>
              <label className="field-label text-paper/60">Brand</label>
              <input
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={product.brand}
                onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label text-paper/60">Category</label>
            <select
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={product.category?._id || product.category || ''}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="field-label text-paper/60">Price (₦)</label>
              <input
                type="number"
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="field-label text-paper/60">Sale price (₦)</label>
              <input
                type="number"
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={product.salePrice}
                onChange={(e) => setProduct({ ...product, salePrice: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label text-paper/60">Stock</label>
              <input
                type="number"
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={product.stock}
                onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label text-paper/60">Short description</label>
            <input
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={product.shortDescription}
              onChange={(e) => setProduct({ ...product, shortDescription: e.target.value })}
              maxLength={200}
            />
          </div>

          <div>
            <label className="field-label text-paper/60">Description</label>
            <textarea
              rows={4}
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label text-paper/60">Warranty</label>
            <input
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={product.warranty}
              onChange={(e) => setProduct({ ...product, warranty: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label text-paper/60">Tags (comma separated)</label>
            <input
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}
              onChange={(e) => setProduct({ ...product, tags: e.target.value })}
            />
          </div>

          {/* Images */}
          <div>
            <label className="field-label text-paper/60">Images</label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {(product.images || []).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden border border-paper/15">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setProduct({ ...product, images: product.images.filter((_, idx) => idx !== i) })}
                    className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-ink/80 text-paper hover:bg-accent"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="grid aspect-square cursor-pointer place-items-center border border-dashed border-paper/20 text-paper/50 hover:border-accent hover:text-accent">
                <FiUpload className="h-5 w-5" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>
            {uploading && <p className="mt-2 font-mono text-2xs uppercase tracking-mono text-paper/50">Uploading…</p>}
          </div>

          {/* Specifications */}
          <div>
            <div className="flex items-center justify-between">
              <label className="field-label text-paper/60">Specifications</label>
              <button
                type="button"
                onClick={() => setProduct({ ...product, specifications: [...product.specifications, { label: '', value: '' }] })}
                className="font-mono text-2xs uppercase tracking-mono text-accent hover:underline"
              >
                + Add row
              </button>
            </div>
            <div className="mt-1 space-y-2">
              {product.specifications.map((s, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <input
                    className="input-base bg-ink-soft border-paper/15 text-paper"
                    placeholder="Label"
                    value={s.label}
                    onChange={(e) => {
                      const sp = [...product.specifications];
                      sp[i] = { ...sp[i], label: e.target.value };
                      setProduct({ ...product, specifications: sp });
                    }}
                  />
                  <input
                    className="input-base bg-ink-soft border-paper/15 text-paper"
                    placeholder="Value"
                    value={s.value}
                    onChange={(e) => {
                      const sp = [...product.specifications];
                      sp[i] = { ...sp[i], value: e.target.value };
                      setProduct({ ...product, specifications: sp });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={product.isFeatured}
                onChange={(e) => setProduct({ ...product, isFeatured: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={product.isActive}
                onChange={(e) => setProduct({ ...product, isActive: e.target.checked })}
                className="h-4 w-4 accent-accent"
              />
              Active
            </label>
          </div>

          <div className="flex gap-2 border-t border-paper/10 pt-4">
            <button type="submit" disabled={saving} className="btn-accent flex-1">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost text-paper">Cancel</button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
