import Link from "next/link";
import { notFound } from "next/navigation";
import type { Event, Session } from "@/types/event";
import {
  getErrorMessage,
  getEventById,
  getEventSessions,
  isNotFound,
} from "@/services/eventService";
import { formatDateTime, formatTime } from "@/lib/format";
import { ClockIcon, DoorIcon, PinIcon, TagIcon } from "@/components/Icons";
import StatusBadge from "@/components/StatusBadge";
import ErrorMessage from "@/components/ErrorMessage";
import EmptyState from "@/components/EmptyState";
import AddSessionForm from "@/components/AddSessionForm";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let event: Event;
  try {
    event = await getEventById(id);
  } catch (e) {
    if (isNotFound(e)) notFound();
    return <ErrorMessage title="Event unavailable" message={getErrorMessage(e)} />;
  }

  let sessions: Session[] = [];
  let sessionsError: string | null = null;
  try {
    sessions = await getEventSessions(id);
    sessions = [...sessions].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    );
  } catch (e) {
    sessionsError = getErrorMessage(e);
  }

  return (
    <>
      <Link href="/events" className="text-link">
        Back to all events
      </Link>

      <article className="detail-card">
        <StatusBadge isPublished={event.isPublished} />
        <h1>{event.title}</h1>
        <ul className="meta-list">
          <li><PinIcon /> {event.location}</li>
          <li><ClockIcon /> {formatDateTime(event.eventDate)}</li>
          <li><TagIcon /> {event.category}</li>
        </ul>
        <p className="detail-desc">{event.description}</p>
      </article>

      <section aria-labelledby="sessions-heading">
        <h2 id="sessions-heading">Sessions</h2>

        {sessionsError ? (
          <ErrorMessage title="Sessions are unavailable" message={sessionsError} />
        ) : sessions.length === 0 ? (
          <EmptyState message="No sessions have been scheduled for this event yet." />
        ) : (
          <ul className="session-list">
            {sessions.map((session) => (
              <li key={session.id} className="session-item">
                <div>
                  <h3>{session.title}</h3>
                  <p className="meta-inline">
                    <span><ClockIcon /> {formatTime(session.startsAt)} to {formatTime(session.endsAt)}</span>
                    <span><DoorIcon /> {session.room}</span>
                  </p>
                </div>
                <Link
                  className="btn btn-outline"
                  href={`/events/${event.id}/sessions/${session.id}`}
                >
                  View session
                </Link>
              </li>
            ))}
          </ul>
        )}

        <AddSessionForm eventId={event.id} />
      </section>
    </>
  );
}