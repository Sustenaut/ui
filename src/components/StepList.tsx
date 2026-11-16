import type { ReactNode } from "react";
import { cn } from "../cn";

export type StepItem = {
  id: string;
  title: ReactNode;
  /** The line under the title: where this step stands, e.g. "kaja-studio linked". */
  summary?: ReactNode;
  status: "done" | "current" | "upcoming";
  /** Tags on the right of the title, e.g. the step's state. */
  tags?: ReactNode;
  /** Open when the page is drawn. Defaults to the current step. */
  open?: boolean;
  children?: ReactNode;
};

const ball = {
  done: "border-primary bg-primary text-on-primary",
  current: "border-primary bg-accent-soft text-ink",
  upcoming: "border-rule-strong bg-surface text-muted",
};

/** Numbered steps of a process, top to bottom, each a panel whose content opens and closes
 *  under its title. A line joins each number to the next. Built on `<details>`, so steps open
 *  and close without any script, with the keyboard too. */
export function StepList({
  steps,
  label = "Steps",
  onToggle,
}: {
  steps: StepItem[];
  label?: string;
  /** Told when a step is opened or closed, e.g. to remember it. */
  onToggle?: (id: string, open: boolean) => void;
}) {
  return (
    <ol aria-label={label} className="m-0 flex list-none flex-col p-0">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.id} aria-current={s.status === "current" ? "step" : undefined} className="flex gap-4">
            <div className="flex flex-col items-center" aria-hidden="true">
              <span
                className={cn(
                  "flex size-10 flex-none items-center justify-center rounded-full border-2 font-display text-lg font-extrabold",
                  ball[s.status],
                )}
              >
                {i + 1}
              </span>
              {!last && <span className="min-h-6 w-0.5 flex-1 bg-rule-strong" />}
            </div>
            <details
              open={s.open ?? s.status === "current"}
              onToggle={onToggle && ((e) => onToggle(s.id, (e.currentTarget as HTMLDetailsElement).open))}
              className={cn("group min-w-0 flex-1 rounded-panel border border-rule bg-surface", !last && "mb-5")}
            >
              <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
                <span className="flex flex-col">
                  <span className="font-display text-xl font-extrabold">{s.title}</span>
                  {s.summary && <span className="text-sm text-muted">{s.summary}</span>}
                </span>
                {s.tags && <span className="flex flex-wrap items-center gap-2">{s.tags}</span>}
              </summary>
              {s.children && (
                <div className="flex flex-col gap-4 border-t border-rule px-5 pt-4 pb-5">{s.children}</div>
              )}
            </details>
          </li>
        );
      })}
    </ol>
  );
}
