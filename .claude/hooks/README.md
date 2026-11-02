# WebBlock invariant checks

`invariants.mjs` holds every automated rule (zero-transaction, import boundaries, secrets,
Server Action auth). It is plain Node, so it works the same on Windows, macOS and Linux.
No bash or jq needed.

Zero-transaction and import rules ignore comments (so `// no cart here` is fine).
Secret rules also check comments, because a key pasted in a comment is still leaked.

| When | Command | What happens on a violation |
|---|---|---|
| Before Claude edits a file | hook `--pre` | Edit is blocked, Claude sees why |
| After Claude edits a file | hook `--post` | File is formatted, then Claude is told to fix it |
| `/verify`, pre-commit, and CI | `node .claude/hooks/invariants.mjs --all` | Lists every violation in `src/` |
| Every push to `dev`/`Master` and every pull request into them | `.github/workflows/ci.yml` on GitHub (also runs gitleaks on GitHub's runner — current files only, not history) | Red ❌ on the commit or pull request |

## Run the tests (after changing a rule)

```powershell
node --test .claude/hooks/invariants.test.mjs
```

Add one blocked and one allowed example to `invariants.test.mjs` for every rule you change.

## Optional: check before every git commit

CI checks pushes to `dev`/`Master` and pull requests into them. This catches problems earlier, on your own machine, before you commit. Run once in the project root (PowerShell):

```powershell
Set-Content -Path .git/hooks/pre-commit -NoNewline -Value "#!/bin/sh`nnode .claude/hooks/invariants.mjs --all`n"
```

To skip it once in an emergency: `git commit --no-verify`.
