import React from 'react';
import { X, Paperclip, Check, FileText } from 'lucide-react';
import { MediaAsset } from '../types';
import { sound } from '../utils/audio';

interface MediaAttachmentPickerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  assets: MediaAsset[];
  attachedIds: string[];
  onToggleAttach: (assetId: string) => void;
}

export const MediaAttachmentPicker: React.FC<MediaAttachmentPickerProps> = ({
  isOpen,
  onClose,
  title,
  assets,
  attachedIds,
  onToggleAttach,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-lg rounded-2xl bg-[var(--card-surface)] border border-[var(--border-medium)] p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-[#8296FF]" />
              <span>Attach Media Assets</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate max-w-xs">
              Target: {title}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset List */}
        <div className="space-y-2 overflow-y-auto max-h-96 pr-1 flex-1">
          {assets.map((asset) => {
            const isAttached = attachedIds.includes(asset.id);

            return (
              <div
                key={asset.id}
                onClick={() => {
                  sound.playClick();
                  onToggleAttach(asset.id);
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isAttached
                    ? 'bg-[#8296FF]/15 border-[#8296FF] text-[var(--text-primary)]'
                    : 'bg-[var(--inset-surface)] border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[var(--card-surface)] border border-[var(--border-subtle)] overflow-hidden flex items-center justify-center shrink-0">
                    {asset.dataUrl.startsWith('data:image') || asset.dataUrl.startsWith('http') ? (
                      <img src={asset.dataUrl} alt={asset.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <FileText className="w-5 h-5 text-[#8296FF]" />
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {asset.name}
                    </h4>
                    <span className="text-[11px] text-[var(--text-secondary)] block">
                      {asset.category}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                    isAttached
                      ? 'bg-[#8296FF] border-[#8296FF] text-[#0B1020]'
                      : 'border-[var(--border-medium)]'
                  }`}
                >
                  {isAttached && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
              </div>
            );
          })}

          {assets.length === 0 && (
            <div className="p-6 text-center text-xs text-[var(--text-secondary)]">
              No media assets available in CMS. Upload diagrams or figures in the Media CMS studio first.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-[#8296FF] text-[#0B1020] text-xs font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
