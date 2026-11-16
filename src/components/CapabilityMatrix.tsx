import type { ReactNode } from "react";
import { cn } from "../cn";

export type CapabilityCell = {
  /** "yes": offered; "no": not offered; "partly": offered through something else, e.g. "via Tailscale". */
  value: "yes" | "no" | "partly";
  /** The words in the cell; the default is the matrix's `text` for its value. */
  text?: ReactNode;
  /** A footnote mark after the text, e.g. "¹", matching the matrix's `notes`. */
  mark?: string;
  /** The trade-off, shown on hover and read out with the cell. */
  tip?: string;
};

export type CapabilityRow = { key: string; name: ReactNode; cells: Record<string, CapabilityCell> };

const pill = {
  yes: "bg-accent-soft font-bold text-ink",
  no: "bg-transparent font-normal text-muted",
  partly: "bg-sunken font-semibold text-ink",
};

/** Who can provide what: one row per provider, one column per capability, each cell yes, no or
 *  partly with an optional footnote mark and a trade-off on hover. Numbered notes follow the
 *  table. Scrolls sideways on a phone instead of squeezing. */
export function CapabilityMatrix({
  columns,
  rows,
  notes,
  caption,
  rowHeader = "Provider",
  text = { yes: "Yes", no: "No", partly: "Partly" },
}: {
  columns: { key: string; header: ReactNode }[];
  rows: CapabilityRow[];
  /** The footnotes, in order: the first is mark 1. */
  notes?: ReactNode[];
  caption?: string;
  rowHeader?: ReactNode;
  /** The default words for each value, for translation. */
  text?: { yes: string; no: string; partly: string };
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-panel border border-rule bg-surface">
        <table className="w-full border-collapse text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-sunken">
              <th scope="col" className="px-3.5 py-2.5 text-left font-bold">
                {rowHeader}
              </th>
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-3 py-2.5 text-center font-bold whitespace-nowrap">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="border-t border-rule">
                <th scope="row" className="px-3.5 py-2.5 text-left font-bold whitespace-nowrap">
                  {r.name}
                </th>
                {columns.map((c) => {
                  const cell = r.cells[c.key] ?? { value: "no" as const };
                  return (
                    <td key={c.key} title={cell.tip} className="px-3 py-2.5 text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-16 items-center justify-center rounded-full px-2.5 py-0.5 whitespace-nowrap",
                          pill[cell.value],
                        )}
                      >
                        {cell.text ?? text[cell.value]}
                        {cell.mark && <sup className="ml-0.5">{cell.mark}</sup>}
                      </span>
                      {cell.tip && <span className="sr-only">: {cell.tip}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notes && notes.length > 0 && (
        <ol className="m-0 flex flex-col gap-1 pl-5 text-sm text-muted">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
