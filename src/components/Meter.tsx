import type { ReactNode } from "react";
import { cx } from "./basics";

/** An amount out of a total, e.g. hours planned out of hours available. `adding` previews an
 *  amount about to be added, in a lighter colour; going over the total is shown, not prevented. */
export function Meter({ label, used, total, adding = 0, unit = "", note }: {
  label: ReactNode; used: number; total: number; adding?: number; unit?: string; note?: ReactNode;
}) {
  const after = used + adding;
  const over = total > 0 ? after > total : after > 0;
  const scale = Math.max(total, after, 1);
  const pct = (n: number) => `${(100 * n) / scale}%`;
  const fmt = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}${unit ? ` ${unit}` : ""}`;
  return (
    <div className={cx("su-meter", over && "su-meter--over")}>
      <div className="su-meter__head">
        <span className="su-meter__label">{label}</span>
        <span className="su-meter__value">
          {adding ? `${fmt(used)} → ${fmt(after)}` : fmt(used)} of {fmt(total)}
        </span>
      </div>
      <div className="su-meter__track" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={after}
           aria-label={typeof label === "string" ? label : undefined}>
        <span className="su-meter__used" style={{ width: pct(used) }} />
        {adding > 0 && <span className="su-meter__added" style={{ width: pct(adding) }} />}
      </div>
      {(note || over) && <span className="su-meter__note">{note ?? `${fmt(after - total)} over`}</span>}
    </div>
  );
}
