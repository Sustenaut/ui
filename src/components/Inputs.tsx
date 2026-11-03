import { useId, type ReactNode } from "react";
import { cn } from "../cn";
import { Field, FieldError, inputClass, type Choice } from "./Form";

/** A labelled group of inputs (a fieldset), with the group's hint and error under it. */
export function FieldGroup({
  label,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0" aria-describedby={describedBy}>
      <legend className="mb-1.5 p-0 font-bold">{label}</legend>
      {children}
      {hint && (
        <span className="text-sm text-muted" id={hintId}>
          {hint}
        </span>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </fieldset>
  );
}

/** The number in a number input, or undefined while it is empty or not a number. */
function numberOf(text: string): number | undefined {
  if (text.trim() === "") return undefined;
  const n = Number(text);
  return Number.isFinite(n) ? n : undefined;
}

type NumberProps = {
  label: ReactNode;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  hint?: ReactNode;
  error?: ReactNode;
  min?: number;
  max?: number;
  /** The step between allowed values; 1 for whole numbers. */
  step?: number;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
};

/** One labelled number; an empty input reports undefined. */
export function NumberField({ label, value, onChange, hint, error, step, ...input }: NumberProps) {
  return (
    <Field label={label} hint={hint} error={error}>
      <input
        type="number"
        inputMode={step !== undefined && Number.isInteger(step) ? "numeric" : "decimal"}
        step={step ?? "any"}
        value={value ?? ""}
        onChange={(e) => onChange(numberOf(e.target.value))}
        {...input}
      />
    </Field>
  );
}

/** A number between a minimum and a maximum: a slider and a number input showing the same value. */
export function RangeField({
  label,
  value,
  onChange,
  hint,
  error,
  min,
  max,
  step = 1,
  disabled,
  required,
}: Omit<NumberProps, "min" | "max" | "placeholder"> & { min: number; max: number }) {
  const id = useId();
  const labelId = `${id}-label`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const shared = {
    min,
    max,
    step,
    disabled,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
  };
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-bold" id={labelId} htmlFor={id}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          {...shared}
          id={id}
          type="range"
          value={value ?? min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="min-h-11 min-w-0 flex-1 accent-primary focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-accent"
        />
        <input
          {...shared}
          type="number"
          aria-labelledby={labelId}
          required={required}
          value={value ?? ""}
          onChange={(e) => onChange(numberOf(e.target.value))}
          className={cn(inputClass, "w-24 shrink-0")}
        />
      </div>
      {hint && (
        <span className="text-sm text-muted" id={hintId}>
          {hint}
        </span>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

/** A start and an end date (ISO "YYYY-MM-DD" strings), side by side, stacked on a phone. */
export type DateRange = { start?: string; end?: string };

export function DateRangeField({
  label,
  value,
  onChange,
  hint,
  error,
  startLabel = "From",
  endLabel = "To",
  disabled,
  required,
}: {
  label: ReactNode;
  value: DateRange | undefined;
  onChange: (value: DateRange) => void;
  hint?: ReactNode;
  error?: ReactNode;
  startLabel?: ReactNode;
  endLabel?: ReactNode;
  disabled?: boolean;
  required?: boolean;
}) {
  const range = value ?? {};
  const set = (key: keyof DateRange, text: string) => onChange({ ...range, [key]: text === "" ? undefined : text });
  return (
    <FieldGroup label={label} hint={hint} error={error}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <Field label={startLabel}>
            <input
              type="date"
              value={range.start ?? ""}
              max={range.end}
              disabled={disabled}
              required={required}
              onChange={(e) => set("start", e.target.value)}
            />
          </Field>
        </div>
        <div className="min-w-0 flex-1">
          <Field label={endLabel}>
            <input
              type="date"
              value={range.end ?? ""}
              min={range.start}
              disabled={disabled}
              required={required}
              onChange={(e) => set("end", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </FieldGroup>
  );
}

/** Pick any number of a few options shown as large buttons, each one a checkbox. */
export function MultiChoiceField<V extends string>({
  label,
  choices,
  value,
  onChange,
  hint,
  error,
  disabled,
}: {
  label: ReactNode;
  choices: Choice<V>[];
  value: V[] | undefined;
  onChange: (value: V[]) => void;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
}) {
  const picked = value ?? [];
  const toggle = (v: V) =>
    onChange(
      picked.includes(v)
        ? picked.filter((p) => p !== v)
        : choices.map((c) => c.value).filter((c) => c === v || picked.includes(c)),
    );
  return (
    <FieldGroup label={label} hint={hint} error={error}>
      <div className="flex flex-wrap gap-2.5">
        {choices.map((c) => {
          const on = picked.includes(c.value);
          return (
            <button
              key={c.value}
              type="button"
              role="checkbox"
              aria-checked={on}
              disabled={disabled || c.disabled}
              onClick={() => toggle(c.value)}
              className={cn(
                "min-h-12 min-w-16 cursor-pointer rounded-control border bg-surface px-3.5 font-extrabold",
                c.tone === "warning" ? "text-warn" : "text-ink",
                c.dashed && "border-dashed",
                on ? "border-3 border-primary bg-accent-soft" : "border-rule-strong",
                "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-50",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </FieldGroup>
  );
}

/** A yes-or-no answer: a checkbox with its label beside it. */
export function CheckboxField({
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
}: {
  label: ReactNode;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={value ?? false}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : undefined}
          className="size-5 shrink-0 accent-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        {label}
      </label>
      {hint && (
        <span className="text-sm text-muted" id={hintId}>
          {hint}
        </span>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
