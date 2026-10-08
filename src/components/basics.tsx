import type { ButtonHTMLAttributes, ReactNode } from "react";

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "warning";
  size?: "normal" | "small";
};

/** A button. `variant="primary"` for the one main action on a screen. */
export function Button({ variant = "secondary", size = "normal", className, type = "button", ...rest }: ButtonProps) {
  return (
    <button type={type} className={cx("su-button", variant !== "secondary" && `su-button--${variant}`,
                                      size === "small" && "su-button--small", className)} {...rest} />
  );
}

export type Tone = "neutral" | "success" | "warning" | "danger";

/** A short label, e.g. a state or a property. `dot` adds a small marker before it. */
export function Tag({ tone = "neutral", dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={cx("su-tag", tone !== "neutral" && `su-tag--${tone}`)}>
      {dot && <span className="su-tag__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** A highlighted message. */
export function Callout({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={cx("su-callout", tone !== "neutral" && `su-callout--${tone}`)}
         role={tone === "danger" || tone === "warning" ? "alert" : undefined}>
      {children}
    </div>
  );
}

/** One number with a label, e.g. "Logged so far: 5 h". */
export function Stat({ label, value, note }: { label: ReactNode; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="su-stat">
      <span className="su-stat__label">{label}</span>
      <span className="su-stat__value">{value}</span>
      {note && <span className="su-stat__note">{note}</span>}
    </div>
  );
}

/** An information block: an optional eyebrow line, a title (a link when `href` is given) and
 *  actions on the right, then its content. */
export function Panel({ eyebrow, title, href, actions, emphasis, as: Element = "section", children }: {
  eyebrow?: ReactNode; title?: ReactNode; href?: string; actions?: ReactNode; emphasis?: boolean;
  as?: "section" | "div" | "aside" | "article"; children?: ReactNode;
}) {
  return (
    <Element className={cx("su-panel", emphasis && "su-panel--emphasis")}>
      {(eyebrow || actions) && (
        <div className="su-panel__head">
          {eyebrow ? <span className="su-panel__eyebrow">{eyebrow}</span> : <span />}
          {actions}
        </div>
      )}
      {title && (
        <h2 className="su-panel__title">
          {href ? <a href={href} target="_blank" rel="noopener">{title}<ExternalIcon /></a> : title}
        </h2>
      )}
      {children}
    </Element>
  );
}

export function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-label="opens in a new tab" role="img"
         style={{ marginLeft: 8, verticalAlign: -2 }}>
      <path d="M9 3 H13 V7 M13 3 L7 9 M11 9.5 V13 H3 V5 H6.5" stroke="currentColor" strokeWidth="1.6" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { cx };
