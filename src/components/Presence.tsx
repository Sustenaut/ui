import { useId } from "react";
import { cn } from "../cn";

export type PresenceGroup = {
  id: string;
  /** What these people are doing here, e.g. "Facilitator", "Voting", "Watching". */
  label: string;
  icon: "flag" | "compass" | "people" | "eye";
  people: string[];
  /** A role that leads right now: highlighted. */
  lead?: boolean;
};

/** Who is on a page right now: an icon and a count per group; hovering or focusing a group lists the names. */
export function Presence({ groups, label = "On this page now" }: { groups: PresenceGroup[]; label?: string }) {
  const id = useId();
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-full border border-rule bg-surface p-1"
    >
      {groups
        .filter((g) => g.people.length > 0)
        .map((g) => (
          <div key={g.id} className="group relative">
            <button
              type="button"
              aria-describedby={`${id}-${g.id}`}
              aria-label={`${g.label}: ${g.people.length}`}
              className={cn(
                "inline-flex cursor-default items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums",
                g.lead && "bg-accent-soft",
                "focus-visible:outline-3 focus-visible:outline-accent",
              )}
            >
              <Icon name={g.icon} />
              <span>{g.people.length}</span>
            </button>
            <div
              id={`${id}-${g.id}`}
              role="tooltip"
              className="absolute top-full left-0 z-20 mt-1.5 hidden min-w-52 rounded-control border border-rule-strong bg-surface px-3 py-2.5 text-sm shadow-lg group-focus-within:block group-hover:block"
            >
              <div className="mb-1 text-xs tracking-wider text-muted uppercase">{g.label}</div>
              <ul className="m-0 list-none p-0">
                {g.people.map((p) => (
                  <li key={p} className="py-0.5">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
    </div>
  );
}

function Icon({ name }: { name: PresenceGroup["icon"] }) {
  const paths: Record<PresenceGroup["icon"], string> = {
    flag: "M4 14 V2.5 M4 3 H12 L10.5 5.75 L12 8.5 H4",
    compass: "M8 1.75 A6.25 6.25 0 1 0 8 14.25 A6.25 6.25 0 1 0 8 1.75 M10.5 5.5 L9 9 L5.5 10.5 L7 7 Z",
    people:
      "M6 7.5 A2.5 2.5 0 1 0 6 2.5 A2.5 2.5 0 1 0 6 7.5 M1.5 14 C1.5 11 3.5 9.5 6 9.5 C8.5 9.5 10.5 11 10.5 14 M11 7 A2 2 0 1 0 11 3 M12.5 9.6 C13.9 10.2 14.6 11.6 14.6 13.5",
    eye: "M1.5 8 C3.5 4.5 5.7 3 8 3 C10.3 3 12.5 4.5 14.5 8 C12.5 11.5 10.3 13 8 13 C5.7 13 3.5 11.5 1.5 8 Z M8 10.2 A2.2 2.2 0 1 0 8 5.8 A2.2 2.2 0 1 0 8 10.2",
  };
  return (
    <svg className="size-4" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={paths[name]}
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
