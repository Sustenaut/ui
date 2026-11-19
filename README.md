# @sustenaut/ui

Sustenaut's React component library. The planning app (business-plan's `planning/web`) uses
it, and later pages and apps can too. You can see every component at
https://plan.sustenaut.eu/components, or locally after `make planning` in business-plan.

## Rules

- **Presentation only.** A component gets data and callbacks as props and
  shows them. It never fetches, stores or decides anything. A page's data and
  rules live above it: a data wrapper that reads and writes, and a state
  machine that decides what can happen next. The components only display
  the result.
- **Generic names.** Components are named for what they are, not for the
  business. For example, `Meter` shows an amount out of a total; it is not
  called a "capacity bar". The business words come in through props.
- **Tailwind, utilities first.** Components are styled with Tailwind
  utility classes in the markup (no `@apply`, no separate stylesheets).
  Variations are props (`variant`, `tone`, `size`), not extra classes.
  Classes are composed with `cn()` (clsx and tailwind-merge), so a
  `className` prop can adjust a component. Prettier's Tailwind plugin
  keeps classes in a consistent order: run `npm run format` at the root.
  This follows the Tailgrids best-practices article.
- **One look.** The design tokens come from
  [`@sustenaut/theme`](https://github.com/Sustenaut/theme), the one copy every
  Sustenaut site uses, which `src/theme.css` imports: colours such as
  `bg-surface`, `text-muted`, `border-rule` and `bg-primary`, the fonts, the
  radii and the panel shadow. Dark mode reuses the same token names, so
  components need no `dark:` variants.
- **Accessible.** Components use real buttons, labels, fieldsets, radio
  groups and `aria-*` attributes. They work with the keyboard and keep a
  44 px touch target.

## The components

| Component | What it is |
|---|---|
| `Stepper` | Steps of a process as circles, left to right, each with a label and a detail line ("2 of 3 issues") |
| `Presence` | Who is on a page now: an icon and a count per role; hover or focus a role for the names |
| `Button` | Primary, secondary, quiet or warning; normal or small |
| `Meter` | An amount out of a total, with a preview of an amount about to be added; going over shows, it isn't blocked |
| `Panel` | An information block: eyebrow, title (optionally a link that opens in a new tab), actions, content |
| `Stat` | One number with its label |
| `Callout` | A highlighted message: neutral, success, warning or danger |
| `Tag` | A short label or state |
| `FormSection`, `Field` | A group of inputs with a heading; one labelled input with its hint and error |
| `ChoiceGroup` | Pick one of a few options shown as large buttons (a radio group), e.g. hours or a vote |
| `FieldGroup` | A labelled group of inputs (a fieldset) with its hint and error |
| `NumberField` | One labelled number; empty reports `undefined` |
| `RangeField` | A number between a minimum and a maximum: a slider and a number input |
| `DateRangeField` | A start and an end date side by side, stacked on a phone |
| `MultiChoiceField` | Pick any number of a few options shown as large buttons (checkboxes) |
| `CheckboxField` | A yes-or-no answer |
| `TableField`, `CellInput` | Editable rows of typed cells (text, number, whole number, date, yes/no, choice), adding and removing rows; one cell's input |
| `Tabs` | Content in tabs, one panel at a time, moved between with the arrow keys |
| `LocaleMenu` | Choose the page's language: the current flag opens a list of flags with each language's own name |
| `Distribution` | How many picked each option, as a small bar chart |
| `PageHeading` | A page's title, introduction and actions |
| `LinkList`, `TagLink` | A list of links, one per row; a small link styled as a tag |
| `DataTable` | Rows of cells by column, scrolling sideways on a phone |
| `Disclosure` | Content that opens under a one-line summary |
| `AppShell`, `SideNav` | An app's frame: a header with the brand and the account, a side navigation in sections (current page, indented items, a note per item) and the content; without navigation the content is centred |
| `StepList` | Numbered steps top to bottom, each a panel that opens under its title (`<details>`, no script needed), with a summary line and tags |
| `LaunchTile` | Something to start, e.g. an app: title, line, detail and action; when not `available`, greyed, dashed and saying what it `needs` |
| `CapabilityMatrix` | Rows of providers by columns of capabilities, each cell yes, no or partly with a footnote mark and a trade-off on hover, numbered notes below |
| `UnlockList` | "Unlock more": cards of what to do next and what each unlocks, with an action; never a level or score |
| `MenuButton` | A button that opens a menu of links or buttons under it (`<details>`, no script), e.g. "+ Link account" |
| `RowActions` | A row's usual action as a named icon (bin, flag) plus a three-dot menu for the rest; or only a word and the menu |
| `AccountChip` | A linked account as a chip: name and short id, full details on hover and focus |
| `DeviceList` | The devices someone signed in from: name and tag, country, last seen and an action |
| `RunHeader` | A live run's header: the repository as its title, unit and mode, its state as a badge, its links (the GitHub run) and facts, an explanatory line, and one primary and one secondary action (Approve, Stop) |
| `NeedTable`, `NeedRow` | A run's needs as a table, one row each: name and type, grade, what it should do (a `ModeSwitch` slot), its machine (a `MachineStrip` slot), its state badge with the time in it, its last result and its stop class (`continue` in the warn colour) |
| `ModeSwitch` | Check or Fulfil for one need, a pair of radio buttons whose legend names the need; `disabled` once the run's choices are frozen; a need of grade human gets none, as the page decides |
| `MachineStrip` | One need's state machine as a row of its states, the current one filled |
| `Journal` | A run's journal, newest last, in monospace: time · need · from → to · actor |
| `ConfirmByName` | "Cancel anyway" for a need that must finish: a warning and a field; the button stays disabled until the need's name is typed, and Enter submits nothing |
| `StateBadge`, `StopLabel` | A need's state, and how a Stop treats it, as labels |
| `Form`, `TextField`, `ChoiceField` | Bindings for [react-hook-form](https://react-hook-form.com/): a form, a text input or area, and a `ChoiceGroup` wired to its fields, showing their errors |

## Text and languages

The library contains no words of its own that a reader sees. Fixed words
are props with English defaults, which the page translates:
- `Meter`'s `text` and `format`;
- `Stepper`'s and `Presence`'s `label`;
- `Panel`'s `newTabLabel`;
- `ExternalIcon`'s `label`;
- `DateRangeField`'s `startLabel` and `endLabel`;
- `TableField`'s `addLabel` and `removeLabel`;
- `SideNav`'s and `StepList`'s `label`;
- `CapabilityMatrix`'s `text` and `rowHeader`;
- `DeviceList`'s `headers`;
- `UnlockList`'s `label` and `text`;
- `MenuButton`'s and `RowActions`' `label` and `moreLabel`;
- `ModeSwitch`'s `labels` and `legend`, `NeedRow`'s `stateLabel` and `stopLabel`, `StateBadge`'s and `StopLabel`'s `label`, `MachineStrip`'s `label`, `Journal`'s `title`, `ConfirmByName`'s `summary`, `prompt` and `action`, and `RunHeader`'s `unitLabel`.

`LocaleMenu` is the language switcher. It takes the languages (code, own
name, flag image) and reports a choice; the app does the switching
(react-i18next).

## Forms and validation

Forms use react-hook-form. The page owns the form: it calls `useForm`, sets
the default values and passes each field's rules (`required`, `pattern`,
`validate`). These are the business rules, so they don't belong in the
library. The bindings only connect fields to the form and show its errors:

```tsx
const form = useForm<{ id: string }>({ defaultValues: { id: "" } });
<Form form={form} onValid={({ id }) => send({ type: "SAVE", id })}>
  <TextField name="id" label="Calendar ID" rules={{ required: "Paste the calendar's ID." }} />
  <Button type="submit" variant="primary">Save</Button>
</Form>
```

There are two kinds of rule. Field rules (is this value filled in and well
formed?) belong to react-hook-form. Process rules (may this person do this
now?) belong to the page's state machine. A valid submit becomes a single
event sent to the machine, which decides what happens next.

## JSON Forms

`@sustenaut/ui/jsonforms` draws [JSON Forms](https://jsonforms.io) with these
components, for forms a schema describes rather than a page's code. The page
owns the JSON schema (the data and its rules), the UI schema (the layout) and
the data; the renderers only draw them and report changes:

```tsx
import { SchemaForm } from "@sustenaut/ui/jsonforms";
<SchemaForm schema={schema} uischema={uischema} data={data} onChange={({ data, errors }) => setDraft(data)} />
```

`SchemaForm` is JSON Forms' `JsonForms` with the library's `renderers` and
`cells` (both exported, so a page can add its own). What each control becomes:

| Schema | Component |
|---|---|
| `string` (`options.multi`: a text area; `format: "date"`: a date) | `Field` with an input |
| `enum` or `oneOf` of consts | `ChoiceGroup` for up to five options or `options.format: "radio"`; a select for more or `options.format: "select"` |
| `number`, `integer` | `NumberField` |
| `number`/`integer` with `minimum`, `maximum` and `options.slider: true` | `RangeField` |
| `object` whose `start` and `end` are `format: "date"` | `DateRangeField` (titles, or `options.startLabel`/`endLabel`) |
| `array` of `uniqueItems`, items an `enum` or `oneOf` | `MultiChoiceField` |
| `array` of objects | `TableField`, its cells drawn by the cell set (`options.columns` orders them) |
| `boolean` | `CheckboxField` |

The layouts are JSON Forms' own ([UI schema layouts](https://jsonforms.io/docs/uischema/layouts)):
`VerticalLayout`; `HorizontalLayout`, stacked on a phone; `Group`, a
`FormSection`; `Categorization`, `Tabs` (a category a rule hides has no tab);
and `Label`. Rules hide, show and disable as JSON Forms defines. A label,
description (shown as the hint) and error come from the schemas and from JSON
Forms' `i18n` prop, which also translates the validation messages; anything
no renderer knows draws nothing. `exampleSchema`, `exampleUiSchema` and
`exampleData` are a sample form using every renderer, for the tests and a
components page.

## Using it

```css
/* the app's CSS entry */
@import "tailwindcss";
@import "@sustenaut/ui/theme.css";      /* the tokens; also tells Tailwind to scan the library */
@import "@sustenaut/theme/fonts.css";   /* Nunito and Nunito Sans, which the tokens name */
```

`fonts.css` loads `fonts/*.woff2` from beside itself: let the bundler rewrite
the URLs, or copy `node_modules/@sustenaut/theme/fonts/` next to the built CSS.

```tsx
import { Panel, Meter } from "@sustenaut/ui";
```

An app depends on a release of this repository, `"@sustenaut/ui":
"github:Sustenaut/ui#vX.Y.Z"`, so no registry account is involved; it builds the
TypeScript and the CSS itself. A release is a tag on main with the version in
`package.json`.

Run `npm ci` here once. Then `npm test` typechecks the library, checks the
formatting and runs the scenarios (`tests/features/*.feature`, run by quickpickle on Vitest in jsdom, with their steps in `tests/*.steps.tsx`), whose
coverage goes to `coverage/lcov.info`; `npm run format` fixes the formatting.

## Releasing

With [pubrel](https://github.com/Sustenaut/pubrel), like the other Sustenaut
packages: every pull request that changes a file `release.json`'s `code` lists
records the change (`pubrel add added "…"`), and `pubrel prepare`, run in a
checkout that holds the release key (`corpus/.publet`, gitignored, backed up to
Bitwarden as `pub-signing-key-ui`), opens the release pull request. Merging it
tags `vX.Y.Z`. A consumer pins a release: `npm install github:Sustenaut/ui#vX.Y.Z`.

`v0.1.0` was tagged by hand before pubrel, so its first release is 0.1.1.
`scripts/go-live-pubrel.sh` brings releases up (the key's backup, the release
app's secrets, and after merging, the rulesets).
