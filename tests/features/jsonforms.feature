Feature: The JSON Forms renderers, drawn in jsdom
  Each schema and UI schema draws the renderer its testers pick, with its
  labels, errors and rules. The result of each action on a form is the data
  JSON Forms last told the page.

  Rule: testers

    Scenario: testers pick a distinct renderer for each kind of value, whole numbers sharing the numbers'
      When JSON Forms picks a renderer for each control in:
        """
        {
          "string": {"schema": {"type": "string"}},
          "enum": {"schema": {"type": "string", "enum": ["x"]}},
          "oneOf": {"schema": {"type": "string", "oneOf": [{"const": "x", "title": "X"}]}},
          "number": {"schema": {"type": "number"}},
          "integer": {"schema": {"type": "integer"}},
          "slider": {"schema": {"type": "number", "minimum": 0, "maximum": 9}, "options": {"slider": true}},
          "boolean": {"schema": {"type": "boolean"}},
          "dateRange": {"schema": {"type": "object", "properties": {"start": {"type": "string", "format": "date"}, "end": {"type": "string", "format": "date"}}}},
          "multi": {"schema": {"type": "array", "uniqueItems": true, "items": {"type": "string", "enum": ["x"]}}},
          "table": {"schema": {"type": "array", "items": {"type": "object", "properties": {"b": {"type": "string"}}}}}
        }
        """
      Then the result is:
        """
        [["string"], ["enum"], ["oneOf"], ["number", "integer"], ["slider"], ["boolean"], ["dateRange"], ["multi"], ["table"]]
        """

    Scenario Outline: testers show a slider only with a minimum, a maximum and the slider option: <schema> <options>
      When the tester "isSliderControl" ranks a control of:
        """
        {"schema": <schema>, "options": <options>}
        """
      Then the result is "<slider>"

      Examples:
        | schema                                         | options          | slider |
        | {"type": "number", "minimum": 0, "maximum": 9} | {"slider": true} | true   |
        | {"type": "number", "minimum": 0, "maximum": 9} | {}               | false  |
        | {"type": "integer", "minimum": 0}              | {"slider": true} | false  |

    Scenario Outline: testers know a date range by its start and end dates: <schema>
      When the tester "isDateRangeControl" ranks a control of:
        """
        {"schema": <schema>}
        """
      Then the result is "<range>"

      Examples:
        | schema                                                                                                                  | range |
        | {"type": "object", "properties": {"start": {"type": "string", "format": "date"}, "end": {"type": "string", "format": "date"}}} | true  |
        | {"type": "object", "properties": {"start": {"type": "string", "format": "date"}, "end": {"type": "string"}}}                   | false |
        | {"type": "string", "format": "date"}                                                                                           | false |

    Scenario Outline: testers know several picks by unique items of an enum or of consts: <items>, unique <unique>
      When the tester "isMultiChoiceControl" ranks a control of:
        """
        {"schema": {"type": "array", "uniqueItems": <unique>, "items": <items>}}
        """
      Then the result is "<picks>"

      Examples:
        | items                                          | unique | picks |
        | {"type": "string", "enum": ["x"]}              | true   | true  |
        | {"oneOf": [{"const": "x"}, {"const": "y"}]}    | true   | true  |
        | {"oneOf": [{"const": "x"}, {"type": "string"}]} | true   | false |
        | {"type": "string", "enum": ["x"]}              | false  | false |
        | {"type": "string"}                             | true   | false |

    Scenario: testers draw nothing, and no words, for what they do not know
      Given a form of the schema:
        """
        {"type": "object", "properties": {"a": {"type": "null"}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/a"}
        """
      When the form is drawn
      Then the page shows nothing

    Scenario Outline: testers rank anything they do not know at 0: <tester>
      When the tester "<tester>" ranks a control of:
        """
        {"schema": {}}
        """
      Then the result is "0"

      Examples:
        | tester            |
        | the last renderer |
        | the last cell     |

  Rule: controls: a string

    Background:
      Given a form of the schema:
        """
        {"type": "object", "properties": {"name": {"type": "string", "title": "Name", "minLength": 3, "description": "Who"}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/name"}
        """
      And the data:
        """
        {"name": "ab"}
        """

    Scenario: controls draw a string as a labelled input with its description and errors
      When the form is drawn
      Then there is a field "Name"
      And the page shows "Who"
      And the alert mentions "3"

    Scenario: controls report a string, with no errors once it is valid
      When the form is drawn
      And the person enters "abc" in the field "Name"
      Then the result is:
        """
        {"name": "abc"}
        """
      And the form reports no errors

    Scenario: controls leave out an emptied string
      When the form is drawn
      And the person enters "abc" in the field "Name"
      And the person enters "" in the field "Name"
      Then the result is "{}"

  Rule: controls: a text area and a date

    Background:
      Given a form of the schema:
        """
        {"type": "object", "properties": {"notes": {"type": "string"}, "day": {"type": "string", "format": "date"}}}
        """
      And the UI schema:
        """
        {"type": "VerticalLayout", "elements": [
          {"type": "Control", "scope": "#/properties/notes", "options": {"multi": true}},
          {"type": "Control", "scope": "#/properties/day"}
        ]}
        """

    Scenario: controls draw a multi-line string as a text area and a date as a date input
      When the form is drawn
      Then the field "Notes" has "tagName" set to "TEXTAREA"
      And the field "Day" has "type" set to "date"

    Scenario: controls report a text area and a date
      When the form is drawn
      And the person enters "x" in the field "Notes"
      And the person enters "2026-01-02" in the field "Day"
      Then the result is:
        """
        {"notes": "x", "day": "2026-01-02"}
        """

    Scenario: controls leave out an emptied text area
      When the form is drawn
      And the person enters "x" in the field "Notes"
      And the person enters "2026-01-02" in the field "Day"
      And the person enters "" in the field "Notes"
      Then the result is:
        """
        {"day": "2026-01-02"}
        """

  Rule: controls: options

    Scenario: controls draw a few options as buttons, keeping a number enum's numbers
      Given a form of the schema:
        """
        {"type": "object", "properties": {"size": {"type": "integer", "enum": [1, 2, 3]}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/size"}
        """
      When the form is drawn
      And the person clicks the radio "2"
      Then the result is:
        """
        {"size": 2}
        """
      And the radiogroup "Size" holds the radio "2"
      And the radio "2" has "aria-checked" set to "true"

    Scenario: controls draw many options, or the select format, as a select
      Given a form of the schema:
        """
        {"type": "object", "properties": {"pick": {"type": "string", "oneOf": [
          {"const": "a", "title": "A"}, {"const": "b", "title": "B"}, {"const": "c", "title": "C"},
          {"const": "d", "title": "D"}, {"const": "e", "title": "E"}, {"const": "f", "title": "F"}
        ]}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/pick"}
        """
      When the form is drawn
      And the person enters "c" in the combobox "Pick"
      Then the result is:
        """
        {"pick": "c"}
        """
      And the combobox "Pick" holds the option "C"

    Scenario: controls leave out an emptied select
      Given a form of the schema:
        """
        {"type": "object", "properties": {"pick": {"type": "string", "oneOf": [
          {"const": "a", "title": "A"}, {"const": "b", "title": "B"}, {"const": "c", "title": "C"},
          {"const": "d", "title": "D"}, {"const": "e", "title": "E"}, {"const": "f", "title": "F"}
        ]}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/pick"}
        """
      When the form is drawn
      And the person enters "c" in the combobox "Pick"
      And the person enters "" in the combobox "Pick"
      Then the result is "{}"

    Scenario: controls follow the radio and select formats over the count
      Given a form of the schema:
        """
        {"type": "object", "properties": {
          "few": {"type": "string", "enum": ["a", "b"]},
          "many": {"type": "string", "enum": ["a", "b", "c", "d", "e", "f"]}
        }}
        """
      And the UI schema:
        """
        {"type": "VerticalLayout", "elements": [
          {"type": "Control", "scope": "#/properties/few", "options": {"format": "select"}},
          {"type": "Control", "scope": "#/properties/many", "options": {"format": "radio"}}
        ]}
        """
      When the form is drawn
      Then there is a combobox "Few"
      And there is a radiogroup "Many"

  Rule: controls: numbers

    Background:
      Given a form of the schema:
        """
        {"type": "object", "properties": {"grams": {"type": "number", "minimum": 0}, "trays": {"type": "integer"}}}
        """
      And the UI schema:
        """
        {"type": "VerticalLayout", "elements": [
          {"type": "Control", "scope": "#/properties/grams"},
          {"type": "Control", "scope": "#/properties/trays"}
        ]}
        """
      And the data:
        """
        {"grams": 5}
        """

    Scenario: controls draw numbers, whole numbers stepping by one
      When the form is drawn
      Then the field "Trays" has "step" set to "1"
      And the field "Grams" has "min" set to "0"

    Scenario: controls report a whole number
      When the form is drawn
      And the person enters "3" in the field "Trays"
      Then the result is:
        """
        {"grams": 5, "trays": 3}
        """

    Scenario: controls show a number's error
      When the form is drawn
      And the person enters "-1" in the field "Grams"
      Then the alert mentions "0"

  Rule: controls: a slider, a checkbox, a date range and picks

    Scenario: controls draw a bounded number with the slider option as a slider
      Given a form of the schema:
        """
        {"type": "object", "properties": {"heat": {"type": "number", "minimum": 10, "maximum": 30, "multipleOf": 0.5}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/heat", "options": {"slider": true}}
        """
      And the data:
        """
        {"heat": 20}
        """
      When the form is drawn
      And the person enters "25" in the slider "Heat"
      Then the result is:
        """
        {"heat": 25}
        """
      And the slider "Heat" has "step" set to "0.5"

    Scenario: controls draw a boolean as a checkbox
      Given a form of the schema:
        """
        {"type": "object", "properties": {"organic": {"type": "boolean"}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/organic"}
        """
      When the form is drawn
      And the person clicks the checkbox "Organic"
      Then the result is:
        """
        {"organic": true}
        """

    Scenario: controls draw a date range with its dates' titles, removing it when emptied
      Given a form of the schema:
        """
        {"type": "object", "properties": {"window": {"type": "object", "properties": {
          "start": {"type": "string", "format": "date", "title": "First"},
          "end": {"type": "string", "format": "date"}
        }}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/window", "options": {"endLabel": "Last"}}
        """
      When the form is drawn
      And the person enters "2026-03-01" in the field "First"
      Then the result is:
        """
        {"window": {"start": "2026-03-01"}}
        """
      And there is a group "Window"
      And there is a field "Last"

    Scenario: controls remove an emptied date range
      Given a form of the schema:
        """
        {"type": "object", "properties": {"window": {"type": "object", "properties": {
          "start": {"type": "string", "format": "date", "title": "First"},
          "end": {"type": "string", "format": "date"}
        }}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/window", "options": {"endLabel": "Last"}}
        """
      When the form is drawn
      And the person enters "2026-03-01" in the field "First"
      And the person enters "" in the field "First"
      Then the result is "{}"

    Scenario: controls draw several picks of an enum as checkboxes
      Given a form of the schema:
        """
        {"type": "object", "properties": {"light": {"type": "array", "uniqueItems": true, "items": {"type": "string", "enum": ["sun", "led"]}}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/light"}
        """
      And the data:
        """
        {"light": ["led"]}
        """
      When the form is drawn
      And the person clicks the checkbox "sun"
      Then the result is:
        """
        {"light": ["sun", "led"]}
        """

  Rule: controls: a table

    Background:
      Given a form of the schema:
        """
        {
          "type": "object",
          "properties": {"rows": {"type": "array", "items": {"$ref": "#/definitions/row"}}},
          "definitions": {"row": {"type": "object", "properties": {
            "day": {"type": "string", "format": "date", "title": "Day"},
            "grams": {"type": "number", "minimum": 0, "title": "Grams"},
            "count": {"type": "integer", "title": "Count"},
            "grade": {"type": "string", "enum": ["a", "b"], "title": "Grade"},
            "size": {"type": "string", "oneOf": [{"const": "s", "title": "Small"}], "title": "Size"},
            "sold": {"type": "boolean", "title": "Sold", "default": false},
            "note": {"type": "string", "title": "Note"}
          }}}
        }
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/rows"}
        """
      And the data:
        """
        {"rows": []}
        """

    Scenario: controls draw an array of objects as a table that adds a row with its defaults
      When the form is drawn
      And the person clicks the button "Add row"
      Then the result is:
        """
        {"rows": [{"sold": false}]}
        """
      And there is a table "Rows"

    Scenario: controls draw a table whose cells take each kind of value and show their own errors
      When the form is drawn
      And the person clicks the button "Add row"
      And the person enters "2026-04-20" in the field "Day"
      And the person enters "-5" in the spinbutton "Grams"
      And the person enters "2" in the spinbutton "Count"
      And the person enters "b" in the combobox "Grade"
      And the person enters "s" in the combobox "Size"
      And the person clicks the checkbox "Sold"
      And the person enters "ok" in the textbox "Note"
      Then the result is:
        """
        {"rows": [{"day": "2026-04-20", "grams": -5, "count": 2, "grade": "b", "size": "s", "sold": true, "note": "ok"}]}
        """
      And the spinbutton "Grams" has "aria-invalid" set to "true"
      And the alert mentions "0"

    Scenario: controls leave out a table's emptied cell
      When the form is drawn
      And the person clicks the button "Add row"
      And the person enters "2026-04-20" in the field "Day"
      And the person enters "-5" in the spinbutton "Grams"
      And the person enters "2" in the spinbutton "Count"
      And the person enters "b" in the combobox "Grade"
      And the person enters "s" in the combobox "Size"
      And the person clicks the checkbox "Sold"
      And the person enters "ok" in the textbox "Note"
      And the person enters "" in the combobox "Grade"
      Then the result is:
        """
        {"rows": [{"day": "2026-04-20", "grams": -5, "count": 2, "size": "s", "sold": true, "note": "ok"}]}
        """

    Scenario: controls remove a table's row
      When the form is drawn
      And the person clicks the button "Add row"
      And the person clicks the button "Remove row 1"
      Then the result is:
        """
        {"rows": []}
        """

  Rule: controls: a table's columns

    Scenario: controls order a table's columns by options.columns
      Given a form of the schema:
        """
        {"type": "object", "properties": {"rows": {"type": "array", "items": {"type": "object", "properties": {"a": {"type": "string"}, "b": {"type": "string"}}}}}}
        """
      And the UI schema:
        """
        {"type": "Control", "scope": "#/properties/rows", "options": {"columns": ["b"]}}
        """
      And the data:
        """
        {"rows": "not an array"}
        """
      When the form is drawn
      Then the elements of the role "columnheader" read:
        """
        b
        """

  Rule: controls: rules

    Background:
      Given a form of the schema:
        """
        {"type": "object", "properties": {
          "show": {"type": "boolean"},
          "text": {"type": "string"},
          "choice": {"type": "string", "enum": ["a"]},
          "number": {"type": "number"},
          "slider": {"type": "number", "minimum": 0, "maximum": 1},
          "boolean": {"type": "boolean"},
          "range": {"type": "object", "properties": {"start": {"type": "string", "format": "date"}, "end": {"type": "string", "format": "date"}}},
          "multi": {"type": "array", "uniqueItems": true, "items": {"enum": ["a"]}},
          "table": {"type": "array", "items": {"type": "object", "properties": {"a": {"type": "string"}}}}
        }}
        """
      And the UI schema:
        """
        {"type": "VerticalLayout", "elements": [
          {"type": "Control", "scope": "#/properties/text", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}},
          {"type": "Control", "scope": "#/properties/choice", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}},
          {"type": "Control", "scope": "#/properties/number", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}},
          {"type": "Control", "scope": "#/properties/slider", "options": {"slider": true}, "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}},
          {"type": "Control", "scope": "#/properties/boolean", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}},
          {"type": "Control", "scope": "#/properties/range", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}},
          {"type": "Control", "scope": "#/properties/multi", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}},
          {"type": "Control", "scope": "#/properties/table", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": false}}}}
        ]}
        """

    Scenario: controls hide every kind of control by its rule
      Given the data:
        """
        {"show": false}
        """
      When the form is drawn
      Then the page shows nothing

    Scenario: controls disable every kind of control in a read-only form
      Given the data:
        """
        {"show": true}
        """
      And the form is read-only
      When the form is drawn
      Then the field "Text" has "disabled" set to "true"
      And the button "Add row" has "disabled" set to "true"

  Rule: layouts

    Background:
      Given a form of the schema:
        """
        {"type": "object", "properties": {"a": {"type": "string"}, "b": {"type": "string"}, "show": {"type": "boolean"}}}
        """

    Scenario: layouts lay out vertically, side by side (stacking on a phone) and in groups
      Given the UI schema:
        """
        {"type": "VerticalLayout", "elements": [
          {"type": "HorizontalLayout", "elements": [{"type": "Control", "scope": "#/properties/a"}, {"type": "Control", "scope": "#/properties/b"}]},
          {"type": "Group", "label": "More", "elements": [{"type": "Control", "scope": "#/properties/show"}]},
          {"type": "Label", "text": "A note"}
        ]}
        """
      When the form is drawn
      Then the element ".sm\:flex-row" holds 2 elements matching "input"
      And the group "More" holds the checkbox "Show"
      And the page shows "A note"

    Scenario: layouts hide layouts by their rules
      Given the UI schema:
        """
        {"type": "VerticalLayout", "elements": [
          {"type": "VerticalLayout", "elements": [{"type": "Control", "scope": "#/properties/a"}], "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": true}}}},
          {"type": "HorizontalLayout", "elements": [{"type": "Control", "scope": "#/properties/a"}], "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": true}}}},
          {"type": "Group", "label": "G", "elements": [{"type": "Control", "scope": "#/properties/a"}], "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": true}}}},
          {"type": "Label", "text": "L", "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": true}}}},
          {"type": "Categorization", "elements": [{"type": "Category", "label": "C", "elements": []}], "rule": {"effect": "HIDE", "condition": {"scope": "#/properties/show", "schema": {"const": true}}}}
        ]}
        """
      And the data:
        """
        {"show": true}
        """
      When the form is drawn
      Then the page shows nothing

    Scenario: layouts show categories as tabs, leaving out one a rule hides, and nest a categorization
      Given the UI schema:
        """
        {"type": "Categorization", "elements": [
          {"type": "Category", "label": "One", "elements": [{"type": "Control", "scope": "#/properties/a"}]},
          {"type": "Category", "label": "Hidden", "elements": [{"type": "Control", "scope": "#/properties/b"}],
           "rule": {"effect": "SHOW", "condition": {"scope": "#/properties/show", "schema": {"const": true}}}},
          {"type": "Categorization", "label": "Nested", "elements": [{"type": "Category", "label": "Inner", "elements": [{"type": "Control", "scope": "#/properties/b"}]}]}
        ]}
        """
      When the form is drawn
      Then the elements of the role "tab" read:
        """
        One
        Nested
        """
      And there is a field "A"

    Scenario: layouts open a nested categorization's own tabs
      Given the UI schema:
        """
        {"type": "Categorization", "elements": [
          {"type": "Category", "label": "One", "elements": [{"type": "Control", "scope": "#/properties/a"}]},
          {"type": "Categorization", "label": "Nested", "elements": [{"type": "Category", "label": "Inner", "elements": [{"type": "Control", "scope": "#/properties/b"}]}]}
        ]}
        """
      When the form is drawn
      And the person clicks the tab "Nested", which the page is not told of
      Then there is a tab "Inner"
      And there is a field "B"

  Rule: the example form

    Background:
      Given the example form

    Scenario: the example form draws its first tab's renderers, with no errors
      When the form is drawn
      Then there is a tablist "Batch"
      And the field "Name" has "value" set to "Basil, north bench"
      And the page shows "What the team calls this batch."
      And there is a radiogroup "Crop"
      And there is a combobox "Tray"
      And there is a group "Sowing window"
      And the field "Notes" has "tagName" set to "TEXTAREA"
      And the form reports no errors

    Scenario: the example form draws its second tab's renderers
      When the form is drawn
      And the person clicks the tab "Growing", which the page is not told of
      Then there is a group "Conditions"
      And there is a slider "Temperature (°C)"
      And the checkbox "LED" has "aria-checked" set to "true"
      And there is a checkbox "Organic"
      And the page shows "One row per harvest."
      And the table "Harvests" holds 2 elements of the role "row"

    Scenario: the example form reports its data
      When the form is drawn
      And the person clicks the tab "Growing", which the page is not told of
      And the person clicks the checkbox "Organic"
      Then the result's "organic" is "true"
      And the result's "crop" is "basil"
