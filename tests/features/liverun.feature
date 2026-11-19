Feature: The convergence engine's live run page
  ModeSwitch, NeedRow, MachineStrip, Journal, ConfirmByName and RunHeader,
  drawn in jsdom and read as a screen reader reads them. Each tells the page
  what the person did: the result is the last thing it was told.

  Rule: ModeSwitch

    Scenario: The switch is a pair of radio buttons whose legend names the need
      Given a mode switch for "ingest-token", set to "fulfil"
      When it is drawn
      Then there is a group "ingest-token"
      And the radio "Fulfil" has "checked" set to "true"
      And the radio "Check" has "checked" set to "false"
      And the radio "Check" is at least 44 px tall

    Scenario: Choosing Check tells the page
      Given a mode switch for "ingest-token", set to "fulfil"
      When it is drawn
      And the person clicks the radio "Check"
      Then the result is "check"

    Scenario: A frozen switch cannot be changed
      Given a frozen mode switch for "database", set to "fulfil"
      When it is drawn
      Then the radio "Check" has "disabled" set to "true"
      And the radio "Fulfil" has "disabled" set to "true"

  Rule: NeedRow

    Scenario: A row shows the need, its grade, its state and time in it, its result and its stop class
      Given a need row for "database" of type "pg.database", grade "auto", "fulfilling" for "1 min 18 s", result "restoring schema, step 3 of 5", stop class "continue"
      When it is drawn
      Then there is a rowheader "database pg.database"
      And the page shows "1 min 18 s"
      And the page shows "restoring schema, step 3 of 5"
      And the words "continue" are drawn in the "warn" colour

    Scenario: A stop class other than continue is not in the warn colour
      Given a need row for "deploy" of type "k8s.deploy", grade "auto", "finishing" for "12 s", result "time budget cut to now", stop class "shorten"
      When it is drawn
      Then the words "shorten" are drawn in the "muted" colour

    Scenario Outline: Each state has a badge in the theme's colours
      Given a need row for "n" of type "t", grade "auto", "<state>" for "2 min", result "r", stop class "signal"
      When it is drawn
      Then the words "<state>" are drawn in the "<colour>" colour

      Examples:
        | state      | colour  |
        | ok         | primary |
        | done       | primary |
        | missing    | bad     |
        | failed     | bad     |
        | drift      | warn    |
        | fulfilling | ink     |
        | finishing  | ink     |
        | stopped    | muted   |
        | blocked    | muted   |

    Scenario: A row holds its need's mode switch, and the switch tells the page
      Given a need row for "ingest-token" holding its mode switch, set to "fulfil"
      When it is drawn
      And the person clicks the radio "Check"
      Then the result is "check"

  Rule: MachineStrip

    Scenario: The strip lists a need's states and marks the current one
      Given a machine strip for "database" of the states "found, approved, fulfilling, done", at "fulfilling"
      When it is drawn
      Then the list "database's machine" holds 4 elements of the role "listitem"
      And the current state of "database" is "fulfilling"

  Rule: Journal

    Scenario: The journal reads time, need, move and actor, newest last
      Given a journal of:
        """
        [{"at": "19:05:21", "need": "run", "from": "awaiting", "to": "running", "by": "approved by you"},
         {"at": "19:06:40", "need": "deploy", "text": "budget shortened"},
         {"at": "19:06:40", "need": "database", "text": "keeps running (continue)"}]
        """
      When it is drawn
      Then the elements of the role "listitem" read:
        """
        19:05:21 · run · awaiting → running · approved by you
        19:06:40 · deploy · budget shortened
        19:06:40 · database · keeps running (continue)
        """

  Rule: ConfirmByName

    Scenario: The cancel button stays disabled until the need's name is typed
      Given a cancel-by-name form for "database", warning "Cancelling partway can leave a half-applied migration."
      When it is drawn
      Then the page shows "Cancelling partway can leave a half-applied migration."
      And the button "Cancel database" has "disabled" set to "true"
      When the person types "datab" in the field "Type database to cancel it"
      Then the button "Cancel database" has "disabled" set to "true"

    Scenario: Typing the name enables the button, and it cancels
      Given a cancel-by-name form for "database", warning "Cancelling partway can leave a half-applied migration."
      When it is drawn
      And the person types "database" in the field "Type database to cancel it"
      Then the button "Cancel database" has "disabled" set to "false"
      When the person clicks the button "Cancel database"
      Then the result is "cancel database"

    Scenario: Enter in the field cancels nothing
      Given a cancel-by-name form for "database", warning "Cancelling partway can leave a half-applied migration."
      When it is drawn
      And the person types "database" in the field "Type database to cancel it"
      And the person presses Enter in the field "Type database to cancel it"
      Then the page was told nothing
      And the button "Cancel database" has "disabled" set to "false"

  Rule: RunHeader

    Scenario: The header shows the run, its state and links, and Approve and Stop
      Given a run header for "integrations", unit "ingest", "fulfil", "Awaiting approval", with Approve and Stop
      When it is drawn
      Then there is a heading "integrations"
      And there is a link "GitHub run 44301877123"
      And the page shows "Awaiting approval"
      And the page shows "Set what each need should do, then approve. Approving freezes these choices."
      And the button "Stop" is at least 44 px tall

    Scenario: Approve and Stop tell the page
      Given a run header for "integrations", unit "ingest", "fulfil", "Awaiting approval", with Approve and Stop
      When it is drawn
      And the person clicks the button "Approve 3 fulfils"
      Then the result is "approve"
      When the person clicks the button "Stop"
      Then the result is "stop"

  Rule: The theme's tokens only

    Scenario: The live run components name no colour of their own
      When the live run components' source is read
      Then it names no colour of its own, only the theme's tokens
