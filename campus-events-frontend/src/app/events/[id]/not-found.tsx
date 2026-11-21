import Link from "next/link";

export default function EventNotFound() {
  return (
    <div className="empty-state">
      <h1>Event not found</h1>
      <p>We couldn&apos;t find that event or session. It may have been removed, or the link is wrong.</p>
      <Link href="/events" className="btn btn-primary">Browse all events</Link>
    </div>
  );
}
