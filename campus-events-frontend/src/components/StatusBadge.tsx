export default function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={`badge ${isPublished ? "badge-published" : "badge-draft"}`}>
      {isPublished ? "Published" : "Unpublished"}
    </span>
  );
}
