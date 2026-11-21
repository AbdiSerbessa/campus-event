import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { FindEventsQueryDto } from "./dto/find-events-query.dto";
import {
  CampusEvent,
  EventSession,
  PaginatedEventsResult,
} from "./entities/event.entity";
import { CreateSessionDto } from "./dto/create-session.dto";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class EventsService {
  private readonly seedEvents: CampusEvent[] = [
    {
      id: "evt-101",
      title: "Intro to Cloud Computing",
      description:
        "A beginner-friendly campus workshop covering containers, cloud fundamentals, and deployment.",
      location: "Engineering Block, Room 2",
      eventDate: "2026-12-04T09:00:00.000Z",
      category: "technology",
      isPublished: true,
    },
    {
      id: "evt-102",
      title: "Full-Stack TypeScript & NestJS Bootcamp",
      description:
        "Hands-on session building modular backends and connecting modern web frontends.",
      location: "Computing Lab 1, Main Campus",
      eventDate: "2026-12-10T14:00:00.000Z",
      category: "workshop",
      isPublished: true,
    },
    {
      id: "evt-103",
      title: "Tech Career & Internship Fair",
      description:
        "Meet engineering leads, review portfolios, and explore student internships.",
      location: "Student Union Auditorium",
      eventDate: "2026-12-18T10:30:00.000Z",
      category: "career",
      isPublished: true,
    },
    {
      id: "evt-104",
      title: "Cybersecurity & Network Defense Seminar",
      description:
        "Practical talk on application security, JWT token hygiene, and incident response.",
      location: "Engineering Block, Hall B",
      eventDate: "2027-01-12T13:00:00.000Z",
      category: "seminar",
      isPublished: true,
    },
    {
      id: "evt-105",
      title: "Spring Hackathon & Innovation Showcase",
      description:
        "Draft planning event for 24-hour student teams building campus solutions.",
      location: "Innovation Hub, Floor 3",
      eventDate: "2026-05-15T08:00:00.000Z",
      category: "technology",
      isPublished: false,
    },
  ];

  private readonly seedSessions: EventSession[] = [
    {
      id: "ses-201",
      eventId: "evt-101",
      title: "Cloud Architecture & Virtualization Basics",
      startsAt: "2026-12-04T09:00:00.000Z",
      endsAt: "2026-12-04T10:45:00.000Z",
      room: "Engineering Block, Room 2",
    },
    {
      id: "ses-202",
      eventId: "evt-101",
      title: "Deploying Services & Environment Config",
      startsAt: "2026-12-04T11:00:00.000Z",
      endsAt: "2026-12-04T12:30:00.000Z",
      room: "Engineering Block, Room 2",
    },
    {
      id: "ses-203",
      eventId: "evt-102",
      title: "NestJS Modules, Controllers & DTO Validation",
      startsAt: "2026-12-10T14:00:00.000Z",
      endsAt: "2026-12-10T15:45:00.000Z",
      room: "Computing Lab 1",
    },
    {
      id: "ses-204",
      eventId: "evt-102",
      title: "Connecting Frontend Clients via Fetch API",
      startsAt: "2026-12-10T16:00:00.000Z",
      endsAt: "2026-12-10T17:30:00.000Z",
      room: "Computing Lab 1",
    },
  ];

  private readonly eventsStore = new Map<string, CampusEvent>();
  private readonly sessionsStore = new Map<string, EventSession>();
  private nextEventCounter = 106;

  constructor() {
    for (const evt of this.seedEvents) {
      this.eventsStore.set(evt.id, { ...evt });
    }
    for (const ses of this.seedSessions) {
      this.sessionsStore.set(ses.id, { ...ses });
    }
  }

  findAll(query: FindEventsQueryDto): PaginatedEventsResult {
    const allEvents = Array.from(this.eventsStore.values());

    // 1. Filter by category, location, isPublished, and optional search/date range
    const filtered = allEvents.filter((event) => {
      if (query.category && query.category.trim() !== "") {
        if (
          event.category.toLowerCase() !== query.category.trim().toLowerCase()
        ) {
          return false;
        }
      }

      if (query.location && query.location.trim() !== "") {
        if (
          !event.location
            .toLowerCase()
            .includes(query.location.trim().toLowerCase())
        ) {
          return false;
        }
      }

      if (typeof query.isPublished === "boolean") {
        if (event.isPublished !== query.isPublished) {
          return false;
        }
      }

      if (query.search && query.search.trim() !== "") {
        const needle = query.search.trim().toLowerCase();
        if (!event.title.toLowerCase().includes(needle)) {
          return false;
        }
      }

      if (query.dateFrom) {
        if (new Date(event.eventDate).getTime() < new Date(query.dateFrom).getTime()) {
          return false;
        }
      }

      if (query.dateTo) {
        if (new Date(event.eventDate).getTime() > new Date(query.dateTo).getTime()) {
          return false;
        }
      }

      return true;
    });

    // 2. Sort a shallow copy without mutating original seed or store order
    const sortBy = query.sortBy ?? "eventDate";
    const order = query.order ?? "asc";
    const direction = order === "desc" ? -1 : 1;

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title) * direction;
      }
      return (
        (new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()) *
        direction
      );
    });

    // 3. Paginate sorted results
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const total = sorted.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const items = sorted.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  findUpcoming(): CampusEvent[] {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const threshold = startOfToday.getTime();

    return [...Array.from(this.eventsStore.values())]
      .filter((event) => new Date(event.eventDate).getTime() >= threshold)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
  }

  findPublished(): CampusEvent[] {
    return [...Array.from(this.eventsStore.values())]
      .filter((event) => event.isPublished)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
  }

  findOne(id: string): CampusEvent {
    const event = this.eventsStore.get(id);
    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }
    return event;
  }

  findSessionsByEventId(eventId: string): EventSession[] {
    this.findOne(eventId);
    return Array.from(this.sessionsStore.values()).filter(
      (session) => session.eventId === eventId
    );
  }

  findOneSession(eventId: string, sessionId: string): EventSession {
    this.findOne(eventId);
    const session = this.sessionsStore.get(sessionId);
    if (!session || session.eventId !== eventId) {
      throw new NotFoundException(
        `Session "${sessionId}" not found for event "${eventId}"`
      );
    }
    return session;
  }

  create(dto: CreateEventDto): CampusEvent {
    const id = `evt-${this.nextEventCounter++}`;
    const newEvent: CampusEvent = {
      id,
      title: dto.title,
      description: dto.description,
      location: dto.location,
      eventDate: new Date(dto.eventDate).toISOString(),
      category: dto.category,
      isPublished: dto.isPublished ?? false,
    };

    this.eventsStore.set(id, newEvent);
    return newEvent;
  }

  private nextSessionCounter = 205;

createSession(eventId: string, dto: CreateSessionDto): EventSession {
    // Ensures the parent event exists (throws 404 if not)
    this.findOne(eventId);

    const startDate = new Date(dto.startsAt);
    const endDate = new Date(dto.endsAt);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException("startsAt and endsAt must be valid dates");
    }

    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException("endsAt must be after startsAt");
    }

    const id = `ses-${this.nextSessionCounter++}`;
    const newSession: EventSession = {
      id,
      eventId,
      title: dto.title,
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      room: dto.room,
    };

    this.sessionsStore.set(id, newSession);
    return newSession;
  }

}
