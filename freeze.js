// freeze.js：冻结指定节点跑单轮，预算限制这一轮处理的边数。
import { initialPositions, validateEdges, stepRound } from "./sim.js";

function once(nodes, edges, frozenSet, budget) {
  const positions = initialPositions(nodes);
  const step = stepRound(nodes, edges, positions, frozenSet, budget);
  return { positions: positions, moved: step.moved, used: step.used };
}

export function run(nodes, edges, frozen, budget) {
  validateEdges(edges);
  const frozenSet = new Set(frozen);
  const first = once(nodes, edges, frozenSet, budget);
  const second = once(nodes, edges, frozenSet, budget);
  const deterministic = JSON.stringify(first.positions) === JSON.stringify(second.positions);

  // 不变量：被冻结的节点整轮坐标不得变化，逐一对照初始布局确认。
  const initial = initialPositions(nodes);
  const frozenKept = frozen.filter((id) => {
    return first.positions[id]
      && first.positions[id][0] === initial[id][0]
      && first.positions[id][1] === initial[id][1];
  });
  const moved = nodes.filter((node) => first.moved.has(node.id)).map((node) => node.id);

  return { positions: first.positions, frozen_kept: frozenKept, moved: moved,
           used: first.used, deterministic: deterministic };
}
