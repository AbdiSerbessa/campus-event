import Link from "next/link";
import type { Event } from "@/types/event";
import { getErrorMessage, getUpcomingEvents } from "@/services/eventService";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";

export default async function HomePage() {
  let events: Event[] = [];
  let error: string | null = null;

  try {
    events = (await getUpcomingEvents()).slice(0, 3);
  } catch (e) {
    error = getErrorMessage(e);
  }

  return (
    <>
      <section className="hero">
        <h1>Discover what&apos;s happening on campus</h1>
        <p>
          Find workshops, technology events and activities, and see exactly
          which sessions run in which room.
        </p>
        <Link href="/events" className="btn btn-accent">
          Explore Events
        </Link>
      </section>

      <section aria-labelledby="upcoming-heading">
        <div className="section-head">
          <h2 id="upcoming-heading">Upcoming events</h2>
          <Link href="/events" className="text-link">
            View All Events
          </Link>
        </div>

        {error ? (
          <ErrorMessage title="Upcoming events are unavailable" message={error} />
        ) : events.length === 0 ? (
          <EmptyState message="No events found. Check back later!" />
        ) : (
          <div className="grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
