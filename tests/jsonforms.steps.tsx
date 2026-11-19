import type { JsonSchema7 as JsonSchema, TesterContext, UISchemaElement } from "@jsonforms/core";
import { expect } from "vitest";
import { Given, Then, When } from "quickpickle";
import {
  cells,
  exampleData,
  exampleSchema,
  exampleUiSchema,
  isDateRangeControl,
  isMultiChoiceControl,
  isSliderControl,
  renderers,
  SchemaForm,
} from "../src/jsonforms";
import { begin, draw, type DomWorld } from "./dom.steps";

type Data = Record<string, unknown>;
type Tester = (u: UISchemaElement, s: JsonSchema, c: TesterContext) => number | boolean;

// A form is a schema, a UI schema and its data; the result of each action is the data JSON Forms last told the
// page, and its errors are kept for "the form reports no errors".
type FormWorld = DomWorld & {
  form?: { schema: JsonSchema; uischema: UISchemaElement; data: Data; readonly?: boolean };
  errors?: unknown[];
};

/** JSON Forms tells the page of a change 10 ms after it. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

/** One control, of the property "a" of an object schema, as a tester sees it. */
function rank(tester: Tester, { schema, options }: { schema: JsonSchema; options?: Data }) {
  const root: JsonSchema = { type: "object", properties: { a: schema } };
  const control = { type: "Control", scope: "#/properties/a", ...(options && { options }) } as UISchemaElement;
  return tester(control, root, { rootSchema: root, config: {} });
}

const testers: Record<string, Tester> = {
  isSliderControl,
  isDateRangeControl,
  isMultiChoiceControl,
  "the last renderer": renderers.at(-1)!.tester,
  "the last cell": cells.at(-1)!.tester,
};

function formOf(world: FormWorld) {
  begin(world);
  world.settle = settle;
  world.form ??= { schema: {}, uischema: { type: "VerticalLayout" } as UISchemaElement, data: {} };
  return world.form;
}

/** Draws the form once its Givens are done: JSON Forms reads the data only when it is first drawn. */
function drawn(world: FormWorld) {
  const form = world.form!;
  world.elements.push(
    <SchemaForm
      key="form"
      schema={form.schema}
      uischema={form.uischema}
      data={form.data}
      readonly={form.readonly}
      onChange={({ data, errors }) => {
        world.errors = errors as unknown[];
        world.reports.push(data);
      }}
    />,
  );
}

// testers
{
  When("the tester {string} ranks a control of:", (world: FormWorld, name: string, json: string) =>
    world.attempt(() => rank(testers[name], JSON.parse(json))),
  );

  /** The kinds of control grouped by the renderer JSON Forms picks for them, in the order given. */
  When("JSON Forms picks a renderer for each control in:", (world: FormWorld, json: string) =>
    world.attempt(() => {
      const groups = new Map<number, string[]>();
      for (const [kind, control] of Object.entries(JSON.parse(json) as Record<string, { schema: JsonSchema }>)) {
        const ranks = renderers.map((r) => Number(rank(r.tester as Tester, control)));
        const picked = ranks.indexOf(Math.max(...ranks));
        groups.set(picked, [...(groups.get(picked) ?? []), kind]);
      }
      return [...groups.values()];
    }),
  );
}

// forms
{
  Given("a form of the schema:", (world: FormWorld, json: string) => {
    formOf(world).schema = JSON.parse(json);
  });

  Given("the UI schema:", (world: FormWorld, json: string) => {
    formOf(world).uischema = JSON.parse(json);
  });

  Given("the data:", (world: FormWorld, json: string) => {
    formOf(world).data = JSON.parse(json);
  });

  Given("the form is read-only", (world: FormWorld) => {
    formOf(world).readonly = true;
  });

  Given("the example form", (world: FormWorld) => {
    Object.assign(formOf(world), { schema: exampleSchema, uischema: exampleUiSchema, data: exampleData });
  });

  When("the form is drawn", (world: FormWorld) => {
    drawn(world);
    return draw(world);
  });

  Then("the form reports no errors", (world: FormWorld) => {
    expect(world.errors).toEqual([]);
  });
}
