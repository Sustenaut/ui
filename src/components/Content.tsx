import type { ReactNode } from "react";
import { cn } from "../cn";

/** A page's title, an optional introduction below it and actions on the right. */
export function PageHeading({ title, lede, actions }: { title: ReactNode; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="m-0 font-display text-3xl font-extrabold">{title}</h1>
        {actions}
      </div>
      {lede && <p className="m-0 max-w-3xl text-muted">{lede}</p>}
    </div>
  );
}

export type LinkItem = {
  key: string;
  label: ReactNode;
  href: string;
  /** Shown after the link, e.g. related links as tags. */
  extra?: ReactNode;
  /** Opens in a new tab (the default for links that leave the app). */
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

/** A list of links, one per row. */
export function LinkList({ items }: { items: LinkItem[] }) {
  return (
    <ul className="m-0 grid list-none gap-0 p-0">
      {items.map((i) => (
        <li key={i.key} className="flex flex-wrap items-baseline gap-2.5 border-b border-rule py-2">
          <a
            href={i.href}
            onClick={i.onClick}
            className="text-link"
            {...(i.external !== false ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {i.label}
          </a>
          {i.extra}
        </li>
      ))}
    </ul>
  );
}

/** A small link styled as a tag, e.g. a channel next to a project. */
export function TagLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-rule px-2 py-px text-xs text-link no-underline hover:border-primary"
    >
      {children}
    </a>
  );
}

export type Column = { key: string; header: ReactNode; numeric?: boolean; wrap?: boolean };

/** A table of rows: each row maps column keys to what its cell shows. Scrolls sideways on a
 *  narrow screen instead of squeezing. */
export function DataTable({
  columns,
  rows,
  caption,
}: {
  columns: Column[];
  rows: ({ key: string } & Record<string, ReactNode>)[];
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse tabular-nums">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "border-b border-rule px-2.5 py-2 text-sm font-semibold whitespace-nowrap text-muted",
                  c.numeric ? "text-right" : "text-left",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              {columns.map((c, i) => (
                <td
                  key={c.key}
                  className={cn(
                    "border-b border-rule px-2.5 py-2",
                    c.numeric ? "text-right" : "text-left",
                    c.wrap || i === 0 ? "whitespace-normal" : "whitespace-nowrap",
                  )}
                >
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Content that opens and closes under a one-line summary. */
export function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <details className="my-2">
      <summary className="cursor-pointer text-muted">{summary}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}
