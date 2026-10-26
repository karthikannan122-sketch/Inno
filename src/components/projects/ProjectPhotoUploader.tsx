import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Check, 
  Trash2, 
  Sparkles, 
  Star, 
  X, 
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';

export interface ProjectPhotoUploaderProps {
  coverImageUrl: string;
  onCoverImageChange: (url: string) => void;
  galleryImages?: string[];
  onGalleryImagesChange?: (images: string[]) => void;
  category?: string;
  className?: string;
}

interface CuratedPreset {
  id: string;
  label: string;
  category: string;
  url: string;
}

const CURATED_PRESETS: CuratedPreset[] = [
  {
    id: 'ai-cyber',
    label: 'Neural & AI Core',
    category: 'Artificial Intelligence',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'saas-cloud',
    label: 'Modern SaaS IDE',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'edtech-study',
    label: 'Smart Education',
    category: 'Education',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'green-sustain',
    label: 'Clean Solar & Climate',
    category: 'Sustainability',
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'health-biotech',
    label: 'Biotech & Genomics',
    category: 'Healthcare',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'mobile-glass',
    label: 'Mobile App Interface',
    category: 'Productivity',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'fintech-chart',
    label: 'Fintech Terminal',
    category: 'Finance',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'minimal-3d',
    label: 'Minimalist 3D Studio',
    category: 'Design',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'work-team',
    label: 'Collaborative Squad',
    category: 'Community',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'agri-drone',
    label: 'AgriTech Sensors',
    category: 'Agriculture',
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'cyber-server',
    label: 'Secure Cloud Mesh',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80'
  },
  {
    id: 'creative-flow',
    label: 'Indie Innovation Desk',
    category: 'Innovation',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80'
  }
];

export const ProjectPhotoUploader: React.FC<ProjectPhotoUploaderProps> = ({
  coverImageUrl,
  onCoverImageChange,
  galleryImages = [],
  onGalleryImagesChange,
  category = 'Technology',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    setUrlError(null);
    if (!file.type.startsWith('image/')) {
      setUrlError('Please upload an image file (PNG, JPG, WebP, GIF, or SVG).');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUrlError('Image size exceeds 10MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onCoverImageChange(dataUrl);

        // Also add to gallery if not present
        if (onGalleryImagesChange) {
          const updated = [dataUrl, ...galleryImages.filter(img => img !== dataUrl)].slice(0, 8);
          onGalleryImagesChange(updated);
        }

        setUploadNotice(`✓ Photo "${file.name}" uploaded and set as cover photo!`);
        setTimeout(() => setUploadNotice(null), 4000);
      }
    };
    reader.onerror = () => {
      setUrlError('Failed to read image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyCustomUrl = () => {
    setUrlError(null);
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setUrlError('Please enter a valid image URL.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setUrlError('Image URL must start with https:// or http://');
      return;
    }

    onCoverImageChange(trimmed);
    if (onGalleryImagesChange) {
      const updated = [trimmed, ...galleryImages.filter(img => img !== trimmed)].slice(0, 8);
      onGalleryImagesChange(updated);
    }
    setCustomUrlInput('');
    setUploadNotice('✓ Cover photo updated from URL!');
    setTimeout(() => setUploadNotice(null), 3000);
  };

  const handleSelectPreset = (presetUrl: string) => {
    onCoverImageChange(presetUrl);
    if (onGalleryImagesChange) {
      const updated = [presetUrl, ...galleryImages.filter(img => img !== presetUrl)].slice(0, 8);
      onGalleryImagesChange(updated);
    }
    setUploadNotice('✓ Curated preset photo selected!');
    setTimeout(() => setUploadNotice(null), 3000);
  };

  const handleSetAsCover = (imgUrl: string) => {
    onCoverImageChange(imgUrl);
    setUploadNotice('✓ Cover image updated!');
    setTimeout(() => setUploadNotice(null), 2500);
  };

  const handleRemoveGalleryImage = (imgUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onGalleryImagesChange) return;
    const filtered = galleryImages.filter(img => img !== imgUrl);
    onGalleryImagesChange(filtered);

    // If removing the active cover, fallback to the next available or default
    if (coverImageUrl === imgUrl) {
      const nextCover = filtered[0] || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&auto=format&fit=crop&q=80';
      onCoverImageChange(nextCover);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-innovexa-border-subtle pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-innovexa-coral" />
            <span className="text-[11px] font-mono font-bold tracking-wider text-innovexa-ink uppercase">
              Project Photos & Visual Identity
            </span>
          </div>
          <p className="text-xs text-innovexa-ink-muted">
            Upload custom screenshots, choose curated covers, or paste direct URLs.
          </p>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-innovexa-bg-subtle text-innovexa-ink-muted border border-innovexa-border-subtle shrink-0">
          Recommended: 16:9 Landscape
        </span>
      </div>

      {uploadNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-medium flex items-center justify-between animate-in fade-in">
          <span>{uploadNotice}</span>
          <button type="button" onClick={() => setUploadNotice(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {urlError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{urlError}</span>
        </div>
      )}

      {/* Main Active Cover Preview Box */}
      <div className="relative rounded-2xl border border-innovexa-border overflow-hidden bg-innovexa-ink shadow-subtle group">
        <div className="h-44 sm:h-52 w-full overflow-hidden relative">
          <img
            src={coverImageUrl}
            alt="Project cover preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
              <Star className="w-3 h-3 fill-white" />
              Active Cover Photo
            </span>

            <span className="text-[10px] font-mono text-white/80 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
              Live in Explore & Detail Card
            </span>
          </div>

          {/* Bottom Hover Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-white drop-shadow-sm">
              <div className="text-[10px] font-mono text-white/70 uppercase">Visual Identity</div>
              <div className="text-xs font-sans font-semibold text-white truncate max-w-xs sm:max-w-md">
                Primary card artwork and page hero banner
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewModalImg(coverImageUrl)}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all border border-white/20"
                title="View Full Resolution"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-white/90 text-innovexa-ink font-mono text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-innovexa-coral" />
                <span>Replace Cover</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Source Tabs: Upload vs Curated Presets vs URL */}
      <div className="bg-innovexa-bg-subtle/50 p-1.5 rounded-2xl border border-innovexa-border-subtle flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-white text-innovexa-ink shadow-sm border border-innovexa-border'
              : 'text-innovexa-ink-muted hover:text-innovexa-ink'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-innovexa-coral" />
          <span>Upload From Device</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preset')}
          className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'preset'
              ? 'bg-white text-innovexa-ink shadow-sm border border-innovexa-border'
              : 'text-innovexa-ink-muted hover:text-innovexa-ink'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-innovexa-amber" />
          <span>Curated Presets (12)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'url'
              ? 'bg-white text-innovexa-ink shadow-sm border border-innovexa-border'
              : 'text-innovexa-ink-muted hover:text-innovexa-ink'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5 text-innovexa-purple" />
          <span>Paste Image URL</span>
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Tab 1: Drag & Drop File Upload */}
      {activeTab === 'upload' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-innovexa-coral bg-innovexa-coral/5 scale-[0.99]'
              : 'border-innovexa-border hover:border-innovexa-coral/50 bg-white hover:bg-innovexa-bg-subtle/30'
          }`}
        >
          <div className="max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-innovexa-coral/10 text-innovexa-coral mx-auto flex items-center justify-center shadow-subtle">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono font-bold text-innovexa-ink">
                Drag and drop your project screenshot or photo here
              </p>
              <p className="text-[11px] text-innovexa-ink-muted">
                or click to browse from your computer (PNG, JPG, WebP, SVG up to 10MB)
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-innovexa-bg border border-innovexa-border text-[11px] font-mono text-innovexa-ink font-semibold">
              <Camera className="w-3.5 h-3.5 text-innovexa-coral" />
              <span>Browse Photos...</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Curated High-Res Presets */}
      {activeTab === 'preset' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-semibold text-innovexa-ink-muted">
              Click any photo to instantly set as your cover:
            </span>
            <span className="font-mono text-[10px] text-innovexa-coral">
              High Resolution (Unsplash)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1 scrollbar-thin">
            {CURATED_PRESETS.map((preset) => {
              const isSelected = coverImageUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className={`group relative rounded-xl border text-left overflow-hidden transition-all h-24 ${
                    isSelected
                      ? 'border-innovexa-coral ring-2 ring-innovexa-coral/40 shadow-sm'
                      : 'border-innovexa-border hover:border-innovexa-ink-light'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold text-white truncate drop-shadow-sm">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-innovexa-coral text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Custom URL Input */}
      {activeTab === 'url' && (
        <div className="p-4 rounded-2xl bg-white border border-innovexa-border space-y-3 animate-in fade-in">
          <label className="text-[11px] font-mono font-semibold text-innovexa-ink uppercase block">
            Direct Photo URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-innovexa-ink-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or Figma / CDN link"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCustomUrl();
                  }
                }}
                className="w-full bg-innovexa-bg-subtle/50 focus:bg-white border border-innovexa-border focus:border-innovexa-purple rounded-xl pl-10 pr-4 py-2.5 text-xs text-innovexa-ink outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCustomUrl}
              className="px-5 py-2.5 rounded-xl bg-innovexa-ink hover:bg-black text-white text-xs font-mono font-bold transition-all shadow-subtle shrink-0"
            >
              Apply URL
            </button>
          </div>
        </div>
      )}

      {/* Gallery Strip: All Attached Photos */}
      {galleryImages.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-innovexa-border-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-bold text-innovexa-ink uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-innovexa-blue" />
              <span>Project Photo Gallery ({galleryImages.length})</span>
            </span>
            <span className="text-[10px] font-mono text-innovexa-ink-muted">
              Click thumbnail to set as cover
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
            {galleryImages.map((img, idx) => {
              const isCover = coverImageUrl === img;
              return (
                <div
                  key={idx}
                  onClick={() => handleSetAsCover(img)}
                  className={`group relative h-20 rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    isCover
                      ? 'border-emerald-500 ring-2 ring-emerald-400 shadow-sm'
                      : 'border-innovexa-border hover:border-innovexa-ink'
                  }`}
                  title={isCover ? 'Current Cover Photo' : 'Click to make this the cover photo'}
                >
                  <img
                    src={img}
                    alt={`Project attachment ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                  {isCover ? (
                    <div className="absolute top-1 left-1 bg-emerald-500 text-white rounded-md p-1 shadow">
                      <Star className="w-2.5 h-2.5 fill-white" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveGalleryImage(img, e)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md transition-all shadow"
                      title="Remove from gallery"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}

                  <div className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-mono text-white/90 truncate font-semibold">
                    {isCover ? 'COVER' : `Photo #${idx + 1}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full-resolution Image Lightbox Modal */}
      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-innovexa-border-subtle">
              <span className="font-mono text-xs font-bold text-innovexa-ink uppercase">
                Photo Full View
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="p-1.5 rounded-lg hover:bg-innovexa-bg text-innovexa-ink-muted hover:text-innovexa-ink text-sm font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <img
                src={previewModalImg}
                alt="Full resolution preview"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
