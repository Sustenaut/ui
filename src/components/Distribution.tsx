import { cx } from "./basics";

/** How many picked each option: a small bar chart, e.g. the spread of votes. */
export function Distribution({ label, items }: { label: string; items: { label: string; count: number }[] }) {
  const most = Math.max(1, ...items.map((i) => i.count));
  return (
    <figure className="su-distribution" aria-label={label} style={{ margin: 0, position: "relative" }}>
      {items.map((i) => (
        <div key={i.label} className="su-distribution__item">
          {i.count > 0 && <span className="su-distribution__count">{i.count}</span>}
          <span className={cx("su-distribution__bar", i.count === 0 && "su-distribution__bar--empty")}
                style={{ height: i.count ? `${(56 * i.count) / most}px` : undefined }} />
          <span className="su-distribution__label">{i.label}</span>
        </div>
      ))}
      <figcaption style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {items.map((i) => `${i.label}: ${i.count}`).join(", ")}
      </figcaption>
    </figure>
  );
}
