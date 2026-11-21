import Link from "next/link";
import type { Event } from "@/types/event";
import { dateTile, formatDateTime } from "@/lib/format";
import { ClockIcon, PinIcon, TagIcon } from "./Icons";
import StatusBadge from "./StatusBadge";

export default function EventCard({ event }: { event: Event }) {
  const tile = dateTile(event.eventDate);

  return (
    <article className="event-card">
      <div className="event-card-head">
        <div className="date-tile" aria-hidden="true">
          <span className="date-tile-month">{tile.month}</span>
          <span className="date-tile-day">{tile.day}</span>
        </div>
        <div>
          <h3 className="event-card-title">{event.title}</h3>
          <StatusBadge isPublished={event.isPublished} />
        </div>
      </div>

      <p className="event-card-desc">{event.description}</p>

      <ul className="meta-list">
        <li>
          <PinIcon /> {event.location}
        </li>
        <li>
          <ClockIcon /> {formatDateTime(event.eventDate)}
        </li>
        <li>
          <TagIcon /> {event.category}
        </li>
      </ul>

      <Link className="btn btn-primary" href={`/events/${event.id}`}>
        View Details
      </Link>
    </article>
  );
}
