# @sustenaut/ui

Sustenaut's React component library. The planning app (`planning/web`) uses
it, and later pages and apps can too. You can see every component at
https://plan.sustenaut.eu/components, or locally after `make planning`.

## Rules

- **Presentation only.** A component gets data and callbacks as props and
  shows them. It never fetches, stores or decides anything. A page's data and
  rules live above it: a data wrapper that reads and writes, and a state
  machine that decides what can happen next. The components only display
  the result.
- **Generic names.** Components are named for what they are, not for the
  business. For example, `Meter` shows an amount out of a total; it is not
  called a "capacity bar". The business words come in through props.
- **One look.** Colours, type and spacing are the tokens at the top of
  `src/styles.css`, taken from `brand/palette.json`. They have light and
  dark variants. Classes start with `su-`.
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
| `Distribution` | How many picked each option, as a small bar chart |
| `Form`, `TextField`, `ChoiceField` | Bindings for [react-hook-form](https://react-hook-form.com/): a form, a text input or area, and a `ChoiceGroup` wired to its fields, showing their errors |

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

## Using it

```tsx
import "@sustenaut/ui/styles.css";            // once, at the app's root
import { Panel, Meter } from "@sustenaut/ui";
```

The repository root is an npm workspace containing `ui` and
`planning/web`. Run `npm ci` there once. Then:
- `npm run typecheck -w ui` checks the library;
- `npm run build -w planning/web` builds the app.
