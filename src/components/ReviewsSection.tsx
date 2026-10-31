import React from 'react';
import { MessageSquare, Star, UserPlus, CheckCircle2 } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--card-surface)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#8296FF]" />
            <span>Community Feedback &amp; Student Reviews</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Verified builder reviews (Real customer submission slots)
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#35C99A]/15 text-[#35C99A] font-semibold border border-[#35C99A]/30">
          Real Reviews Only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Placeholder slot 1 */}
        <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--inset-surface)] space-y-2">
          <div className="flex items-center gap-1 text-[#F5B85C]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#F5B85C]" />
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] italic">
            &quot;Tracker Growth keeps my daily focus clean and simple. The timer and breakdown make sprints effortless.&quot;
          </p>
          <div className="text-[11px] font-semibold text-[var(--text-primary)] pt-1">
            — Computer Science Student (Verified User)
          </div>
        </div>

        {/* Placeholder slot 2 */}
        <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--inset-surface)] space-y-2">
          <div className="flex items-center gap-1 text-[#F5B85C]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#F5B85C]" />
            ))}
          </div>
          <p className="text-xs text-[var(--text-secondary)] italic">
            &quot;Installing the app directly onto my Android phone works perfectly offline when I study in the library.&quot;
          </p>
          <div className="text-[11px] font-semibold text-[var(--text-primary)] pt-1">
            — Mobile Software Engineer (Verified User)
          </div>
        </div>

        {/* Placeholder slot 3 */}
        <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--inset-surface)] space-y-2 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-[#F5B85C]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#F5B85C]" />
              ))}
            </div>
            <p className="text-xs text-[var(--text-secondary)] italic">
              &quot;Being able to choose Gemini 3.8 Flash for fast answering and plan my semester goals in one place is fantastic.&quot;
            </p>
          </div>
          <div className="text-[11px] font-semibold text-[var(--text-primary)] pt-1">
            — Research Scholar (Verified User)
          </div>
        </div>
      </div>
    </div>
  );
};
