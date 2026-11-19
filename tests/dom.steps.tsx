import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { expect } from "vitest";
import { Then, When } from "quickpickle";

// What the component and form scenarios share: the page a Given builds, drawn in the When, and the person's
// actions on it. Each action's result (pubtest's "the result …" steps) is the last value the page was told
// through onChange; an action the page hears nothing of is refused. The Thens read the document as a screen
// reader does: by role and accessible name, or by label ("field").

export type DomWorld = {
  /** The elements a scenario's Givens build, drawn side by side. */
  elements: ReactElement[];
  /** Every value the page was told through onChange, in order. */
  reports: unknown[];
  /** Waits for what the page is told late (JSON Forms tells it 10 ms after a change). */
  settle?: () => Promise<void>;
  container?: HTMLElement;
  attempt: (action: () => unknown) => Promise<unknown>;
};

export function begin(world: DomWorld) {
  world.elements ??= [];
  world.reports ??= [];
  return world;
}

/** Draws the scenario's elements; the result is the last value the page was told, if any. */
export async function draw(world: DomWorld) {
  begin(world);
  await world.attempt(async () => {
    world.container = render(<>{world.elements}</>).container;
    await world.settle?.();
    return world.reports.at(-1);
  });
}

/** One action of the person's; the result is the last value it told the page. */
async function act(world: DomWorld, action: () => unknown) {
  begin(world);
  await world.attempt(async () => {
    const before = world.reports.length;
    await action();
    await world.settle?.();
    if (world.reports.length === before) throw new Error("the page was told nothing");
    return world.reports.at(-1);
  });
}

/** An element by its kind: "field" by its label, "element" by a CSS selector, otherwise a role by its name. */
export function find(world: DomWorld, kind: string, name: string): HTMLElement {
  if (kind === "field") return screen.getByLabelText(name);
  if (kind === "element") {
    const found = (world.container ?? document.body).querySelector(name);
    expect(found, `no element matches ${name}`).not.toBeNull();
    return found as HTMLElement;
  }
  return screen.getByRole(kind, { name });
}

// The person's actions
{
  When("it is drawn", draw);

  When("the person enters {string} in the {word} {string}", (world: DomWorld, value: string, kind, name) =>
    act(world, () => fireEvent.change(find(world, kind, name), { target: { value } })),
  );

  When("the person clicks the {word} {string}", (world: DomWorld, kind: string, name: string) =>
    act(world, () => userEvent.click(find(world, kind, name))),
  );

  /** A click that only moves the page about, such as to another tab: it is refused if the page is told anything. */
  When("the person clicks the {word} {string}, which the page is not told of", (world: DomWorld, kind, name) =>
    world.attempt(async () => {
      const before = world.reports.length;
      await userEvent.click(find(world, kind, name));
      await world.settle?.();
      if (world.reports.length !== before) throw new Error(`the page was told ${JSON.stringify(world.reports.at(-1))}`);
    }),
  );

  When("the person presses {string} on the {word} {string}", (world: DomWorld, keys: string, kind, name) =>
    act(world, () => {
      for (const key of keys.split(" ")) fireEvent.keyDown(find(world, kind, name), { key });
    }),
  );
}

// What the page shows
{
  Then("there is a {word} {string}", (world: DomWorld, kind: string, name: string) => {
    expect(find(world, kind, name)).toBeTruthy();
  });

  /** A property of the element when it has one (value, step, disabled, tagName), otherwise its attribute. */
  Then("the {word} {string} has {string} set to {string}", (world: DomWorld, kind, name, key: string, value) => {
    const el = find(world, kind, name) as unknown as Record<string, unknown> & HTMLElement;
    expect(String(key in el ? el[key] : el.getAttribute(key))).toBe(value);
  });

  /** The words of the elements its aria-describedby names, in order. */
  Then("the {word} {string} is described by {string}", (world: DomWorld, kind: string, name: string, text) => {
    const ids = find(world, kind, name).getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(ids.map((id) => document.getElementById(id)?.textContent).join(" ")).toBe(text);
  });

  Then("the {word} {string} is focused", (world: DomWorld, kind: string, name: string) => {
    expect(document.activeElement).toBe(find(world, kind, name));
  });

  Then("the {word} reads {string}", (_w, role: string, text: string) => {
    expect(screen.getByRole(role).textContent).toBe(text);
  });

  Then("the {word} {string} reads {string}", (world: DomWorld, kind: string, name: string, text: string) => {
    expect(find(world, kind, name).textContent).toBe(text);
  });

  Then("the {word} mentions {string}", (_w, role: string, text: string) => {
    expect(screen.getByRole(role).textContent).toContain(text);
  });

  Then("the page shows {string}", (_w, text: string) => {
    expect(screen.getByText(text)).toBeTruthy();
  });

  Then("the page shows nothing", (world: DomWorld) => {
    expect(world.container?.textContent).toBe("");
  });

  Then("the {word} {string} holds the {word} {string}", (world: DomWorld, kind, name, role: string, inner) => {
    expect(within(find(world, kind, name)).getByRole(role, { name: inner })).toBeTruthy();
  });

  Then("the page has {int} element(s) of the role {string}", (_w, count: number, role: string) => {
    expect(screen.queryAllByRole(role)).toHaveLength(count);
  });

  Then("the {word} {string} holds {int} element(s) of the role {string}", (world: DomWorld, kind, name, n, role) => {
    expect(within(find(world, kind, name)).queryAllByRole(role)).toHaveLength(n);
  });

  Then("the {word} {string} holds {int} element(s) matching {string}", (world: DomWorld, kind, name, n, css) => {
    expect(find(world, kind, name).querySelectorAll(css)).toHaveLength(n);
  });

  Then("the elements of the role {string} read:", (_w, role: string, lines: string) => {
    expect(screen.getAllByRole(role).map((el) => el.textContent)).toEqual(String(lines).split("\n"));
  });
}
