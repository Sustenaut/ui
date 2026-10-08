import { cx } from "./basics";

export type Step = {
  id: string;
  label: string;
  /** The line under the label, e.g. "2 of 3 issues". */
  detail?: string;
  status: "done" | "current" | "upcoming";
};

/** Steps of a process as circles, left to right, each with its label and a detail line below.
 *  With `onSelect`, steps that aren't upcoming can be clicked to go back to them. */
export function Stepper({ steps, label = "Steps", onSelect }: {
  steps: Step[]; label?: string; onSelect?: (id: string) => void;
}) {
  return (
    <ol className="su-stepper" aria-label={label}>
      {steps.map((s, i) => {
        const inner = (
          <>
            <span className="su-step__dot" aria-hidden="true">
              {s.status === "done" ? <Tick /> : i + 1}
            </span>
            <span className="su-step__label">{s.label}</span>
            {s.detail && <span className="su-step__detail">{s.detail}</span>}
          </>
        );
        const clickable = onSelect && s.status !== "upcoming";
        return (
          <li key={s.id} className={cx("su-step", `su-step--${s.status}`)}
              aria-current={s.status === "current" ? "step" : undefined}>
            {clickable
              ? <button className="su-step__button" onClick={() => onSelect!(s.id)}
                        aria-label={`${s.label}${s.detail ? `, ${s.detail}` : ""}`}>{inner}</button>
              : inner}
          </li>
        );
      })}
    </ol>
  );
}

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.5 L5 9 L10 3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
