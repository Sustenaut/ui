// Layouts: JSON Forms' own UI schema layouts (https://jsonforms.io/docs/uischema/layouts) drawn with the
// library's components. Each lays out its elements and hands every one back to JSON Forms to draw.
import {
  isVisible,
  rankWith,
  uiTypeIs,
  type Categorization,
  type Category,
  type LabelElement,
  type Layout,
  type LayoutProps,
  type UISchemaElement,
} from "@jsonforms/core";
import { JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps } from "@jsonforms/react";
import { useState } from "react";
import { cn } from "../cn";
import { FormSection } from "../components/Form";
import { Tabs } from "../components/Tabs";

/** The elements of a layout, each drawn by whichever renderer JSON Forms picks for it. */
function Elements({ elements, props, row }: { elements: UISchemaElement[]; props: LayoutProps; row?: boolean }) {
  const { schema, path, enabled, renderers, cells } = props;
  return (
    <div className={cn("flex flex-col gap-4", row && "sm:flex-row sm:items-start")}>
      {elements.map((element, i) => (
        // A UI schema's elements have no ids: their place in it is what tells them apart.
        <div key={i} className={cn(row && "min-w-0 sm:flex-1")}>
          <JsonFormsDispatch
            uischema={element}
            schema={schema}
            path={path}
            enabled={enabled}
            renderers={renderers}
            cells={cells}
          />
        </div>
      ))}
    </div>
  );
}

function VerticalLayout(props: LayoutProps) {
  if (!props.visible) return null;
  return <Elements elements={(props.uischema as Layout).elements} props={props} />;
}

/** Side by side; stacked on a phone. */
function HorizontalLayout(props: LayoutProps) {
  if (!props.visible) return null;
  return <Elements elements={(props.uischema as Layout).elements} props={props} row />;
}

/** A group of elements under a heading, as a FormSection. */
function GroupLayout(props: LayoutProps) {
  if (!props.visible) return null;
  return (
    <FormSection legend={props.label}>
      <Elements elements={(props.uischema as Layout).elements} props={props} />
    </FormSection>
  );
}

/** Categories as tabs, one open at a time; a category a rule hides has no tab. A category may itself be a
 *  categorization, which shows as tabs inside the tab. */
function CategorizationLayout(props: LayoutProps) {
  const { uischema, path, visible, config } = props;
  const { core } = useJsonForms();
  const [open, setOpen] = useState("0");
  if (!visible) return null;
  const categorization = uischema as Categorization;
  const shown = categorization.elements
    .map((category, i) => ({ category, id: String(i) }))
    .filter(({ category }) => isVisible(category, core?.data, path, core?.ajv as never, config));
  return (
    <Tabs
      label={props.label || undefined}
      value={open}
      onChange={setOpen}
      tabs={shown.map(({ category, id }) => ({
        id,
        label: category.label,
        content:
          category.type === "Category" ? (
            <Elements elements={(category as Category).elements} props={props} />
          ) : (
            <Elements elements={[category]} props={props} />
          ),
      }))}
    />
  );
}

/** A line of text from the UI schema. */
function LabelLayout({ uischema, visible }: LayoutProps) {
  if (!visible) return null;
  return <p className="m-0 text-muted">{(uischema as LabelElement).text}</p>;
}

export const layoutRenderers = [
  { tester: rankWith(1, uiTypeIs("VerticalLayout")), renderer: withJsonFormsLayoutProps(VerticalLayout) },
  { tester: rankWith(1, uiTypeIs("HorizontalLayout")), renderer: withJsonFormsLayoutProps(HorizontalLayout) },
  { tester: rankWith(1, uiTypeIs("Group")), renderer: withJsonFormsLayoutProps(GroupLayout) },
  { tester: rankWith(1, uiTypeIs("Categorization")), renderer: withJsonFormsLayoutProps(CategorizationLayout) },
  { tester: rankWith(1, uiTypeIs("Label")), renderer: withJsonFormsLayoutProps(LabelLayout) },
];
