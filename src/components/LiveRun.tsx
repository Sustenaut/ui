import { useState, type ReactNode } from "react";
import { cn } from "../cn";
import { Button } from "./basics";

// The convergence engine's live run page: a run's header and actions, each need as a row of a table,
// the switch that sets what a need should do, its state machine as a strip, the run's journal, and the
// form that cancels a need that must finish. Presentation only: the page holds the run and says what
// each action does.

/** What a need should do in a fulfil run. */
export type NeedMode = "check" | "fulfil";

/** Check or Fulfil for one need, as a segmented pair of radio buttons. Its legend names the need for
 *  a screen reader. `disabled` once the run's choices are frozen (on approve). A need of grade human
 *  has no switch: the page shows none. */
export function ModeSwitch({
  name,
  value,
  onChange,
  disabled,
  labels = { check: "Check", fulfil: "Fulfil" },
  legend,
  hint,
}: {
  /** The need's name, also the radio group's name. */
  name: string;
  value: NeedMode;
  onChange?: (mode: NeedMode) => void;
  disabled?: boolean;
  labels?: Record<NeedMode, string>;
  /** Read out for the group, for translation; the need's name by default. */
  legend?: string;
  /** A line under the switch, e.g. "You changed this from Fulfil". */
  hint?: ReactNode;
}) {
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0" disabled={disabled}>
      <legend className="sr-only">{legend ?? name}</legend>
      <div className="inline-flex self-start overflow-hidden rounded-control border border-rule-strong">
        {(["check", "fulfil"] as const).map((mode) => (
          <label
            key={mode}
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 px-3.5 text-sm",
              disabled ? "cursor-default" : "cursor-pointer",
              value === mode ? "bg-primary font-bold text-on-primary" : "bg-surface text-ink",
              disabled && "opacity-70",
            )}
          >
            <input
              type="radio"
              name={`mode-${name}`}
              value={mode}
              checked={value === mode}
              disabled={disabled}
              onChange={() => onChange?.(mode)}
              className="m-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
            {labels[mode]}
          </label>
        ))}
      </div>
      {hint && <span className="text-xs text-warn">{hint}</span>}
    </fieldset>
  );
}

/** Where a need is. */
export type NeedState =
  "ok" | "missing" | "drift" | "fulfilling" | "finishing" | "done" | "stopped" | "failed" | "blocked";

const stateTone: Record<NeedState, string> = {
  ok: "bg-accent-soft text-primary",
  done: "bg-accent-soft text-primary",
  missing: "bg-bad-soft text-bad",
  failed: "bg-bad-soft text-bad",
  drift: "bg-warn-soft text-warn",
  fulfilling: "bg-sunken text-ink",
  finishing: "bg-sunken text-ink",
  stopped: "bg-sunken text-muted",
  blocked: "bg-sunken text-muted",
};

/** A need's state, as a badge. */
export function StateBadge({ state, label }: { state: NeedState; label?: string }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-sm font-bold", stateTone[state])}>
      {label ?? state}
    </span>
  );
}

/** How a Stop treats a need: one not started waits and never starts; signal ends it; shorten cuts its
 *  time budget; continue lets it run to its end. */
export type StopClass = "waiting" | "signal" | "shorten" | "continue";

/** A need's stop class, as a label; continue in the warn colour. */
export function StopLabel({ stop, label }: { stop: StopClass; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md border px-2 py-0.5 text-xs",
        stop === "continue" ? "border-warn font-bold text-warn" : "border-rule text-muted",
      )}
    >
      {label ?? stop}
    </span>
  );
}

/** A table of a run's needs: its headings, then a NeedRow per need. Scrolls sideways in its box on a
 *  narrow screen. */
export function NeedTable({
  caption,
  headings,
  children,
}: {
  caption: string;
  headings: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-panel border border-rule bg-surface">
      <table className="w-full min-w-[60rem] border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-left text-xs tracking-wide text-muted uppercase">
            {headings.map((h) => (
              <th key={h} scope="col" className="px-3 py-3.5 font-bold first:pl-6 last:pr-6">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** One need of a run, as a row of a NeedTable: its name and type, its grade, what it should do (a
 *  ModeSwitch, or the page's text, in `mode`), its machine (a MachineStrip, when the page shows one),
 *  its state with the time it has been in it, its last result, and how a Stop treats it. `children`
 *  go under the result, e.g. a ConfirmByName. `emphasis` marks a need a person must watch. */
export function NeedRow({
  name,
  type,
  grade,
  mode,
  machine,
  state,
  since,
  note,
  result,
  stop,
  emphasis,
  children,
  stateLabel,
  stopLabel,
}: {
  name: string;
  type: string;
  grade: string;
  mode?: ReactNode;
  machine?: ReactNode;
  state: NeedState;
  /** The time in this state, e.g. "1 min 18 s". */
  since?: string;
  /** A line under the state, e.g. "Runs to its end". */
  note?: ReactNode;
  result?: ReactNode;
  stop?: StopClass;
  emphasis?: boolean;
  children?: ReactNode;
  /** The state's and the stop class's words, for translation; their names by default. */
  stateLabel?: string;
  stopLabel?: string;
}) {
  const cell = "px-3 py-4 align-top";
  return (
    <tr className={cn("border-t border-rule", emphasis && "bg-warn-soft")}>
      <th scope="row" className={cn(cell, "pl-6 text-left font-normal")}>
        <span className="block font-bold">{name}</span>{" "}
        <span className="block font-mono text-xs text-muted">{type}</span>
      </th>
      <td className={cell}>{grade}</td>
      {mode !== undefined && <td className={cell}>{mode}</td>}
      {machine !== undefined && <td className={cell}>{machine}</td>}
      <td className={cell}>
        <span className="inline-flex flex-wrap items-center gap-2">
          <StateBadge state={state} label={stateLabel} />
          {since && <span className="text-xs text-muted">{since}</span>}
        </span>
        {note && <span className="mt-1.5 block text-sm font-bold text-warn">{note}</span>}
      </td>
      <td className={cn(cell, "text-muted")}>
        {result}
        {children}
      </td>
      {stop && (
        <td className={cn(cell, "pr-6")}>
          <StopLabel stop={stop} label={stopLabel} />
        </td>
      )}
    </tr>
  );
}

/** One need's state machine as a row of its states, the current one filled: in ink while it works,
 *  in the primary colour once it is done, muted once it is stopped. */
export function MachineStrip({
  need,
  states,
  current,
  label,
}: {
  need: string;
  states: string[];
  current: string;
  /** Read out for the strip, for translation; "{need}'s machine" by default. */
  label?: string;
}) {
  const fill =
    current === "done" || current === "ready"
      ? "bg-primary text-on-primary"
      : current === "stopped" || current === "blocked"
        ? "bg-muted text-on-primary"
        : "bg-ink text-on-primary";
  return (
    <ol aria-label={label ?? `${need}'s machine`} className="m-0 flex list-none flex-wrap gap-1 p-0 text-xs">
      {states.map((s) => (
        <li
          key={s}
          aria-current={s === current ? "step" : undefined}
          className={cn(
            "rounded px-1.5 py-0.5",
            s === current ? cn("font-bold", fill) : "border border-rule text-muted",
          )}
        >
          {s}
        </li>
      ))}
    </ol>
  );
}

/** One line of a run's journal: when, which need (or the run), the move, and who made it. */
export type JournalEntry = {
  at: string;
  need: string;
  from?: string;
  to?: string;
  /** What happened, when it is not a move from one state to another. */
  text?: string;
  by?: string;
};

/** A run's journal, newest last, in monospace: time · need · from → to · actor. */
export function Journal({ entries, title = "Journal" }: { entries: JournalEntry[]; title?: string }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-panel border border-rule bg-surface px-6 py-5">
      <h2 className="m-0 font-display text-base font-extrabold">{title}</h2>
      <ol aria-label={title} className="m-0 flex list-none flex-col gap-2 p-0 font-mono text-sm text-muted">
        {entries.map((e, i) => (
          <li key={i}>
            {[e.at, e.need, e.from && e.to ? `${e.from} → ${e.to}` : (e.text ?? e.to ?? ""), e.by]
              .filter(Boolean)
              .join(" · ")}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** "Cancel anyway" for a need that must run to its end: a warning, and a field where the person types
 *  the need's name. The button stays disabled until the text equals the name, and Enter submits
 *  nothing: only the button cancels. */
export function ConfirmByName({
  name,
  warning,
  onConfirm,
  summary = "Cancel anyway",
  prompt,
  action,
}: {
  name: string;
  warning: ReactNode;
  onConfirm: (name: string) => void;
  summary?: string;
  /** The field's label; "Type {name} to cancel it" by default. */
  prompt?: ReactNode;
  /** The button; "Cancel {name}" by default. */
  action?: string;
}) {
  const [typed, setTyped] = useState("");
  const id = `confirm-${name}`;
  return (
    <details className="mt-3 rounded-control border border-warn bg-surface px-3.5 py-3">
      <summary className="flex min-h-11 cursor-pointer items-center font-bold text-warn">{summary}</summary>
      <form className="mt-2.5 flex flex-col gap-2.5" onSubmit={(e) => e.preventDefault()}>
        <p className="m-0 text-sm text-muted">{warning}</p>
        <label htmlFor={id} className="text-sm text-muted">
          {prompt ?? (
            <>
              Type <b className="font-mono">{name}</b> to cancel it
            </>
          )}
        </label>
        <input
          id={id}
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className="min-h-11 rounded-md border border-rule-strong bg-surface px-2.5 font-mono text-sm text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <Button
          variant="warning"
          className="self-start border-0 bg-bad-soft text-bad"
          disabled={typed !== name}
          onClick={() => onConfirm(name)}
        >
          {action ?? `Cancel ${name}`}
        </Button>
      </form>
    </details>
  );
}

/** An action of the run's header. */
export type RunAction = { label: string; onClick: () => void; disabled?: boolean };

/** A run's header: its title (the repository), unit and mode, its state as a badge, its links (the
 *  GitHub run), other facts, an explanatory line, and at most one primary and one secondary action
 *  (Approve, Stop). */
export function RunHeader({
  title,
  unit,
  mode,
  state,
  links = [],
  facts = [],
  explain,
  primary,
  secondary,
  unitLabel = "unit",
}: {
  title: string;
  unit: string;
  mode: string;
  state: { label: string; tone?: "neutral" | "success" | "warning" | "danger" };
  links?: { label: string; href: string }[];
  facts?: ReactNode[];
  explain?: ReactNode;
  primary?: RunAction;
  secondary?: RunAction;
  unitLabel?: string;
}) {
  const tone = {
    neutral: "bg-sunken text-ink",
    success: "bg-accent-soft text-primary",
    warning: "bg-warn-soft text-warn",
    danger: "bg-bad-soft text-bad",
  }[state.tone ?? "neutral"];
  return (
    <section className="flex flex-col gap-4 rounded-panel border border-rule bg-surface p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="m-0 font-display text-3xl font-extrabold">{title}</h1>
        <span className="text-muted">
          {unitLabel} <b className="text-ink">{unit}</b> · {mode}
        </span>
        <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold", tone)}>
          {state.label}
        </span>
      </div>
      {(links.length > 0 || facts.length > 0) && (
        <ul className="m-0 flex list-none flex-wrap gap-5 p-0 text-sm text-muted">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-link">
                {l.label}
              </a>
            </li>
          ))}
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      )}
      {(explain || primary || secondary) && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
          {explain ? <p className="m-0 max-w-prose">{explain}</p> : <span />}
          <div className="flex flex-wrap gap-3">
            {secondary && (
              <Button onClick={secondary.onClick} disabled={secondary.disabled}>
                {secondary.label}
              </Button>
            )}
            {primary && (
              <Button variant="primary" onClick={primary.onClick} disabled={primary.disabled}>
                {primary.label}
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
