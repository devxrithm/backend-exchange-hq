"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cluster_1 = __importDefault(require("node:cluster"));
const node_os_1 = __importDefault(require("node:os"));
const path_1 = __importDefault(require("path"));
const cpuCount = node_os_1.default.cpus().length;
if (node_cluster_1.default.isPrimary) {
    console.log(`Primary PID ${process.pid}`);
    console.log(`Total CPUs: ${cpuCount}`);
    node_cluster_1.default.setupPrimary({
        exec: path_1.default.resolve("./src/server.ts"),
    });
    for (let i = 0; i < cpuCount; i++) {
        node_cluster_1.default.fork();
    }
    node_cluster_1.default.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died, restarting`);
        node_cluster_1.default.fork();
    });
}
else {
    // ❗ NOTHING here
    // server.ts will run inside workers
}
//# sourceMappingURL=cluster.js.map