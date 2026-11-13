#!/usr/bin/env bash
# Brings up pubrel releases for @sustenaut/ui (README, "Releasing"). Run it from
# ~/git/ui, the checkout that holds the release key (corpus/.publet/signing.key,
# gitignored), with gh signed in as an owner of Sustenaut, in two parts:
#
#   scripts/go-live-pubrel.sh               before the pull request merges:
#     1. the release key backed up to Bitwarden (pub-signing-key-ui in project Pub),
#        by pubsec, which asks for a Bitwarden token with write access
#     2. the release app's secrets, RELEASE_APP_ID and RELEASE_APP_KEY, reach ui
#   scripts/go-live-pubrel.sh after-merge   once it has, on main (git latest):
#     3. main's ruleset requires release / release, and the tag ruleset lets only
#        the release app tag (./pubkit protect)
#
# Each step says what it does and asks first; a step already done is skipped, and
# the first error stops it. It prints no secret.
set -euo pipefail
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
org=Sustenaut
repo=$org/ui
pubsec=https://github.com/Sustenaut/pubsec/releases/download/v0.1.2/pubsec-0.1.2-py3-none-any.whl

step() { printf '\n== %s\n' "$*"; }
skip() { echo "   already done: $*"; }
ask() {
  local answer
  read -r -p "   $1 Type yes to go on: " answer </dev/tty
  [[ $answer == yes ]] || { echo "Stopped; run scripts/go-live-pubrel.sh ${phase#before-merge} again to go on."; exit 1; }
}

phase=${1:-before-merge}
[[ $phase == before-merge || $phase == after-merge ]] || { echo "usage: $0 [after-merge]" >&2; exit 2; }

step "Checking the tools, the login and the key"
for tool in gh jq git uvx; do command -v "$tool" >/dev/null || { echo "$tool is not installed" >&2; exit 1; }; done
[[ $(gh api "orgs/$org/memberships/$(gh api user --jq .login)" --jq .role) == admin ]] ||
  { echo "gh is not signed in as an owner of $org" >&2; exit 1; }
[[ -f corpus/.publet/signing.key ]] || { echo "no release key here: run this from the checkout that holds it (~/git/ui)" >&2; exit 1; }
echo "   ok"

if [[ $phase == before-merge ]]; then
  step "1/3 the release key, backed up to Bitwarden"
  echo "   pubsec skips it when Bitwarden already holds it."
  ask "Back it up with pubsec signing-key backup?"
  uvx --from "$pubsec" pubsec signing-key backup

  step "2/3 the release app's secrets reach $repo"
  id=$(gh api "repos/$repo" --jq .id)
  for name in RELEASE_APP_ID RELEASE_APP_KEY; do
    if gh api "orgs/$org/actions/secrets/$name/repositories" --paginate --jq '.repositories[].id' | grep -qx "$id"; then
      skip "$name reaches ui"
    else
      ask "Let $repo use the organization secret $name?"
      gh api -X PUT "orgs/$org/actions/secrets/$name/repositories/$id" >/dev/null
      echo "   ok"
    fi
  done
  cat <<'DONE'

== Done before merging. Merge the pull request, then, on main:

     git latest
     scripts/go-live-pubrel.sh after-merge
DONE
  exit 0
fi

step "Checking the code: main, as GitHub has it"
git fetch -q origin main
[[ $(git rev-parse HEAD) == $(git rev-parse origin/main) ]] || { echo "check out main first (git latest)" >&2; exit 1; }
[[ -f release.json ]] || { echo "main has no release.json yet: merge the pull request first" >&2; exit 1; }
echo "   ok: $(git rev-parse --short HEAD)"

step "3/3 the rulesets: release / release required, tags from the release app only"
./pubkit protect --check || true
ask "Apply them with ./pubkit protect?"
./pubkit protect
cat <<'DONE'

== Done. The next pull request that records changes (pubrel add) can be released:
   pubrel prepare, from this checkout on main.
DONE
