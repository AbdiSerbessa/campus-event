"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const KEYS = ["category", "location", "isPublished", "sortBy", "order", "limit"] as const;
type Key = (typeof KEYS)[number];
type Values = Record<Key, string>;

const CATEGORY_SUGGESTIONS = [
  "technology",
  "workshop",
  "sports",
  "cultural",
  "academic",
  "career",
];

function readValues(params: URLSearchParams): Values {
  const values = {} as Values;
  KEYS.forEach((key) => {
    values[key] = params.get(key) ?? "";
  });
  return values;
}

function toQuery(values: Values): string {
  const qs = new URLSearchParams();
  KEYS.forEach((key) => {
    const value = values[key].trim();
    if (value) qs.set(key, value);
  });
  return qs.toString();
}

/** Filter + sort controls. They write to the URL, and the server page re-fetches from the API. */
export default function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlKey = searchParams.toString();

  const [values, setValues] = useState<Values>(() => readValues(new URLSearchParams(urlKey)));
  const [isPending, startTransition] = useTransition();

  // Keep the inputs in sync when the URL changes (back button, reset, ...).
  useEffect(() => {
    setValues(readValues(new URLSearchParams(urlKey)));
  }, [urlKey]);

  // Debounced: update the URL (and therefore the API request) when a filter changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = toQuery(values);
      const current = toQuery(readValues(new URLSearchParams(urlKey)));
      if (next !== current) {
        // Dropping "page" sends the user back to page 1 for the new filters.
        startTransition(() => router.push(next ? `${pathname}?${next}` : pathname));
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [values, urlKey, pathname, router]);

  const set = (key: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const hasFilters = KEYS.some((key) => values[key] !== "");

  return (
    <form className="filters" onSubmit={(e) => e.preventDefault()} aria-label="Filter and sort events">
      <div className="field">
        <label htmlFor="f-category">Category</label>
        <input
          id="f-category"
          list="category-options"
          value={values.category}
          onChange={set("category")}
          placeholder="Any category"
        />
        <datalist id="category-options">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="field">
        <label htmlFor="f-location">Location</label>
        <input
          id="f-location"
          value={values.location}
          onChange={set("location")}
          placeholder="Any location"
        />
      </div>

      <div className="field">
        <label htmlFor="f-status">Publication status</label>
        <select id="f-status" value={values.isPublished} onChange={set("isPublished")}>
          <option value="">All</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-sort">Sort by</label>
        <select id="f-sort" value={values.sortBy} onChange={set("sortBy")}>
          <option value="">Default</option>
          <option value="eventDate">Event date</option>
          <option value="title">Title</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-order">Order</label>
        <select id="f-order" value={values.order} onChange={set("order")}>
          <option value="">Default</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-limit">Events per page</label>
        <select id="f-limit" value={values.limit} onChange={set("limit")}>
          <option value="">Default</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>

      <div className="filters-actions">
        <button
          type="button"
          className="btn btn-outline"
          disabled={!hasFilters}
          onClick={() =>
            setValues({ category: "", location: "", isPublished: "", sortBy: "", order: "", limit: "" })
          }
        >
          Reset filters
        </button>
        {isPending && <span className="muted" role="status">Updating...</span>}
      </div>
    </form>
  );
}
