// Cells: the inputs of a table's cells (JSON Forms' cell set), without labels of their own. The table names
// each one by its column heading, which it hands down through CellLabel.
import {
  isBooleanControl,
  isEnumControl,
  isIntegerControl,
  isNumberControl,
  isOneOfEnumControl,
  isStringControl,
  rankWith,
  type CellProps,
  type EnumCellProps,
} from "@jsonforms/core";
import { withJsonFormsCellProps, withJsonFormsEnumCellProps, withJsonFormsOneOfEnumCellProps } from "@jsonforms/react";
import { createContext, useContext } from "react";
import { CellInput, type CellType } from "../components/TableField";

/** The id of the element that names the cell being drawn: its column heading. */
export const CellLabel = createContext<string | undefined>(undefined);

/** A cell of one type; a string cell is a date when its schema's format is "date". */
function cell(type: CellType) {
  return function Cell({ data, handleChange, path, schema, enabled, isValid, id }: CellProps) {
    const labelledBy = useContext(CellLabel);
    return (
      <CellInput
        type={type === "text" && schema.format === "date" ? "date" : type}
        id={id}
        value={data}
        onChange={(v) => handleChange(path, v)}
        labelledBy={labelledBy}
        disabled={!enabled}
        invalid={!isValid}
        min={schema.minimum}
        max={schema.maximum}
      />
    );
  };
}

function ChoiceCell({ data, handleChange, path, enabled, isValid, id, options = [] }: EnumCellProps) {
  const labelledBy = useContext(CellLabel);
  const byText = new Map(options.map((o) => [String(o.value), o.value]));
  return (
    <CellInput
      type="choice"
      id={id}
      value={data === undefined ? undefined : String(data)}
      onChange={(v) => handleChange(path, v === undefined ? undefined : byText.get(v as string))}
      choices={options.map((o) => ({ value: String(o.value), label: o.label }))}
      labelledBy={labelledBy}
      disabled={!enabled}
      invalid={!isValid}
    />
  );
}

export const cells = [
  { tester: rankWith(1, isStringControl), cell: withJsonFormsCellProps(cell("text")) },
  { tester: rankWith(2, isNumberControl), cell: withJsonFormsCellProps(cell("number")) },
  { tester: rankWith(2, isIntegerControl), cell: withJsonFormsCellProps(cell("integer")) },
  { tester: rankWith(2, isBooleanControl), cell: withJsonFormsCellProps(cell("boolean")) },
  { tester: rankWith(2, isEnumControl), cell: withJsonFormsEnumCellProps(ChoiceCell) },
  { tester: rankWith(2, isOneOfEnumControl), cell: withJsonFormsOneOfEnumCellProps(ChoiceCell) },
];
