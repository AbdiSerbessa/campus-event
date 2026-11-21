import EventForm from "@/components/EventForm";

export const metadata = { title: "Create event | Campus Events" };

export default function CreateEventPage() {
  return (
    <>
      <h1>Create an event</h1>
      <p className="muted">Fill in the details below. The event is saved through the Campus Events API.</p>
      <EventForm />
    </>
  );
}
