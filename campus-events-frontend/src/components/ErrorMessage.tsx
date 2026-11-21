export default function ErrorMessage({
  title = "We couldn't load this page",
  message,
  children,
}: {
  title?: string;
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="notice notice-error" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
      {children}
    </div>
  );
}
