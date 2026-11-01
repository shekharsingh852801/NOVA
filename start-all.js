import { spawn } from "node:child_process";

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

const services = [
  { name: "SERVER", color: "\x1b[36m", args: ["run", "dev:api"] },
  { name: "CLIENT", color: "\x1b[32m", args: ["run", "dev"] },
  { name: "ADMIN ", color: "\x1b[35m", args: ["run", "dev:admin"] }
];

const children = [];
const RESET = "\x1b[0m";

console.log("\x1b[1m\x1b[34m=== Starting NOVA Ecosystem (Server, Client, Admin) ===\x1b[0m\n");

for (const service of services) {
  const child = spawn(npmCmd, service.args, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: isWindows
  });

  children.push(child);

  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${service.color}[${service.name}]${RESET} ${line}`);
      }
    }
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.error(`${service.color}[${service.name}]${RESET} \x1b[31m${line}\x1b[0m`);
      }
    }
  });

  child.on("close", (code) => {
    console.log(`${service.color}[${service.name}]${RESET} Exited with code ${code}`);
  });
}

function cleanup() {
  console.log("\n\x1b[33mShutting down all NOVA services...\x1b[0m");
  for (const child of children) {
    if (!child.killed) {
      if (isWindows) {
        spawn("taskkill", ["/pid", child.pid.toString(), "/f", "/t"]);
      } else {
        child.kill("SIGTERM");
      }
    }
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

