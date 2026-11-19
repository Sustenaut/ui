import { useState } from "react";
import { fireEvent, screen } from "@testing-library/react";
import { expect } from "vitest";
import { Given, Then, When } from "quickpickle";
import {
  ConfirmByName,
  Journal,
  MachineStrip,
  ModeSwitch,
  NeedRow,
  NeedTable,
  RunHeader,
  type NeedMode,
  type NeedState,
  type StopClass,
} from "../src";
import { begin, find, type DomWorld } from "./dom.steps";
import liveRunSource from "../src/components/LiveRun.tsx?raw";

// The live run page's components (LiveRun.tsx), as a page holds them: each tells the page what the
// person did (the scenario's result), and the page draws what it is told.

function Switch({
  name,
  start,
  disabled,
  report,
}: {
  name: string;
  start: NeedMode;
  disabled?: boolean;
  report: (v: unknown) => void;
}) {
  const [mode, setMode] = useState(start);
  return (
    <ModeSwitch
      name={name}
      value={mode}
      disabled={disabled}
      onChange={(m) => {
        setMode(m);
        report(m);
      }}
    />
  );
}

{
  Given("a mode switch for {string}, set to {string}", (world: DomWorld, name: string, mode: string) => {
    begin(world).elements.push(
      <Switch key={world.elements.length} name={name} start={mode as NeedMode} report={(v) => world.reports.push(v)} />,
    );
  });

  Given("a frozen mode switch for {string}, set to {string}", (world: DomWorld, name: string, mode: string) => {
    begin(world).elements.push(
      <Switch
        key={world.elements.length}
        name={name}
        start={mode as NeedMode}
        disabled
        report={(v) => world.reports.push(v)}
      />,
    );
  });

  Given(
    "a need row for {string} of type {string}, grade {string}, {string} for {string}, result {string}, stop class {string}",
    (
      world: DomWorld,
      name: string,
      type: string,
      grade: string,
      state: string,
      since: string,
      result: string,
      stop: string,
    ) => {
      begin(world).elements.push(
        <NeedTable
          key={world.elements.length}
          caption="Needs"
          headings={["Need", "Grade", "State", "Last result", "On Stop"]}
        >
          <NeedRow
            name={name}
            type={type}
            grade={grade}
            state={state as NeedState}
            since={since}
            result={result}
            stop={stop as StopClass}
          />
        </NeedTable>,
      );
    },
  );

  Given(
    "a need row for {string} holding its mode switch, set to {string}",
    (world: DomWorld, name: string, mode: string) => {
      begin(world).elements.push(
        <NeedTable
          key={world.elements.length}
          caption="Needs"
          headings={["Need", "Grade", "What it should do", "State", "Last result"]}
        >
          <NeedRow
            name={name}
            type="bitwarden.secret"
            grade="auto"
            mode={<Switch name={name} start={mode as NeedMode} report={(v) => world.reports.push(v)} />}
            state="missing"
          />
        </NeedTable>,
      );
    },
  );

  Given(
    "a machine strip for {string} of the states {string}, at {string}",
    (world: DomWorld, need: string, states: string, current: string) => {
      begin(world).elements.push(
        <MachineStrip key={world.elements.length} need={need} states={states.split(", ")} current={current} />,
      );
    },
  );

  Given("a journal of:", (world: DomWorld, json: string) => {
    begin(world).elements.push(<Journal key={world.elements.length} entries={JSON.parse(json)} />);
  });

  Given("a cancel-by-name form for {string}, warning {string}", (world: DomWorld, name: string, warning: string) => {
    begin(world).elements.push(
      <ConfirmByName
        key={world.elements.length}
        name={name}
        warning={warning}
        onConfirm={(n) => world.reports.push(`cancel ${n}`)}
      />,
    );
  });

  Given(
    "a run header for {string}, unit {string}, {string}, {string}, with Approve and Stop",
    (world: DomWorld, title: string, unit: string, mode: string, state: string) => {
      begin(world).elements.push(
        <RunHeader
          key={world.elements.length}
          title={title}
          unit={unit}
          mode={mode}
          state={{ label: state, tone: "warning" }}
          links={[
            {
              label: "GitHub run 44301877123",
              href: "https://github.com/Sustenaut/integrations/actions/runs/44301877123",
            },
          ]}
          facts={["Expires in 58 min"]}
          explain="Set what each need should do, then approve. Approving freezes these choices."
          primary={{ label: "Approve 3 fulfils", onClick: () => world.reports.push("approve") }}
          secondary={{ label: "Stop", onClick: () => world.reports.push("stop") }}
        />,
      );
    },
  );
}

{
  /** A theme colour token as the element's Tailwind class names it: "warn" for text-warn or border-warn. */
  Then(
    "the {word} {string} is drawn in the {string} colour",
    (world: DomWorld, kind: string, name: string, token: string) => {
      expect(find(world, kind, name).className).toMatch(new RegExp(`\\b(text|border|bg)-${token}\\b`));
    },
  );

  Then("the words {string} are drawn in the {string} colour", (_w, text: string, token: string) => {
    expect(screen.getByText(text).className).toMatch(new RegExp(`\\b(text|border|bg)-${token}\\b`));
  });

  Then("the {word} {string} is at least 44 px tall", (world: DomWorld, kind: string, name: string) => {
    // min-h-11 is 2.75rem: 44 px at the root's 16 px.
    const el = find(world, kind, name);
    const target = el.tagName === "INPUT" && el.getAttribute("type") === "radio" ? el.closest("label")! : el;
    expect(target.className).toMatch(/\bmin-h-11\b/);
  });

  Then("the current state of {string} is {string}", (_w, need: string, state: string) => {
    const strip = screen.getByRole("list", { name: `${need}'s machine` });
    const current = [...strip.querySelectorAll('[aria-current="step"]')].map((el) => el.textContent);
    expect(current).toEqual([state]);
  });

  Then("it names no colour of its own, only the theme's tokens", (world: DomWorld & { source?: string }) => {
    expect(world.source).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|\b(?:text|bg|border)-\[/);
  });
}

{
  When("the live run components' source is read", (world: DomWorld & { source?: string }) => {
    world.source = liveRunSource;
  });

  /** Typing into a field the page is told nothing of until a button is pressed. */
  When("the person types {string} in the field {string}", (world: DomWorld, text: string, label: string) => {
    fireEvent.change(find(world, "field", label), { target: { value: text } });
  });

  /** Enter, as a browser sends it to a text field: it would submit the field's form. */
  When("the person presses Enter in the field {string}", (world: DomWorld, label: string) => {
    const field = find(world, "field", label);
    const went = fireEvent.keyDown(field, { key: "Enter" });
    if (went) fireEvent.submit(field.closest("form")!);
  });

  Then("the page was told nothing", (world: DomWorld) => {
    expect(world.reports).toEqual([]);
  });
}
