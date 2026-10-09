import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "warning";
  size?: "normal" | "small";
};

const buttonVariants = {
  primary: "border-primary bg-primary text-on-primary",
  secondary: "border-rule-strong bg-surface text-ink hover:enabled:border-primary",
  quiet: "border-transparent bg-transparent text-link hover:enabled:underline",
  warning: "border-rule-strong bg-surface text-warn hover:enabled:border-warn",
};

/** A button. `variant="primary"` for the one main action on a screen. */
export function Button({ variant = "secondary", size = "normal", className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-control border font-bold",
        size === "small" ? "min-h-9 px-3 text-sm" : "min-h-11 px-4",
        buttonVariants[variant],
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-55",
        className,
      )}
      {...rest}
    />
  );
}

export type Tone = "neutral" | "success" | "warning" | "danger";

const soft: Record<Tone, string> = {
  neutral: "bg-sunken",
  success: "bg-accent-soft",
  warning: "bg-warn-soft",
  danger: "bg-bad-soft",
};
const edge: Record<Tone, string> = {
  neutral: "border-rule-strong",
  success: "border-primary",
  warning: "border-warn",
  danger: "border-bad",
};

/** A short label, e.g. a state or a property. `dot` adds a small marker before it. */
export function Tag({ tone = "neutral", dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm", soft[tone])}>
      {dot && <span className="size-2 rounded-full bg-primary" aria-hidden="true" />}
      {children}
    </span>
  );
}

/** A highlighted message. */
export function Callout({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div
      className={cn("rounded-control border-l-4 px-3.5 py-2.5", soft[tone], edge[tone])}
      role={tone === "danger" || tone === "warning" ? "alert" : undefined}
    >
      {children}
    </div>
  );
}

/** One number with a label, e.g. "Logged so far: 5 h". */
export function Stat({ label, value, note }: { label: ReactNode; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-control bg-sunken px-3.5 py-3">
      <span className="text-xs text-muted">{label}</span>
      <span className="font-display text-xl font-extrabold tabular-nums">{value}</span>
      {note && <span className="text-xs text-muted">{note}</span>}
    </div>
  );
}

/** An information block: an optional eyebrow line, a title (a link that opens in a new tab when
 *  `href` is given) and actions on the right, then its content. */
export function Panel({
  eyebrow,
  title,
  href,
  actions,
  emphasis,
  as: Element = "section",
  className,
  children,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  href?: string;
  actions?: ReactNode;
  emphasis?: boolean;
  as?: "section" | "div" | "aside" | "article";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Element
      className={cn(
        "flex min-w-0 flex-col gap-3.5 rounded-panel bg-surface px-6 py-5",
        emphasis ? "border-2 border-primary" : "border border-rule",
        className,
      )}
    >
      {(eyebrow || actions) && (
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          {eyebrow ? <span className="text-sm text-muted">{eyebrow}</span> : <span />}
          {actions}
        </div>
      )}
      {title && (
        <h2 className="m-0 font-display text-xl font-extrabold">
          {href ? (
            <a href={href} target="_blank" rel="noopener" className="text-inherit decoration-accent underline-offset-4">
              {title}
              <ExternalIcon />
            </a>
          ) : (
            title
          )}
        </h2>
      )}
      {children}
    </Element>
  );
}

export function ExternalIcon() {
  return (
    <svg className="ml-2 inline size-4 align-[-2px]" viewBox="0 0 16 16" aria-label="opens in a new tab" role="img">
      <path
        d="M9 3 H13 V7 M13 3 L7 9 M11 9.5 V13 H3 V5 H6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
