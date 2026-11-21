import { Suspense } from "react";
import type { EventQuery, PaginatedEvents } from "@/types/event";
import { getErrorMessage, getEvents } from "@/services/eventService";
import ErrorMessage from "@/components/ErrorMessage";
import EventFilters from "@/components/EventFilters";
import EventsExplorer from "@/components/EventsExplorer";
import Pagination from "@/components/Pagination";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const filterParams = {
    category: first(sp.category),
    location: first(sp.location),
    isPublished: first(sp.isPublished),
    sortBy: first(sp.sortBy),
    order: first(sp.order),
    limit: first(sp.limit),
  };
  const query: EventQuery = { ...filterParams, page: first(sp.page) };

  let data: PaginatedEvents | null = null;
  let error: string | null = null;

  try {
    data = await getEvents(query);
  } catch (e) {
    error = getErrorMessage(e);
  }

  return (
    <>
      <h1>All events</h1>

      <Suspense fallback={null}>
        <EventFilters />
      </Suspense>

      {error || !data ? (
        <ErrorMessage title="Events are unavailable" message={error ?? "No data was returned."} />
      ) : (
        <>
          <EventsExplorer events={data.items} />
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            total={data.total}
            params={filterParams}
          />
        </>
      )}
    </>
  );
}
