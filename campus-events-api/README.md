# Campus Events API (`campus-events-api`)

A RESTful backend API built with **NestJS** and **TypeScript** for managing campus events and their scheduled sessions. Students can browse upcoming events, filter, sort, and paginate through event listings, view event details and sessions, and create new events and sessions.

## Features & Architecture

The application follows NestJS modular architecture with clear separation of responsibilities:

- **Module (`EventsModule`)**: Wires together the controller and service for the events feature.
- **Controller (`EventsController`)**: Defines `/api/events` routes, extracts `@Param()`, `@Query()`, and `@Body()`, and enforces route ordering (static routes like `/upcoming` are declared before dynamic `/:id` routes).
- **Service (`EventsService`)**: Manages in-memory `Map` storage pre-populated with sample campus events and sessions, performs business logic, and validates relationships and timestamps.
- **DTOs (`CreateEventDto`, `CreateSessionDto`, `FindEventsQueryDto`)**: Validate incoming payloads and query parameters using `class-validator` and `class-transformer`.

## Installation & Running Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the TypeScript project**:
   ```bash
   npm run build
   ```

3. **Start the server**:
   - **Development mode**:
     ```bash
     npm run start:dev
     ```
   - **Production / compiled mode**:
     ```bash
     node dist/main.js
     ```

The API runs by default at **`http://localhost:3000/api`**.

## API Endpoints

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | List events with filtering, sorting, and pagination | `200 OK`, `400 Bad Request` |
| `GET` | `/api/events/upcoming` | List events occurring today or in the future | `200 OK` |
| `GET` | `/api/events/:id` | Retrieve a single event by ID | `200 OK`, `404 Not Found` |
| `GET` | `/api/events/:id/sessions` | Retrieve all sessions belonging to an event | `200 OK`, `404 Not Found` |
| `GET` | `/api/events/:id/sessions/:sessionId` | Retrieve a specific session under its parent event | `200 OK`, `404 Not Found` |
| `POST` | `/api/events` | Create a new campus event | `201 Created`, `400 Bad Request` |
| `POST` | `/api/events/:id/sessions` | Add a new session to an existing event (`endsAt > startsAt`) | `201 Created`, `400 Bad Request`, `404 Not Found` |

## Filtering, Sorting & Pagination

`GET /api/events` processes query parameters (`category`, `location`, `isPublished`, `sortBy`, `order`, `page`, `limit`) in three sequential stages:

1. **Filtering**: Matches `category` (case-insensitive), `location` (substring match), and `isPublished` (`true`/`false`).
2. **Sorting**: Clones the filtered array (`[...filtered]`) so original seed data is never mutated, then sorts by `eventDate` or `title` in `asc` or `desc` order.
3. **Pagination**: Calculates `offset = (page - 1) * limit` (default `page = 1`, `limit = 5`), slices `items = sorted.slice(offset, offset + limit)`, and returns:
   ```json
   {
     "items": [],
     "total": 8,
     "page": 1,
     "limit": 5,
     "totalPages": 2
   }
   ```

## Tested API Cases (`requests.http`)

| # | Test Case | Request | Expected Status |
| :- | :--- | :--- | :--- |
| 1 | Get all events | `GET /api/events` | `200 OK` |
| 2 | Filter by category | `GET /api/events?category=technology` | `200 OK` |
| 3 | Filter by publication status | `GET /api/events?isPublished=true` | `200 OK` |
| 4 | Sort and paginate | `GET /api/events?sortBy=eventDate&order=asc&page=2&limit=2` | `200 OK` |
| 5 | Get upcoming events | `GET /api/events/upcoming` | `200 OK` |
| 6 | Get existing event | `GET /api/events/evt-101` | `200 OK` |
| 7 | Request non-existent event | `GET /api/events/not-real` | `404 Not Found` |
| 8 | Get sessions for an event | `GET /api/events/evt-101/sessions` | `200 OK` |
| 9 | Get session under its event | `GET /api/events/evt-101/sessions/ses-201` | `200 OK` |
| 10 | Get mismatched session/event | `GET /api/events/evt-101/sessions/ses-203` | `404 Not Found` |
| 11 | Create a valid event | `POST /api/events` | `201 Created` |
| 12 | Create event with missing title | `POST /api/events` | `400 Bad Request` |
| 13 | Create valid session for event | `POST /api/events/evt-101/sessions` | `201 Created` |
| 14 | Create session with invalid times | `POST /api/events/evt-101/sessions` (`endsAt <= startsAt`) | `400 Bad Request` |