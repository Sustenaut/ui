Feature: The JSON Forms renderers, drawn in jsdom
  Each schema and UI schema draws the renderer its testers pick, with its
  labels, errors and rules.

  Rule: testers

    Scenario: testers pick a distinct renderer for each kind of value
      Then testers pick a distinct renderer for each kind of value

    Scenario: testers show a slider only with a minimum, a maximum and the slider option
      Then testers show a slider only with a minimum, a maximum and the slider option

    Scenario: testers know a date range by its start and end dates
      Then testers know a date range by its start and end dates

    Scenario: testers know several picks by unique items of an enum or of consts
      Then testers know several picks by unique items of an enum or of consts

    Scenario: testers draw nothing, and no words, for what they do not know
      Then testers draw nothing, and no words, for what they do not know

  Rule: controls

    Scenario: controls draw a string as a labelled input with its description and errors
      Then controls draw a string as a labelled input with its description and errors

    Scenario: controls draw a multi-line string as a text area and a date as a date input
      Then controls draw a multi-line string as a text area and a date as a date input

    Scenario: controls draw a few options as buttons, keeping a number enum's numbers
      Then controls draw a few options as buttons, keeping a number enum's numbers

    Scenario: controls draw many options, or the select format, as a select
      Then controls draw many options, or the select format, as a select

    Scenario: controls follow the radio and select formats over the count
      Then controls follow the radio and select formats over the count

    Scenario: controls draw numbers, whole numbers stepping by one
      Then controls draw numbers, whole numbers stepping by one

    Scenario: controls draw a bounded number with the slider option as a slider
      Then controls draw a bounded number with the slider option as a slider

    Scenario: controls draw a boolean as a checkbox
      Then controls draw a boolean as a checkbox

    Scenario: controls draw a date range with its dates' titles, removing it when emptied
      Then controls draw a date range with its dates' titles, removing it when emptied

    Scenario: controls draw several picks of an enum as checkboxes
      Then controls draw several picks of an enum as checkboxes

    Scenario: controls draw an array of objects as a table whose cells show their own errors
      Then controls draw an array of objects as a table whose cells show their own errors

    Scenario: controls order a table's columns by options.columns
      Then controls order a table's columns by options.columns

    Scenario: controls hide and disable controls by their rules
      Then controls hide and disable controls by their rules

  Rule: layouts

    Scenario: layouts lay out vertically, side by side (stacking on a phone) and in groups
      Then layouts lay out vertically, side by side (stacking on a phone) and in groups

    Scenario: layouts hide layouts by their rules
      Then layouts hide layouts by their rules

    Scenario: layouts show categories as tabs, leaving out one a rule hides, and nest a categorization
      Then layouts show categories as tabs, leaving out one a rule hides, and nest a categorization

  Rule: the example form

    Scenario: the example form draws every renderer and reports its data
      Then the example form draws every renderer and reports its data
