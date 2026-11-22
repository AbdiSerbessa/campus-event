# Campus Events API (NestJS)

A RESTful backend API built with NestJS and TypeScript for managing campus events and event sessions, using in-memory data storage, DTO validation, and custom request lifecycle components.

---

## 1. Installation & Run Instructions

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm**

### Setup
```bash
cd campus-events-api
npm install
```

### Run the Server
```bash
# Development mode (watch mode)
npm run start:dev

# Production build & run
npm run build
npm run start:prod
```

The API runs at **`http://localhost:3000/api`** (global `/api` prefix enabled in `src/main.ts`).

### Optional API Key Protection
To enforce API key authentication on protected `POST` routes (`POST /api/events`), set `CLASSROOM_API_KEY` before starting the server:
```bash
# Git Bash / macOS / Linux
CLASSROOM_API_KEY=campus-secret npm run start:dev

# Windows PowerShell
$env:CLASSROOM_API_KEY="campus-secret"; npm run start:dev
```
If `CLASSROOM_API_KEY` is unset, `ApiKeyGuard` allows `POST` requests without requiring an `x-api-key` header.

---

## 2. In-Memory Data Storage

- Data is stored in memory inside `EventsService` (`src/events/events.service.ts`) using seeded arrays/maps of **Events** and nested **Sessions**.
- No external database is required to run or test the API.
- Because storage is in-memory, any newly created events or sessions persist while the server is running and reset to the initial seed dataset whenever the server restarts.

---

## 3. API Routes

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/events` | List events (supports query filters: `category`, `isPublished`, `sortBy`, `order`, `page`, `limit`) |
| `GET` | `/events/upcoming` | List upcoming published events |
| `GET` | `/events/example` | Demo route testing `ParseIntPipe` on `?page=` |
| `GET` | `/events/:id` | Get a single event by ID (`404` if not found) |
| `GET` | `/events/:id/sessions` | List all sessions for a specific event |
| `GET` | `/events/:id/sessions/:sessionId` | Get a specific session under an event |
| `POST` | `/events` | Create a new event (protected by `ApiKeyGuard` & validated by `ValidationPipe`) |
| `POST` | `/events/:id/sessions` | Create a new session under an event |

---

## 4. Request Lifecycle

Every incoming request flows through NestJS's execution pipeline in this order:

1. **Middleware (`LoggerMiddleware` — `src/common/logger.middleware.ts`)**
   - Applied globally across all routes in `AppModule`.
   - Logs the HTTP method, request URL, and ISO timestamp to the terminal before route handling begins.
2. **Guard (`ApiKeyGuard` — `src/common/api-key.guard.ts`)**
   - Attached via `@UseGuards(ApiKeyGuard)` on `POST /api/events`.
   - When `CLASSROOM_API_KEY` is configured, verifies that the incoming `x-api-key` header matches; otherwise throws `401 Unauthorized`.
3. **Pipes (`ValidationPipe` & `ParseIntPipe`)**
   - Global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`) validates and transforms incoming DTO payloads before controller methods run.
   - `ParseIntPipe` validates and converts numeric query/route parameters (such as `?page=2`).
4. **Controller & Service (`EventsController` & `EventsService`)**
   - Executes business logic and reads/writes in-memory event and session records.
5. **Interceptor (`TimingInterceptor` — `src/common/timing.interceptor.ts`)**
   - Attached to `EventsController` via `@UseInterceptors(TimingInterceptor)`.
   - Measures execution time from request entry to response completion (`ms`) and logs it without altering the JSON response structure.

---

## 5. Validation Rules

- **Global `ValidationPipe` (`src/main.ts`):**
  - `whitelist: true` — strips properties not defined on the DTO.
  - `forbidNonWhitelisted: true` — rejects requests containing unexpected extra fields with `400 Bad Request`.
  - `transform: true` — automatically transforms payloads into DTO class instances and primitive types.
- **Create Event DTO (`CreateEventDto`):**
  - `title`, `description`, `location`, `category`: required non-empty strings (`@IsString()`, `@IsNotEmpty()`).
  - `eventDate`: required valid ISO-8601 date string (`@IsDateString()`).
  - `isPublished`: optional boolean (`@IsBoolean()`, `@IsOptional()`).
- **Create Session DTO (`CreateSessionDto`):**
  - `title`, `speaker`, `room`: required non-empty strings.
  - `startTime`, `endTime`: required valid ISO-8601 date strings.
- **Numeric Parameter Validation (`ParseIntPipe`):**
  - Rejects non-integer values (e.g., `?page=hello`) with `400 Bad Request`.

---

## 6. How to Test Middleware, Guard, Interceptor, and Pipes

You can run all automated HTTP checks directly from **`campus-events-api/requests.http`** using the VS Code **REST Client** extension:

1. **Middleware (`LoggerMiddleware`) & Interceptor (`TimingInterceptor`):**
   - Send any request (e.g., `GET http://localhost:3000/api/events`).
   - Check the backend terminal to see `[Logger] GET /api/events ...` and `[Timing] GET /api/events - Xms`.
2. **Guard (`ApiKeyGuard`):**
   - Start the server with `CLASSROOM_API_KEY=campus-secret npm run start:dev`.
   - Send `POST /api/events` with a missing or wrong `x-api-key` header → returns **`401 Unauthorized`**.
   - Send `POST /api/events` with `x-api-key: campus-secret` → returns **`201 Created`**.
3. **Pipes (`ValidationPipe` & `ParseIntPipe`):**
   - Send `POST /api/events` with missing required fields, an invalid date, or an unknown extra field → returns **`400 Bad Request`**.
   - Send `GET /api/events/example?page=hello` → returns **`400 Bad Request`** (`ParseIntPipe`).
   - Send `GET /api/events/example?page=2` → returns **`200 OK`** with `{"page": 2, ...}`.