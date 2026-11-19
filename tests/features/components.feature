Feature: Sustenaut's React components, drawn in jsdom
  Each field reports what the person enters through react-hook-form's
  bindings, labelled and described as a screen reader reads it. The result
  of each action is the last value the field told the page.

  Rule: NumberField

    Scenario: NumberField shows a whole number, described by its hint and its error
      Given a NumberField with:
        """
        {"label": "Trays", "value": 4, "step": 1, "hint": "Whole trays", "error": "Too many"}
        """
      When it is drawn
      Then the field "Trays" has "value" set to "4"
      And the field "Trays" has "inputMode" set to "numeric"
      And the field "Trays" has "aria-invalid" set to "true"
      And the field "Trays" is described by "Whole trays Too many"

    Scenario: NumberField reports a number
      Given a NumberField with:
        """
        {"label": "Trays", "value": 4, "step": 1}
        """
      When it is drawn
      And the person enters "7" in the field "Trays"
      Then the result is "7"

    Scenario: NumberField reports nothing when emptied
      Given a NumberField with:
        """
        {"label": "Trays", "value": 4, "step": 1}
        """
      When it is drawn
      And the person enters "7" in the field "Trays"
      And the person enters "" in the field "Trays"
      Then the result is empty

    Scenario: NumberField takes any decimal without a step
      Given a NumberField with:
        """
        {"label": "Grams"}
        """
      When it is drawn
      Then the field "Grams" has "value" set to ""
      And the field "Grams" has "step" set to "any"
      And the field "Grams" has "inputMode" set to "decimal"

  Rule: RangeField

    Scenario: RangeField shows one value in a slider and a number input, both labelled
      Given a RangeField with:
        """
        {"label": "Heat", "value": 20, "min": 10, "max": 30, "hint": "°C", "error": "Too hot"}
        """
      When it is drawn
      Then the slider "Heat" has "value" set to "20"
      And the spinbutton "Heat" has "value" set to "20"
      And the slider "Heat" has "min" set to "10"
      And the spinbutton "Heat" is described by "°C Too hot"
      And the alert reads "Too hot"

    Scenario: RangeField reports the slider's value
      Given a RangeField with:
        """
        {"label": "Heat", "value": 20, "min": 10, "max": 30}
        """
      When it is drawn
      And the person enters "25" in the slider "Heat"
      Then the result is "25"

    Scenario: RangeField reports nothing when its number is emptied
      Given a RangeField with:
        """
        {"label": "Heat", "value": 20, "min": 10, "max": 30}
        """
      When it is drawn
      And the person enters "25" in the slider "Heat"
      And the person enters "" in the spinbutton "Heat"
      Then the result is empty

    Scenario: RangeField puts an empty value's slider at the minimum
      Given a RangeField with:
        """
        {"label": "Heat", "min": 10, "max": 30}
        """
      When it is drawn
      Then the slider "Heat" has "value" set to "10"

  Rule: DateRangeField

    Scenario: DateRangeField is a group of two dates, with English labels by default
      Given a DateRangeField with:
        """
        {"label": "Window", "hint": "Sowing", "error": "Pick both"}
        """
      When it is drawn
      Then there is a group "Window"
      And there is a field "From"
      And there is a field "To"
      And the alert reads "Pick both"

    Scenario: DateRangeField keeps the end after a start
      Given a DateRangeField with:
        """
        {"label": "Window", "hint": "Sowing", "error": "Pick both"}
        """
      When it is drawn
      And the person enters "2026-03-01" in the field "From"
      Then the result is:
        """
        {"start": "2026-03-01"}
        """
      And the field "To" has "min" set to "2026-03-01"

    Scenario: DateRangeField keeps the start before an end
      Given a DateRangeField with:
        """
        {"label": "Window", "hint": "Sowing", "error": "Pick both"}
        """
      When it is drawn
      And the person enters "2026-03-01" in the field "From"
      And the person enters "2026-03-09" in the field "To"
      Then the result is:
        """
        {"start": "2026-03-01", "end": "2026-03-09"}
        """
      And the field "From" has "max" set to "2026-03-09"

    Scenario: DateRangeField keeps the end when the start is emptied
      Given a DateRangeField with:
        """
        {"label": "Window", "hint": "Sowing", "error": "Pick both"}
        """
      When it is drawn
      And the person enters "2026-03-01" in the field "From"
      And the person enters "2026-03-09" in the field "To"
      And the person enters "" in the field "From"
      Then the result is:
        """
        {"start": null, "end": "2026-03-09"}
        """
      And the alert reads "Pick both"

    Scenario: DateRangeField takes the page's words for its two inputs
      Given a DateRangeField with:
        """
        {"label": "Window", "value": {}, "startLabel": "Alates", "endLabel": "Kuni"}
        """
      When it is drawn
      Then there is a field "Alates"
      And there is a field "Kuni"

  Rule: MultiChoiceField

    Background:
      Given a MultiChoiceField with:
        """
        {
          "label": "Light",
          "value": ["led"],
          "choices": [
            {"value": "sun", "label": "Sun"},
            {"value": "led", "label": "LED", "tone": "warning", "dashed": true},
            {"value": "shade", "label": "Shade", "disabled": true}
          ]
        }
        """

    Scenario: MultiChoiceField marks its picks and the choices it cannot take
      When it is drawn
      Then the checkbox "LED" has "aria-checked" set to "true"
      And the checkbox "Sun" has "aria-checked" set to "false"
      And the checkbox "Shade" has "disabled" set to "true"

    Scenario: MultiChoiceField adds a pick, keeping the choices' order
      When it is drawn
      And the person clicks the checkbox "Sun"
      Then the result is:
        """
        ["sun", "led"]
        """

    Scenario: MultiChoiceField removes a pick
      When it is drawn
      And the person clicks the checkbox "LED"
      Then the result is "[]"

  Rule: MultiChoiceField disabled

    Scenario: MultiChoiceField disabled takes no choice, and draws an empty value as no picks
      Given a MultiChoiceField with:
        """
        {"label": "Light", "disabled": true, "choices": [{"value": "sun", "label": "Sun"}]}
        """
      When it is drawn
      Then the checkbox "Sun" has "aria-checked" set to "false"
      And the checkbox "Sun" has "disabled" set to "true"

  Rule: CheckboxField

    Scenario: CheckboxField starts unticked, described by its hint and its error
      Given a CheckboxField with:
        """
        {"label": "Organic", "hint": "Certified", "error": "Required"}
        """
      When it is drawn
      Then the checkbox "Organic" has "checked" set to "false"
      And the checkbox "Organic" has "aria-invalid" set to "true"
      And the page shows "Certified"

    Scenario: CheckboxField reports that it is ticked
      Given a CheckboxField with:
        """
        {"label": "Organic", "hint": "Certified", "error": "Required"}
        """
      When it is drawn
      And the person clicks the checkbox "Organic"
      Then the result is "true"

  Rule: FieldGroup

    Scenario: FieldGroup is a fieldset named by its legend and described by its hint
      Given a FieldGroup with:
        """
        {"label": "Size", "hint": "Pick one", "children": "inside"}
        """
      When it is drawn
      Then the group "Size" is described by "Pick one"

  Rule: TableField

    Background:
      Given a TableField with:
        """
        {
          "label": "Harvests",
          "hint": "One per day",
          "error": "Check the grams",
          "columns": [
            {"key": "day", "label": "Day", "type": "date"},
            {"key": "grams", "label": "Grams", "type": "number", "min": 0},
            {"key": "count", "label": "Count", "type": "integer"},
            {"key": "grade", "label": "Grade", "type": "choice", "choices": [{"value": "a", "label": "A"}]},
            {"key": "sold", "label": "Sold", "type": "boolean"},
            {"key": "note", "label": "Note", "type": "text"}
          ]
        }
        """
      And its new rows start as:
        """
        {"sold": false}
        """

    Scenario: TableField is a table named by its label, with its error
      When it is drawn
      Then there is a table "Harvests"
      And the alert reads "Check the grams"

    Scenario: TableField adds a row
      When it is drawn
      And the person clicks the button "Add row"
      Then the result is:
        """
        [{"sold": false}]
        """

    Scenario: TableField edits each typed cell
      When it is drawn
      And the person clicks the button "Add row"
      And the person enters "2026-04-20" in the field "Day"
      And the person enters "350" in the spinbutton "Grams"
      And the person enters "x" in the spinbutton "Count"
      And the person enters "a" in the combobox "Grade"
      And the person clicks the checkbox "Sold"
      And the person enters "sweet" in the textbox "Note"
      Then the result is:
        """
        [{"day": "2026-04-20", "grams": 350, "grade": "a", "sold": true, "note": "sweet"}]
        """

    Scenario: TableField leaves out an emptied text or choice
      When it is drawn
      And the person clicks the button "Add row"
      And the person enters "2026-04-20" in the field "Day"
      And the person enters "a" in the combobox "Grade"
      And the person enters "sweet" in the textbox "Note"
      And the person enters "" in the textbox "Note"
      And the person enters "" in the combobox "Grade"
      Then the result is:
        """
        [{"day": "2026-04-20", "grade": null, "note": null, "sold": false}]
        """

    Scenario: TableField removes a row
      When it is drawn
      And the person clicks the button "Add row"
      And the person clicks the button "Remove row 1"
      Then the result is "[]"

  Rule: TableField's words and cells

    Scenario: TableField draws the page's words, and no rows when it has none
      Given a TableField with:
        """
        {"label": "Rows", "columns": [{"key": "a", "label": "A", "type": "text"}], "addLabel": "Lisa rida"}
        """
      And its cells are drawn as their column's key and row number
      When it is drawn
      Then there is a button "Lisa rida"
      And the page has 1 element of the role "row"

    Scenario: TableField calls renderCell for each cell
      Given a TableField with:
        """
        {"label": "Rows", "columns": [{"key": "a", "label": "A", "type": "text"}], "rows": [{"a": "x"}]}
        """
      And its rows' remove buttons read "Eemalda n", n the row's number
      And its cells are drawn as their column's key and row number
      When it is drawn
      Then the page shows "a0"
      And there is a button "Eemalda 1"

  Rule: CellInput

    Scenario: CellInput shows values of the wrong kind as empty
      Given a CellInput with:
        """
        {"type": "text", "value": 3, "id": "t"}
        """
      And a CellInput with:
        """
        {"type": "number", "value": "3", "id": "n"}
        """
      And a CellInput with:
        """
        {"type": "choice", "value": 3, "id": "c", "invalid": true}
        """
      When it is drawn
      Then the element "#t" has "value" set to ""
      And the element "#n" has "value" set to ""
      And the element "#c" has "aria-invalid" set to "true"

  Rule: Tabs

    Background:
      Given a Tabs with:
        """
        {
          "label": "Parts",
          "value": "a",
          "tabs": [
            {"id": "a", "label": "First", "content": "one"},
            {"id": "b", "label": "Second", "content": "two"},
            {"id": "c", "label": "Third", "content": "three"}
          ]
        }
        """

    Scenario: Tabs shows one panel, named by its tab
      When it is drawn
      Then there is a tablist "Parts"
      And the tabpanel "First" reads "one"

    Scenario: Tabs opens the tab the person clicks
      When it is drawn
      And the person clicks the tab "Second"
      Then the result is "b"
      And the tabpanel reads "two"

    Scenario: Tabs moves to the next tab and its focus with the right arrow
      When it is drawn
      And the person clicks the tab "Second"
      And the person presses "ArrowRight" on the tab "Second"
      Then the result is "c"
      And the tab "Third" has "aria-selected" set to "true"
      And the tab "Third" is focused

    Scenario Outline: Tabs moves with the keyboard, wrapping at either end: <keys>
      When it is drawn
      And the person clicks the tab "Second"
      And the person presses "<keys>" on the tab "Second"
      Then the result is "<tab>"
      And the tabpanel reads "<panel>"

      Examples:
        | keys                                                                   | tab | panel |
        | ArrowRight ArrowRight                                                  | a   | one   |
        | ArrowRight ArrowRight ArrowLeft                                        | c   | three |
        | ArrowRight ArrowRight ArrowLeft Home                                   | a   | one   |
        | ArrowRight ArrowRight ArrowLeft Home ArrowLeft                         | c   | three |
        | ArrowRight ArrowRight ArrowLeft Home ArrowLeft End ArrowRight x        | a   | one   |

  Rule: Tabs without a known value

    Scenario: Tabs opens the first tab when the value names none
      Given a Tabs with:
        """
        {"value": "z", "tabs": [{"id": "a", "label": "First", "content": "one"}, {"id": "b", "label": "Second", "content": "two"}]}
        """
      When it is drawn
      Then the tabpanel reads "one"
