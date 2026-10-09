import type { ReactNode } from "react";
import { cn } from "../cn";

/** An amount out of a total, e.g. hours planned out of hours available. `adding` previews an
 *  amount about to be added, in a lighter colour; going over the total is shown, not prevented. */
export function Meter({
  label,
  used,
  total,
  adding = 0,
  unit = "",
  note,
}: {
  label: ReactNode;
  used: number;
  total: number;
  adding?: number;
  unit?: string;
  note?: ReactNode;
}) {
  const after = used + adding;
  const over = total > 0 ? after > total : after > 0;
  const scale = Math.max(total, after, 1);
  const pct = (n: number) => `${(100 * n) / scale}%`;
  const fmt = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}${unit ? ` ${unit}` : ""}`;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between gap-4">
        <span className="font-bold">{label}</span>
        <span className="tabular-nums">
          {adding ? `${fmt(used)} → ${fmt(after)}` : fmt(used)} of {fmt(total)}
        </span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={after}
        aria-label={typeof label === "string" ? label : undefined}
        className="flex h-2.5 overflow-hidden rounded-full bg-sunken"
      >
        <span className={over ? "bg-warn" : "bg-primary"} style={{ width: pct(used) }} />
        {adding > 0 && <span className={over ? "bg-warn" : "bg-accent"} style={{ width: pct(adding) }} />}
      </div>
      {(note || over) && (
        <span className={cn("text-xs", over ? "font-bold text-warn" : "text-muted")}>
          {note ?? `${fmt(after - total)} over`}
        </span>
      )}
    </div>
  );
}
