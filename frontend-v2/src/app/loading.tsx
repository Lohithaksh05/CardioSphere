import { Heart } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Heart className="h-12 w-12 text-rose-500 animate-pulse" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
