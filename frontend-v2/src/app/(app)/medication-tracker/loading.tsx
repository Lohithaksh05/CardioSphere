export default function MedicationLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-52 bg-gray-200 rounded" />
          <div className="h-4 w-72 bg-gray-100 rounded mt-2" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl border" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-xl border" />
      ))}
    </div>
  );
}
