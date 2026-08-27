#!/usr/bin/env bash
#
# Runs the four demo steps against a running server and asserts on the results.
# Run this BEFORE building any UI. If step 1 fails, the prompt is wrong, not the
# corpus, and no amount of Tailwind will save the Loom.
#
#   npm run dev          # in one terminal
#   npm run smoke        # in another
#
# Requires jq. Override the target with BASE=https://... npm run smoke
set -uo pipefail

BASE="${BASE:-http://localhost:3000}"
PASS=0
FAIL=0

green() { printf '\033[32m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }
rule()  { printf '\n\033[1m%s\033[0m\n' "$1"; }

assert() { # assert <description> <condition-result 0|1>
  if [ "$2" -eq 0 ]; then green "  PASS  $1"; PASS=$((PASS+1));
  else red "  FAIL  $1"; FAIL=$((FAIL+1)); fi
}

ask() { # ask <userId> <question>
  curl -s -X POST "$BASE/api/ask" \
    -H 'content-type: application/json' \
    -d "$(jq -nc --arg q "$2" --argjson u "$1" '{question:$q, userId:$u}')"
}

command -v jq >/dev/null || { red "jq is required"; exit 1; }

rule "0. Reset"
npm run reset --silent || { red "reset failed, is DATABASE_URL set?"; exit 1; }

FLUORIDE="Does fluoride count under basic or preventive for Delta Dental of California?"

rule "1. Ask as Sam Ortiz (id 4), before any correction"
R1=$(ask 4 "$FLUORIDE")
echo "$R1" | jq '{answer, confidence, citations, payer}'

A1=$(echo "$R1" | jq -r '.answer' | tr '[:upper:]' '[:lower:]')
[[ "$A1" == *basic* ]]; assert "answer says Basic" $?
[[ "$A1" != *preventive* || "$A1" == *basic* ]]; assert "answer is not simply Preventive" $?
[ "$(echo "$R1" | jq -r '.confidence')" = "high" ]; assert "confidence is high" $?
echo "$R1" | jq -e '.citations | index("payer-delta-ca")' >/dev/null; assert "cites payer-delta-ca" $?
echo "$R1" | jq -e '.citations | index("payer-coverage-summary")' >/dev/null; assert "cites payer-coverage-summary" $?
[ "$(echo "$R1" | jq -r '.payer')" = "Delta Dental of California" ]; assert "payer normalised" $?
[ "$(echo "$R1" | jq -r '.loggedAsGap')" = "false" ]; assert "not logged as a gap" $?

if [[ "$A1" == *preventive* && "$A1" != *basic* ]]; then
  red ""
  red "  >>> Claude answered from its own knowledge. The demo has nothing left"
  red "  >>> to correct. Harden ASK_SYSTEM_PROMPT in lib/prompts.ts before going on."
fi

rule "2. Correct as Akhilesh T (id 2, ops expert)"
CITES=$(echo "$R1" | jq -c '[.citations[] | select(startswith("correction-") | not)]')
R2=$(curl -s -X POST "$BASE/api/correct" -H 'content-type: application/json' -d "$(jq -nc \
  --arg q "$FLUORIDE" \
  --arg a "Adult fluoride varnish (D1206) is adjudicated under Preventive at 100% for Delta Dental of California, with the deductible waived, effective 2026-06-01. The playbook still says Basic at 80%, which was correct before that date. Confirmed by Priya Menon in the June Slack thread. The portal layout changed on 2026-06-02 so the benefit class now renders in a different panel." \
  --argjson c "$CITES" \
  '{question:$q, correctedAnswer:$a, userId:2, overridesDocId:"payer-delta-ca", citations:$c}')")
echo "$R2" | jq '{weight, weightReason, toast}'

[ "$(echo "$R2" | jq -r '.weight')" = "3" ]; assert "weight is 3" $?
[ "$(echo "$R2" | jq -r '.matchedDepartment')" = "ops" ]; assert "matched on ops" $?
[[ "$(echo "$R2" | jq -r '.toast')" == *"payer-delta-ca"* ]]; assert "toast names the overridden doc" $?

rule "3. Re-ask as Sam Ortiz, after the correction"
R3=$(ask 4 "$FLUORIDE")
echo "$R3" | jq '{answer, confidence, citations}'

A3=$(echo "$R3" | jq -r '.answer' | tr '[:upper:]' '[:lower:]')
[[ "$A3" == *preventive* ]]; assert "answer now says Preventive" $?
echo "$R3" | jq -e '.correctionsApplied | length > 0' >/dev/null; assert "correction is applied" $?
echo "$R3" | jq -e '.citations | map(startswith("correction-")) | any' >/dev/null; assert "correction is cited" $?
echo "$R3" | jq -e '.citations | index("payer-delta-ca")' >/dev/null; assert "playbook still cited alongside it" $?
[ "$(echo "$R3" | jq -r '.correctionsApplied[0].author')" = "Akhilesh T" ]; assert "attributed to Akhilesh T" $?

rule "4. Gap question as Sam Ortiz"
R4=$(ask 4 "What's our refund policy for churned customers?")
echo "$R4" | jq '{answer, confidence, payer, loggedAsGap}'

[[ "$(echo "$R4" | jq -r '.answer' | tr '[:upper:]' '[:lower:]')" == *"don't have this documented"* ]]; assert "says not documented" $?
[ "$(echo "$R4" | jq -r '.confidence')" = "low" ]; assert "confidence is low" $?
[ "$(echo "$R4" | jq -r '.payer')" = "null" ]; assert "payer is null" $?
[ "$(echo "$R4" | jq -r '.loggedAsGap')" = "true" ]; assert "logged as a gap" $?

rule "5. Gaps tab reads"
G=$(curl -s "$BASE/api/gaps")
echo "$G" | jq '.payerCounts'
echo "$G" | jq -e '.payerCounts | map(.payer == "Unknown") | any' >/dev/null; assert "shows as Unknown in the coverage map" $?

rule "Result"
green "$PASS passed"
[ "$FAIL" -gt 0 ] && red "$FAIL failed" && exit 1
green "All four demo steps verified. Safe to build the UI."
