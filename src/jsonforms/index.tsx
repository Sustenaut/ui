// @sustenaut/ui/jsonforms: JSON Forms (https://jsonforms.io) drawn with the library's components. The page
// owns the JSON schema (what the data is and its rules), the UI schema (how it is laid out) and the data;
// these renderers only draw them and report changes. The words a reader sees come from the schemas and from
// JSON Forms' i18n, never from here.
import type { JsonFormsCellRendererRegistryEntry, JsonFormsRendererRegistryEntry } from "@jsonforms/core";
import { JsonForms } from "@jsonforms/react";
import { useMemo, type ComponentProps } from "react";
import { cells as typedCells } from "./cells";
import { controlRenderers, isDateRangeControl, isMultiChoiceControl, isSliderControl } from "./controls";
import { layoutRenderers } from "./layouts";

/** Draws nothing: what no renderer or cell knows stays out of the page, with no built-in words. */
function Nothing() {
  return null;
}
const anything = () => 0;

/** Every renderer, for JsonForms' `renderers`. */
export const renderers: JsonFormsRendererRegistryEntry[] = [
  ...controlRenderers,
  ...layoutRenderers,
  { tester: anything, renderer: Nothing },
];

/** Every cell (the inputs of a table's cells), for JsonForms' `cells`. */
export const cells: JsonFormsCellRendererRegistryEntry[] = [...typedCells, { tester: anything, cell: Nothing }];

export { isDateRangeControl, isMultiChoiceControl, isSliderControl };
export { CellLabel } from "./cells";
export { exampleData, exampleSchema, exampleUiSchema } from "./example";

const none: never[] = [];

type JsonFormsProps = ComponentProps<typeof JsonForms>;

/** A form drawn from a JSON schema and a UI schema with the library's renderers and cells. `onChange` hears
 *  the data and its validation errors after each change (and once at the start). */
export function SchemaForm({
  renderers: more = none,
  cells: moreCells = none,
  ...props
}: Omit<JsonFormsProps, "renderers" | "cells"> & {
  /** Renderers the page adds; a higher rank wins over the library's. */
  renderers?: JsonFormsRendererRegistryEntry[];
  cells?: JsonFormsCellRendererRegistryEntry[];
}) {
  const allRenderers = useMemo(() => [...renderers, ...more], [more]);
  const allCells = useMemo(() => [...cells, ...moreCells], [moreCells]);
  return <JsonForms renderers={allRenderers} cells={allCells} {...props} />;
}
