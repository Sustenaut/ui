import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../cn";

export type Tab = { id: string; label: ReactNode; content: ReactNode };

/** Content in tabs: one panel at a time, picked from a row of tabs. The arrow keys, Home and End move between
 *  tabs. The page keeps which tab is open (`value`) and hears of a change (`onChange`). */
export function Tabs({
  label,
  tabs,
  value,
  onChange,
}: {
  /** What the tabs are about, for a screen reader. */
  label?: string;
  tabs: Tab[];
  value: string;
  onChange: (id: string) => void;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );
  const move = (e: KeyboardEvent) => {
    const last = tabs.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    const next = Object.hasOwn(targets, e.key) ? targets[e.key] : undefined;
    if (next === undefined) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };
  const open = tabs[current];
  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={move}
        className="flex gap-1 overflow-x-auto border-b border-rule"
      >
        {tabs.map((t, i) => {
          const selected = i === current;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={cn(
                "-mb-px min-h-11 cursor-pointer border-0 border-b-3 bg-transparent px-3.5 font-bold whitespace-nowrap",
                selected ? "border-primary text-ink" : "border-transparent text-muted hover:text-ink",
                "focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-accent",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      {open && (
        <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${current}`} tabIndex={0}>
          {open.content}
        </div>
      )}
    </div>
  );
}
