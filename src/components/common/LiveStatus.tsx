/** Announces drag pickup, move, and drop to assistive tech. */
export function LiveStatus({ message }: { message: string }) {
  return (
    <div className="sr-only" aria-live="assertive" aria-atomic="true">
      {message}
    </div>
  )
}
