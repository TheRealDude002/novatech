import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';
import { bannerApi, uploadApi } from '../../services/api';
import { Spinner, EmptyState } from '../../components/ui';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  mobileImage: '',
  ctaText: 'Shop now',
  ctaLink: '/shop',
  placement: 'hero',
  position: 1,
  isActive: true,
  bg: '#0B0F1A',
};

/* ------------------------------------------------------------------ */
/*  Banner card                                                        */
/* ------------------------------------------------------------------ */
function BannerCard({ b, onEdit, onRemove }) {
  return (
    <div className="border border-paper/10 bg-ink-soft/40">
      <div className="relative aspect-[16/7] overflow-hidden">
        <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
        <div className="absolute left-2 top-2">
          <span className="rounded bg-ink/80 px-2 py-1 font-mono text-2xs uppercase tracking-mono text-paper">
            {b.placement}
          </span>
        </div>
        {!b.isActive && (
          <div className="absolute right-2 top-2">
            <span className="rounded bg-accent px-2 py-1 font-mono text-2xs uppercase tracking-mono text-paper">
              Inactive
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-medium text-paper">{b.title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-paper/60">{b.subtitle}</p>
        <div className="mt-3 flex gap-1">
          <button
            onClick={() => onEdit(b)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-paper/15 text-paper/70 active:bg-paper/10"
            aria-label="Edit banner"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRemove(b)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-paper/15 text-paper/70 active:bg-accent/10 active:text-accent"
            aria-label="Delete banner"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Banner edit drawer                                                 */
/* ------------------------------------------------------------------ */
function BannerDrawer({ banner, setBanner, onClose, onSave, uploading, onUpload }) {
  const upload = async (files, field) => {
    if (!files?.length) return;
    onUpload(files, field);
  };

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
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-ink text-paper"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-paper/10 bg-ink p-4 sm:p-5">
          <h2 className="font-display text-lg font-medium sm:text-xl">
            {banner._id ? 'Edit banner' : 'New banner'}
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
          {/* Title */}
          <div>
            <label className="field-label text-paper/60">Title</label>
            <input
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={banner.title}
              onChange={(e) => setBanner({ ...banner, title: e.target.value })}
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="field-label text-paper/60">Subtitle</label>
            <input
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={banner.subtitle}
              onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="field-label text-paper/60">Description</label>
            <textarea
              rows={3}
              className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
              value={banner.description}
              onChange={(e) => setBanner({ ...banner, description: e.target.value })}
            />
          </div>

          {/* CTA text + link — stack on mobile, row on sm+ */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label text-paper/60">CTA text</label>
              <input
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={banner.ctaText}
                onChange={(e) => setBanner({ ...banner, ctaText: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label text-paper/60">CTA link</label>
              <input
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={banner.ctaLink}
                onChange={(e) => setBanner({ ...banner, ctaLink: e.target.value })}
              />
            </div>
          </div>

          {/* Placement / Position / Background — stack on mobile, 3-col on sm+ */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="field-label text-paper/60">Placement</label>
              <select
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={banner.placement}
                onChange={(e) => setBanner({ ...banner, placement: e.target.value })}
              >
                {['hero', 'midpage', 'sidebar', 'footer', 'promo'].map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label text-paper/60">Position</label>
              <input
                type="number"
                inputMode="numeric"
                className="input-base mt-1 bg-ink-soft border-paper/15 text-paper"
                value={banner.position}
                onChange={(e) =>
                  setBanner({ ...banner, position: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="field-label text-paper/60">Background</label>
              <input
                type="color"
                className="mt-1 h-11 w-full rounded border border-paper/15 bg-transparent"
                value={banner.bg}
                onChange={(e) => setBanner({ ...banner, bg: e.target.value })}
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className="field-label text-paper/60">Image</label>
            <div className="mt-1 flex items-center gap-3">
              {banner.image ? (
                <div className="h-20 w-32 shrink-0 overflow-hidden rounded border border-paper/15">
                  <img src={banner.image} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
              <label className="btn-outline border-paper/15 text-paper cursor-pointer">
                <FiUpload className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => upload(e.target.files, 'image')}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={banner.isActive}
              onChange={(e) => setBanner({ ...banner, isActive: e.target.checked })}
              className="h-4 w-4 accent-accent"
            />
            Active
          </label>

          {/* Submit */}
          <div className="flex gap-2 border-t border-paper/10 pt-4">
            <button type="submit" className="btn-accent flex-1">
              Save banner
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
export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    bannerApi
      .all()
      .then(({ data }) => setBanners(data.banners || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (files, field) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const { data } = await uploadApi.multiple(Array.from(files), 'banners');
      setEditing((e) => ({ ...e, [field]: data.files[0].url }));
      toast.success('Image uploaded.');
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editing.title || !editing.image) {
      toast.error('Title and image are required.');
      return;
    }
    try {
      if (editing._id) {
        await bannerApi.update(editing._id, editing);
        toast.success('Banner updated.');
      } else {
        await bannerApi.create(editing);
        toast.success('Banner created.');
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save banner.');
    }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    try {
      await bannerApi.remove(b._id);
      toast.success('Banner deleted.');
      load();
    } catch {
      toast.error('Could not delete banner.');
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
          <p className="eyebrow text-paper/50">// Visuals</p>
          <h1 className="mt-2 font-display text-2xl font-medium tracking-tightest sm:text-3xl md:text-4xl">
            Banners
          </h1>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-accent">
          <FiPlus className="h-4 w-4" /> Add banner
        </button>
      </div>

      {banners.length === 0 ? (
        <EmptyState
          icon={FiImage}
          title="No banners yet."
          message="Add a hero banner to feature on the home page."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {banners.map((b) => (
            <BannerCard
              key={b._id}
              b={b}
              onEdit={setEditing}
              onRemove={remove}
            />
          ))}
        </div>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {editing && (
          <BannerDrawer
            banner={editing}
            setBanner={setEditing}
            onClose={() => setEditing(null)}
            onSave={save}
            uploading={uploading}
            onUpload={handleUpload}
          />
        )}
      </AnimatePresence>
    </div>
  );
}