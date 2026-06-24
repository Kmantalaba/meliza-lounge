'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, ArrowRight, Plus, Upload, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useScrollReveal } from '@/lib/useScrollReveal';
import type { GalleryImage } from '@/types';

/* ── Static gallery items (hardcoded placeholders) ───────────────────── */
const STATIC_ITEMS = [
  { id: 's1', title: 'Floral Gel Art',   category: 'Nail Art',   gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FF69B4 50%, #E91E8C 100%)',  size: 'tall'   as const },
  { id: 's2', title: 'Ombre French',     category: 'Manicure',   gradient: 'linear-gradient(135deg, #FFF0F7 0%, #F9A8D4 50%, #DB2777 100%)',   size: 'normal' as const },
  { id: 's3', title: 'Minimalist Art',   category: 'Nail Art',   gradient: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 50%, #EC4899 100%)',   size: 'normal' as const },
  { id: 's4', title: 'Gel Extensions',   category: 'Extensions', gradient: 'linear-gradient(135deg, #FDE8F3 0%, #F472B6 50%, #BE185D 100%)',   size: 'normal' as const },
  { id: 's5', title: 'Glitter Ombre',    category: 'Nail Art',   gradient: 'linear-gradient(135deg, #FFF5F9 0%, #FBB6CE 50%, #F9A8D4 100%)',   size: 'tall'   as const },
  { id: 's6', title: 'Classic French',   category: 'Manicure',   gradient: 'linear-gradient(135deg, #FECDD3 0%, #FDA4BA 50%, #FB7185 100%)',   size: 'normal' as const },
  { id: 's7', title: 'Acrylic Sculpt',   category: 'Extensions', gradient: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 50%, #FDA4BA 100%)',   size: 'normal' as const },
  { id: 's8', title: 'Botanical Art',    category: 'Nail Art',   gradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FECDD3 100%)',   size: 'normal' as const },
  { id: 's9', title: 'Chrome Powder',    category: 'Nail Art',   gradient: 'linear-gradient(135deg, #F5F3FF 0%, #DDD6FE 50%, #A78BFA 100%)',   size: 'normal' as const },
];

const EMOJI_MAP: Record<string, string> = { 'Nail Art': '🎨', Manicure: '💅', Extensions: '💎' };
const FILTERS = ['All', 'Manicure', 'Nail Art', 'Extensions'];
const CATEGORIES: GalleryImage['category'][] = ['Nail Art', 'Manicure', 'Extensions'];

/* ── Upload modal ────────────────────────────────────────────────────── */
function UploadModal({ onClose, onUpload }: {
  onClose: () => void;
  onUpload: (file: File, title: string, category: GalleryImage['category']) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GalleryImage['category']>('Nail Art');
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (f.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); return; }
    setError('');
    setFile(f);
    // Revoke previous preview URL to avoid memory leak
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(f);
    setPreview(url);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { setError('Please select an image.'); return; }
    if (!title.trim()) { setError('Please enter a title.'); return; }
    setUploading(true);
    setError('');
    try {
      await onUpload(file, title.trim(), category);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F7] flex items-center justify-center">
              <Upload size={16} className="text-[#E91E8C]" />
            </div>
            <h3 className="text-base font-bold text-[#1a1a2e]" style={{ fontFamily: 'var(--font-playfair)' }}>
              Add Nail Design
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-[#9CA3AF]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop zone / preview */}
          <div
            className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden ${
              preview ? 'border-[#E91E8C]/30' : 'border-pink-200 hover:border-[#E91E8C] hover:bg-[#FFF9FC]'
            }`}
            style={{ height: '180px' }}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {preview ? (
              <>
                <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full">
                    Click to change
                  </span>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#FFF0F7] flex items-center justify-center">
                  <Plus size={24} className="text-[#E91E8C]" />
                </div>
                <p className="text-sm text-[#9CA3AF]">Click or drag &amp; drop an image</p>
                <p className="text-xs text-pink-200">PNG, JPG, WEBP — max 10 MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1.5">Design Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rose Gold Chrome"
              className="w-full border border-pink-100 rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] focus:outline-none focus:border-[#E91E8C] focus:ring-1 focus:ring-[#E91E8C]/20 placeholder:text-[#C4B5BA]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#525252] mb-1.5">Category</label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    category === cat
                      ? 'bg-[#E91E8C] text-white border-[#E91E8C] shadow-sm shadow-pink-200'
                      : 'bg-white text-[#525252] border-pink-100 hover:border-[#E91E8C]/40 hover:text-[#E91E8C]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl border border-pink-100 text-sm text-[#525252] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!preview || !title.trim() || uploading}
            className="flex-1 py-2.5 rounded-xl bg-[#E91E8C] hover:bg-[#C2177A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-md shadow-pink-200 flex items-center justify-center gap-2"
          >
            {uploading ? <><Loader2 size={15} className="animate-spin" /> Uploading…</> : 'Add to Gallery'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Gallery ─────────────────────────────────────────────────────────── */
type LightboxItem = { title: string; category: string; gradient?: string; src?: string };

export default function Gallery() {
  const { openBookingModal, isAdmin, galleryImages, addGalleryImage, removeGalleryImage } = useApp();
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<LightboxItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const { ref: gridRef,   visible: gridVisible   } = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  // Admin-uploaded images shown first, then static
  const allItems = [
    ...galleryImages.map((img) => ({ ...img, isUpload: true  as const, gradient: undefined })),
    ...STATIC_ITEMS.map((item) => ({ ...item, isUpload: false as const, src: undefined })),
  ];

  const filtered = filter === 'All'
    ? allItems
    : allItems.filter((g) => g.category === filter);

  return (
    <section id="gallery" className="section-padding bg-pink-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          ref={headerRef}
          className={`reveal ${headerVisible ? 'in-view' : ''} text-center mb-10`}
        >
          <span className="inline-block text-[#E91E8C] text-sm font-semibold tracking-widest uppercase mb-3">
            Portfolio
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-[#1a1a2e]"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            My Nail Designs
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-lg mx-auto text-base leading-relaxed">
            Every set is a unique creation. Browse through my work for inspiration and
            book your own custom design.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-[#E91E8C] text-white shadow-md shadow-pink-200'
                  : 'bg-white text-[#525252] hover:bg-[#FFF0F7] hover:text-[#E91E8C] border border-pink-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className={`reveal ${gridVisible ? 'in-view' : ''} columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4`}
        >
          {/* Admin: "Add Design" card always visible regardless of filter */}
          {isAdmin && (
            <div className="break-inside-avoid">
              <button
                onClick={() => setShowUpload(true)}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-[#E91E8C]/40 hover:border-[#E91E8C] bg-white/60 hover:bg-[#FFF0F7] flex flex-col items-center justify-center gap-2 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#FFF0F7] group-hover:bg-[#E91E8C] flex items-center justify-center transition-colors duration-300">
                  <Plus size={20} className="text-[#E91E8C] group-hover:text-white transition-colors duration-300" />
                </div>
                <span className="text-xs font-semibold text-[#E91E8C]">Add Design</span>
              </button>
            </div>
          )}

          {filtered.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid group cursor-pointer relative"
              onClick={() => setLightbox({
                title: item.title,
                category: item.category,
                gradient: item.gradient,
                src: item.src,
              })}
            >
              <div
                className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
                  item.size === 'tall' ? 'h-72' : 'h-48'
                }`}
                style={item.gradient ? { background: item.gradient } : undefined}
              >
                {/* Real image (admin upload) */}
                {item.src && (
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}

                {/* Gradient placeholder with fake nails (static items) */}
                {!item.src && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-2 p-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="rounded-t-full rounded-b-lg opacity-60"
                          style={{
                            width: '16px',
                            height: `${24 + i * 2}px`,
                            background: 'rgba(255,255,255,0.6)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-between p-4 opacity-0 group-hover:opacity-100">
                  <div>
                    <p className="text-white text-sm font-bold">{item.title}</p>
                    <p className="text-white/70 text-xs">{item.category}</p>
                  </div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <ArrowRight size={14} className="text-white" />
                  </div>
                </div>

                {/* Category badge */}
                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#E91E8C]">
                  {item.category}
                </div>

                {/* Admin: delete button on uploaded images */}
                {isAdmin && item.isUpload && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeGalleryImage(item.id); }}
                    className="absolute top-3 right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md z-10"
                    title="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View more CTA */}
        <div className="text-center mt-10">
          <button
            onClick={openBookingModal}
            className="inline-flex items-center gap-2 text-[#E91E8C] border-2 border-[#E91E8C] hover:bg-[#E91E8C] hover:text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 text-sm"
          >
            Book a Custom Design
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-sm w-full rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full h-80 flex items-center justify-center relative"
              style={lightbox.gradient ? { background: lightbox.gradient } : { background: '#FFF0F7' }}
            >
              {lightbox.src ? (
                <Image src={lightbox.src} alt={lightbox.title} fill className="object-cover" unoptimized />
              ) : (
                <span className="text-7xl drop-shadow-xl">{EMOJI_MAP[lightbox.category]}</span>
              )}
            </div>
            <div className="bg-white p-6">
              <h3 className="text-xl font-bold text-[#1a1a2e] mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>
                {lightbox.title}
              </h3>
              <p className="text-[#9CA3AF] text-sm mb-4">{lightbox.category}</p>
              <button
                onClick={() => { setLightbox(null); openBookingModal(); }}
                className="w-full bg-[#E91E8C] hover:bg-[#C2177A] text-white font-semibold py-2.5 rounded-full text-sm transition-colors shadow-md shadow-pink-200"
              >
                Book This Style
              </button>
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <X size={16} className="text-[#525252]" />
            </button>
          </div>
        </div>
      )}

      {/* Admin upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={addGalleryImage}
        />
      )}
    </section>
  );
}
