#!/usr/bin/env node
/**
 * scripts/measure-gate.js
 * ------------------------
 * Measure what one governance decision costs, so nobody has to quote a number
 * nobody took.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * `docs/HANDOVER.md` PERF 3 carried a 5,000 decisions/sec figure and §30.3 S6
 * recorded that it had no measurement behind it. `docs/ROADMAP-V3.md` R3 says:
 * measure it, publish the figure with its date, then decide whether a cache is
 * worth building. In that order, and explicitly NOT the other one — a cache
 * built before the measurement is an optimisation aimed at a guess.
 *
 * ── WHAT IT MEASURES, AND WHAT IT CANNOT ────────────────────────────────────
 * `authorizeAction` end to end, plus each component suspected of dominating it,
 * on scenarios chosen because they take DIFFERENT paths through the gate rather
 * than because they look representative.
 *
 * It does NOT measure the mandatory-approval path. That blocks on a human and
 * its cost is the human's, not the gate's; a figure that averaged it in would be
 * measuring how fast someone reads. The scenarios are chosen to avoid it, and
 * `approvalsSeen` counts any that slipped through — if one does, the run says so
 * rather than quietly reporting a number with a person inside it.
 *
 * ── ISOLATION ───────────────────────────────────────────────────────────────
 * `CAIRN_VAULT_DIR` is set to a fresh temporary directory BEFORE any import that
 * reads it — `config/index.js` resolves `VAULT_DIR` at module load, so this must
 * happen before the dynamic imports below and cannot be done with a static one.
 * That is the same constraint `tests/setup/isolate-vault.mjs` works around.
 *
 * A benchmark that wrote to the operator's live vault would add rows to the
 * hash-chained ledger that no operator performed. The ledger is the product.
 *
 * ── HOW TO READ THE OUTPUT ──────────────────────────────────────────────────
 * p50 is what a decision usually costs. p99 is what the slowest one in a hundred
 * costs, and on a path that writes to SQLite that tail is the interesting half.
 *
 * The per-second figures are 1/latency for ONE SEQUENTIAL CALLER. They are a
 * per-decision cost expressed as a rate, NOT a throughput or concurrency claim.
 * The gate has never been run concurrently and this script does not do so.
 *
 *     node scripts/measure-gate.js               # default 300 iterations
 *     node scripts/measure-gate.js --n 2000      # longer run, tighter tail
 *     node scripts/measure-gate.js --json <path> # also write the artefact
 *     node scripts/measure-gate.js --src <dir>   # measure ANOTHER CAIRN tree
 *
 * ── --src, AND WHY THIS FILE IMPORTS NOTHING BUT NODE (A3, 2026-09-16) ────────
 * The headline figure on cairnetp.com came from this script run against the
 * private source tree. Nobody outside the project could reproduce it, which made
 * it a number to be believed. `--src` points the script at any CAIRN root —
 * including one extracted from a published installer's app.asar — so the figure
 * can be re-taken against the exact code a customer runs. The script uses node
 * built-ins only, so it can be copied out of this repository and run unchanged;
 * the distribution repository publishes it verbatim under validation/.
 */

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ── The vault redirect, before anything reads it ─────────────────────────────
const BENCH_VAULT = await fs.mkdtemp(path.join(os.tmpdir(), 'cairn-gate-bench-'));
process.env.CAIRN_VAULT_DIR = BENCH_VAULT;
process.env.CAIRN_ROLE = 'operator';
process.env.CAIRN_CLEARANCE = 'CONFIDENTIAL';

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const N = Number(argOf('--n', '300'));
const JSON_OUT = argOf('--json', null);
const SRC_ROOT = path.resolve(argOf('--src', path.join(path.dirname(fileURLToPath(import.meta.url)), '..')));
const load = (rel) => import(pathToFileURL(path.join(SRC_ROOT, rel)).href);
const MEASURED_VERSION = await fs
    .readFile(path.join(SRC_ROOT, 'package.json'), 'utf8')
    .then((s) => JSON.parse(s).version ?? null)
    .catch(() => null);

const gate = await load('src/trust/governanceGate.js');
const ledger = await load('src/trust/ledgerStore.js');
const policy = await load('src/trust/policyManager.js');

// ── Statistics ───────────────────────────────────────────────────────────────

/**
 * Percentile by nearest rank, on a sorted copy. No interpolation: with a few
 * hundred samples, interpolating invents precision the sample cannot support.
 */
function pct(sorted, p) {
    if (sorted.length === 0) return NaN;
    const rank = Math.max(1, Math.ceil((p / 100) * sorted.length));
    return sorted[rank - 1];
}

function summarise(samples) {
    const sorted = [...samples].sort((a, b) => a - b);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    return {
        n: samples.length,
        min: sorted[0],
        p50: pct(sorted, 50),
        p95: pct(sorted, 95),
        p99: pct(sorted, 99),
        max: sorted[sorted.length - 1],
        mean,
    };
}

const ms = (v) => (Number.isFinite(v) ? v.toFixed(3) : '-');

/** Sequential single-caller rate implied by a per-decision latency. Not concurrency. */
const perSec = (msValue) => (msValue > 0 ? Math.round(1000 / msValue) : Infinity);

async function time(fn) {
    const t0 = performance.now();
    await fn();
    return performance.now() - t0;
}

/** Discard the first `warmup` samples: JIT, lazy imports and first-touch disk. */
async function measure(label, fn, { n = N, warmup = 20 } = {}) {
    for (let i = 0; i < warmup; i++) await fn(i);
    const samples = [];
    for (let i = 0; i < n; i++) samples.push(await time(() => fn(i)));
    return { label, ...summarise(samples) };
}

// ── Scenarios ────────────────────────────────────────────────────────────────
//
// Chosen because each takes a different path, not because each looks typical:
//
//   read         cheapest path - no payload, no AST, still a ledger write
//   write        path arguments are collected and compared
//   execute_ast  EXECUTE with a payload: both AST analysers are eligible
//   denied       short-circuits before the expensive work, still records
//
const WIN_PATH_PREFIX = ['C:', 'Users', 'bench'].join(path.win32.sep);

const SCENARIOS = [
    {
        key: 'read',
        note: 'READ tool, no payload',
        call: () => ({ toolName: 'list_scripts', args: {} }),
    },
    {
        key: 'write',
        note: 'WRITE tool carrying a path argument',
        call: (i) => ({
            toolName: 'save_skill',
            args: { path: [WIN_PATH_PREFIX, `note-${i}.txt`].join(path.win32.sep) },
        }),
    },
    {
        key: 'execute_ast',
        note: 'EXECUTE with a payload - both AST analysers eligible',
        call: (i) => ({
            toolName: 'execute_command',
            args: { command: `Get-ChildItem -Path bench-${i} | Select-Object Name` },
        }),
    },
    {
        // The AST analysers run only when they could CHANGE the outcome, so a
        // payload already graded CRITICAL by the static scan skips them. Measured
        // beside `execute_ast`, this isolates the analysers' cost from the rest of
        // the EXECUTE path without having to trust the attribution.
        key: 'execute_critical',
        note: 'EXECUTE already CRITICAL - AST skipped, cannot raise further',
        call: (i) => ({
            toolName: 'execute_command',
            args: { command: `Remove-Item -Recurse -Force bench-${i}` },
        }),
    },
    {
        key: 'denied',
        note: 'Unclassified tool name - denied before the expensive work',
        call: (i) => ({ toolName: `no_such_tool_${i}`, args: {} }),
    },
];

// ── Run ──────────────────────────────────────────────────────────────────────

console.log('');
console.log('  CAIRN governance gate - per-decision cost');
console.log('  ' + '-'.repeat(72));
console.log(`  date        ${new Date().toISOString()}`);
console.log(`  host        ${os.cpus()[0]?.model?.trim() ?? 'unknown CPU'}`);
console.log(
    `              ${os.cpus().length} logical cores, ${(os.totalmem() / 1024 ** 3).toFixed(1)} GB RAM`,
);
console.log(`  platform    ${process.platform} ${os.release()}, node ${process.version}`);
console.log(`  measuring   ${SRC_ROOT} (CAIRN ${MEASURED_VERSION ?? 'version unknown'})`);
console.log(`  vault       ${BENCH_VAULT} (temporary)`);
console.log(`  iterations  ${N} per scenario, after 20 warmup`);
console.log('');

const results = { scenarios: [], components: [] };

// Approval must never be reached. If it is, the numbers contain a human.
let approvalsSeen = 0;

for (const s of SCENARIOS) {
    const r = await measure(s.key, async (i) => {
        const out = await gate.authorizeAction(s.call(i));
        if (out?.mandatoryApproval) approvalsSeen++;
    });
    r.note = s.note;
    results.scenarios.push(r);
}

// ── Components, measured separately ──────────────────────────────────────────
//
// The roadmap named three per-decision costs: a vault read for identity, a
// corporate policy load, and a synchronous ledger write. Each is measured on its
// own so the end-to-end figure can be ATTRIBUTED rather than guessed at.

results.components.push(
    await measure('resolveIdentity (warm)', async () => {
        await gate.resolveIdentity();
    }),
);

results.components.push(
    await measure('loadCorporatePolicy (warm)', async () => {
        await policy.loadCorporatePolicy();
    }),
);

results.components.push(
    await measure(
        'loadCorporatePolicy (forced re-read)',
        async () => {
            await policy.loadCorporatePolicy({ force: true });
        },
        { n: Math.min(N, 200) },
    ),
);

results.components.push(
    await measure('assessRisk (pure, no I/O)', async (i) => {
        gate.assessRisk('execute_command', { command: `echo bench-${i}` });
    }),
);

// The two structural analysers, measured directly rather than inferred from the
// difference between two scenarios. One spawns a process; the other does not,
// and the gap between them is the finding.
{
    const { scanPowerShellAst } = await load('src/security/powershellAst.js');
    const { scanJavaScriptAst } = await load('src/security/javascriptAst.js');

    results.components.push(
        await measure(
            'scanPowerShellAst (spawns powershell.exe)',
            async (i) => {
                await scanPowerShellAst(`Get-ChildItem -Path bench-${i}`);
            },
            { n: Math.min(N, 60), warmup: 5 },
        ),
    );

    results.components.push(
        await measure('scanJavaScriptAst (parses in process)', async (i) => {
            scanJavaScriptAst(`const x = ${i}; console.log(x);`);
        }),
    );
}

results.components.push(
    await measure('appendDecision (ledger write)', async (i) => {
        ledger.appendDecision({
            decision: `BENCH ${i}`,
            outcome: 'EXECUTED',
            reasoning: 'measurement',
        });
    }),
);

// ── Cold costs, measured once each ───────────────────────────────────────────
// No percentile: an average of one sample is that sample, and saying "p50" over
// a single observation would dress it as something it is not.
const cold = {};
gate.__setIdentityForTests(null);
cold.resolveIdentity = await time(() => gate.resolveIdentity());
cold.loadCorporatePolicy = await time(() => policy.loadCorporatePolicy({ force: true }));
results.cold = cold;

// ── Report ───────────────────────────────────────────────────────────────────

function table(title, rows, { rate = false } = {}) {
    console.log(`  ${title}`);
    console.log('  ' + '-'.repeat(72));
    console.log(
        rate
            ? '  scenario            p50 ms   p95 ms   p99 ms   max ms   per sec (1 caller)'
            : '  component                          p50 ms   p95 ms   p99 ms   max ms',
    );
    for (const r of rows) {
        if (rate) {
            console.log(
                '  ' +
                    r.label.padEnd(18) +
                    ms(r.p50).padStart(8) +
                    ms(r.p95).padStart(9) +
                    ms(r.p99).padStart(9) +
                    ms(r.max).padStart(9) +
                    String(perSec(r.p50)).padStart(13),
            );
        } else {
            console.log(
                '  ' +
                    r.label.padEnd(35) +
                    ms(r.p50).padStart(8) +
                    ms(r.p95).padStart(9) +
                    ms(r.p99).padStart(9) +
                    ms(r.max).padStart(9),
            );
        }
    }
    console.log('');
}

table('End to end - authorizeAction()', results.scenarios, { rate: true });
for (const s of results.scenarios) console.log(`    ${s.label.padEnd(14)} ${s.note}`);
console.log('');
table('Components', results.components);

console.log('  Cold, measured once each (no percentile - one sample is one sample)');
console.log('  ' + '-'.repeat(72));
console.log(`  resolveIdentity        ${ms(cold.resolveIdentity)} ms`);
console.log(`  loadCorporatePolicy    ${ms(cold.loadCorporatePolicy)} ms`);
console.log('');

if (approvalsSeen > 0) {
    console.log(`  !! ${approvalsSeen} scenario call(s) reached the approval path.`);
    console.log('     Those numbers include waiting for a person and are NOT gate cost.');
    console.log('');
}

const artefact = {
    measured_at: new Date().toISOString(),
    tool: 'scripts/measure-gate.js',
    measured_against: { version: MEASURED_VERSION },
    iterations: N,
    approvals_triggered: approvalsSeen,
    host: {
        cpu: os.cpus()[0]?.model?.trim() ?? null,
        logical_cores: os.cpus().length,
        total_ram_gb: Number((os.totalmem() / 1024 ** 3).toFixed(1)),
        platform: process.platform,
        release: os.release(),
        node: process.version,
    },
    caveat:
        'Per-decision latency for ONE sequential caller. The per-second figures are 1/latency, ' +
        'not a throughput or concurrency measurement. The mandatory-approval path is excluded: ' +
        'it blocks on a human.',
    scenarios: results.scenarios,
    components: results.components,
    cold: results.cold,
};

if (JSON_OUT) {
    await fs.writeFile(JSON_OUT, JSON.stringify(artefact, null, 2) + '\n', 'utf8');
    console.log(`  Written: ${JSON_OUT}`);
    console.log('');
}

await fs.rm(BENCH_VAULT, { recursive: true, force: true }).catch(() => {});
