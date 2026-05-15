interface PaginationProps {
  page: number;         // 0-based current page
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  // Show at most 5 page buttons around current
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  const visible = pages.slice(start, end + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-8" aria-label="Pagination">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#0D1B2A] hover:text-[#0D1B2A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {start > 0 && (
        <>
          <button onClick={() => onPageChange(0)} className="w-8 h-8 rounded-lg text-sm text-[#64748B] hover:bg-[#F1F5F9] transition-all">1</button>
          {start > 1 && <span className="text-[#94A3B8] text-sm px-1">…</span>}
        </>
      )}

      {visible.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
            p === page
              ? "bg-[#0D1B2A] text-white"
              : "text-[#64748B] hover:bg-[#F1F5F9]"
          }`}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className="text-[#94A3B8] text-sm px-1">…</span>}
          <button onClick={() => onPageChange(totalPages - 1)} className="w-8 h-8 rounded-lg text-sm text-[#64748B] hover:bg-[#F1F5F9] transition-all">{totalPages}</button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#0D1B2A] hover:text-[#0D1B2A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}
