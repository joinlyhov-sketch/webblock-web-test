#!/usr/bin/env node
// WebBlock invariant checks: one set of rules, used in three places.
//
//   node invariants.mjs --pre    PreToolUse hook (Edit|MultiEdit|Write). Checks the NEW text.
//                                Exit 2 blocks the edit and shows the reason to Claude.
//   node invariants.mjs --post   PostToolUse hook. Formats the file, then checks the WHOLE file
//                                on disk (incl. Server Action auth). Exit 2 reports to Claude.
//   node invariants.mjs --all    Scans every file in src/. Used by /verify and the git
//                                pre-commit hook, so edits made any other way (Bash, by hand,
//                                by a teammate) are still caught. Exit 1 on violations.
//
// Pure Node (no bash, no jq) so it behaves the same on Windows, macOS and Linux.
// Regression tests: node --test .claude/hooks/

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CODE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;
const IMPORT_OF = (spec) =>
  new RegExp(`(?:from\\s*|import\\s*\\(\\s*|import\\s+|require\\s*\\(\\s*)['"]${spec}['"]`);

/** Text rules. `allow(rel)` returns true where the rule does not apply. */
export const TEXT_RULES = [
  // ── Zero-transaction: applies everywhere in src/, billing included ──────────
  {
    id: "zero-transaction/whatsapp",
    re: /\bwa\.me\b|whats\s*app/i,
    msg: "No WhatsApp links or buttons. Use tel:, mailto:, Google Maps directions or an external https:// link.",
  },
  {
    id: "zero-transaction/cart",
    re: /\bcarts?\b|add[-_ ]?to[-_ ]?(?:cart|bag)|use[-_]?cart|cart[-_]?(?:provider|context|store|item)|shopping[-_ ]?cart/i,
    msg: "No cart. Websites are showcase/contact only.",
  },
  {
    id: "zero-transaction/checkout",
    re: /check[-_]?out/i,
    msg: "No checkout. Websites never take orders or payments (platform billing uses 'payment', not 'checkout').",
  },
  {
    id: "zero-transaction/order-wording",
    re: /\bbuy[-_ ]?now\b|\border[-_ ]?now\b|\bplace[-_ ]?(?:an[-_ ]?)?order\b/i,
    msg: "No order/buy wording. Website CTAs say 'Contact us', 'Call us', 'Email us' or 'Get directions'.",
  },
  {
    id: "zero-transaction/booking",
    re: /booking|book[-_ ]?now|reservation/i,
    msg: "No booking or reservations. Websites route customers to phone, email or maps.",
  },
  {
    id: "zero-transaction/quantity",
    re: /quantity|\bqty\b/i,
    msg: "No quantity selectors. Product cards show name, price, image and category only.",
  },
  {
    id: "zero-transaction/payment-provider",
    re: /\bstripe\b|paypal|webill365\.com|api\.webill/i,
    msg: "No payment-provider code in the frontend. The backend talks to the provider; billing only displays the KHQR and status from the API.",
  },

  // ── Boundaries ───────────────────────────────────────────────────────────────
  {
    id: "boundary/mocks",
    re: /(?:from\s*|import\s*\(\s*|import\s+|require\s*\(\s*)['"](?:@\/|(?:\.\.?\/)+)mocks\//,
    allow: (rel) =>
      /^src\/features\/.+\/api\.ts$/.test(rel) ||
      rel.startsWith("src/mocks/") ||
      rel === "src/lib/auth/session.ts",
    msg: "Only features/<name>/api.ts (and lib/auth/session.ts) may import @/mocks. Call the feature's api.ts instead.",

  },
  {
    id: "boundary/wrapped-library",
    re: IMPORT_OF("(?:sonner|recharts|@radix-ui\\/[^'\"]+)"),
    allow: (rel) => rel.startsWith("src/components/"),
    msg: "Import sonner/recharts/Radix only inside src/components. Use the wrappers (common/toast, common/charts, ui/*).",
  },
  {
    id: "boundary/puck",
    re: IMPORT_OF("(?:@measured\\/puck|@puckeditor)(?:\\/[^'\"]*)?"),
    allow: (rel) => rel.startsWith("src/features/editor/"),
    msg: "Puck may only be imported inside src/features/editor.",
  },

  // ── Secrets ──────────────────────────────────────────────────────────────────
  {
    id: "secret/public-env",
    re: /NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE)/,
    msg: "NEXT_PUBLIC_* variables are sent to the browser. Never put secrets, tokens or passwords in them.",
  },
  {
    id: "secret/hardcoded",
    re: /-----BEGIN [A-Z ]*PRIVATE KEY-----|client[_-]?secret\s*[:=]\s*['"`][^'"`\s]{6,}/i,
    msg: "Hardcoded secret. Read it from a server-only environment variable instead.",
  },
  {
    id: "secret/known-token",
    // Google API key, Stripe, GitHub, Slack, AWS access key, JWT
    re: /\b(?:AIza[0-9A-Za-z_-]{35}|sk_(?:live|test)_[0-9A-Za-z]{16,}|gh[pousr]_[0-9A-Za-z]{36,}|xox[abprs]-[0-9A-Za-z-]{10,}|AKIA[0-9A-Z]{16}|eyJ[0-9A-Za-z_-]{10,}\.eyJ[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,})\b/,
    msg: "This looks like a real API key or token. Remove it, rotate it, and read it from a server-only environment variable.",
  },
  {
    id: "secret/assigned-credential",
    re: /\b[\w$]*(?:api[_-]?key|apikey|secret|access[_-]?token|auth[_-]?token|refresh[_-]?token|password|passwd)[\w$]*["']?\s*[:=]\s*['"`](?![/#.@]|https?:)(?=[^'"`\s]*\d)(?=[^'"`\s]*[A-Za-z])[^'"`\s]{12,}['"`]/i,
    // value: 12+ chars, no spaces, has a letter AND a digit, not a path/URL/key name
    allow: (rel) => rel.startsWith("src/mocks/"), // fake demo credentials are fine in mock data
    msg: "Credential-like value hardcoded in source. Read it from a server-only environment variable instead.",
  },
];

// Rules whose ids start with these prefixes ignore comments (a comment like "no cart here" is fine).
// Secret rules always check comments too: a key pasted into a comment is still leaked.
const CODE_ONLY = ["zero-transaction/", "boundary/"];

const REQUIRE_FNS = new Set(["requireUser", "requireWebsiteOwner", "requireAdmin"]);

// ── Path helpers ─────────────────────────────────────────────────────────────

const posix = (p) => String(p).replace(/\\/g, "/");

/** Project-relative POSIX path ("src/features/x/api.ts"), or null if outside the project. */
export function toRel(file, projectDir) {
  const f = posix(file);
  if (projectDir) {
    const root = posix(projectDir).replace(/\/+$/, "") + "/";
    if (f.toLowerCase().startsWith(root.toLowerCase())) return f.slice(root.length);
  }
  if (!/^([a-zA-Z]:)?\//.test(f)) return f.replace(/^\.\//, ""); // already relative
  const i = f.lastIndexOf("/src/");
  return i === -1 ? null : f.slice(i + 1);
}

const isChecked = (rel) => !!rel && rel.startsWith("src/") && CODE_FILE.test(rel);

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

// ── Checks ───────────────────────────────────────────────────────────────────

/**
 * Replaces every comment with spaces (newlines kept, so line numbers stay correct).
 * Uses the TypeScript parser, so JSX text, strings and URLs like "https://" are never mistaken
 * for comments. Without TypeScript, returns the text unchanged (stricter, never weaker).
 */
export function stripComments(ts, rel, text) {
  if (!ts) return text;
  const kind = /\.(tsx|jsx)$/.test(rel) ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile("x" + (kind === ts.ScriptKind.TSX ? ".tsx" : ".ts"), text, ts.ScriptTarget.Latest, true, kind);
  const out = text.split("");
  const blank = (from, to) => {
    for (let i = from; i < to; i++) if (out[i] !== "\n" && out[i] !== "\r") out[i] = " ";
  };
  const visit = (node) => {
    const kids = node.getChildren(sf);
    if (kids.length === 0) blank(node.pos, node.getStart(sf)); // leading trivia = whitespace + comments only
    else kids.forEach(visit);
  };
  visit(sf);
  blank(sf.endOfFileToken.pos, sf.endOfFileToken.getStart(sf));
  return out.join("");
}

/** Text rules against a file's content (or an edit's new text). Pass `ts` to ignore comments. */
export function checkText(rel, text, ts = null) {
  if (!isChecked(rel) || !text) return [];
  const code = stripComments(ts, rel, text);
  const found = [];
  for (const rule of TEXT_RULES) {
    if (rule.allow?.(rel)) continue;
    const source = CODE_ONLY.some((p) => rule.id.startsWith(p)) ? code : text;
    const m = rule.re.exec(source);
    if (m) found.push({ rel, line: lineOf(source, m.index), id: rule.id, match: m[0], msg: rule.msg });
  }
  return found;
}

export function loadTypeScript(projectDir) {
  try {
    return createRequire(path.join(projectDir || process.cwd(), "package.json"))("typescript");
  } catch {
    return null;
  }
}

/**
 * In a module-level "use server" file, every exported function must START with the right check
 * (optionally assigned to a const):
 *   - in src/features/admin/**            → await requireAdmin()
 *   - has a `websiteId` parameter         → await requireWebsiteOwner(websiteId)   (that exact parameter)
 *   - otherwise                           → await requireUser() / requireAdmin()
 * This is a guardrail for the frontend only. Spring Boot must still enforce ownership on every request,
 * and checks that a child resource (e.g. productId) belongs to the website belong there too.
 */
export function checkServerActions(ts, rel, text) {
  if (!ts || !isChecked(rel) || !/['"]use server['"]/.test(text)) return [];
  const kind = rel.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, kind);
  const first = sf.statements[0];
  const isServerFile =
    first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression) &&
    first.expression.text === "use server";
  if (!isServerFile) return [];

  const exported = (node) =>
    node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;

  /** The `requireX(...)` CallExpression if `expr` is `await requireX(...)`, else null. */
  const requireCallOf = (expr) =>
    expr && ts.isAwaitExpression(expr) && ts.isCallExpression(expr.expression) &&
    ts.isIdentifier(expr.expression.expression) && REQUIRE_FNS.has(expr.expression.expression.text)
      ? expr.expression
      : null;

  /** The auth call that opens the function body, or null. */
  const firstAuthCall = (fn) => {
    const body = fn.body;
    if (!body || !ts.isBlock(body)) return null;
    const s = body.statements[0];
    if (!s) return null;
    if (ts.isExpressionStatement(s)) return requireCallOf(s.expression);
    if (ts.isVariableStatement(s)) {
      const d = s.declarationList.declarations;
      return d.length === 1 ? requireCallOf(d[0].initializer) : null;
    }
    return null;
  };

  /**
   * Parameter bindings of a function:
   *   names        every name the parameters bind (incl. destructured)
   *   websiteIdVars names that hold the website id: `websiteId`, `{ websiteId }`, `{ websiteId: id }`
   */
  const paramInfo = (fn) => {
    const names = new Set();
    const websiteIdVars = new Set();
    const visit = (n, fromWebsiteIdProp = false) => {
      if (ts.isIdentifier(n)) {
        names.add(n.text);
        if (n.text === "websiteId" || fromWebsiteIdProp) websiteIdVars.add(n.text);
      } else if (ts.isObjectBindingPattern(n)) {
        for (const el of n.elements) {
          const prop = el.propertyName && ts.isIdentifier(el.propertyName) ? el.propertyName.text : null;
          visit(el.name, prop === "websiteId" || (!prop && ts.isIdentifier(el.name) && el.name.text === "websiteId"));
        }
      } else if (ts.isArrayBindingPattern(n)) {
        for (const el of n.elements) if (!ts.isOmittedExpression(el)) visit(el.name);
      }
    };
    for (const p of fn.parameters) visit(p.name);
    return { names, websiteIdVars };
  };

  /** A website id that came from the parameters: `websiteId`, an alias of it, or `<param>.websiteId`. */
  const isWebsiteIdArg = (arg, info) =>
    !!arg &&
    ((ts.isIdentifier(arg) && info.websiteIdVars.has(arg.text)) ||
      (ts.isPropertyAccessExpression(arg) && arg.name.text === "websiteId" &&
        ts.isIdentifier(arg.expression) && info.names.has(arg.expression.text)));

  /**
   * An action is website-scoped if `websiteId` appears ANYWHERE in it: a parameter, a destructured or
   * aliased property, a type annotation, `input.websiteId` in the body, or formData.get("websiteId").
   * Named types (input: SaveInput) are caught through their use in the body.
   */
  const mentionsWebsiteId = (fn) => /\bwebsiteId\b/.test(fn.getText(sf));

  const isAdminFeature = rel.startsWith("src/features/admin/");

  /** Returns [ruleId, message] for an action with the wrong or missing check, or null if correct. */
  const authProblem = (name, fn) => {
    const call = firstAuthCall(fn);
    if (!call) {
      return ["auth/server-action",
        `Server Action "${name}" must start with \`await requireUser()\`, \`await requireWebsiteOwner(websiteId)\` or \`await requireAdmin()\` before doing anything else.`];
    }
    const fnName = call.expression.text;
    const info = paramInfo(fn);
    if (isAdminFeature) {
      return fnName === "requireAdmin" ? null : ["auth/admin-action",
        `Server Action "${name}" is in features/admin, so it must start with \`await requireAdmin()\` (found ${fnName}).`];
    }
    if (mentionsWebsiteId(fn) && !(fnName === "requireWebsiteOwner" && isWebsiteIdArg(call.arguments[0], info))) {
      return ["auth/website-owner",
        `Server Action "${name}" uses a websiteId, so it must start with \`await requireWebsiteOwner(websiteId)\` using the id from its parameters (found ${fnName}). Being logged in is not enough; the user must own that website. Simplest form: make \`websiteId\` its first parameter.`];
    }
    if (fnName === "requireWebsiteOwner" && !isWebsiteIdArg(call.arguments[0], info)) {
      return ["auth/website-owner",
        `Server Action "${name}" must pass its \`websiteId\` parameter to requireWebsiteOwner(), not another id or value.`];
    }
    return null;
  };

  const locals = new Map(); // name -> function node (for `export { a, b }`)
  const targets = []; // [name, functionNode]

  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name) {
      locals.set(st.name.text, st);
      if (exported(st)) targets.push([st.name.text, st]);
    } else if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const init = d.initializer;
        if (ts.isIdentifier(d.name) && init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
          locals.set(d.name.text, init);
          if (exported(st)) targets.push([d.name.text, init]);
        }
      }
    } else if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause && ts.isNamedExports(st.exportClause)) {
      for (const el of st.exportClause.elements) {
        const local = (el.propertyName ?? el.name).text;
        if (locals.has(local)) targets.push([el.name.text, locals.get(local)]);
      }
    }
  }

  return targets.flatMap(([name, fn]) => {
    const problem = authProblem(name, fn);
    if (!problem) return [];
    const [id, msg] = problem;
    return [{ rel, line: sf.getLineAndCharacterOfPosition(fn.getStart()).line + 1, id, match: name, msg }];
  });
}

export function checkFile(ts, rel, text) {
  return [...checkText(rel, text, ts), ...checkServerActions(ts, rel, text)];
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const format = (v) => `  ${v.rel}:${v.line}  [${v.id}] found "${v.match}"\n    → ${v.msg}`;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function newTextOf(input) {
  const t = input.tool_input ?? {};
  if (typeof t.content === "string") return t.content;
  if (typeof t.new_string === "string") return t.new_string;
  if (Array.isArray(t.edits)) return t.edits.map((e) => e?.new_string ?? "").join("\n");
  return "";
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (CODE_FILE.test(name)) out.push(p);
  }
  return out;
}

function formatFile(file, projectDir) {
    // Never blocks Claude: lint errors are reported by /verify (pnpm lint), not on every keystroke.
  const q = JSON.stringify(file);
  for (const cmd of [`pnpm exec prettier --write ${q}`, `pnpm exec eslint --fix ${q}`]) {
    if (cmd.includes("eslint") && !/\.(ts|tsx|js|jsx|mjs)$/.test(file)) continue;
    try {
      execSync(cmd, { cwd: projectDir, stdio: "ignore", timeout: 60_000 });
    } catch {
      /* formatting is best effort */
    }
  }
}

function main(argv) {
  const mode = argv[2];
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  if (mode === "--pre") {
    const input = JSON.parse(readStdin() || "{}");
    const rel = toRel(input.tool_input?.file_path ?? "", projectDir);
    const violations = checkText(rel, newTextOf(input), loadTypeScript(projectDir));
    if (violations.length) {
      process.stderr.write(`BLOCKED by WebBlock invariants:\n${violations.map(format).join("\n")}\n` +
        "Rewrite the code without these terms (comments are ignored by these rules).\n");
      return 2;
    }
    return 0;
  }

  if (mode === "--post") {
    const input = JSON.parse(readStdin() || "{}");
    const file = input.tool_input?.file_path ?? "";
    const rel = toRel(file, projectDir);
    if (!file || !existsSync(file)) return 0;
    if (/\.(ts|tsx|js|jsx|mjs|css|json|md)$/.test(file)) formatFile(file, projectDir);
    if (!isChecked(rel)) return 0;
    const violations = checkFile(loadTypeScript(projectDir), rel, readFileSync(file, "utf8"));
    if (violations.length) {
      process.stderr.write(`WebBlock invariant violations in the file you just edited — fix them now:\n${violations.map(format).join("\n")}\n`);
      return 2;
    }
    return 0;
  }

  if (mode === "--all") {
    const src = path.join(projectDir, "src");
    if (!existsSync(src)) {
      console.error("No src/ folder found. Run from the project root.");
      return 1;
    }
    const ts = loadTypeScript(projectDir);
    if (!ts) console.warn("warning: typescript not found — Server Action auth check skipped.");
    const violations = walk(src).flatMap((f) => checkFile(ts, toRel(f, projectDir), readFileSync(f, "utf8")));
    if (violations.length) {
      console.error(`${violations.length} WebBlock invariant violation(s):\n${violations.map(format).join("\n")}`);
      return 1;
    }
    console.log("WebBlock invariants: OK");
    return 0;
  }

  console.error("Usage: node invariants.mjs --pre | --post | --all");
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv);
}
