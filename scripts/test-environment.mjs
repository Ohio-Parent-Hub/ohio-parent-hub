import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createHash } from "node:crypto";
import { PROJECT_ID, RUNTIME_FILE, loadTestEnvironment, localConfigFromStatus, isolatedProcessEnv, unitEnvironment, assertLocalProjectConfig } from "../tests/support/environment.mjs";
import { seedFixtures } from "../tests/support/seed.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const bin = (name) => path.join(root, "node_modules", ".bin", name + (process.platform === "win32" ? ".cmd" : ""));
const marker = path.join(root, ".next", "oph-test-build.json");

function assertLocalProject() {
  assertLocalProjectConfig(readFileSync(path.join(root, "supabase/config.toml"), "utf8"));
}

function cli(args) {
  assertLocalProject();
  const env = { ...process.env };
  // Always use this machine's daemon, never an inherited remote Docker context.
  for (const name of ["DOCKER_HOST", "DOCKER_CONTEXT", "DOCKER_TLS", "DOCKER_TLS_VERIFY", "DOCKER_CERT_PATH",
    "SUPABASE_ACCESS_TOKEN", "SUPABASE_DB_PASSWORD"]) delete env[name];
  env.DOCKER_HOST = "unix:///var/run/docker.sock";
  const result = spawnSync(bin("supabase"), args, {
    cwd: root, env, encoding: "utf8", timeout: 15 * 60_000, maxBuffer: 20 * 1024 * 1024,
    stdio: args[0] === "start" ? ["ignore", "pipe", "inherit"] : "pipe",
  });
  // CLI status/start stdout can include local keys; never echo it.
  if (result.error || result.status !== 0) {
    throw new Error(`Local Supabase ${args[0]} failed: ${result.error?.message ?? result.stderr?.slice(-2000) ?? "see startup diagnostics"}`);
  }
  return result.stdout;
}

function refreshLocalEnvironment() {
  const local = localConfigFromStatus(JSON.parse(cli(["status", "-o", "json"])));
  mkdirSync(path.dirname(RUNTIME_FILE), { recursive: true });
  writeFileSync(RUNTIME_FILE, JSON.stringify(local, null, 2) + "\n", { mode: 0o600 });
  return local;
}

function fingerprint(local) {
  return createHash("sha256").update(JSON.stringify(local)).digest("hex");
}

function run(command, args, local, nodeEnv = "production") {
  const result = spawnSync(command, args, { cwd: root, env: { ...isolatedProcessEnv(local), NODE_ENV: nodeEnv }, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  const [action, task, ...extra] = process.argv.slice(2);
  if (extra.length || (action !== "run" && task)) throw new Error("Unexpected test command arguments.");
  switch (action) {
    case "setup":
      console.log("Starting dedicated local Supabase; the first run downloads Docker images.");
      cli(["start", "--exclude", "studio,logflare,vector,realtime,edge-runtime,imgproxy"]);
      refreshLocalEnvironment();
      await seedFixtures();
      console.log("Local fixtures ready. Email inbox: http://127.0.0.1:55434");
      break;
    case "reset":
      // --local is explicit. No remote URL, linked flag, or caller arguments are accepted.
      refreshLocalEnvironment();
      cli(["db", "reset", "--local", "--no-seed", "--yes"]);
      refreshLocalEnvironment();
      await seedFixtures();
      console.log("Dedicated local database reset and fixtures reseeded.");
      break;
    case "stop":
    case "teardown":
      cli(["stop", "--project-id", PROJECT_ID, ...(action === "teardown" ? ["--no-backup"] : [])]);
      rmSync(RUNTIME_FILE, { force: true });
      console.log(action === "teardown" ? "Dedicated local stack and its data removed; other projects are untouched." :
        "Dedicated local stack stopped; other projects are untouched.");
      break;
    case "run": {
      if (task === "unit") {
        run(bin("vitest"), ["run", "--config", "vitest.config.mts"], unitEnvironment(), "test");
        break;
      }
      const tasks = {
        build: [bin("next"), ["build"]],
        start: [bin("next"), ["start", "--hostname", "127.0.0.1", "--port", "3100"]],
        integration: [bin("vitest"), ["run", "--config", "vitest.integration.config.mts"]],
        e2e: [bin("playwright"), ["test"]],
      };
      if (!Object.hasOwn(tasks, task)) throw new Error("Unknown isolated test task.");
      const local = loadTestEnvironment();
      const observed = localConfigFromStatus(JSON.parse(cli(["status", "-o", "json"])));
      if (fingerprint(local) !== fingerprint(observed)) throw new Error("Stale local test configuration; run test:setup.");
      if (task === "integration") await seedFixtures();
      if (task === "build") rmSync(marker, { force: true });
      if (task === "start" || task === "e2e") {
        if (!existsSync(marker)) throw new Error("Run npm run test:build before starting the test application.");
        const saved = JSON.parse(readFileSync(marker, "utf8"));
        if (saved.fingerprint !== fingerprint(local) || saved.buildId !== readFileSync(path.join(root, ".next/BUILD_ID"), "utf8").trim()) {
          throw new Error("Build does not match this isolated test environment; rebuild with test:build.");
        }
      }
      run(...tasks[task], local, task === "integration" ? "test" : "production");
      if (task === "build") writeFileSync(marker, JSON.stringify({
        fingerprint: fingerprint(local), buildId: readFileSync(path.join(root, ".next/BUILD_ID"), "utf8").trim(),
      }) + "\n");
      break;
    }
    default: throw new Error("Use setup, reset, stop, teardown, or run <unit|build|start|integration|e2e>.");
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
