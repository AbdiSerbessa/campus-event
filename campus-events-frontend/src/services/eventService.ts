import type {
  CreateEventInput,
  Event,
  EventQuery,
  PaginatedEvents,
  Session,
} from "@/types/event";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

/** Error thrown for every failed API call. `status` is 0 when the server is unreachable. */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** True when the API said the requested resource does not exist (or the id is malformed). */
export function isNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 400)
  );
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

async function readErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = await response.json();
    // NestJS validation errors: { message: string | string[] }
    if (Array.isArray(body?.message)) return body.message.join(", ");
    if (typeof body?.message === "string") return body.message;
  } catch {
    // Response body was not JSON - use the fallback message.
  }
  return fallback;
}

/** Thin wrapper around the native fetch() that adds error handling. */
async function request<T>(
  path: string,
  errorMessage: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });
  } catch {
    throw new ApiError(
      "Cannot reach the Campus Events API. Check that the backend is running and that NEXT_PUBLIC_API_BASE_URL is correct.",
      0
    );
  }

  if (!response.ok) {
    throw new ApiError(
      await readErrorMessage(response, errorMessage),
      response.status
    );
  }

  return (await response.json()) as T;
}

/** Accepts a plain array or a wrapper object such as { items: [...] } / { data: [...] }. */
function toArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["items", "data", "results", "events", "sessions"]) {
      if (Array.isArray(record[key])) return record[key] as T[];
    }
  }
  return [];
}

export async function getEvents(
  query: EventQuery = {}
): Promise<PaginatedEvents> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const qs = params.toString();

  const data = await request<PaginatedEvents | Event[]>(
    `/events${qs ? `?${qs}` : ""}`,
    "Failed to fetch events"
  );

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
    };
  }
  return data;
}

export async function getUpcomingEvents(): Promise<Event[]> {
  const data = await request<unknown>(
    "/events/upcoming",
    "Failed to fetch upcoming events"
  );
  return toArray<Event>(data);
}

export async function getEventById(id: string): Promise<Event> {
  return request<Event>(
    `/events/${encodeURIComponent(id)}`,
    "Failed to fetch event"
  );
}

export async function getEventSessions(id: string): Promise<Session[]> {
  const data = await request<unknown>(
    `/events/${encodeURIComponent(id)}/sessions`,
    "Failed to fetch sessions"
  );
  return toArray<Session>(data);
}

export async function getSessionById(
  eventId: string,
  sessionId: string
): Promise<Session> {
  return request<Session>(
    `/events/${encodeURIComponent(eventId)}/sessions/${encodeURIComponent(sessionId)}`,
    "Failed to fetch session"
  );
}

export async function createEvent(event: CreateEventInput): Promise<Event> {
  return request<Event>("/events", "Failed to create event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
}
