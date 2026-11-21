"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type AddSessionFormProps = {
  eventId: string;
};

export default function AddSessionForm({ eventId }: AddSessionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [room, setRoom] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/events/${eventId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          room,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Failed to create session";
        throw new Error(msg);
      }

      setTitle("");
      setRoom("");
      setStartsAt("");
      setEndsAt("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="detail-card" style={{ marginTop: "1.5rem" }}>
      <h3>Add a session</h3>

      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

      <div>
        <label htmlFor="session-title">Session title</label>
        <input
          id="session-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Hands-on Lab"
        />
      </div>

      <div>
        <label htmlFor="session-room">Room</label>
        <input
          id="session-room"
          type="text"
          required
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Engineering Block, Room 2"
        />
      </div>

      <div>
        <label htmlFor="session-starts">Starts at</label>
        <input
          id="session-starts"
          type="datetime-local"
          required
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </div>

     <div>
  <label htmlFor="session-ends">Ends at</label>
  <input
    id="session-ends"
    type="datetime-local"
    required
    min={startsAt || undefined}
    value={endsAt}
    onChange={(e) => setEndsAt(e.target.value)}
  />
</div>

      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? "Adding session..." : "Add session"}
      </button>
    </form>
  );
}