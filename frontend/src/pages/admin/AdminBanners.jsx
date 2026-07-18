import { useEffect, useState } from 'react';
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

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    bannerApi.all().then(({ data }) => setBanners(data.banners || [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const upload = async (files, field) => {
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
          <p className="eyebrow text-paper/50">// Visuals</p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tightest sm:text-4xl">Banners</h1>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-accent">
          <FiPlus className="h-4 w-4" /> Add banner
        </button>
      </div>

      {banners.length === 0 ? (
        <EmptyState icon={FiImage} title="No banners yet." message="Add a hero banner to feature on the home page." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((b) => (
            <div key={b._id} className="border border-paper/10 bg-ink-soft/40">
              <div className="relative aspect-[16/7] overflow-hidden">
                <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2">
                  <span className="bg-ink/80 px-2 py-1 font-mono text-2xs uppercase tracking-mono text-paper">
                    {b.placement}
                  </span>
                </div>
                {!b.isActive && (
                  <div className="absolute right-2 top-2">
                    <span className="bg-accent px-2 py-1 font-mono text-2xs uppercase tracking-mono text-paper">Inactive</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base font-medium text-paper">{b.title}</h3>
                <p className="mt-1 line-clamp-1 text-sm text-paper/60">{b.subtitle}</p>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => setEditing(b)} className="grid h-8 w-8 place-items-center border border-paper/15 text-paper/70 hover:text-paper">
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(b)} className="grid h-8 w-8 place-items-center border border-paper/15 text-paper/70 hover:text-accent">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-ink text-paper">
            <div className="sticky top-0 flex items-center justify-between border-b border-paper/10 bg-ink p-5">
              <h2 className="font-display text-xl font-medium">{editing._id ? 'Edit banner' : 'New banner'}</h2>
              <button onClick={() => setEditing(null)}><FiX className="h-5 w-5" /></button>
            </div>
            <form onSubmit={save} className="space-y-4 p-5">
              <div>
                <label className="field-label text-paper/60">Title</label>
                <input className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
              </div>
              <div>
                <label className="field-label text-paper/60">Subtitle</label>
                <input className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="field-label text-paper/60">Description</label>
                <textarea rows={3} className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label text-paper/60">CTA text</label>
                  <input className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.ctaText} onChange={(e) => setEditing({ ...editing, ctaText: e.target.value })} />
                </div>
                <div>
                  <label className="field-label text-paper/60">CTA link</label>
                  <input className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.ctaLink} onChange={(e) => setEditing({ ...editing, ctaLink: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="field-label text-paper/60">Placement</label>
                  <select className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.placement} onChange={(e) => setEditing({ ...editing, placement: e.target.value })}>
                    {['hero', 'midpage', 'sidebar', 'footer', 'promo'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label text-paper/60">Position</label>
                  <input type="number" className="input-base mt-1 bg-ink-soft border-paper/15 text-paper" value={editing.position} onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="field-label text-paper/60">Background</label>
                  <input type="color" className="mt-1 h-11 w-full bg-transparent border border-paper/15" value={editing.bg} onChange={(e) => setEditing({ ...editing, bg: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="field-label text-paper/60">Image</label>
                <div className="mt-1 flex items-center gap-3">
                  {editing.image ? (
                    <div className="h-20 w-32 overflow-hidden border border-paper/15">
                      <img src={editing.image} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <label className="btn-outline border-paper/15 text-paper cursor-pointer">
                    <FiUpload className="h-4 w-4" />
                    {uploading ? 'Uploading…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files, 'image')} disabled={uploading} />
                  </label>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="h-4 w-4 accent-accent" />
                Active
              </label>
              <div className="flex gap-2 border-t border-paper/10 pt-4">
                <button type="submit" className="btn-accent flex-1">Save banner</button>
                <button type="button" onClick={() => setEditing(null)} className="btn-ghost text-paper">Cancel</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
