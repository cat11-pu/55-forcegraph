// freeze.js：冻结与预算（基线：不冻结、不看预算）
import { iterate } from "./sim.js";

export function run(nodes, edges, frozen, budget) {
  const base = iterate(nodes, edges, 10);
  return { positions: base.positions, frozen_kept: [], moved: nodes.map((node) => node.id),
           used: nodes.length, deterministic: true };
}
