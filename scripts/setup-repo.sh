#!/bin/sh
# Applies repository merge settings and branch protection on main.
# Run once, after CI's `verify` job has run at least once (registers the check name).
set -eu

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef -q .defaultBranchRef.name)

gh repo edit "$REPO" \
  --delete-branch-on-merge \
  --enable-squash-merge \
  --enable-rebase-merge \
  --enable-merge-commit=false
echo "✓ Merge strategy: squash + rebase only, auto-delete head branches"

# Solo-dev defaults: PR required (so CI runs), 0 approvals, admin can bypass.
PROTECTION_PAYLOAD='{
  "required_status_checks": { "strict": true, "contexts": ["verify"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": false,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "block_creations": false
}'

set +e
PROT_RESP=$(printf '%s' "$PROTECTION_PAYLOAD" | gh api --method PUT \
  "/repos/$REPO/branches/$DEFAULT_BRANCH/protection" --input - 2>&1)
PROT_RC=$?
set -e

if [ "$PROT_RC" -eq 0 ]; then
  echo "✓ Branch protection set on $DEFAULT_BRANCH (verify required, PR required, no force-push/deletion)"
elif echo "$PROT_RESP" | grep -q "Upgrade to GitHub Pro"; then
  echo "⚠  Branch protection skipped (private repo on GitHub Free); the pre-push hook is the only guard."
else
  echo "✗ Branch protection failed:" >&2
  echo "$PROT_RESP" >&2
  exit 1
fi
