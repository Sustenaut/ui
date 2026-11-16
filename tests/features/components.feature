Feature: Sustenaut's React components, drawn in jsdom
  Each field reports what the person enters through react-hook-form's
  bindings, labelled and described as a screen reader reads it.

  Rule: NumberField

    Scenario: NumberField reports a number, and undefined when emptied
      Then NumberField reports a number, and undefined when emptied

    Scenario: NumberField takes any decimal without a step
      Then NumberField takes any decimal without a step

  Rule: RangeField

    Scenario: RangeField shows one value in a slider and a number input, both labelled
      Then RangeField shows one value in a slider and a number input, both labelled

    Scenario: RangeField puts an empty value's slider at the minimum
      Then RangeField puts an empty value's slider at the minimum

  Rule: DateRangeField

    Scenario: DateRangeField keeps the start before the end, with English labels by default
      Then DateRangeField keeps the start before the end, with English labels by default

    Scenario: DateRangeField takes the page's words for its two inputs
      Then DateRangeField takes the page's words for its two inputs

  Rule: MultiChoiceField

    Scenario: MultiChoiceField adds and removes picks, keeping the choices' order
      Then MultiChoiceField adds and removes picks, keeping the choices' order

  Rule: CheckboxField

    Scenario: CheckboxField reports whether it is ticked
      Then CheckboxField reports whether it is ticked

  Rule: FieldGroup

    Scenario: FieldGroup is a fieldset named by its legend and described by its hint
      Then FieldGroup is a fieldset named by its legend and described by its hint

  Rule: TableField

    Scenario: TableField adds a row, edits each typed cell and removes the row
      Then TableField adds a row, edits each typed cell and removes the row

    Scenario: TableField draws the page's cells and words, and no rows when it has none
      Then TableField draws the page's cells and words, and no rows when it has none

    Scenario: TableField calls renderCell for each cell
      Then TableField calls renderCell for each cell

  Rule: CellInput

    Scenario: CellInput shows values of the wrong kind as empty
      Then CellInput shows values of the wrong kind as empty

  Rule: Tabs

    Scenario: Tabs shows one panel and moves with the keyboard
      Then Tabs shows one panel and moves with the keyboard

    Scenario: Tabs opens the first tab when the value names none
      Then Tabs opens the first tab when the value names none
