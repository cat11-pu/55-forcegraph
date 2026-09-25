import assert from "node:assert";
import { iterate } from "../sim.js";
import { run } from "../freeze.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const nodes = [{ id: "n0" }, { id: "n1" }];
const edges = [[0, 1]];

check("iterate returns positions", () => {
  assert.strictEqual(typeof iterate(nodes, edges, 3).positions, "object");
});

check("iterate reports rounds", () => {
  assert.strictEqual(typeof iterate(nodes, edges, 3).rounds, "number");
});

check("run reports moved", () => {
  assert.ok(Array.isArray(run(nodes, edges, [], 4).moved));
});

check("run reports deterministic flag", () => {
  assert.strictEqual(typeof run(nodes, edges, [], 4).deterministic, "boolean");
});

check("render exposes frozen_kept", () => {
  assert.ok(Array.isArray(render({ nodes: nodes, edges: edges, frozen: [], budget: 4 }).frozen_kept));
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
