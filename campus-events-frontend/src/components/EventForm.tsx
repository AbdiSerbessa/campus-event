"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, getErrorMessage } from "@/services/eventService";

interface FormState {
  title: string;
  description: string;
  location: string;
  eventDate: string; // value of <input type="datetime-local">
  category: string;
  isPublished: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  title: "",
  description: "",
  location: "",
  eventDate: "",
  category: "",
  isPublished: false,
};

const CATEGORY_SUGGESTIONS = ["technology", "workshop", "sports", "cultural", "academic", "career"];

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.title.trim()) errors.title = "Enter a title for the event.";
  if (!form.description.trim()) errors.description = "Enter a description of the event.";
  if (!form.location.trim()) errors.location = "Enter where the event takes place.";
  if (!form.eventDate) errors.eventDate = "Choose the event date and time.";
  else if (Number.isNaN(new Date(form.eventDate).getTime()))
    errors.eventDate = "Enter a valid date and time.";
  if (!form.category.trim()) errors.category = "Choose or enter a category.";
  return errors;
}

export default function EventForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ id: string; title: string } | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // 1. stop the browser's own form submission
    setApiError(null);
    setCreated(null);

    const found = validate(form); // 2. validate required fields
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      // 3. POST to the NestJS API using fetch()
      const event = await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        eventDate: new Date(form.eventDate).toISOString(),
        category: form.category.trim(),
        isPublished: form.isPublished,
      });

      // 4. success message + clear the form
      setCreated({ id: event.id, title: event.title });
      setForm(EMPTY);
      // 5. make sure the event list shows the new event, then open its page
      router.refresh();
      if (event.id) {
        redirectTimer.current = setTimeout(() => router.push(`/events/${event.id}`), 2000);
      }
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const errorProps = (key: keyof FormState) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });

  const FieldError = ({ name }: { name: keyof FormState }) =>
    errors[name] ? (
      <p className="field-error" id={`${name}-error`}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {created && (
        <div className="notice notice-success" role="status">
          <strong>Event created</strong>
          <p>
            &ldquo;{created.title}&rdquo; was saved. Opening the event page...{" "}
            <Link href={`/events/${created.id}`}>Go now</Link>
          </p>
        </div>
      )}

      {apiError && (
        <div className="notice notice-error" role="alert">
          <strong>The event could not be created</strong>
          <p>{apiError}</p>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="notice notice-error" role="alert">
          <strong>Fix the highlighted fields</strong>
          <p>All fields except publication status are required.</p>
        </div>
      )}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" type="text" value={form.title}
          onChange={(e) => update("title", e.target.value)} {...errorProps("title")} />
        <FieldError name="title" />
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" rows={5} value={form.description}
          onChange={(e) => update("description", e.target.value)} {...errorProps("description")} />
        <FieldError name="description" />
      </div>

      <div className="form-row">
        <div className="field">
          <label htmlFor="location">Location</label>
          <input id="location" type="text" value={form.location}
            onChange={(e) => update("location", e.target.value)} {...errorProps("location")} />
          <FieldError name="location" />
        </div>

        <div className="field">
          <label htmlFor="eventDate">Event date and time</label>
          <input id="eventDate" type="datetime-local" value={form.eventDate}
            onChange={(e) => update("eventDate", e.target.value)} {...errorProps("eventDate")} />
          <FieldError name="eventDate" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <input id="category" type="text" list="form-category-options" value={form.category}
          onChange={(e) => update("category", e.target.value)} {...errorProps("category")} />
        <datalist id="form-category-options">
          {CATEGORY_SUGGESTIONS.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <FieldError name="category" />
      </div>

      <div className="checkbox-field">
        <input id="isPublished" type="checkbox" checked={form.isPublished}
          onChange={(e) => update("isPublished", e.target.checked)} />
        <label htmlFor="isPublished">Publish this event</label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? "Creating event..." : "Create event"}
      </button>
    </form>
  );
}
