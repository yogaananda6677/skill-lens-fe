export function LoadingSpinner({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  }[size];
  return (
    <div role="status" className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-slate-400 ${sizeClass} ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}