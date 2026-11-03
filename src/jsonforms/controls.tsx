// Controls: one JSON Forms renderer per kind of value, each drawing one of the library's fields. The label,
// the description (as the hint) and the errors come from JSON Forms; the words in them are the page's, from
// its schemas and its JSON Forms i18n.
import {
  and,
  createDefaultValue,
  getCombinedErrorMessage,
  getErrorTranslator,
  getSubErrorsAt,
  getTranslator,
  hasType,
  isBooleanControl,
  isEnumControl,
  isIntegerControl,
  isNumberControl,
  isObjectArrayControl,
  isOneOfEnumControl,
  isStringControl,
  optionIs,
  or,
  Paths,
  rankWith,
  resolveSchema,
  schemaMatches,
  uiTypeIs,
  type ControlProps,
  type EnumOption,
  type JsonSchema,
  type OwnPropsOfEnum,
} from "@jsonforms/core";
import {
  DispatchCell,
  useJsonForms,
  withJsonFormsControlProps,
  withJsonFormsEnumProps,
  withJsonFormsMultiEnumProps,
  withJsonFormsOneOfEnumProps,
} from "@jsonforms/react";
import { ChoiceGroup, Field } from "../components/Form";
import {
  CheckboxField,
  DateRangeField,
  FieldGroup,
  MultiChoiceField,
  NumberField,
  RangeField,
} from "../components/Inputs";
import { TableField, type CellType, type TableFieldColumn } from "../components/TableField";
import { CellLabel } from "./cells";

/** A value the schema leaves empty is removed from the data, as JSON Forms' own renderers do. */
const emptyToUndefined = (v: string) => (v === "" ? undefined : v);

/** The props every field takes from a control. */
function fieldProps({ label, description, errors, enabled }: ControlProps) {
  return { label, hint: description || undefined, error: errors || undefined, disabled: !enabled };
}

/** A line of text; `options.multi` makes it a text area, and `format: "date"` a date. */
function TextControl(props: ControlProps) {
  const { data, handleChange, path, schema, uischema, visible, enabled, required, errors, label, description } = props;
  if (!visible) return null;
  const date = schema.format === "date" || uischema.options?.format === "date";
  const value = typeof data === "string" ? data : "";
  return (
    <Field label={label} hint={description || undefined} error={errors || undefined}>
      {uischema.options?.multi ? (
        <textarea
          rows={3}
          value={value}
          disabled={!enabled}
          required={required}
          onChange={(e) => handleChange(path, emptyToUndefined(e.target.value))}
        />
      ) : (
        <input
          type={date ? "date" : "text"}
          value={value}
          disabled={!enabled}
          required={required}
          maxLength={schema.maxLength}
          onChange={(e) => handleChange(path, emptyToUndefined(e.target.value))}
        />
      )}
    </Field>
  );
}

/** One of a list: large buttons for a few options (or `options.format: "radio"`), a select for more (or
 *  `options.format: "select"`). */
function ChoiceControl(props: ControlProps & OwnPropsOfEnum) {
  const { data, handleChange, path, uischema, visible, enabled, required, options = [] } = props;
  if (!visible) return null;
  const format = uischema.options?.format;
  const buttons = format === "radio" || (format !== "select" && options.length <= 5);
  // Options are matched by their value as text, so a number enum works as well as a string one.
  const byText = new Map(options.map((o) => [String(o.value), o]));
  const current = data === undefined ? null : String(data);
  const pick = (text: string) => handleChange(path, byText.get(text)?.value);
  const { label, hint, error } = fieldProps(props);
  if (buttons) {
    return (
      <FieldGroup label={label} hint={hint} error={error}>
        <ChoiceGroup
          label={label}
          value={current}
          onChange={pick}
          choices={options.map((o: EnumOption) => ({ value: String(o.value), label: o.label, disabled: !enabled }))}
        />
      </FieldGroup>
    );
  }
  return (
    <Field label={label} hint={hint} error={error}>
      <select value={current ?? ""} disabled={!enabled} required={required} onChange={(e) => pick(e.target.value)}>
        <option value="" />
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function NumberControl(props: ControlProps) {
  const { data, handleChange, path, schema, visible, required } = props;
  if (!visible) return null;
  return (
    <NumberField
      {...fieldProps(props)}
      required={required}
      value={typeof data === "number" ? data : undefined}
      onChange={(v) => handleChange(path, v)}
      min={schema.minimum}
      max={schema.maximum}
      step={schema.multipleOf ?? (hasType(schema, "integer") ? 1 : undefined)}
    />
  );
}

function RangeControl(props: ControlProps) {
  const { data, handleChange, path, schema, visible, required } = props;
  if (!visible) return null;
  return (
    <RangeField
      {...fieldProps(props)}
      required={required}
      value={typeof data === "number" ? data : undefined}
      onChange={(v) => handleChange(path, v)}
      min={schema.minimum as number}
      max={schema.maximum as number}
      step={schema.multipleOf ?? 1}
    />
  );
}

function BooleanControl(props: ControlProps) {
  const { data, handleChange, path, visible } = props;
  if (!visible) return null;
  return <CheckboxField {...fieldProps(props)} value={data === true} onChange={(v) => handleChange(path, v)} />;
}

function DateRangeControl(props: ControlProps) {
  const { data, handleChange, path, schema, uischema, visible, required } = props;
  if (!visible) return null;
  const start = schema.properties?.start;
  const end = schema.properties?.end;
  return (
    <DateRangeField
      {...fieldProps(props)}
      required={required}
      value={data}
      onChange={(v) => handleChange(path, v.start === undefined && v.end === undefined ? undefined : v)}
      startLabel={uischema.options?.startLabel ?? start?.title}
      endLabel={uischema.options?.endLabel ?? end?.title}
    />
  );
}

function MultiChoiceControl(props: ControlProps & OwnPropsOfEnum) {
  const { data, handleChange, path, visible, options = [] } = props;
  if (!visible) return null;
  const byText = new Map(options.map((o) => [String(o.value), o.value]));
  const picked = Array.isArray(data) ? data.map(String) : [];
  return (
    <MultiChoiceField
      {...fieldProps(props)}
      value={picked}
      onChange={(texts) =>
        handleChange(
          path,
          texts.map((t) => byText.get(t)),
        )
      }
      choices={options.map((o) => ({ value: String(o.value), label: o.label }))}
    />
  );
}

/** The kind of cell a property of a row is edited with. */
function cellTypeOf(schema: JsonSchema): CellType {
  if (schema.enum || schema.oneOf) return "choice";
  if (hasType(schema, "boolean")) return "boolean";
  if (hasType(schema, "integer")) return "integer";
  if (hasType(schema, "number")) return "number";
  return schema.format === "date" ? "date" : "text";
}

/** An array of objects as a table: a column per property of its items (in `options.columns`' order, if
 *  given), each cell drawn by the cell set. */
function TableControl(props: ControlProps) {
  const { data, handleChange, path, schema, rootSchema, uischema, visible, enabled, cells, renderers } = props;
  const ctx = useJsonForms();
  if (!visible) return null;
  const items = resolveSchema(schema, "items", rootSchema) ?? {};
  const resolved = items.$ref ? (resolveSchema(rootSchema, items.$ref, rootSchema) ?? items) : items;
  const properties = resolved.properties ?? {};
  const keys: string[] = uischema.options?.columns ?? Object.keys(properties);
  const columns: TableFieldColumn[] = keys.map((key) => ({
    key,
    label: properties[key]?.title ?? key,
    type: cellTypeOf(properties[key] ?? {}),
  }));
  const state = { jsonforms: ctx };
  const cellErrors = getCombinedErrorMessage(
    getSubErrorsAt(path, schema)(state),
    getErrorTranslator()(state),
    getTranslator()(state),
  );
  const { label, hint } = fieldProps(props);
  return (
    <TableField
      label={label}
      hint={hint}
      error={[props.errors, cellErrors].filter(Boolean).join("\n") || undefined}
      disabled={!enabled}
      columns={columns}
      rows={Array.isArray(data) ? data : []}
      onChange={(rows) => handleChange(path, rows)}
      newRow={() => createDefaultValue(resolved, rootSchema)}
      renderCell={({ row, column, labelledBy }) => (
        <CellLabel.Provider value={labelledBy}>
          <DispatchCell
            schema={properties[column.key] ?? {}}
            uischema={{ type: "Control", scope: `#/properties/${column.key}` } as never}
            path={Paths.compose(path, `${row}.${column.key}`)}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        </CellLabel.Provider>
      )}
    />
  );
}

const isNumeric = or(isNumberControl, isIntegerControl);

/** A start and an end date: an object whose `start` and `end` properties are dates. */
export const isDateRangeControl = and(
  uiTypeIs("Control"),
  schemaMatches(
    (s) => hasType(s, "object") && s.properties?.start?.format === "date" && s.properties?.end?.format === "date",
  ),
);

/** A number with a minimum and a maximum, shown as a slider when `options.slider` is true. */
export const isSliderControl = and(
  isNumeric,
  schemaMatches((s) => s.minimum !== undefined && s.maximum !== undefined),
  optionIs("slider", true),
);

/** Any number of a list: an array of unique items, each an enum or a oneOf of consts. */
export const isMultiChoiceControl = and(
  uiTypeIs("Control"),
  schemaMatches((s, root) => {
    if (!hasType(s, "array") || s.uniqueItems !== true || !s.items || Array.isArray(s.items)) return false;
    const item = resolveSchema(s, "items", root);
    return Boolean(item?.enum || item?.oneOf?.every((o) => o.const !== undefined));
  }),
);

export const controlRenderers = [
  { tester: rankWith(1, isStringControl), renderer: withJsonFormsControlProps(TextControl) },
  { tester: rankWith(2, isEnumControl), renderer: withJsonFormsEnumProps(ChoiceControl) },
  { tester: rankWith(2, isOneOfEnumControl), renderer: withJsonFormsOneOfEnumProps(ChoiceControl) },
  { tester: rankWith(2, isNumeric), renderer: withJsonFormsControlProps(NumberControl) },
  { tester: rankWith(3, isSliderControl), renderer: withJsonFormsControlProps(RangeControl) },
  { tester: rankWith(2, isBooleanControl), renderer: withJsonFormsControlProps(BooleanControl) },
  { tester: rankWith(3, isDateRangeControl), renderer: withJsonFormsControlProps(DateRangeControl) },
  { tester: rankWith(3, isMultiChoiceControl), renderer: withJsonFormsMultiEnumProps(MultiChoiceControl) },
  { tester: rankWith(3, isObjectArrayControl), renderer: withJsonFormsControlProps(TableControl) },
];
