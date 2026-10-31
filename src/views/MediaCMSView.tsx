import React, { useState, useRef } from 'react';
import { 
  FolderPlus, 
  Upload, 
  Search, 
  Tag, 
  FileText, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink, 
  Image as ImageIcon, 
  LayoutGrid, 
  List, 
  Filter, 
  Sparkles, 
  Share2, 
  Paperclip,
  X,
  Code
} from 'lucide-react';
import { MediaAsset, MediaCategory, Task, GrowthGoal } from '../types';
import { sound } from '../utils/audio';

interface MediaCMSViewProps {
  assets: MediaAsset[];
  onUploadAsset: (asset: Omit<MediaAsset, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
  onUpdateAsset: (id: string, updates: Partial<MediaAsset>) => Promise<void>;
  tasks: Task[];
  goals: GrowthGoal[];
  onAttachToTask: (taskId: string, assetId: string) => void;
  onAttachToGoal: (goalId: string, assetId: string) => void;
}

export const MediaCMSView: React.FC<MediaCMSViewProps> = ({
  assets,
  onUploadAsset,
  onDeleteAsset,
  onUpdateAsset,
  tasks,
  goals,
  onAttachToTask,
  onAttachToGoal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Upload modal / drawer
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('Architecture Diagrams');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [uploadMimeType, setUploadMimeType] = useState('image/png');
  const [uploadSizeBytes, setUploadSizeBytes] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Asset detail modal
  const [inspectAsset, setInspectAsset] = useState<MediaAsset | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Attachment popup
  const [attachTargetAsset, setAttachTargetAsset] = useState<MediaAsset | null>(null);
  const [attachSuccessMsg, setAttachSuccessMsg] = useState<string | null>(null);

  const categories: (MediaCategory | 'All')[] = [
    'All',
    'Architecture Diagrams',
    'Research Figures',
    'Benchmarks',
    'Documentation',
    'General Assets',
  ];

  // Collect all unique tags
  const allTags = Array.from(
    new Set(assets.flatMap((a) => a.tags || []))
  ).filter(Boolean);

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    if (selectedCategory !== 'All' && asset.category !== selectedCategory) return false;
    if (selectedTag && !asset.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(q);
      const matchTag = asset.tags.some((t) => t.toLowerCase().includes(q));
      const matchNotes = asset.notes && asset.notes.toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchNotes) return false;
    }
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playClick();
    setUploadName(file.name.replace(/\.[^/.]+$/, ''));
    setUploadMimeType(file.type || 'application/octet-stream');
    setUploadSizeBytes(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim() || !uploadDataUrl) return;

    sound.playClick();
    setIsUploading(true);
    try {
      const tagList = uploadTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await onUploadAsset({
        name: uploadName.trim(),
        originalName: uploadName.trim(),
        category: uploadCategory,
        tags: tagList,
        mimeType: uploadMimeType,
        sizeBytes: uploadSizeBytes,
        dataUrl: uploadDataUrl,
        notes: uploadNotes.trim(),
      });

      sound.playCompletionChime();
      setIsUploadOpen(false);
      setUploadName('');
      setUploadTags('');
      setUploadNotes('');
      setUploadDataUrl(null);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8296FF]">
            <ImageIcon className="w-4 h-4" />
            <span>Content Management System</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight mt-1">
            Media & Asset Studio
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Organize architecture diagrams, benchmark charts, and research media for embedding across execution screens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setIsUploadOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs sm:text-sm font-semibold hover:bg-[#8296FF]/90 transition-all active:scale-[0.98] shadow-sm whitespace-nowrap"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Asset</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3">
        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#8296FF] text-[#0B1020] font-semibold shadow-xs'
                    : 'bg-[var(--card-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets or tags..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
              />
            </div>

            <div className="flex items-center p-0.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)]">
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('grid');
                }}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[var(--card-surface)] text-[#8296FF]' : 'text-[var(--text-secondary)]'}`}
                title="Grid layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('list');
                }}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[var(--card-surface)] text-[#8296FF]' : 'text-[var(--text-secondary)]'}`}
                title="List layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3" />
              <span>Tags:</span>
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2 py-0.5 rounded-full bg-[#F47783]/15 text-[#F47783] text-[11px] font-medium flex items-center gap-1"
              >
                <span>Clear ({selectedTag})</span>
                <X className="w-3 h-3" />
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  sound.playClick();
                  setSelectedTag(selectedTag === tag ? null : tag);
                }}
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono transition-colors ${
                  selectedTag === tag
                    ? 'bg-[#8296FF] text-[#0B1020] font-semibold'
                    : 'bg-[var(--inset-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Asset Grid / List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] shadow-xs transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Thumbnail Container */}
              <div 
                onClick={() => setInspectAsset(asset)}
                className="h-44 w-full bg-[var(--inset-surface)] relative cursor-pointer overflow-hidden flex items-center justify-center p-3 border-b border-[var(--border-subtle)]"
              >
                {asset.dataUrl.startsWith('data:image') || asset.dataUrl.startsWith('http') ? (
                  <img
                    src={asset.dataUrl}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[var(--text-secondary)]">
                    <FileText className="w-10 h-10 text-[#8296FF]" />
                    <span className="text-xs font-mono">{asset.mimeType}</span>
                  </div>
                )}

                {/* Category Pill Tag Overlay */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[var(--card-surface)]/90 backdrop-blur-sm border border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-secondary)]">
                  {asset.category}
                </div>
              </div>

              {/* Info Body */}
              <div className="p-4 space-y-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 
                    onClick={() => setInspectAsset(asset)}
                    className="text-sm font-semibold text-[var(--text-primary)] hover:text-[#8296FF] cursor-pointer truncate"
                  >
                    {asset.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--text-secondary)] tabular-nums shrink-0">
                    {formatFileSize(asset.sizeBytes)}
                  </span>
                </div>

                {asset.notes && (
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {asset.notes}
                  </p>
                )}

                {/* Tags */}
                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {asset.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--inset-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="px-4 py-2.5 bg-[var(--inset-surface)]/50 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const code = `![${asset.name}](${asset.dataUrl})`;
                      copyToClipboard(code, `md-${asset.id}`);
                    }}
                    className="px-2 py-1 rounded bg-[var(--card-surface)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] text-[11px] font-mono flex items-center gap-1"
                    title="Copy Markdown embed snippet"
                  >
                    {copyStatus === `md-${asset.id}` ? <Check className="w-3 h-3 text-[#35C99A]" /> : <Code className="w-3 h-3" />}
                    <span>MD</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setAttachTargetAsset(asset);
                    }}
                    className="px-2 py-1 rounded bg-[#8296FF]/15 hover:bg-[#8296FF]/25 text-[#8296FF] text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>Embed in Screen</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    if (window.confirm(`Delete media asset "${asset.name}"?`)) {
                      onDeleteAsset(asset.id);
                    }
                  }}
                  className="p-1 text-[var(--text-secondary)] hover:text-[#F47783] transition-colors"
                  title="Delete asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="rounded-2xl bg-[var(--card-surface)] border border-[var(--border-subtle)] overflow-hidden divide-y divide-[var(--border-subtle)]">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-[var(--inset-surface)]/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  onClick={() => setInspectAsset(asset)}
                  className="w-12 h-12 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden p-1"
                >
                  {asset.dataUrl.startsWith('data:image') || asset.dataUrl.startsWith('http') ? (
                    <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <FileText className="w-6 h-6 text-[#8296FF]" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4 
                    onClick={() => setInspectAsset(asset)}
                    className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:text-[#8296FF] cursor-pointer truncate"
                  >
                    {asset.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] flex-wrap">
                    <span className="text-[#8296FF] font-medium">{asset.category}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{formatFileSize(asset.sizeBytes)}</span>
                    {asset.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="font-mono">{asset.tags.map((t) => `#${t}`).join(' ')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const code = `![${asset.name}](${asset.dataUrl})`;
                    copyToClipboard(code, `md-list-${asset.id}`);
                  }}
                  className="px-2.5 py-1 text-xs rounded bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-mono"
                >
                  {copyStatus === `md-list-${asset.id}` ? 'Copied' : 'MD Code'}
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setAttachTargetAsset(asset);
                  }}
                  className="px-2.5 py-1 text-xs rounded bg-[#8296FF]/15 text-[#8296FF] font-medium flex items-center gap-1"
                >
                  <Paperclip className="w-3 h-3" />
                  <span className="hidden sm:inline">Embed</span>
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    if (window.confirm(`Delete ${asset.name}?`)) onDeleteAsset(asset.id);
                  }}
                  className="p-1 text-[var(--text-secondary)] hover:text-[#F47783]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAssets.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[var(--card-surface)]/40 border border-dashed border-[var(--border-medium)] space-y-3">
          <ImageIcon className="w-10 h-10 text-[var(--text-secondary)] mx-auto opacity-50" />
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
            No media assets found
          </h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Upload architecture diagrams, research charts, or performance graphs to organize and embed them into daily checkpoints.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-semibold"
          >
            Upload Media Asset
          </button>
        </div>
      )}

      {/* Upload Media Asset Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#8296FF]" />
                <span>Upload Media Asset to CMS</span>
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-medium)] hover:border-[#8296FF] rounded-xl p-5 text-center cursor-pointer transition-colors bg-[var(--inset-surface)]/60"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg,.pdf,.json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {uploadDataUrl ? (
                  <div className="space-y-2">
                    <img
                      src={uploadDataUrl}
                      alt="Preview"
                      className="max-h-36 mx-auto rounded-lg object-contain"
                    />
                    <span className="text-xs font-medium text-[#35C99A] block">
                      File loaded ({formatFileSize(uploadSizeBytes)}) - Click to change
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-4">
                    <Upload className="w-8 h-8 text-[#8296FF] mx-auto" />
                    <span className="text-xs font-semibold text-[var(--text-primary)] block">
                      Click to choose image or SVG diagram
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)]">
                      PNG, JPG, SVG, WebP up to 25MB
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="e.g. Memory Cache Locality Benchmark"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[#8296FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Category
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as MediaCategory)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  >
                    <option value="Architecture Diagrams">Architecture Diagrams</option>
                    <option value="Research Figures">Research Figures</option>
                    <option value="Benchmarks">Benchmarks</option>
                    <option value="Documentation">Documentation</option>
                    <option value="General Assets">General Assets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    placeholder="systems, cache, q4"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Technical Notes & Key Takeaways
                </label>
                <textarea
                  rows={2}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="Context, paper source, or benchmark configuration..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadDataUrl || isUploading}
                  className="px-4 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-semibold hover:bg-[#8296FF]/90 transition-all disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Save to Studio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Full Inspection Modal */}
      {inspectAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-3xl rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] truncate">
                  {inspectAsset.name}
                </h3>
                <span className="text-xs text-[var(--text-secondary)]">
                  {inspectAsset.category} · {formatFileSize(inspectAsset.sizeBytes)}
                </span>
              </div>
              <button
                onClick={() => setInspectAsset(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Large Preview */}
            <div className="w-full rounded-xl bg-[var(--inset-surface)] border border-[var(--border-subtle)] p-4 flex items-center justify-center overflow-hidden max-h-96">
              <img
                src={inspectAsset.dataUrl}
                alt={inspectAsset.name}
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>

            {inspectAsset.notes && (
              <div className="p-3 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)] block mb-0.5">Notes:</span>
                {inspectAsset.notes}
              </div>
            )}

            {/* Quick Embed Snippets */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                Screen Embed Code Generators
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-[10px] font-mono text-[#8296FF] block">Markdown Embed</span>
                    <span className="font-mono text-[11px] truncate block text-[var(--text-secondary)]">
                      ![{inspectAsset.name}](media://{inspectAsset.id})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const snippet = `![${inspectAsset.name}](${inspectAsset.dataUrl})`;
                      copyToClipboard(snippet, 'modal-md');
                    }}
                    className="px-2 py-1 rounded bg-[var(--card-surface)] text-[11px] font-medium border border-[var(--border-subtle)] shrink-0"
                  >
                    {copyStatus === 'modal-md' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--inset-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-[10px] font-mono text-[#35C99A] block">HTML Image Embed</span>
                    <span className="font-mono text-[11px] truncate block text-[var(--text-secondary)]">
                      &lt;img src="..." alt="{inspectAsset.name}" /&gt;
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const snippet = `<img src="${inspectAsset.dataUrl}" alt="${inspectAsset.name}" />`;
                      copyToClipboard(snippet, 'modal-html');
                    }}
                    className="px-2 py-1 rounded bg-[var(--card-surface)] text-[11px] font-medium border border-[var(--border-subtle)] shrink-0"
                  >
                    {copyStatus === 'modal-html' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Embed Directly to Task/Goal Button */}
            <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <button
                onClick={() => {
                  sound.playClick();
                  setAttachTargetAsset(inspectAsset);
                  setInspectAsset(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-semibold flex items-center gap-1.5"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Embed into Task or Growth Arc</span>
              </button>

              <button
                onClick={() => setInspectAsset(null)}
                className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Embed Target Picker Modal */}
      {attachTargetAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Embed Asset into Workspace Screen
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Binding "{attachTargetAsset.name}"
                </p>
              </div>
              <button
                onClick={() => setAttachTargetAsset(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {attachSuccessMsg && (
              <div className="p-3 rounded-xl bg-[#35C99A]/15 border border-[#35C99A]/30 text-xs text-[#35C99A] flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{attachSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {/* Daily Tasks targets */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                  Select Daily Checkpoint (Today's Board)
                </span>
                <div className="space-y-1">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        sound.playCompletionChime();
                        onAttachToTask(task.id, attachTargetAsset.id);
                        setAttachSuccessMsg(`Attached to checkpoint "${task.title}"!`);
                        setTimeout(() => setAttachTargetAsset(null), 1200);
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-[var(--inset-surface)] hover:bg-[#8296FF]/15 border border-[var(--border-subtle)] hover:border-[#8296FF]/40 flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-[var(--text-primary)] truncate max-w-[280px]">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-[#8296FF] shrink-0 font-medium ml-2">
                        {task.domain}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Growth Goals targets */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] block">
                  Select Quarterly Growth Arc (OKR)
                </span>
                <div className="space-y-1">
                  {goals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => {
                        sound.playCompletionChime();
                        onAttachToGoal(goal.id, attachTargetAsset.id);
                        setAttachSuccessMsg(`Attached to growth arc "${goal.title}"!`);
                        setTimeout(() => setAttachTargetAsset(null), 1200);
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-[var(--inset-surface)] hover:bg-[#A78BFA]/15 border border-[var(--border-subtle)] hover:border-[#A78BFA]/40 flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-[var(--text-primary)] truncate max-w-[280px]">
                        {goal.title}
                      </span>
                      <span className="text-[10px] text-[#A78BFA] shrink-0 font-medium ml-2">
                        {goal.quarter}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => setAttachTargetAsset(null)}
                className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
