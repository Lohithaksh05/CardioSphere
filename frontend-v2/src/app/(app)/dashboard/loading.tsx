export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-56 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl border" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 bg-gray-100 rounded-xl border" />
        <div className="h-64 bg-gray-100 rounded-xl border" />
      </div>
    </div>
  );
}
