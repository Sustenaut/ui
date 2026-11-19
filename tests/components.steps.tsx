import { useState, type ComponentType } from "react";
import { Given } from "quickpickle";
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
  type TableFieldColumn,
} from "../src";
import { begin, type DomWorld } from "./dom.steps";

type Props = Record<string, unknown>;

/** A component, its props read from the scenario's JSON. */
const as = (component: unknown) => component as ComponentType<Props>;

/** The components a scenario can build, and the prop that holds what the page keeps (none: it keeps nothing). */
const components: Record<string, { component: ComponentType<Props>; keeps?: string }> = {
  NumberField: { component: as(NumberField), keeps: "value" },
  RangeField: { component: as(RangeField), keeps: "value" },
  DateRangeField: { component: as(DateRangeField), keeps: "value" },
  MultiChoiceField: { component: as(MultiChoiceField), keeps: "value" },
  CheckboxField: { component: as(CheckboxField), keeps: "value" },
  TableField: { component: as(TableField), keeps: "rows" },
  Tabs: { component: as(Tabs), keeps: "value" },
  CellInput: { component: as(CellInput), keeps: "value" },
  FieldGroup: { component: as(FieldGroup) },
};

/** A component as a page holds it: the page keeps what it is told, and the scenario hears it too. */
function Page({ name, props, report }: { name: string; props: Props; report: (value: unknown) => void }) {
  const { component: Component, keeps } = components[name];
  const [kept, keep] = useState(keeps ? props[keeps] : undefined);
  const told = (value: unknown) => {
    keep(value);
    report(value);
  };
  const all = keeps ? { ...props, [keeps]: kept, onChange: told } : props;
  return <Component {...all} />;
}

type ComponentWorld = DomWorld & { props?: Props };

{
  /** The component with the props given as JSON; a tab's content is drawn as a paragraph. */
  Given("a {word} with:", (world: ComponentWorld, name: string, json: string) => {
    begin(world);
    const props = JSON.parse(json) as Props;
    if (name === "Tabs") {
      props.tabs = (props.tabs as Props[]).map((t) => ({ ...t, content: <p>{t.content as string}</p> }));
    }
    world.props = props;
    world.elements.push(
      <Page key={world.elements.length} name={name} props={props} report={(v) => world.reports.push(v)} />,
    );
  });

  Given("its new rows start as:", (world: ComponentWorld, json: string) => {
    world.props!.newRow = () => JSON.parse(json);
  });

  Given("its rows' remove buttons read {string}, n the row's number", (world: ComponentWorld, words: string) => {
    world.props!.removeLabel = (n: number) => words.replace(/\bn\b/, String(n));
  });

  Given("its cells are drawn as their column's key and row number", (world: ComponentWorld) => {
    world.props!.renderCell = ({
      row,
      column,
      labelledBy,
    }: {
      row: number;
      column: TableFieldColumn;
      labelledBy: string;
    }) => <output aria-labelledby={labelledBy}>{`${column.key}${row}`}</output>;
  });
}
