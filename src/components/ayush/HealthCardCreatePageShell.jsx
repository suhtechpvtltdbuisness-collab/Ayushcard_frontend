/**
 * Counteracts AdminLayout main padding; keeps a 1px even inset for rounded corners.
 */
export default function HealthCardCreatePageShell({ children }) {
  return (
    <div
      className="flex flex-1 min-h-0 h-full flex-col overflow-hidden p-px w-[calc(100%+1.5rem)] max-w-[calc(100%+1.5rem)] -m-3 sm:w-[calc(100%+3rem)] sm:max-w-[calc(100%+3rem)] sm:-m-6 lg:w-[calc(100%+4rem)] lg:max-w-[calc(100%+4rem)] lg:-m-8"
    >
      {children}
    </div>
  );
}
