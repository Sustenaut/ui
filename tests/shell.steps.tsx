import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { expect, vi } from "vitest";
import { Given, Then, When } from "quickpickle";
import {
  AppShell,
  Button,
  CapabilityMatrix,
  DeviceList,
  LaunchTile,
  SideNav,
  StepList,
  Tag,
  type CapabilityRow,
  type Device,
  type StepItem,
  UnlockList,
} from "../src";

// Each scenario builds one element in a Given, draws it in the When and reads it in the Thens.
type World = { element?: ReactElement; onToggle?: ReturnType<typeof vi.fn<(id: string, open: boolean) => void>> };

const draw = (world: World) => {
  render(world.element!);
};

// AppShell and SideNav
{
  Given("a frame with a side navigation of two sections", (world: World) => {
    world.element = (
      <AppShell
        brand={<span>Sustenaut</span>}
        account={<span>@kaja-dev</span>}
        nav={
          <SideNav
            sections={[
              {
                key: "main",
                items: [
                  { key: "ws", label: "Workspace", href: "/" },
                  { key: "p", label: "kaja-studio", href: "/p", current: true, indent: true },
                ],
              },
              {
                key: "infra",
                heading: "Linked infrastructure",
                items: [
                  { key: "github", label: "GitHub", href: "/infra", meta: "linked" },
                  { key: "add", label: "+ Link a provider", href: "/infra", action: true },
                ],
                note: "More providers soon.",
              },
            ]}
          />
        }
      >
        <h1>kaja-studio</h1>
      </AppShell>
    );
  });

  Given("a frame with no side navigation and a footer", (world: World) => {
    world.element = (
      <AppShell brand={<span>Sustenaut</span>} footer={<span>Self-hosted use is free.</span>} width="narrow">
        <h1>Sign in</h1>
      </AppShell>
    );
  });

  When("the frame is drawn", draw);

  Then("the header shows the brand and the account", () => {
    const banner = screen.getByRole("banner");
    expect(within(banner).getByText("Sustenaut")).toBeTruthy();
    expect(within(banner).getByText("@kaja-dev")).toBeTruthy();
  });

  Then("the navigation is named {string} and marks {string} as the current page", (_w, name: string, page: string) => {
    const nav = screen.getByRole("navigation", { name });
    const current = within(nav).getByRole("link", { name: page });
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Workspace" }).getAttribute("aria-current")).toBeNull();
  });

  Then("the section heading {string} and the note {string} show", (_w, heading: string, meta: string) => {
    expect(screen.getByText(heading)).toBeTruthy();
    expect(screen.getByText(meta)).toBeTruthy();
    expect(screen.getByText("More providers soon.")).toBeTruthy();
  });

  Then("the page's content is the main landmark", () => {
    expect(within(screen.getByRole("main")).getByRole("heading", { name: "kaja-studio" })).toBeTruthy();
  });

  Then("there is no navigation", () => {
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getByRole("main")).toBeTruthy();
  });

  Then("the footer shows {string}", (_w, text: string) => {
    expect(within(screen.getByRole("contentinfo")).getByText(text)).toBeTruthy();
  });
}

// StepList
{
  const steps: StepItem[] = [
    {
      id: "org",
      title: "Link a GitHub organization",
      summary: "kaja-studio linked",
      status: "done",
      children: <p>Read</p>,
    },
    {
      id: "secrets",
      title: "Keep your own secrets in Bitwarden",
      summary: "Your keys stay with you",
      status: "current",
      tags: <Tag>Preview</Tag>,
      children: <p>Bitwarden holds every key</p>,
    },
    { id: "release", title: "Turn on release control", status: "upcoming", children: <p>Runs in your Actions</p> },
  ];

  Given("three steps, the first done, the second current and the third upcoming", (world: World) => {
    world.onToggle = vi.fn<(id: string, open: boolean) => void>();
    world.element = <StepList steps={steps} label="Set up your project" onToggle={world.onToggle} />;
  });

  When("the steps are drawn", draw);

  const details = (n: number) => screen.getAllByRole("listitem")[n - 1].querySelector("details")!;

  When("the person opens step {int}", (_w, n: number) => {
    const d = details(n);
    d.open = true;
    fireEvent(d, new Event("toggle"));
  });

  Then("the list is named {string}", (_w, name: string) => {
    expect(screen.getByRole("list", { name })).toBeTruthy();
  });

  Then("step {int} is marked as the current step", (_w, n: number) => {
    const items = screen.getAllByRole("listitem");
    expect(items[n - 1].getAttribute("aria-current")).toBe("step");
    expect(items.filter((i) => i.getAttribute("aria-current")).length).toBe(1);
  });

  Then("step {int} is open and steps {int} and {int} are closed", (_w, open: number, a: number, b: number) => {
    expect(details(open).open).toBe(true);
    expect(details(a).open).toBe(false);
    expect(details(b).open).toBe(false);
  });

  Then("step {int} shows its summary {string} and its tag {string}", (_w, n: number, summary: string, tag: string) => {
    const summaryEl = details(n).querySelector("summary")!;
    expect(within(summaryEl as HTMLElement).getByText(summary)).toBeTruthy();
    expect(within(summaryEl as HTMLElement).getByText(tag)).toBeTruthy();
  });

  Then("the page is told that step {int} is open", (world: World, n: number) => {
    expect(world.onToggle).toHaveBeenCalledWith(steps[n - 1].id, true);
  });
}

// LaunchTile
{
  Given("a tile {string} that is available", (world: World, title: string) => {
    world.element = (
      <LaunchTile
        title={title}
        description="Posts written in Markdown."
        detail="blog.k7q2m9xa.sustenaut.app"
        action={<Button variant="primary">Launch</Button>}
      />
    );
  });

  Given("a tile {string} that needs file storage", (world: World, title: string) => {
    world.element = (
      <LaunchTile
        title={title}
        description="Albums and sharing."
        available={false}
        needs="Needs: file storage, database"
        action={<a href="/infra">Add infrastructure</a>}
      />
    );
  });

  When("the tile is drawn", draw);

  Then("it shows {string}, its address and a {string} button", (_w, title: string, button: string) => {
    expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    expect(screen.getByText("blog.k7q2m9xa.sustenaut.app")).toBeTruthy();
    expect(screen.getByRole("button", { name: button })).toBeTruthy();
  });

  Then("it is not marked as disabled", () => {
    expect(screen.getByRole("article").getAttribute("aria-disabled")).toBeNull();
  });

  Then("it is marked as disabled", () => {
    expect(screen.getByRole("article").getAttribute("aria-disabled")).toBe("true");
  });

  Then("it says {string}", (_w, text: string) => {
    expect(screen.getByText(text)).toBeTruthy();
  });
}

// CapabilityMatrix
{
  const rows: CapabilityRow[] = [
    {
      key: "byo",
      name: "Bring your own infra",
      cells: {
        storage: { value: "yes", mark: "¹", tip: "A second provider is needed for backups" },
        zt: { value: "partly", text: "via Tailscale", tip: "Add Tailscale for zero trust" },
      },
    },
    { key: "cf", name: "Cloudflare", cells: { dns: { value: "yes" }, storage: { value: "yes" }, zt: { value: "no" } } },
  ];

  Given("a matrix of two providers and three capabilities", (world: World) => {
    world.element = (
      <CapabilityMatrix
        caption="Who can provide what"
        columns={[
          { key: "dns", header: "DNS" },
          { key: "storage", header: "File storage" },
          { key: "zt", header: "Zero trust" },
        ]}
        rows={rows}
        notes={["A second provider is needed for backups and snapshots.", "Only when Tailscale is in use."]}
      />
    );
  });

  When("the matrix is drawn", draw);

  const cellsOf = (name: string) => {
    const row = screen.getByRole("rowheader", { name }).closest("tr")!;
    return within(row).getAllByRole("cell");
  };
  const column = (header: string) =>
    screen
      .getAllByRole("columnheader")
      .slice(1)
      .findIndex((h) => h.textContent === header);

  Then(
    "the row {string} reads {string}, {string} and {string}",
    (_w, name: string, a: string, b: string, c: string) => {
      expect(cellsOf(name).map((td) => td.textContent)).toEqual([a, b, c]);
    },
  );

  Then(
    "the cell for {string} and {string} reads {string} and explains {string}",
    (_w, row: string, col: string, text: string, tip: string) => {
      const cell = cellsOf(row)[column(col)];
      expect(cell.textContent).toContain(text);
      expect(cell.getAttribute("title")).toContain(tip);
      expect(cell.textContent).toContain(tip);
    },
  );

  Then("the cell for {string} and {string} carries footnote {string}", (_w, row: string, col: string, mark: string) => {
    expect(cellsOf(row)[column(col)].querySelector("sup")!.textContent).toBe(mark);
  });

  Then("the notes are numbered in order", () => {
    const notes = screen.getAllByRole("listitem").map((li) => li.textContent);
    expect(notes).toEqual(["A second provider is needed for backups and snapshots.", "Only when Tailscale is in use."]);
    expect(screen.getByRole("table", { name: "Who can provide what" })).toBeTruthy();
  });
}

// DeviceList
{
  const devices: Device[] = [
    {
      key: "1",
      name: "Firefox on Linux",
      badge: "This device",
      country: "Estonia",
      lastSeen: "2026-11-16",
      action: "Signed in",
    },
    {
      key: "2",
      name: "Safari on iPhone",
      country: "Estonia",
      lastSeen: "2026-11-12",
      action: <Button size="small">Forget</Button>,
    },
  ];

  Given("two devices, one of them this device", (world: World) => {
    world.element = <DeviceList devices={devices} caption="Your devices" />;
  });

  Given("no devices", (world: World) => {
    world.element = <DeviceList devices={[]} empty="No devices yet" />;
  });

  When("the device list is drawn", draw);

  Then(
    "the columns are {string}, {string}, {string} and {string}",
    (_w, a: string, b: string, c: string, d: string) => {
      expect(screen.getAllByRole("columnheader").map((h) => h.textContent)).toEqual([a, b, c, d]);
    },
  );

  const rowOf = (name: string) => screen.getByText(name).closest("tr")! as HTMLElement;

  Then(
    "the row {string} is tagged {string} and was last seen {string}",
    (_w, name: string, tag: string, day: string) => {
      expect(within(rowOf(name)).getByText(tag)).toBeTruthy();
      expect(within(rowOf(name)).getByText(day)).toBeTruthy();
    },
  );

  Then("the row {string} offers {string}", (_w, name: string, action: string) => {
    expect(within(rowOf(name)).getByRole("button", { name: action })).toBeTruthy();
  });

  Then("it says {string} and has no table", (_w, text: string) => {
    expect(screen.getByText(text)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
}

// UnlockList
{
  Given("an unlock list of two next steps", (world: World) => {
    world.element = (
      <UnlockList
        items={[
          {
            key: "passkey",
            todo: "Add a second passkey for recovery",
            unlocks: "linking infrastructure",
            action: <a href="#add-passkey">Add passkey</a>,
          },
          { key: "verify", todo: "Verify yourself with an EU wallet", unlocks: "paid platform services" },
        ]}
      />
    );
  });

  When("the unlock list is drawn", draw);

  const cardOf = (text: string) => screen.getByText(text).closest("li")! as HTMLElement;

  Then("the card {string} says {string} and links to {string}", (_w, todo: string, unlocks: string, action: string) => {
    expect(cardOf(todo).textContent).toContain(unlocks);
    expect(within(cardOf(todo)).getByRole("link", { name: action })).toBeTruthy();
  });

  Then("no card shows a trust level", () => {
    for (const li of screen.getAllByRole("listitem")) expect(li.textContent).not.toMatch(/\b[PO][0-4]\b/);
  });
}
