import { useId, type ReactElement, type ReactNode } from "react";
import { cloneElement } from "react";
import { cx } from "./basics";

/** A group of related inputs with a heading (a fieldset with its legend). */
export function FormSection({ legend, hint, children }: { legend: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="su-form-section">
      <legend className="su-form-section__legend">{legend}</legend>
      {hint && <p className="su-form-section__hint">{hint}</p>}
      {children}
    </fieldset>
  );
}

/** One labelled input. Pass the input element as the child; the label, hint and error are wired to it. */
export function Field({ label, hint, error, children }: {
  label: ReactNode; hint?: ReactNode; error?: ReactNode;
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="su-field">
      <label className="su-field__label" htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id, "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined, "aria-invalid": error ? true : undefined,
      })}
      {hint && <span className="su-field__hint" id={hintId}>{hint}</span>}
      {error && <span className="su-field__error" id={errorId}>{error}</span>}
    </div>
  );
}

export type Choice<V extends string> = {
  value: V;
  label: ReactNode;
  tone?: "normal" | "warning";
  /** A choice that stands apart from the others, e.g. "postpone". */
  dashed?: boolean;
  disabled?: boolean;
};

/** Pick one of a few options shown as large buttons (a radio group), e.g. hours or a vote. */
export function ChoiceGroup<V extends string>({ label, choices, value, onChange, size = "normal" }: {
  label: string; choices: Choice<V>[]; value: V | null; onChange: (v: V) => void; size?: "normal" | "large";
}) {
  return (
    <div className="su-choices" role="radiogroup" aria-label={label}>
      {choices.map((c) => (
        <button key={c.value} type="button" role="radio" aria-checked={value === c.value} disabled={c.disabled}
                className={cx("su-choice", size === "large" && "su-choice--large", c.tone === "warning" && "su-choice--warning",
                              c.dashed && "su-choice--dashed")}
                onClick={() => onChange(c.value)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}
