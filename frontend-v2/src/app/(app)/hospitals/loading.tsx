import { Heart } from "lucide-react";

export default function HospitalsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
          <Heart className="h-12 w-12 text-rose-500 relative" />
        </div>
        <p className="text-muted-foreground font-medium">Finding nearby hospitals…</p>
      </div>
    </div>
  );
}
