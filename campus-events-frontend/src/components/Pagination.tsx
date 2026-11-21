import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  /** Current filter / sort parameters, preserved in every page link. */
  params: Record<string, string | undefined>;
}

function pageNumbers(current: number, last: number): (number | "gap")[] {
  const wanted = new Set<number>([1, last, current - 1, current, current + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push("gap");
    result.push(n);
  });
  return result;
}

export default function Pagination({ page, totalPages, total, params }: PaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="pagination-summary">
        {total} {total === 1 ? "event" : "events"}
      </p>
    );
  }

  const href = (n: number) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) qs.set(key, value);
    }
    qs.set("page", String(n));
    return `/events?${qs.toString()}`;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? (
        <Link className="btn btn-outline" href={href(page - 1)}>
          Previous
        </Link>
      ) : (
        <span className="btn btn-outline disabled" aria-disabled="true">
          Previous
        </span>
      )}

      <ul className="page-list">
        {pageNumbers(page, totalPages).map((item, i) =>
          item === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true">
              &hellip;
            </li>
          ) : (
            <li key={item}>
              <Link
                href={href(item)}
                className={item === page ? "page-link current" : "page-link"}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Link>
            </li>
          )
        )}
      </ul>

      {page < totalPages ? (
        <Link className="btn btn-outline" href={href(page + 1)}>
          Next
        </Link>
      ) : (
        <span className="btn btn-outline disabled" aria-disabled="true">
          Next
        </span>
      )}

      <p className="pagination-summary">
        Page {page} of {totalPages} &middot; {total} events
      </p>
    </nav>
  );
}
