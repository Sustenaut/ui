// quickpickle's setup for the scenarios: each draws into a fresh document.
import { cleanup } from "@testing-library/react";
import { After } from "quickpickle";

After(async () => {
  cleanup();
});
