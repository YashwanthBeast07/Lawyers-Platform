interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  const visible = pages.slice(start, end + 1);

  const btnBase: React.CSSProperties = {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    border: "1.5px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontSize: "13px",
    fontWeight: "600",
    background: "var(--surface)",
    color: "var(--text-muted)",
    fontFamily: "inherit",
  };

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-6" aria-label="Pagination">
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        style={{
          ...btnBase,
          opacity: page === 0 ? 0.4 : 1,
          cursor: page === 0 ? "not-allowed" : "pointer",
        }}
        aria-label="Previous page"
        onMouseOver={(e) => {
          if (page !== 0) {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--navy)";
            (e.currentTarget as HTMLElement).style.color = "var(--navy)";
          }
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
        }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {start > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            style={btnBase}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
          >
            1
          </button>
          {start > 1 && (
            <span className="text-sm" style={{ color: "var(--text-light)", padding: "0 2px" }}>
              …
            </span>
          )}
        </>
      )}

      {visible.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={
            p === page
              ? {
                  ...btnBase,
                  background: "var(--navy)",
                  borderColor: "var(--navy)",
                  color: "white",
                }
              : btnBase
          }
          onMouseOver={(e) => {
            if (p !== page) (e.currentTarget as HTMLElement).style.background = "var(--bg)";
          }}
          onMouseOut={(e) => {
            if (p !== page) (e.currentTarget as HTMLElement).style.background = "var(--surface)";
          }}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && (
            <span className="text-sm" style={{ color: "var(--text-light)", padding: "0 2px" }}>
              …
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            style={btnBase}
            onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
            onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--surface)")}
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        style={{
          ...btnBase,
          opacity: page >= totalPages - 1 ? 0.4 : 1,
          cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
        }}
        aria-label="Next page"
        onMouseOver={(e) => {
          if (page < totalPages - 1) {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--navy)";
            (e.currentTarget as HTMLElement).style.color = "var(--navy)";
          }
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
        }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}
