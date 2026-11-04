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
- **One look.** The design tokens are a Tailwind `@theme` in
  `src/theme.css`, taken from business-plan's `brand/palette.json`: colours such as
  `bg-surface`, `text-muted`, `border-rule` and `bg-primary`, the fonts and
  the radii. Dark mode reuses the same token names, so components need no
  `dark:` variants.
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
| `Form`, `TextField`, `ChoiceField` | Bindings for [react-hook-form](https://react-hook-form.com/): a form, a text input or area, and a `ChoiceGroup` wired to its fields, showing their errors |

## Text and languages

The library contains no words of its own that a reader sees. Fixed words
are props with English defaults, which the page translates:
- `Meter`'s `text` and `format`;
- `Stepper`'s and `Presence`'s `label`;
- `Panel`'s `newTabLabel`;
- `ExternalIcon`'s `label`;
- `DateRangeField`'s `startLabel` and `endLabel`;
- `TableField`'s `addLabel` and `removeLabel`.

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
@import "@sustenaut/ui/theme.css";   /* the tokens; also tells Tailwind to scan the library */
```

```tsx
import { Panel, Meter } from "@sustenaut/ui";
```

### Without React or Tailwind

A page with no Tailwind build (server templates, Alpine.js, plain HTML) takes
the same tokens from `src/tokens.css`: plain CSS custom properties with the
names and values `theme.css` gives Tailwind (`--color-surface`,
`--color-muted`, `--font-sans`, `--radius-control`, …), dark mode included. A
unit test fails if the two files differ. A site without a build loads it from
jsDelivr at a release tag, with its integrity:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Sustenaut/ui@vX.Y.Z/src/tokens.css"
      integrity="sha384-…" crossorigin="anonymous">
```

The fonts are Fontsource's variable builds of Nunito and Nunito Sans
(`@fontsource-variable/nunito` and `@fontsource-variable/nunito-sans`), which
the page loads itself so it can pin them too. Both files name those families
first.

### Releases

An app depends on a release of this repository, `"@sustenaut/ui":
"github:Sustenaut/ui#vX.Y.Z"`, so no registry account is involved; it builds the
TypeScript and the CSS itself. A release is a tag on main with the version in
`package.json`.

Run `npm ci` here once. Then `npm test` typechecks the library, checks the
formatting and runs the unit tests (Vitest in jsdom, `tests/*.test.tsx`), whose
coverage goes to `coverage/lcov.info`; `npm run format` fixes the formatting.
