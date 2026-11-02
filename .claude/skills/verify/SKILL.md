---
name: verify
description: Check the project. "/verify quick" runs invariants, typecheck and lint in seconds (use after each change); plain "/verify" also runs the production build (use before saying a task is done, committing or pushing).
argument-hint: "[quick]"
---

Mode: `$ARGUMENTS` (`quick` = skip the build; anything else or empty = full).

Run these in order and stop at the first failure:

1. `node .claude/hooks/invariants.mjs --all` — zero-transaction, boundaries, secrets, Server Action auth.
   Scans every file in `src/`, so it also catches changes that didn't go through Edit/Write.
2. `pnpm typecheck` — TypeScript errors (fast; fails before the slow build would).
3. `pnpm lint` — code quality. `next build` does NOT run ESLint, so this step is never redundant.
4. **Full mode only:** `pnpm build` — catches what the steps above can't: server/client component
   mistakes, pages that crash during pre-rendering, invalid `next.config.ts`, route and CSS errors.

In `quick` mode, say at the end that the build was skipped and a full `/verify` is still needed
before committing.

If a step fails: fix the cause (not by disabling the rule, adding `any`, `@ts-ignore`,
`eslint-disable`, or rewording code just to dodge a pattern), then re-run from step 1.
Never edit `.claude/hooks/` to make a check pass — if a rule looks wrong, stop and tell me.

Report as a short table: step · pass/fail/skipped · what you fixed. If something can't be fixed without
a design decision, stop and ask.
