import { cn } from "../cn";

export type Step = {
  id: string;
  label: string;
  /** The line under the label, e.g. "2 of 3 issues". */
  detail?: string;
  status: "done" | "current" | "upcoming";
};

const dot = {
  done: "border-accent bg-accent text-soil",
  current: "border-primary bg-surface text-primary",
  upcoming: "border-rule-strong bg-surface text-muted",
};

/** Steps of a process as circles, left to right, each with its label and a detail line below.
 *  With `onSelect`, steps that aren't upcoming can be clicked to go back to them. On a phone
 *  the steps stack. */
export function Stepper({
  steps,
  label = "Steps",
  onSelect,
}: {
  steps: Step[];
  label?: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <ol
      aria-label={label}
      className="m-0 grid list-none gap-2.5 rounded-panel border border-rule bg-surface px-6 py-5 sm:auto-cols-fr sm:grid-flow-col sm:gap-0"
    >
      {steps.map((s, i) => {
        const inner = (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-3 font-display text-lg font-extrabold",
                dot[s.status],
              )}
            >
              {s.status === "done" ? <Tick /> : i + 1}
            </span>
            <span className="flex flex-col sm:items-center">
              <span className="font-bold">{s.label}</span>
              {s.detail && (
                <span
                  className={cn("text-[0.82rem]", s.status === "current" ? "font-semibold text-primary" : "text-muted")}
                >
                  {s.detail}
                </span>
              )}
            </span>
          </>
        );
        const clickable = onSelect && s.status !== "upcoming";
        return (
          <li
            key={s.id}
            aria-current={s.status === "current" ? "step" : undefined}
            className="relative flex items-center gap-3 px-1 sm:flex-col sm:gap-1.5 sm:text-center"
          >
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-5 left-1/2 hidden h-[3px] w-full rounded-sm sm:block",
                  s.status === "done" ? "bg-accent" : "bg-rule",
                )}
              />
            )}
            {clickable ? (
              <button
                type="button"
                onClick={() => onSelect!(s.id)}
                aria-label={`${s.label}${s.detail ? `, ${s.detail}` : ""}`}
                className="contents cursor-pointer"
              >
                {inner}
              </button>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Tick() {
  return (
    <svg className="size-[18px]" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5 L5 9 L10 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
