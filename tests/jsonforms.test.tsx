import type { JsonSchema7 as JsonSchema, TesterContext, UISchemaElement } from "@jsonforms/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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

type Data = Record<string, unknown>;

/** One control for the property `key` of an object schema. */
function control(key: string, options?: Record<string, unknown>): UISchemaElement {
  return { type: "Control", scope: `#/properties/${key}`, ...(options && { options }) } as UISchemaElement;
}

function objectOf(properties: Record<string, JsonSchema>, required?: string[]): JsonSchema {
  return { type: "object", properties, ...(required && { required }) };
}

/** JSON Forms tells the page of a change 10 ms after it. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

/** Draws a form; `latest` waits for its next report and hands it back. */
function draw(schema: JsonSchema, uischema: UISchemaElement, data: Data = {}) {
  const onChange = vi.fn();
  render(<SchemaForm schema={schema} uischema={uischema} data={data} onChange={onChange} />);
  return {
    latest: async () => {
      await settle();
      return onChange.mock.lastCall?.[0] as { data: Data; errors: unknown[] };
    },
  };
}

/** The renderer JSON Forms would pick, by the rank of its tester: the highest wins. */
function rankOf(
  tester: (u: UISchemaElement, s: JsonSchema, c: TesterContext) => number | boolean,
  key: string,
  schema: JsonSchema,
  options?: Record<string, unknown>,
) {
  const root = objectOf({ [key]: schema });
  return tester(control(key, options), root, { rootSchema: root, config: {} });
}

function winner(key: string, schema: JsonSchema, options?: Record<string, unknown>) {
  const ranks = renderers.map((r) => Number(rankOf(r.tester, key, schema, options)));
  return ranks.indexOf(Math.max(...ranks));
}

describe("testers", () => {
  it("pick a distinct renderer for each kind of value", async () => {
    const picks = {
      string: winner("a", { type: "string" }),
      enum: winner("a", { type: "string", enum: ["x"] }),
      oneOf: winner("a", { type: "string", oneOf: [{ const: "x", title: "X" }] }),
      number: winner("a", { type: "number" }),
      integer: winner("a", { type: "integer" }),
      slider: winner("a", { type: "number", minimum: 0, maximum: 9 }, { slider: true }),
      boolean: winner("a", { type: "boolean" }),
      dateRange: winner(
        "a",
        objectOf({ start: { type: "string", format: "date" }, end: { type: "string", format: "date" } }),
      ),
      multi: winner("a", { type: "array", uniqueItems: true, items: { type: "string", enum: ["x"] } }),
      table: winner("a", { type: "array", items: objectOf({ b: { type: "string" } }) }),
    };
    expect(picks.integer).toBe(picks.number);
    expect(new Set(Object.values(picks)).size).toBe(Object.keys(picks).length - 1);
  });

  it("show a slider only with a minimum, a maximum and the slider option", async () => {
    const range = { type: "number", minimum: 0, maximum: 9 } as const;
    expect(rankOf(isSliderControl, "a", range, { slider: true })).toBe(true);
    expect(rankOf(isSliderControl, "a", range)).toBe(false);
    expect(rankOf(isSliderControl, "a", { type: "integer", minimum: 0 }, { slider: true })).toBe(false);
  });

  it("know a date range by its start and end dates", async () => {
    const date = { type: "string", format: "date" } as const;
    expect(rankOf(isDateRangeControl, "a", objectOf({ start: date, end: date }))).toBe(true);
    expect(rankOf(isDateRangeControl, "a", objectOf({ start: date, end: { type: "string" } }))).toBe(false);
    expect(rankOf(isDateRangeControl, "a", { type: "string", format: "date" })).toBe(false);
  });

  it("know several picks by unique items of an enum or of consts", async () => {
    const of = (items: JsonSchema, uniqueItems = true) =>
      rankOf(isMultiChoiceControl, "a", { type: "array", uniqueItems, items });
    expect(of({ type: "string", enum: ["x"] })).toBe(true);
    expect(of({ oneOf: [{ const: "x" }, { const: "y" }] })).toBe(true);
    expect(of({ oneOf: [{ const: "x" }, { type: "string" }] })).toBe(false);
    expect(of({ type: "string", enum: ["x"] }, false)).toBe(false);
    expect(of({ type: "string" })).toBe(false);
  });

  it("draw nothing, and no words, for what they do not know", async () => {
    const { container } = render(
      <SchemaForm schema={objectOf({ a: { type: "null" } })} uischema={control("a")} data={{}} />,
    );
    expect(container.textContent).toBe("");
    expect(renderers.at(-1)?.tester(control("a"), {}, { rootSchema: {}, config: {} })).toBe(0);
    expect(cells.at(-1)?.tester(control("a"), {}, { rootSchema: {}, config: {} })).toBe(0);
  });
});

describe("controls", () => {
  it("draw a string as a labelled input with its description and errors", async () => {
    const schema = objectOf({ name: { type: "string", title: "Name", minLength: 3, description: "Who" } });
    const { latest } = draw(schema, control("name"), { name: "ab" });
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    expect(screen.getByText("Who")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("3");
    fireEvent.change(input, { target: { value: "abc" } });
    expect((await latest()).data).toEqual({ name: "abc" });
    expect((await latest()).errors).toEqual([]);
    fireEvent.change(input, { target: { value: "" } });
    expect((await latest()).data).toEqual({});
  });

  it("draw a multi-line string as a text area and a date as a date input", async () => {
    const schema = objectOf({ notes: { type: "string" }, day: { type: "string", format: "date" } });
    const ui = {
      type: "VerticalLayout",
      elements: [control("notes", { multi: true }), control("day")],
    } as UISchemaElement;
    const { latest } = draw(schema, ui);
    const notes = screen.getByLabelText("Notes");
    expect(notes.tagName).toBe("TEXTAREA");
    fireEvent.change(notes, { target: { value: "x" } });
    expect((screen.getByLabelText("Day") as HTMLInputElement).type).toBe("date");
    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "2026-01-02" } });
    expect((await latest()).data).toEqual({ notes: "x", day: "2026-01-02" });
    fireEvent.change(notes, { target: { value: "" } });
    expect((await latest()).data).toEqual({ day: "2026-01-02" });
  });

  it("draw a few options as buttons, keeping a number enum's numbers", async () => {
    const { latest } = draw(objectOf({ size: { type: "integer", enum: [1, 2, 3] } }), control("size"));
    const group = screen.getByRole("radiogroup", { name: "Size" });
    await userEvent.click(within(group).getByRole("radio", { name: "2" }));
    expect((await latest()).data).toEqual({ size: 2 });
    expect(within(group).getByRole("radio", { name: "2" }).getAttribute("aria-checked")).toBe("true");
  });

  it("draw many options, or the select format, as a select", async () => {
    const options = { oneOf: ["a", "b", "c", "d", "e", "f"].map((v) => ({ const: v, title: v.toUpperCase() })) };
    const { latest } = draw(objectOf({ pick: { type: "string", ...options } }), control("pick"));
    const select = screen.getByRole("combobox", { name: "Pick" });
    fireEvent.change(select, { target: { value: "c" } });
    expect((await latest()).data).toEqual({ pick: "c" });
    expect(within(select).getByRole("option", { name: "C" })).toBeTruthy();
    fireEvent.change(select, { target: { value: "" } });
    expect((await latest()).data).toEqual({});
  });

  it("follow the radio and select formats over the count", async () => {
    const schema = objectOf({
      few: { type: "string", enum: ["a", "b"] },
      many: { type: "string", enum: ["a", "b", "c", "d", "e", "f"] },
    });
    const ui = {
      type: "VerticalLayout",
      elements: [control("few", { format: "select" }), control("many", { format: "radio" })],
    };
    draw(schema, ui as UISchemaElement);
    expect(screen.getByRole("combobox", { name: "Few" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Many" })).toBeTruthy();
  });

  it("draw numbers, whole numbers stepping by one", async () => {
    const schema = objectOf({ grams: { type: "number", minimum: 0 }, trays: { type: "integer" } });
    const ui = { type: "VerticalLayout", elements: [control("grams"), control("trays")] } as UISchemaElement;
    const { latest } = draw(schema, ui, { grams: 5 });
    const trays = screen.getByLabelText("Trays") as HTMLInputElement;
    expect(trays.step).toBe("1");
    expect((screen.getByLabelText("Grams") as HTMLInputElement).min).toBe("0");
    fireEvent.change(trays, { target: { value: "3" } });
    expect((await latest()).data).toEqual({ grams: 5, trays: 3 });
    fireEvent.change(screen.getByLabelText("Grams"), { target: { value: "-1" } });
    expect(screen.getByRole("alert").textContent).toContain("0");
  });

  it("draw a bounded number with the slider option as a slider", async () => {
    const schema = objectOf({ heat: { type: "number", minimum: 10, maximum: 30, multipleOf: 0.5 } });
    const { latest } = draw(schema, control("heat", { slider: true }), { heat: 20 });
    const slider = screen.getByRole("slider", { name: "Heat" }) as HTMLInputElement;
    expect(slider.step).toBe("0.5");
    fireEvent.change(slider, { target: { value: "25" } });
    expect((await latest()).data).toEqual({ heat: 25 });
  });

  it("draw a boolean as a checkbox", async () => {
    const { latest } = draw(objectOf({ organic: { type: "boolean" } }), control("organic"));
    await userEvent.click(screen.getByRole("checkbox", { name: "Organic" }));
    expect((await latest()).data).toEqual({ organic: true });
  });

  it("draw a date range with its dates' titles, removing it when emptied", async () => {
    const date = (title?: string) => ({ type: "string", format: "date", ...(title && { title }) }) as const;
    const schema = objectOf({ window: objectOf({ start: date("First"), end: date() }) });
    const { latest } = draw(schema, control("window", { endLabel: "Last" }));
    expect(screen.getByRole("group", { name: "Window" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("First"), { target: { value: "2026-03-01" } });
    expect((await latest()).data).toEqual({ window: { start: "2026-03-01" } });
    fireEvent.change(screen.getByLabelText("First"), { target: { value: "" } });
    expect((await latest()).data).toEqual({});
    expect(screen.getByLabelText("Last")).toBeTruthy();
  });

  it("draw several picks of an enum as checkboxes", async () => {
    const schema = objectOf({
      light: { type: "array", uniqueItems: true, items: { type: "string", enum: ["sun", "led"] } },
    });
    const { latest } = draw(schema, control("light"), { light: ["led"] });
    await userEvent.click(screen.getByRole("checkbox", { name: "sun" }));
    expect((await latest()).data).toEqual({ light: ["sun", "led"] });
  });

  it("draw an array of objects as a table whose cells show their own errors", async () => {
    const row = objectOf({
      day: { type: "string", format: "date", title: "Day" },
      grams: { type: "number", minimum: 0, title: "Grams" },
      count: { type: "integer", title: "Count" },
      grade: { type: "string", enum: ["a", "b"], title: "Grade" },
      size: { type: "string", oneOf: [{ const: "s", title: "Small" }], title: "Size" },
      sold: { type: "boolean", title: "Sold", default: false },
      note: { type: "string", title: "Note" },
    });
    const schema = {
      ...objectOf({ rows: { type: "array", items: { $ref: "#/definitions/row" } } }),
      definitions: { row },
    };
    const { latest } = draw(schema, control("rows"), { rows: [] });
    expect(screen.getByRole("table", { name: "Rows" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Add row" }));
    expect((await latest()).data).toEqual({ rows: [{ sold: false }] });

    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "2026-04-20" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Grams" }), { target: { value: "-5" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Count" }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Grade" }), { target: { value: "b" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Size" }), { target: { value: "s" } });
    await userEvent.click(screen.getByRole("checkbox", { name: "Sold" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), { target: { value: "ok" } });
    expect((await latest()).data).toEqual({
      rows: [{ day: "2026-04-20", grams: -5, count: 2, grade: "b", size: "s", sold: true, note: "ok" }],
    });
    expect(screen.getByRole("spinbutton", { name: "Grams" }).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("0");

    fireEvent.change(screen.getByRole("combobox", { name: "Grade" }), { target: { value: "" } });
    expect((await latest()).data.rows).toEqual([
      { day: "2026-04-20", grams: -5, count: 2, size: "s", sold: true, note: "ok" },
    ]);
    await userEvent.click(screen.getByRole("button", { name: "Remove row 1" }));
    expect((await latest()).data).toEqual({ rows: [] });
  });

  it("order a table's columns by options.columns", async () => {
    const schema = objectOf({
      rows: { type: "array", items: objectOf({ a: { type: "string" }, b: { type: "string" } }) },
    });
    draw(schema, control("rows", { columns: ["b"] }), { rows: "not an array" } as never);
    const headings = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(headings).toEqual(["b"]);
  });

  it("hide and disable controls by their rules", async () => {
    const date = { type: "string", format: "date" } as const;
    const props: Record<string, JsonSchema> = {
      text: { type: "string" },
      choice: { type: "string", enum: ["a"] },
      number: { type: "number" },
      slider: { type: "number", minimum: 0, maximum: 1 },
      boolean: { type: "boolean" },
      range: objectOf({ start: date, end: date }),
      multi: { type: "array", uniqueItems: true, items: { enum: ["a"] } },
      table: { type: "array", items: objectOf({ a: { type: "string" } }) },
    };
    const full = objectOf({ show: { type: "boolean" }, ...props });
    const hide = { effect: "HIDE", condition: { scope: "#/properties/show", schema: { const: false } } };
    const ui = {
      type: "VerticalLayout",
      elements: Object.keys(props).map((k) => ({
        ...control(k, k === "slider" ? { slider: true } : undefined),
        rule: hide,
      })),
    };
    const { container } = render(<SchemaForm schema={full} uischema={ui as UISchemaElement} data={{ show: false }} />);
    expect(container.textContent).toBe("");
    render(<SchemaForm schema={full} uischema={ui as UISchemaElement} data={{ show: true }} readonly />);
    expect((screen.getByLabelText("Text") as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Add row" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("layouts", () => {
  const schema = objectOf({ a: { type: "string" }, b: { type: "string" }, show: { type: "boolean" } });

  it("lay out vertically, side by side (stacking on a phone) and in groups", async () => {
    const ui = {
      type: "VerticalLayout",
      elements: [
        { type: "HorizontalLayout", elements: [control("a"), control("b")] },
        { type: "Group", label: "More", elements: [control("show")] },
        { type: "Label", text: "A note" },
      ],
    } as UISchemaElement;
    const { container } = render(<SchemaForm schema={schema} uischema={ui} data={{}} />);
    expect(container.querySelector(".sm\\:flex-row")?.querySelectorAll("input")).toHaveLength(2);
    expect(within(screen.getByRole("group", { name: "More" })).getByRole("checkbox", { name: "Show" })).toBeTruthy();
    expect(screen.getByText("A note")).toBeTruthy();
  });

  it("hide layouts by their rules", async () => {
    const hide = { effect: "HIDE", condition: { scope: "#/properties/show", schema: { const: true } } };
    const ui = {
      type: "VerticalLayout",
      elements: [
        { type: "VerticalLayout", elements: [control("a")], rule: hide },
        { type: "HorizontalLayout", elements: [control("a")], rule: hide },
        { type: "Group", label: "G", elements: [control("a")], rule: hide },
        { type: "Label", text: "L", rule: hide },
        { type: "Categorization", elements: [{ type: "Category", label: "C", elements: [] }], rule: hide },
      ],
    } as UISchemaElement;
    const { container } = render(<SchemaForm schema={schema} uischema={ui} data={{ show: true }} />);
    expect(container.textContent).toBe("");
  });

  it("show categories as tabs, leaving out one a rule hides, and nest a categorization", async () => {
    const ui = {
      type: "Categorization",
      elements: [
        { type: "Category", label: "One", elements: [control("a")] },
        {
          type: "Category",
          label: "Hidden",
          elements: [control("b")],
          rule: { effect: "SHOW", condition: { scope: "#/properties/show", schema: { const: true } } },
        },
        {
          type: "Categorization",
          label: "Nested",
          elements: [{ type: "Category", label: "Inner", elements: [control("b")] }],
        },
      ],
    } as UISchemaElement;
    render(<SchemaForm schema={schema} uischema={ui} data={{}} />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["One", "Nested"]);
    expect(screen.getByLabelText("A")).toBeTruthy();
    await userEvent.click(screen.getByRole("tab", { name: "Nested" }));
    expect(screen.getByRole("tab", { name: "Inner" })).toBeTruthy();
    expect(screen.getByLabelText("B")).toBeTruthy();
  });
});

describe("the example form", () => {
  it("draws every renderer and reports its data", async () => {
    const onChange = vi.fn();
    render(<SchemaForm schema={exampleSchema} uischema={exampleUiSchema} data={exampleData} onChange={onChange} />);
    expect(screen.getByRole("tablist", { name: "Batch" })).toBeTruthy();
    expect((screen.getByLabelText("Name") as HTMLInputElement).value).toBe("Basil, north bench");
    expect(screen.getByText("What the team calls this batch.")).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "Crop" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "Tray" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Sowing window" })).toBeTruthy();
    expect(screen.getByLabelText("Notes").tagName).toBe("TEXTAREA");
    await settle();
    expect(onChange.mock.lastCall?.[0].errors).toEqual([]);

    await userEvent.click(screen.getByRole("tab", { name: "Growing" }));
    expect(screen.getByRole("group", { name: "Conditions" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Temperature (°C)" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "LED" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("checkbox", { name: "Organic" })).toBeTruthy();
    expect(screen.getByText("One row per harvest.")).toBeTruthy();
    expect(within(screen.getByRole("table", { name: "Harvests" })).getAllByRole("row")).toHaveLength(2);

    await userEvent.click(screen.getByRole("checkbox", { name: "Organic" }));
    await settle();
    expect(onChange.mock.lastCall?.[0].data).toMatchObject({ organic: true, crop: "basil" });
  });
});
