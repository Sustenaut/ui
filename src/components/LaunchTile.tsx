import type { ReactNode } from "react";
import { cn } from "../cn";

/** One thing a person can start, e.g. an app to launch: a title, a line about it, a detail
 *  such as its address, and an action. A tile that is not `available` yet is drawn greyed and
 *  dashed, says what it `needs` and takes the action that gets it there instead. */
export function LaunchTile({
  title,
  description,
  detail,
  needs,
  available = true,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  detail?: ReactNode;
  /** What is missing before it can start, e.g. "Needs: file storage, database". */
  needs?: ReactNode;
  available?: boolean;
  action?: ReactNode;
}) {
  return (
    <article
      aria-disabled={available ? undefined : true}
      className={cn(
        "flex flex-col gap-2 rounded-panel p-4.5",
        available ? "border border-rule bg-surface" : "border border-dashed border-rule-strong bg-sunken text-muted",
      )}
    >
      <h3 className="m-0 font-display text-lg font-extrabold">{title}</h3>
      {description && <p className={cn("m-0 flex-1 text-sm", available && "text-muted")}>{description}</p>}
      {detail && <span className="text-sm">{detail}</span>}
      {!available && needs && <span className="text-sm text-ink">{needs}</span>}
      {action}
    </article>
  );
}
