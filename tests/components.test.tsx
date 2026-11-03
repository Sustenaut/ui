import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  CellInput,
  CheckboxField,
  DateRangeField,
  FieldGroup,
  MultiChoiceField,
  NumberField,
  RangeField,
  TableField,
  Tabs,
  type DateRange,
  type TableRow,
} from "../src";

describe("NumberField", () => {
  it("reports a number, and undefined when emptied", () => {
    const onChange = vi.fn();
    render(<NumberField label="Trays" value={4} onChange={onChange} step={1} hint="Whole trays" error="Too many" />);
    const input = screen.getByLabelText("Trays") as HTMLInputElement;
    expect(input.value).toBe("4");
    expect(input.inputMode).toBe("numeric");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Whole trays").id).toBe(input.getAttribute("aria-describedby")?.split(" ")[0]);
    fireEvent.change(input, { target: { value: "7" } });
    expect(onChange).toHaveBeenLastCalledWith(7);
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("takes any decimal without a step", () => {
    render(<NumberField label="Grams" value={undefined} onChange={() => {}} />);
    const input = screen.getByLabelText("Grams") as HTMLInputElement;
    expect(input.value).toBe("");
    expect(input.step).toBe("any");
    expect(input.inputMode).toBe("decimal");
  });
});

describe("RangeField", () => {
  it("shows one value in a slider and a number input, both labelled", () => {
    const onChange = vi.fn();
    render(<RangeField label="Heat" value={20} onChange={onChange} min={10} max={30} hint="°C" error="Too hot" />);
    const slider = screen.getByRole("slider", { name: "Heat" }) as HTMLInputElement;
    const number = screen.getByRole("spinbutton", { name: "Heat" }) as HTMLInputElement;
    expect(slider.value).toBe("20");
    expect(number.value).toBe("20");
    expect(slider.min).toBe("10");
    expect(number.getAttribute("aria-describedby")).toContain("hint");
    expect(screen.getByRole("alert").textContent).toBe("Too hot");
    fireEvent.change(slider, { target: { value: "25" } });
    expect(onChange).toHaveBeenLastCalledWith(25);
    fireEvent.change(number, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("puts an empty value's slider at the minimum", () => {
    render(<RangeField label="Heat" value={undefined} onChange={() => {}} min={10} max={30} />);
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("10");
  });
});

describe("DateRangeField", () => {
  function Harness({ onChange }: { onChange: (v: DateRange) => void }) {
    const [value, setValue] = useState<DateRange | undefined>(undefined);
    return (
      <DateRangeField
        label="Window"
        value={value}
        hint="Sowing"
        error="Pick both"
        onChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      />
    );
  }

  it("keeps the start before the end, with English labels by default", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    expect(screen.getByRole("group", { name: "Window" })).toBeTruthy();
    const from = screen.getByLabelText("From") as HTMLInputElement;
    const to = screen.getByLabelText("To") as HTMLInputElement;
    fireEvent.change(from, { target: { value: "2026-03-01" } });
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-03-01", end: undefined });
    expect(to.min).toBe("2026-03-01");
    fireEvent.change(to, { target: { value: "2026-03-09" } });
    expect(onChange).toHaveBeenLastCalledWith({ start: "2026-03-01", end: "2026-03-09" });
    expect(from.max).toBe("2026-03-09");
    fireEvent.change(from, { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith({ start: undefined, end: "2026-03-09" });
    expect(screen.getByRole("alert").textContent).toBe("Pick both");
  });

  it("takes the page's words for its two inputs", () => {
    render(<DateRangeField label="Window" value={{}} onChange={() => {}} startLabel="Alates" endLabel="Kuni" />);
    expect(screen.getByLabelText("Alates")).toBeTruthy();
    expect(screen.getByLabelText("Kuni")).toBeTruthy();
  });
});

describe("MultiChoiceField", () => {
  const choices = [
    { value: "sun", label: "Sun" },
    { value: "led", label: "LED", tone: "warning" as const, dashed: true },
    { value: "shade", label: "Shade", disabled: true },
  ];

  it("adds and removes picks, keeping the choices' order", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MultiChoiceField label="Light" choices={choices} value={["led"]} onChange={onChange} />,
    );
    const sun = screen.getByRole("checkbox", { name: "Sun" });
    expect(screen.getByRole("checkbox", { name: "LED" }).getAttribute("aria-checked")).toBe("true");
    expect(sun.getAttribute("aria-checked")).toBe("false");
    await userEvent.click(sun);
    expect(onChange).toHaveBeenLastCalledWith(["sun", "led"]);
    await userEvent.click(screen.getByRole("checkbox", { name: "LED" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect((screen.getByRole("checkbox", { name: "Shade" }) as HTMLButtonElement).disabled).toBe(true);
    rerender(<MultiChoiceField label="Light" choices={choices} value={undefined} onChange={onChange} disabled />);
    expect((screen.getByRole("checkbox", { name: "Sun" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("CheckboxField", () => {
  it("reports whether it is ticked", async () => {
    const onChange = vi.fn();
    render(<CheckboxField label="Organic" value={undefined} onChange={onChange} hint="Certified" error="Required" />);
    const box = screen.getByRole("checkbox", { name: "Organic" }) as HTMLInputElement;
    expect(box.checked).toBe(false);
    expect(box.getAttribute("aria-invalid")).toBe("true");
    await userEvent.click(box);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByText("Certified")).toBeTruthy();
  });
});

describe("FieldGroup", () => {
  it("is a fieldset named by its legend and described by its hint", () => {
    render(
      <FieldGroup label="Size" hint="Pick one">
        <span>inside</span>
      </FieldGroup>,
    );
    const group = screen.getByRole("group", { name: "Size" });
    expect(group.getAttribute("aria-describedby")).toBe(screen.getByText("Pick one").id);
  });
});

describe("TableField", () => {
  const columns = [
    { key: "day", label: "Day", type: "date" as const },
    { key: "grams", label: "Grams", type: "number" as const, min: 0 },
    { key: "count", label: "Count", type: "integer" as const },
    { key: "grade", label: "Grade", type: "choice" as const, choices: [{ value: "a", label: "A" }] },
    { key: "sold", label: "Sold", type: "boolean" as const },
    { key: "note", label: "Note", type: "text" as const },
  ];

  function Harness({ onChange, start = [] }: { onChange: (rows: TableRow[]) => void; start?: TableRow[] }) {
    const [rows, setRows] = useState<TableRow[]>(start);
    return (
      <TableField
        label="Harvests"
        columns={columns}
        rows={rows}
        hint="One per day"
        error="Check the grams"
        newRow={() => ({ sold: false })}
        onChange={(r) => {
          setRows(r);
          onChange(r);
        }}
      />
    );
  }

  it("adds a row, edits each typed cell and removes the row", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    expect(screen.getByRole("table", { name: "Harvests" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Add row" }));
    expect(onChange).toHaveBeenLastCalledWith([{ sold: false }]);

    fireEvent.change(screen.getByLabelText("Day"), { target: { value: "2026-04-20" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Grams" }), { target: { value: "350" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Count" }), { target: { value: "x" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Grade" }), { target: { value: "a" } });
    await userEvent.click(screen.getByRole("checkbox", { name: "Sold" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), { target: { value: "sweet" } });
    expect(onChange).toHaveBeenLastCalledWith([
      { day: "2026-04-20", grams: 350, count: undefined, grade: "a", sold: true, note: "sweet" },
    ]);
    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), { target: { value: "" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Grade" }), { target: { value: "" } });
    expect(onChange.mock.lastCall?.[0][0]).toMatchObject({ note: undefined, grade: undefined });

    expect(screen.getByRole("alert").textContent).toBe("Check the grams");
    await userEvent.click(screen.getByRole("button", { name: "Remove row 1" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("draws the page's cells and words, and no rows when it has none", () => {
    render(
      <TableField
        label="Rows"
        columns={[{ key: "a", label: "A", type: "text" }]}
        rows={undefined}
        onChange={() => {}}
        addLabel="Lisa rida"
        removeLabel={(n) => `Eemalda ${n}`}
        renderCell={({ row, labelledBy }) => <output aria-labelledby={labelledBy}>{row}</output>}
      />,
    );
    expect(screen.getByRole("button", { name: "Lisa rida" })).toBeTruthy();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("calls renderCell for each cell", () => {
    render(
      <TableField
        label="Rows"
        columns={[{ key: "a", label: "A", type: "text" }]}
        rows={[{ a: "x" }]}
        onChange={() => {}}
        removeLabel={(n) => `Eemalda ${n}`}
        renderCell={({ row, column }) => <span>{`${column.key}${row}`}</span>}
      />,
    );
    expect(screen.getByText("a0")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Eemalda 1" })).toBeTruthy();
  });
});

describe("CellInput", () => {
  it("shows values of the wrong kind as empty", () => {
    render(
      <>
        <CellInput type="text" value={3} onChange={() => {}} id="t" />
        <CellInput type="number" value="3" onChange={() => {}} id="n" />
        <CellInput type="choice" value={3} onChange={() => {}} id="c" invalid />
      </>,
    );
    expect((document.getElementById("t") as HTMLInputElement).value).toBe("");
    expect((document.getElementById("n") as HTMLInputElement).value).toBe("");
    expect(document.getElementById("c")?.getAttribute("aria-invalid")).toBe("true");
  });
});

describe("Tabs", () => {
  const tabs = [
    { id: "a", label: "First", content: <p>one</p> },
    { id: "b", label: "Second", content: <p>two</p> },
    { id: "c", label: "Third", content: <p>three</p> },
  ];

  function Harness() {
    const [value, setValue] = useState("a");
    return <Tabs label="Parts" tabs={tabs} value={value} onChange={setValue} />;
  }

  it("shows one panel and moves with the keyboard", async () => {
    render(<Harness />);
    expect(screen.getByRole("tablist", { name: "Parts" })).toBeTruthy();
    expect(screen.getByRole("tabpanel", { name: "First" }).textContent).toBe("one");
    await userEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByRole("tabpanel").textContent).toBe("two");
    const second = screen.getByRole("tab", { name: "Second" });
    fireEvent.keyDown(second, { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Third" }).getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "Third" }));
    fireEvent.keyDown(second, { key: "ArrowRight" });
    expect(screen.getByRole("tabpanel").textContent).toBe("one");
    fireEvent.keyDown(second, { key: "ArrowLeft" });
    expect(screen.getByRole("tabpanel").textContent).toBe("three");
    fireEvent.keyDown(second, { key: "Home" });
    expect(screen.getByRole("tabpanel").textContent).toBe("one");
    fireEvent.keyDown(second, { key: "ArrowLeft" });
    expect(screen.getByRole("tabpanel").textContent).toBe("three");
    fireEvent.keyDown(second, { key: "End" });
    fireEvent.keyDown(second, { key: "ArrowRight" });
    fireEvent.keyDown(second, { key: "x" });
    expect(screen.getByRole("tabpanel").textContent).toBe("one");
  });

  it("opens the first tab when the value names none", () => {
    render(<Tabs tabs={tabs} value="z" onChange={() => {}} />);
    expect(screen.getByRole("tabpanel").textContent).toBe("one");
  });
});
