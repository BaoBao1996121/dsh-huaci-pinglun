/**
 * Isolated, offline Chrome regression fixtures. Usage: node test/browser.mjs
 * DSH_TEST_CHROME overrides the installed browser path (no downloads).
 * Each fixture gets a fresh profile and a 20-second process budget. Output and
 * profiles stay in os.tmpdir()/dsh-huaci-pinglun-browser-* for diagnosis; this
 * runner never removes directories or connects to a DSH server.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { accessSync, closeSync, constants, mkdtempSync, openSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = [
	{ name: "layout", checks: 20 },
	{ name: "selection", checks: 9 }
];
const budgetMs = 20_000;
const prefix = "dsh-huaci-pinglun-browser-";

class RegressionFailure extends Error {}

function errorCode(error) {
	return /^[A-Z0-9_]+$/u.test(error?.code ?? "") ? error.code : "UNKNOWN";
}

function browserPath() {
	const override = process.env.DSH_TEST_CHROME;
	const candidates = override !== undefined ? [override] : process.platform === "win32"
		? ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"]
		: ["/usr/bin/google-chrome", "/usr/bin/chromium"];
	for (const candidate of candidates) {
		try {
			if (!statSync(candidate).isFile()) continue;
			accessSync(candidate, process.platform === "win32" ? constants.R_OK : constants.X_OK);
			return candidate;
		} catch {
			// Only probe installed paths. An invalid explicit override must fail.
		}
	}
	throw new RegressionFailure(override !== undefined
		? "DSH_TEST_CHROME is unavailable; browser tests failed (not skipped)"
		: "Chrome/Chromium is unavailable; set DSH_TEST_CHROME (failed, not skipped)");
}

// dump-dom serializes pre.textContent as HTML, so decode entities before JSON.
function decodeText(text) {
	const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
	return text.replace(/&(amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/giu, (entity, key) => {
		if (key[0] !== "#") return named[key.toLowerCase()];
		const hex = key[1].toLowerCase() === "x";
		const point = Number.parseInt(key.slice(hex ? 2 : 1), hex ? 16 : 10);
		return point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
	});
}

function runFixture(chrome, fixture) {
	const work = mkdtempSync(join(tmpdir(), prefix + fixture.name + "-"));
	const output = join(work, "stdout.html");
	const stdout = openSync(output, "wx");
	let stderr;
	let child;
	try {
		stderr = openSync(join(work, "stderr.log"), "wx");
		const args = [
			"--headless",
			"--dump-dom",
			"--virtual-time-budget=2000",
			"--user-data-dir=" + join(work, "profile"),
			"--disable-background-networking",
			"--disable-component-update",
			"--disable-default-apps",
			"--disable-extensions",
			"--disable-sync",
			"--metrics-recording-only",
			"--no-first-run",
			"--no-default-browser-check",
			"--no-proxy-server",
			"--host-resolver-rules=MAP * ~NOTFOUND"
		];
		// The CI profile contains only synthetic fixtures, never user data.
		if (/^(?:1|true)$/iu.test(process.env.CI ?? "")) args.push("--no-sandbox");
		args.push(pathToFileURL(join(here, "browser", fixture.name + ".html")).href);
		child = spawnSync(chrome, args, {
			stdio: ["ignore", stdout, stderr],
			timeout: budgetMs,
			killSignal: "SIGKILL",
			windowsHide: true
		});
	} finally {
		closeSync(stdout);
		if (stderr !== undefined) closeSync(stderr);
	}
	if (child.error) {
		throw new RegressionFailure(fixture.name + ": browser process failed (" + errorCode(child.error) + ")");
	}
	if (child.status !== 0) {
		throw new RegressionFailure(fixture.name + ": browser exited unsuccessfully");
	}
	const dom = readFileSync(output, "utf8");
	const pre = dom.match(/<pre\b[^>]*\bid=(?:"results"|'results'|results(?=\s|>))[^>]*>([\s\S]*?)<\/pre>/iu);
	if (pre === null) throw new RegressionFailure(fixture.name + ": results pre is missing");
	let report;
	try {
		report = JSON.parse(decodeText(pre[1]));
	} catch {
		throw new RegressionFailure(fixture.name + ": results JSON is missing or invalid");
	}
	try {
		assert.equal(report.status, "PASS");
		assert.ok(Array.isArray(report.checks));
		assert.equal(report.checks.length, fixture.checks);
		for (const check of report.checks) assert.equal(check.ok, true);
	} catch {
		throw new RegressionFailure(fixture.name + ": result assertions failed (" + fixture.checks + " expected checks)");
	}
	return fixture.checks;
}

try {
	const chrome = browserPath();
	const counts = fixtures.map((fixture) => runFixture(chrome, fixture));
	for (let i = 0; i < fixtures.length; i += 1) {
		console.log("PASS " + fixtures[i].name + ": " + counts[i] + " checks");
	}
	console.log("PASS browser: " + counts.reduce((sum, count) => sum + count, 0) + " checks");
} catch (error) {
	const summary = error instanceof RegressionFailure ? error.message : "runner error (" + errorCode(error) + ")";
	console.error("FAIL browser: " + summary);
	console.error("Diagnostics are retained under os.tmpdir()/" + prefix + "* when a browser was started.");
	process.exitCode = 1;
}
