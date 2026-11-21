import Link from "next/link";
import { notFound } from "next/navigation";
import type { Event, Session } from "@/types/event";
import {
  getErrorMessage,
  getEventById,
  getSessionById,
  isNotFound,
} from "@/services/eventService";
import { formatDateTime } from "@/lib/format";
import { ClockIcon, DoorIcon, PinIcon } from "@/components/Icons";
import ErrorMessage from "@/components/ErrorMessage";
import StatusBadge from "@/components/StatusBadge";

export default async function SessionDetailsPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;

  let event: Event;
  let session: Session;
  try {
    [event, session] = await Promise.all([
      getEventById(id),
      getSessionById(id, sessionId),
    ]);
  } catch (e) {
    if (isNotFound(e)) notFound();
    return <ErrorMessage title="Session unavailable" message={getErrorMessage(e)} />;
  }

  return (
    <>
      <Link href={`/events/${event.id}`} className="text-link">
        Back to {event.title}
      </Link>

      <article className="detail-card">
        <h1>{session.title}</h1>
        <dl className="detail-grid">
          <div>
            <dt>Start time</dt>
            <dd><ClockIcon /> {formatDateTime(session.startsAt)}</dd>
          </div>
          <div>
            <dt>End time</dt>
            <dd><ClockIcon /> {formatDateTime(session.endsAt)}</dd>
          </div>
          <div>
            <dt>Room</dt>
            <dd><DoorIcon /> {session.room}</dd>
          </div>
        </dl>
      </article>

      <section className="detail-card" aria-labelledby="related-heading">
        <h2 id="related-heading">Related event</h2>
        <h3>{event.title}</h3>
        <StatusBadge isPublished={event.isPublished} />
        <ul className="meta-list">
          <li><PinIcon /> {event.location}</li>
          <li><ClockIcon /> {formatDateTime(event.eventDate)}</li>
        </ul>
        <p>{event.description}</p>
        <Link className="btn btn-outline" href={`/events/${event.id}`}>
          View event
        </Link>
      </section>
    </>
  );
}
