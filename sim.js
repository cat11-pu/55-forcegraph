// sim.js：逐轮迭代。每轮按边表顺序线性推进，相连节点在每一维上
// 互相拉近一格（间距不超过一格则不动）；相邻两轮坐标完全一致即收敛。
export const DUP_EDGE_CODE = "E_DUP_EDGE";

// 重复边（无向意义下同一对端点）直接报错，不静默去重。
export function validateEdges(edges) {
  const seen = new Set();
  edges.forEach((edge) => {
    const a = edge[0];
    const b = edge[1];
    const key = a < b ? a + "|" + b : b + "|" + a;
    if (seen.has(key)) {
      const error = new Error(DUP_EDGE_CODE + ": duplicate edge " + key);
      error.code = DUP_EDGE_CODE;
      throw error;
    }
    seen.add(key);
  });
}

// 初始布局确定性生成：按节点顺序排到 x 轴上（可带 x/y 覆盖）。
export function initialPositions(nodes) {
  const positions = {};
  nodes.forEach((node, index) => {
    const x = typeof node.x === "number" ? node.x : index;
    const y = typeof node.y === "number" ? node.y : 0;
    positions[node.id] = [x, y];
  });
  return positions;
}

function snapshot(positions, nodes) {
  const copy = {};
  nodes.forEach((node) => { copy[node.id] = positions[node.id].slice(); });
  return copy;
}

function samePositions(a, b, nodes) {
  return nodes.every((node) => {
    const pa = a[node.id];
    const pb = b[node.id];
    return pa[0] === pb[0] && pa[1] === pb[1];
  });
}

// 单轮推进：按边表顺序逐边处理，每条边消耗一格预算；
// 预算耗尽即停，保证每轮代价相对边表线性。frozen 中的节点参与受力但自身不动。
export function stepRound(nodes, edges, positions, frozen, budget) {
  const moved = new Set();
  const limit = typeof budget === "number" ? budget : Infinity;
  let used = 0;
  for (const edge of edges) {
    if (used >= limit) { break; }
    used += 1;
    const pa = positions[nodes[edge[0]].id];
    const pb = positions[nodes[edge[1]].id];
    for (let dim = 0; dim < 2; dim += 1) {
      const diff = pb[dim] - pa[dim];
      if (diff > 1 || diff < -1) {
        const dir = diff > 0 ? 1 : -1;
        if (!frozen.has(nodes[edge[0]].id)) { pa[dim] += dir; moved.add(nodes[edge[0]].id); }
        if (!frozen.has(nodes[edge[1]].id)) { pb[dim] -= dir; moved.add(nodes[edge[1]].id); }
      }
    }
  }
  return { moved: moved, used: used };
}

export function iterate(nodes, edges, rounds) {
  validateEdges(edges);
  const positions = initialPositions(nodes);
  const nobody = new Set();
  let actual = 0;
  let stable = false;
  for (let round = 1; round <= rounds; round += 1) {
    const before = snapshot(positions, nodes);
    stepRound(nodes, edges, positions, nobody, Infinity);
    actual = round;
    if (samePositions(before, positions, nodes)) { stable = true; break; }
  }
  return { positions: positions, rounds: actual, stable: stable };
}
