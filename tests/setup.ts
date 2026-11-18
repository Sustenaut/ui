// quickpickle's setup for the scenarios: pubtest's steps (GRAMMAR.md), and each scenario draws into a fresh document.
import { register } from "@sustenaut/pubtest";
import { cleanup } from "@testing-library/react";
import * as quickpickle from "quickpickle";

register(quickpickle, { runner: "quickpickle" });

quickpickle.After(async () => {
  cleanup();
});
