import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(import.meta.dirname, "..");
const indexCss = fs.readFileSync(path.join(rootDir, "src/index.css"), "utf-8");
const appTsx = fs.readFileSync(path.join(rootDir, "src/App.tsx"), "utf-8");
const sharedTsx = fs.readFileSync(path.join(rootDir, "src/shared.tsx"), "utf-8");
const adminTsx = fs.readFileSync(path.join(rootDir, "src/admin.tsx"), "utf-8");
const studentTsx = fs.readFileSync(path.join(rootDir, "src/student.tsx"), "utf-8");
const technicianTsx = fs.readFileSync(path.join(rootDir, "src/technician.tsx"), "utf-8");
const quickTsx = fs.readFileSync(path.join(rootDir, "src/quick.tsx"), "utf-8");
const roomsTsx = fs.readFileSync(path.join(rootDir, "src/rooms.tsx"), "utf-8");

const allSourceCode = [indexCss, appTsx, sharedTsx, adminTsx, studentTsx, technicianTsx, quickTsx, roomsTsx].join("\n");

test("DESIGN.md Color Tokens: index.css defines exact design colors", () => {
  // Primary: #FFFFFF, Secondary: #F8F8F8, Tertiary: #007BFF, Neutral: #212529
  // Surface/Success: #28A745, Accent/Warning: #FFC107, Danger: #DC3545, Muted: #6C757D
  assert.match(indexCss, /#007BFF/i, "Corporate blue #007BFF must be defined in index.css");
  assert.match(indexCss, /#212529/i, "Neutral off-black #212529 must be defined in index.css");
  assert.match(indexCss, /#F8F8F8/i, "Secondary #F8F8F8 must be defined in index.css");
  assert.match(indexCss, /#28A745/i, "Success #28A745 must be defined in index.css");
  assert.match(indexCss, /#FFC107/i, "Warning #FFC107 must be defined in index.css");
  assert.match(indexCss, /#DC3545/i, "Danger #DC3545 must be defined in index.css");
  assert.match(indexCss, /#6C757D/i, "Muted #6C757D must be defined in index.css");
});

test("DESIGN.md Typography: Inter and JetBrains Mono only, no Plus Jakarta Sans", () => {
  assert.ok(!indexCss.includes("Plus+Jakarta+Sans"), "Plus Jakarta Sans must be removed from fonts");
  assert.match(indexCss, /Inter/, "Inter font family must be configured");
  assert.match(indexCss, /JetBrains Mono/, "JetBrains Mono font family must be configured");
});

test("DESIGN.md Shapes & Radii: base corner radius is 4px (sm: 4px, md: 8px, lg: 12px)", () => {
  assert.match(indexCss, /--radius-sm:\s*4px/i, "sm radius token must be 4px");
  assert.match(indexCss, /--radius-md:\s*8px/i, "md radius token must be 8px");
  assert.match(indexCss, /--radius-lg:\s*12px/i, "lg radius token must be 12px");
});

test("DESIGN.md Do's & Don'ts: No pure black (#000000) in theme or CSS", () => {
  // Check that pure black #000000 or #000 is not used as color token
  assert.ok(!indexCss.includes("#000000"), "Pure black #000000 must not be used");
});

test("DESIGN.md Do's & Don'ts: No decorative gradients or heavy glow shadows", () => {
  assert.ok(!indexCss.includes("--shadow-brand: 0 4px 10px rgb(29 78 216 / 0.2)"), "Heavy brand glow shadow must be removed");
  assert.ok(!indexCss.includes(".auth-showcase::before"), "Decorative background glow circle must be removed");
});

test("DESIGN.md Do's & Don'ts: No h-screen (use min-h-[100dvh])", () => {
  assert.ok(!appTsx.includes('min-h-screen'), "App.tsx should use min-h-[100dvh] instead of min-h-screen");
});

test("DESIGN.md Do's & Don'ts: No AI copywriting clichés in UI", () => {
  const cliches = ["Elevate", "Seamless", "Unleash", "Next-Gen"];
  for (const word of cliches) {
    const re = new RegExp(`\\b${word}\\b`, "i");
    assert.ok(!re.test(allSourceCode), `Found AI copywriting cliché: ${word}`);
  }
});

test("DESIGN.md Components: Button has tactile active press (active:translate-y-[1px])", () => {
  assert.match(sharedTsx, /active:translate-y-\[1px\]/, "Shared Button must include tactile active press");
});

test("DESIGN.md Layout: Container has 1280px max-width containment", () => {
  assert.match(appTsx, /max-w-\[1280px\]/, "App main shell must enforce 1280px max-width containment");
});

test("DESIGN.md Components: Admin card base style uses rounded-sm (4px radius)", () => {
  assert.match(adminTsx, /const card = "rounded-sm border border-slate-200 bg-white shadow-xs"/, "Admin card must use rounded-sm");
});

test("DESIGN.md Components: Status labels use rectangular rounded-sm (no bloated pills)", () => {
  assert.match(indexCss, /\.status-label\s*\{[^}]*border-radius:\s*4px/s, "status-label class must use 4px border-radius");
});

test("DESIGN.md Components: Inputs have focus ring with brand color and 2px offset", () => {
  assert.match(indexCss, /\.focus-ring:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--color-brand-500\)/s, "focus-ring must use 2px brand outline");
});
