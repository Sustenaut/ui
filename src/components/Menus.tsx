import type { ReactNode } from "react";
import { cn } from "../cn";

export type MenuItem = {
  key: string;
  label: ReactNode;
  /** A second line, e.g. what an account type offers. */
  note?: ReactNode;
  /** A link, for pages without a script; otherwise a button calling `onSelect`. */
  href?: string;
  onSelect?: () => void;
  /** Drawn in the danger colour, e.g. "Not me: sign out and block". */
  danger?: boolean;
};

const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent";

/** A button that opens a list of choices under it, e.g. "+ Link account" with the kinds of
 *  account. Built on `<details>`, so it opens with a click, Enter or Space and needs no script;
 *  the list is a menu of real links or buttons. `trigger` is what the button shows, `label` its
 *  name when that is only an icon. */
export function MenuButton({
  trigger,
  label,
  items,
  variant = "secondary",
  align = "end",
}: {
  trigger: ReactNode;
  label?: string;
  items: MenuItem[];
  variant?: "primary" | "secondary" | "icon";
  align?: "start" | "end";
}) {
  return (
    <details className="relative">
      <summary
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex cursor-pointer list-none items-center justify-center gap-1.5 rounded-control border font-bold [&::-webkit-details-marker]:hidden",
          variant === "primary" && "min-h-11 border-primary bg-primary px-3.5 text-on-primary",
          variant === "secondary" && "min-h-11 border-rule-strong bg-surface px-3.5 text-ink",
          variant === "icon" && "size-11 border-transparent bg-transparent text-ink hover:bg-sunken",
          focus,
        )}
      >
        {trigger}
      </summary>
      <ul
        role="menu"
        className={cn(
          "absolute top-full z-10 mt-1.5 flex min-w-56 list-none flex-col rounded-control border border-rule-strong bg-surface p-1.5 shadow-panel",
          align === "end" ? "right-0" : "left-0",
        )}
      >
        {items.map((i) => {
          const cls = cn(
            "flex min-h-11 w-full cursor-pointer flex-col items-start justify-center rounded-lg border-0 bg-transparent px-2.5 py-1.5 text-left font-[inherit] text-[inherit] no-underline hover:bg-sunken",
            i.danger ? "text-bad" : "text-ink",
            focus,
          );
          const body = (
            <>
              <span className="font-semibold">{i.label}</span>
              {i.note && <span className="text-xs text-muted">{i.note}</span>}
            </>
          );
          return (
            <li key={i.key} role="none">
              {i.href ? (
                <a role="menuitem" href={i.href} className={cls}>
                  {body}
                </a>
              ) : (
                <button role="menuitem" type="button" onClick={i.onSelect} className={cls}>
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

const icons = {
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  flag: <path d="M5 21V4M5 4h11l-2 4 2 4H5" />,
};

export function ActionIcon({ name }: { name: keyof typeof icons | "more" }) {
  if (name === "more")
    return (
      <svg className="size-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    );
  return (
    <svg
      className="size-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

/** A table row's actions: one icon button for the usual action (a bin to remove, a flag for
 *  "Not me"), named by its label, and a three-dot menu for the rest. A row with no safe usual
 *  action gives only the menu, and may show a word instead (e.g. "Always on"). */
export function RowActions({
  usual,
  more = [],
  note,
  moreLabel = "More actions",
}: {
  usual?: { label: string; icon: "trash" | "flag"; onSelect?: () => void; danger?: boolean };
  more?: MenuItem[];
  note?: ReactNode;
  moreLabel?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {note && <span className="mr-1 text-muted">{note}</span>}
      {usual && (
        <button
          type="button"
          aria-label={usual.label}
          title={usual.label}
          onClick={usual.onSelect}
          className={cn(
            "inline-flex size-11 cursor-pointer items-center justify-center rounded-control border-0 bg-transparent hover:bg-sunken",
            usual.danger ? "text-bad" : "text-ink",
            focus,
          )}
        >
          <ActionIcon name={usual.icon} />
        </button>
      )}
      {more.length > 0 && (
        <MenuButton trigger={<ActionIcon name="more" />} label={moreLabel} items={more} variant="icon" />
      )}
    </div>
  );
}

/** A linked account as a small chip: a dot, its name and a short id. Its full details show on
 *  hover and when it has the keyboard's focus, and are read out with it. */
export function AccountChip({
  id,
  name,
  short,
  detail,
}: {
  id: string;
  name: ReactNode;
  short?: ReactNode;
  detail?: ReactNode;
}) {
  const tip = `${id}-detail`;
  return (
    <span
      tabIndex={0}
      aria-describedby={detail ? tip : undefined}
      className={cn(
        "group relative inline-flex items-center gap-1.5 rounded-full border border-primary bg-accent-soft px-3 py-1 text-sm",
        focus,
      )}
    >
      <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
      <strong>{name}</strong>
      {short && <span className="text-muted">{short}</span>}
      {detail && (
        <span
          id={tip}
          role="tooltip"
          className="invisible absolute top-full left-0 z-10 mt-1.5 w-max max-w-80 rounded-control border border-rule-strong bg-surface px-3 py-2 text-sm text-ink shadow-panel group-hover:visible group-focus:visible"
        >
          {detail}
        </span>
      )}
    </span>
  );
}
