import { useId, type ReactNode } from "react";
import { cn } from "../cn";
import { Button } from "./basics";
import { FieldError, inputClass } from "./Form";

/** What a cell holds, and so which input edits it. */
export type CellType = "text" | "number" | "integer" | "date" | "boolean" | "choice";

export type CellChoice = { value: string; label: ReactNode };

/** One input of a table's cell, without a visible label: the column heading names it (`labelledBy`). */
export function CellInput({
  type,
  value,
  onChange,
  choices = [],
  labelledBy,
  id,
  disabled,
  invalid,
  min,
  max,
}: {
  type: CellType;
  value: unknown;
  onChange: (value: unknown) => void;
  choices?: CellChoice[];
  labelledBy?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  min?: number;
  max?: number;
}) {
  const shared = { id, disabled, "aria-labelledby": labelledBy, "aria-invalid": invalid || undefined };
  if (type === "boolean") {
    return (
      <input
        {...shared}
        type="checkbox"
        checked={value === true}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 accent-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    );
  }
  const look = cn(inputClass, "min-w-24 px-2 py-1.5");
  if (type === "choice") {
    return (
      <select
        {...shared}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className={look}
      >
        <option value="" />
        {choices.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
    );
  }
  if (type === "number" || type === "integer") {
    return (
      <input
        {...shared}
        type="number"
        inputMode={type === "integer" ? "numeric" : "decimal"}
        step={type === "integer" ? 1 : "any"}
        min={min}
        max={max}
        value={typeof value === "number" ? value : ""}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(e.target.value.trim() === "" || !Number.isFinite(n) ? undefined : n);
        }}
        className={cn(look, "text-right tabular-nums")}
      />
    );
  }
  return (
    <input
      {...shared}
      type={type === "date" ? "date" : "text"}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
      className={look}
    />
  );
}

export type TableFieldColumn = {
  key: string;
  label: ReactNode;
  type: CellType;
  choices?: CellChoice[];
  min?: number;
  max?: number;
};

export type TableRow = Record<string, unknown>;

/** Editable rows of typed cells, one column per property, with a button to add a row and one per row to
 *  remove it. Scrolls sideways on a phone. */
export function TableField({
  label,
  columns,
  rows,
  onChange,
  hint,
  error,
  newRow = () => ({}),
  renderCell,
  addLabel = "Add row",
  removeLabel = (n) => `Remove row ${n}`,
  disabled,
}: {
  label: ReactNode;
  columns: TableFieldColumn[];
  rows: TableRow[] | undefined;
  onChange: (rows: TableRow[]) => void;
  hint?: ReactNode;
  error?: ReactNode;
  /** The values a new row starts with. */
  newRow?: () => TableRow;
  /** Draws a cell's input in place of the built-in one, e.g. to show the cell's own error. */
  renderCell?: (cell: { row: number; column: TableFieldColumn; labelledBy: string }) => ReactNode;
  addLabel?: ReactNode;
  /** The remove button's text for row n (counting from 1). */
  removeLabel?: (n: number) => string;
  disabled?: boolean;
}) {
  const id = useId();
  const list = rows ?? [];
  const head = (key: string) => `${id}-col-${key}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const setCell = (row: number, key: string, value: unknown) =>
    onChange(list.map((r, i) => (i === row ? { ...r, [key]: value } : r)));
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-bold" id={`${id}-label`}>
        {label}
      </span>
      <div className="overflow-x-auto">
        <table
          className="w-full border-collapse tabular-nums"
          aria-labelledby={`${id}-label`}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        >
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  id={head(c.key)}
                  scope="col"
                  className="border-b border-rule px-2 py-2 text-left text-sm font-semibold whitespace-nowrap text-muted"
                >
                  {c.label}
                </th>
              ))}
              <td className="border-b border-rule" />
            </tr>
          </thead>
          <tbody>
            {list.map((r, row) => (
              // Rows have no identity of their own: their place is their key.
              <tr key={row}>
                {columns.map((c) => (
                  <td key={c.key} className="border-b border-rule px-2 py-1.5">
                    {renderCell ? (
                      renderCell({ row, column: c, labelledBy: head(c.key) })
                    ) : (
                      <CellInput
                        type={c.type}
                        value={r[c.key]}
                        onChange={(v) => setCell(row, c.key, v)}
                        choices={c.choices}
                        min={c.min}
                        max={c.max}
                        labelledBy={head(c.key)}
                        disabled={disabled}
                      />
                    )}
                  </td>
                ))}
                <td className="border-b border-rule px-2 py-1.5 text-right">
                  <Button
                    size="small"
                    variant="quiet"
                    disabled={disabled}
                    onClick={() => onChange(list.filter((_, i) => i !== row))}
                  >
                    {removeLabel(row + 1)}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <Button size="small" disabled={disabled} onClick={() => onChange([...list, newRow()])}>
          {addLabel}
        </Button>
      </div>
      {hint && (
        <span className="text-sm text-muted" id={hintId}>
          {hint}
        </span>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
