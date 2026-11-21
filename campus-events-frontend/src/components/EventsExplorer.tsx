"use client";

import { useMemo, useState } from "react";
import type { Event } from "@/types/event";
import EmptyState from "./EmptyState";
import EventCard from "./EventCard";
import SearchBar from "./SearchBar";

/**
 * Title search is done on the frontend (the API has no search endpoint),
 * so it filters the events already fetched for the current page.
 */
export default function EventsExplorer({ events }: { events: Event[] }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return term
      ? events.filter((event) => event.title.toLowerCase().includes(term))
      : events;
  }, [events, query]);

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />

      {events.length === 0 ? (
        <EmptyState message="No events found. Check back later!" />
      ) : visible.length === 0 ? (
        <EmptyState
          message={`No events on this page match "${query.trim()}". Try a different title.`}
        />
      ) : (
        <>
          <p className="result-count" aria-live="polite">
            Showing {visible.length} of {events.length} events on this page
          </p>
          <div className="grid">
            {visible.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
