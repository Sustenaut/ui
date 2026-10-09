import { cn } from "../cn";

/** How many picked each option: a small bar chart, e.g. the spread of votes. */
export function Distribution({ label, items }: { label: string; items: { label: string; count: number }[] }) {
  const most = Math.max(1, ...items.map((i) => i.count));
  return (
    <figure aria-label={label} className="relative m-0 flex min-h-24 items-end gap-2.5">
      {items.map((i) => (
        <div key={i.label} className="flex min-w-14 flex-col items-center gap-1">
          {i.count > 0 && <span className="text-xs font-bold">{i.count}</span>}
          <span
            className={cn("min-h-1 w-10 rounded", i.count ? "bg-primary" : "bg-rule")}
            style={{ height: i.count ? `${(56 * i.count) / most}px` : undefined }}
          />
          <span className="text-sm">{i.label}</span>
        </div>
      ))}
      <figcaption className="sr-only">{items.map((i) => `${i.label}: ${i.count}`).join(", ")}</figcaption>
    </figure>
  );
}
