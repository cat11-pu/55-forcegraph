// app.js：渲染结果
import { iterate } from "./sim.js";
import { run } from "./freeze.js";

export function render(spec) {
  const base = iterate(spec.nodes, spec.edges, spec.iterations);
  const planned = run(spec.nodes, spec.edges, spec.frozen || [], spec.budget);
  return { positions: base.positions, rounds: base.rounds, stable: base.stable,
           frozen_kept: planned.frozen_kept, moved: planned.moved,
           budget_used: planned.used, deterministic: planned.deterministic };
}
