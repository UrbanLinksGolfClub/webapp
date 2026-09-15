export function SgtNotConfigured() {
  return (
    <div className="max-w-md rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-medium">Simulator Golf Tour isn&apos;t connected yet.</p>
      <p className="mt-1">
        An admin needs to set <code>SGT_CLUB_URL</code>,{" "}
        <code>SGT_ADMIN_USERNAME</code>, and <code>SGT_ADMIN_PASSWORD</code> in
        the server environment to pull league data.
      </p>
    </div>
  );
}

export function SgtErrorState() {
  return (
    <div className="max-w-md rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
      Couldn&apos;t load Simulator Golf Tour data right now. Please try again
      shortly.
    </div>
  );
}
