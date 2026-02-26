export default function CommunityLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-40 bg-gray-100 rounded-xl border" />
      ))}
    </div>
  );
}
