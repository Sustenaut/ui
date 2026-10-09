import { cloneElement, useId, type ReactElement, type ReactNode } from "react";
import { cn } from "../cn";

/** The look of a text input, text area or select; Field gives it to its child. */
export const inputClass =
  "w-full rounded-control border border-rule-strong bg-ground px-3 py-2.5 text-ink focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-accent aria-invalid:border-bad";

/** A group of related inputs with a heading (a fieldset with its legend). */
export function FormSection({ legend, hint, children }: { legend: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
      <legend className="mb-1 p-0 font-bold">{legend}</legend>
      {hint && <p className="-mt-1.5 mb-0 text-sm text-muted">{hint}</p>}
      {children}
    </fieldset>
  );
}

/** One labelled input. Pass the input element as the child; its label, hint, error and look are wired to it. */
export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactElement<{ id?: string; className?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-bold" htmlFor={id}>
        {label}
      </label>
      {cloneElement(children, {
        id,
        className: cn(inputClass, children.props.className),
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <span className="text-sm text-muted" id={hintId}>
          {hint}
        </span>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span id={id} role="alert" className="text-sm font-bold text-bad">
      {children}
    </span>
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
export function ChoiceGroup<V extends string>({
  label,
  choices,
  value,
  onChange,
  size = "normal",
}: {
  label: string;
  choices: Choice<V>[];
  value: V | null;
  onChange: (v: V) => void;
  size?: "normal" | "large";
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2.5">
      {choices.map((c) => {
        const picked = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={picked}
            disabled={c.disabled}
            onClick={() => onChange(c.value)}
            className={cn(
              "cursor-pointer rounded-control border bg-surface px-3.5 font-extrabold",
              size === "large" ? "min-h-24 min-w-18 rounded-xl font-display text-2xl" : "min-h-12 min-w-16",
              c.tone === "warning" ? "text-warn" : "text-ink",
              c.dashed && "border-dashed",
              picked ? "border-3 border-primary bg-accent-soft" : "border-rule-strong",
              "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-50",
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
