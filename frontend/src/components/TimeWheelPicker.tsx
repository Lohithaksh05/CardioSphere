"use client";

import { useRef, useEffect, useCallback, useState } from "react";

// ---------- Wheel Column ----------
function WheelColumn({
  items,
  selected,
  onChange,
  width = 64,
}: {
  items: string[];
  selected: number;
  onChange: (idx: number) => void;
  width?: number;
}) {
  const ITEM_H = 40;
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Scroll to selected on mount and when selected changes externally
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = selected * ITEM_H;
  }, [selected]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isScrolling.current) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    if (idx !== selected && idx >= 0 && idx < items.length) {
      onChange(idx);
    }
  }, [items.length, onChange, selected]);

  const handleScrollEnd = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    isScrolling.current = true;
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    setTimeout(() => {
      isScrolling.current = false;
    }, 150);
    if (idx !== selected && idx >= 0 && idx < items.length) {
      onChange(idx);
    }
  }, [items.length, onChange, selected]);

  return (
    <div className="relative" style={{ width, height: ITEM_H * 3 }}>
      {/* highlight band */}
      <div
        className="absolute left-0 right-0 rounded-lg bg-purple-100 pointer-events-none z-0"
        style={{ top: ITEM_H, height: ITEM_H }}
      />
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory scrollbar-hide z-10"
        style={{ scrollSnapType: "y mandatory" }}
        onScroll={handleScroll}
        onMouseUp={handleScrollEnd}
        onTouchEnd={handleScrollEnd}
      >
        {/* top padding */}
        <div style={{ height: ITEM_H }} />
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-center cursor-pointer snap-center transition-all select-none ${
              i === selected
                ? "text-purple-700 font-bold text-xl"
                : "text-gray-400 text-base"
            }`}
            style={{ height: ITEM_H }}
            onClick={() => {
              onChange(i);
              containerRef.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" });
            }}
          >
            {item}
          </div>
        ))}
        {/* bottom padding */}
        <div style={{ height: ITEM_H }} />
      </div>
    </div>
  );
}

// ---------- helpers ----------
const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

function parseTime(str: string): [number, number] {
  const parts = str.split(":");
  return [parseInt(parts[0]) || 0, parseInt(parts[1]) || 0];
}

// ---------- TimeWheelPicker ----------
export default function TimeWheelPicker({
  value,
  onChange,
}: {
  value: string; // "HH:MM"
  onChange: (v: string) => void;
}) {
  const [h, m] = parseTime(value);

  return (
    <div className="flex items-center gap-1 p-2 rounded-xl border bg-white shadow-sm">
      <WheelColumn items={HOURS} selected={h} onChange={(i) => onChange(`${HOURS[i]}:${MINUTES[m]}`)} />
      <span className="text-2xl font-bold text-gray-400">:</span>
      <WheelColumn items={MINUTES} selected={m} onChange={(i) => onChange(`${HOURS[h]}:${MINUTES[i]}`)} />
    </div>
  );
}
