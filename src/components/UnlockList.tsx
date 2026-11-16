import type { ReactNode } from "react";

export type Unlock = {
  key: string;
  /** What to do, e.g. "Add a second passkey for recovery". */
  todo: ReactNode;
  /** What it unlocks, e.g. "linking infrastructure". */
  unlocks: ReactNode;
  /** The way to do it, e.g. a link or a button. */
  action?: ReactNode;
};

/** What someone can do next and what each step unlocks, as cards side by side (stacked on a
 *  phone): the thing to do, "Unlocks: …" and an action. It shows only next steps and what they
 *  open up, never a level or a score. */
export function UnlockList({
  items,
  label = "Unlock more",
  text = { unlocks: "Unlocks:" },
}: {
  items: Unlock[];
  label?: string;
  /** The word before what each step unlocks, for translation. */
  text?: { unlocks: string };
}) {
  return (
    <ul aria-label={label} className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2">
      {items.map((i) => (
        <li key={i.key} className="flex flex-col gap-1 rounded-control border border-rule-strong bg-surface p-3">
          <strong>{i.todo}</strong>
          <span className="text-sm text-muted">
            {text.unlocks} {i.unlocks}
          </span>
          {i.action && <span className="text-sm font-semibold">{i.action}</span>}
        </li>
      ))}
    </ul>
  );
}
