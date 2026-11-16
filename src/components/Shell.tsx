import type { ReactNode } from "react";
import { cn } from "../cn";

export type NavItem = {
  key: string;
  label: ReactNode;
  href: string;
  /** The page being shown: highlighted, and read out as the current page. */
  current?: boolean;
  /** Drawn indented under the item before it, e.g. a project under the workspace. */
  indent?: boolean;
  /** A short note on the right, e.g. "linked". */
  meta?: ReactNode;
  /** An action rather than a place, e.g. "+ Link a provider": drawn in the link colour. */
  action?: boolean;
};

export type NavSection = { key: string; heading?: ReactNode; items: NavItem[]; note?: ReactNode };

/** A column of links for moving around an app, in sections with an optional heading and a
 *  note under them. On a phone it sits above the content as a full-width list. */
export function SideNav({ sections, label = "Main" }: { sections: NavSection[]; label?: string }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-1 px-4 py-6">
      {sections.map((s) => (
        <div key={s.key} className="flex flex-col gap-1">
          {s.heading && (
            <span className="mx-3 mt-4 mb-1 text-xs font-bold tracking-wider text-muted uppercase">{s.heading}</span>
          )}
          {s.items.map((i) => (
            <a
              key={i.key}
              href={i.href}
              aria-current={i.current ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-between gap-3 rounded-control px-3 no-underline",
                i.indent && "pl-7",
                i.current ? "bg-accent-soft font-bold text-ink" : i.action ? "font-semibold text-link" : "text-ink",
                "hover:bg-sunken focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
            >
              <span>{i.label}</span>
              {i.meta && <span className="text-xs font-normal text-muted">{i.meta}</span>}
            </a>
          ))}
          {s.note && <p className="mx-3 mt-5 mb-0 text-sm text-muted">{s.note}</p>}
        </div>
      ))}
    </nav>
  );
}

/** An app's frame: a header with the brand on the left and the account on the right, a side
 *  navigation and the page's content. Without `nav` the content is centred on its own, e.g. a
 *  sign-in page or a wizard. The side navigation stacks above the content on a phone. */
export function AppShell({
  brand,
  account,
  nav,
  footer,
  children,
  width = "normal",
}: {
  brand: ReactNode;
  account?: ReactNode;
  nav?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** How wide the content may grow: "narrow" for a single form, "normal" for pages. */
  width?: "narrow" | "normal";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ground text-ink">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-rule bg-surface px-6 py-3.5">
        <div className="flex items-center gap-2.5">{brand}</div>
        {account && <div className="flex items-center gap-3">{account}</div>}
      </header>
      <div className="flex flex-1 flex-wrap">
        {nav && (
          <div className="w-full border-b border-rule sm:w-auto sm:max-w-72 sm:flex-[1_1_220px] sm:border-r sm:border-b-0">
            {nav}
          </div>
        )}
        <main
          className={cn(
            "flex min-w-0 flex-col gap-6 px-4 py-8 sm:px-8",
            nav ? "flex-[999_1_560px]" : "mx-auto w-full",
            width === "narrow" ? "max-w-3xl" : "max-w-5xl",
          )}
        >
          {children}
        </main>
      </div>
      {footer && <footer className="flex flex-wrap gap-5 px-8 py-4 text-sm text-muted">{footer}</footer>}
    </div>
  );
}
