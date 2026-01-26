import cluster from "node:cluster";
import os from "node:os";
// import { dirname } from "node:path";
// import { fileURLToPath } from "node:url";
import path from "path";

// const __dir = dirname(fileURLToPath(path.resolve("./ca.pem")));

const cpuCount = os.cpus().length;

console.log(`Total number of cpus is ${cpuCount}`);
console.log(`primary pid${process.pid}`);

cluster.setupPrimary({
  exec: path.resolve("./src/server.ts"),
});

for (let i = 0; i < cpuCount; i++) {
  cluster.fork();
}

cluster.on("exit", () => {
  cluster.fork();
});
