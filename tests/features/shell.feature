Feature: An app's frame and the dashboard's building blocks
  AppShell, SideNav, StepList, LaunchTile, CapabilityMatrix and DeviceList,
  drawn in jsdom and read as a screen reader reads them.

  Rule: AppShell and SideNav

    Scenario: The frame shows the brand, the account, the navigation and the page
      Given a frame with a side navigation of two sections
      When the frame is drawn
      Then the header shows the brand and the account
      And the navigation is named "Main" and marks "kaja-studio" as the current page
      And the section heading "Linked infrastructure" and the note "linked" show
      And the page's content is the main landmark

    Scenario: A frame without navigation centres its content
      Given a frame with no side navigation and a footer
      When the frame is drawn
      Then there is no navigation
      And the footer shows "Self-hosted use is free."

  Rule: StepList

    Scenario: The current step is open and the others closed
      Given three steps, the first done, the second current and the third upcoming
      When the steps are drawn
      Then the list is named "Set up your project"
      And step 2 is marked as the current step
      And step 2 is open and steps 1 and 3 are closed
      And step 2 shows its summary "Your keys stay with you" and its tag "Preview"

    Scenario: Opening a step tells the page
      Given three steps, the first done, the second current and the third upcoming
      When the steps are drawn
      And the person opens step 3
      Then the page is told that step 3 is open

  Rule: LaunchTile

    Scenario: An available tile offers its action
      Given a tile "Blog" that is available
      When the tile is drawn
      Then it shows "Blog", its address and a "Launch" button
      And it is not marked as disabled

    Scenario: A tile that needs something says what
      Given a tile "Photo library" that needs file storage
      When the tile is drawn
      Then it is marked as disabled
      And it says "Needs: file storage, database"

  Rule: CapabilityMatrix

    Scenario: Each cell says yes, no or partly, with its footnote and trade-off
      Given a matrix of two providers and three capabilities
      When the matrix is drawn
      Then the row "Cloudflare" reads "Yes", "Yes" and "No"
      And the cell for "Bring your own infra" and "Zero trust" reads "via Tailscale" and explains "Add Tailscale"
      And the cell for "Bring your own infra" and "File storage" carries footnote "¹"
      And the notes are numbered in order

  Rule: DeviceList

    Scenario: Each device shows its name, tag, country, day and action
      Given two devices, one of them this device
      When the device list is drawn
      Then the columns are "Device", "Country", "Last seen" and "Actions"
      And the row "Firefox on Linux" is tagged "This device" and was last seen "2026-11-16"
      And the row "Safari on iPhone" offers "Forget"

    Scenario: No devices shows the page's words instead of a table
      Given no devices
      When the device list is drawn
      Then it says "No devices yet" and has no table

  Rule: UnlockList

    Scenario: Each card says what to do and what it unlocks, never a level
      Given an unlock list of two next steps
      When the unlock list is drawn
      Then the list is named "Unlock more"
      And the card "Add a second passkey for recovery" says "Unlocks: linking infrastructure" and links to "Add passkey"
      And no card shows a trust level

  Rule: MenuButton, RowActions and AccountChip

    Scenario: A menu button lists its choices as menu items
      Given a "+ Link account" menu of two kinds of account
      When the menu is drawn
      And the person opens the menu
      Then the menu shows "Cloudflare" with its note "DNS, storage, databases, edge"
      And choosing "Second DNS provider" tells the page

    Scenario: A row gives its usual action as a named icon and the rest in a menu
      Given a device row whose usual action is "Forget device"
      When the row actions are drawn
      Then there is an icon button named "Forget device"
      And a menu named "More actions" offers "Rename" and "Sign out"

    Scenario: A row with no safe usual action gives only its word and the menu
      Given a device row that is this device
      When the row actions are drawn
      Then it shows "Signed in" and no icon button but the menu

    Scenario: An account chip shows its name and short id, and its details on focus
      Given an account chip for GitHub org "kaja-studio"
      When the chip is drawn
      Then the chip reads "GitHub" and "kaja-studio" and can take the focus
      And its details "reader app installed" describe it
