// A sample form that uses every renderer: the tests draw it, and a components page can show it.
// Its words are sample data, as a page's would be.
import type { JsonSchema, UISchemaElement } from "@jsonforms/core";

export const exampleSchema = {
  type: "object",
  required: ["name", "crop"],
  properties: {
    name: { type: "string", title: "Name", minLength: 2, description: "What the team calls this batch." },
    notes: { type: "string", title: "Notes" },
    crop: { type: "string", title: "Crop", enum: ["basil", "lettuce", "tomato"] },
    tray: {
      type: "string",
      title: "Tray",
      oneOf: [
        { const: "s", title: "Small" },
        { const: "m", title: "Medium" },
        { const: "l", title: "Large" },
        { const: "xl", title: "Extra large" },
        { const: "flat", title: "Flat" },
        { const: "deep", title: "Deep" },
      ],
    },
    trays: { type: "integer", title: "Trays", minimum: 1 },
    temperature: { type: "number", title: "Temperature (°C)", minimum: 10, maximum: 35, default: 22 },
    window: {
      type: "object",
      title: "Sowing window",
      properties: {
        start: { type: "string", format: "date", title: "First day" },
        end: { type: "string", format: "date", title: "Last day" },
      },
    },
    light: {
      type: "array",
      title: "Light",
      uniqueItems: true,
      items: {
        type: "string",
        oneOf: [
          { const: "sun", title: "Sun" },
          { const: "led", title: "LED" },
          { const: "shade", title: "Shade" },
        ],
      },
    },
    organic: { type: "boolean", title: "Organic" },
    harvests: {
      type: "array",
      title: "Harvests",
      items: {
        type: "object",
        properties: {
          day: { type: "string", format: "date", title: "Day" },
          grams: { type: "number", title: "Grams", minimum: 0 },
          grade: { type: "string", title: "Grade", enum: ["a", "b"] },
          sold: { type: "boolean", title: "Sold" },
        },
      },
    },
  },
} satisfies JsonSchema;

export const exampleUiSchema = {
  type: "Categorization",
  label: "Batch",
  elements: [
    {
      type: "Category",
      label: "Sowing",
      elements: [
        {
          type: "HorizontalLayout",
          elements: [
            { type: "Control", scope: "#/properties/name" },
            { type: "Control", scope: "#/properties/trays" },
          ],
        },
        { type: "Control", scope: "#/properties/crop" },
        { type: "Control", scope: "#/properties/tray" },
        { type: "Control", scope: "#/properties/window" },
        { type: "Control", scope: "#/properties/notes", options: { multi: true } },
      ],
    },
    {
      type: "Category",
      label: "Growing",
      elements: [
        {
          type: "Group",
          label: "Conditions",
          elements: [
            { type: "Control", scope: "#/properties/temperature", options: { slider: true } },
            { type: "Control", scope: "#/properties/light" },
            { type: "Control", scope: "#/properties/organic" },
          ],
        },
        { type: "Label", text: "One row per harvest." },
        { type: "Control", scope: "#/properties/harvests" },
      ],
    },
  ],
} satisfies UISchemaElement & { elements: unknown[] };

export const exampleData = {
  name: "Basil, north bench",
  crop: "basil",
  trays: 4,
  temperature: 22,
  window: { start: "2026-03-01", end: "2026-03-14" },
  light: ["led"],
  harvests: [{ day: "2026-04-20", grams: 350, grade: "a", sold: true }],
};
