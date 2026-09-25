// sim.js：逐轮迭代的力导向布局
// 规则：每条边把两个端点在每一维上向彼此拉近一格（间距不超过一格即不动）；
// 相邻两轮坐标完全一致即收敛并提前结束。遍历顺序固定为节点表/边表顺序。

export const DIMENSIONS = 2;

// 把边的端点（下标或节点 id）解析为节点下标，并在解析过程中检查重复边。
// 重复边（无向，含反向重复与自环重复）抛 E_DUP_EDGE，不做静默去重。
export function prepareEdges(nodes, edges) {
  const idToIndex = new Map();
  nodes.forEach((node, index) => { idToIndex.set(node.id, index); });

  const prepared = new Array(edges.length);
  const seen = new Set();

  for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
    const edge = edges[edgeIndex];
    let a = edge[0];
    let b = edge[1];
    if (typeof a === "string" || typeof b === "string") {
      if (!idToIndex.has(a) || !idToIndex.has(b)) {
        throw new Error("E_UNKNOWN_NODE: edge references unknown node at edge " + edgeIndex);
      }
      a = idToIndex.get(a);
      b = idToIndex.get(b);
    }
    if (!Number.isInteger(a) || !Number.isInteger(b)
        || a < 0 || b < 0 || a >= nodes.length || b >= nodes.length) {
      throw new Error("E_BAD_EDGE: edge endpoint out of range at edge " + edgeIndex);
    }

    const key = a <= b ? a + "|" + b : b + "|" + a;
    if (seen.has(key)) {
      const error = new Error("duplicate edge: " + JSON.stringify(edges[edgeIndex]));
      error.code = "E_DUP_EDGE";
      throw error;
    }
    seen.add(key);
    prepared[edgeIndex] = [a, b];
  }
  return prepared;
}

function initialPositions(nodes) {
  const positions = {};
  nodes.forEach((node, index) => {
    const coordinate = new Array(DIMENSIONS);
    coordinate[0] = index;
    for (let dim = 1; dim < DIMENSIONS; dim += 1) { coordinate[dim] = 0; }
    positions[node.id] = coordinate;
  });
  return positions;
}

// 处理一条边：在每一维上把两个端点各拉近一格（冻结端点只受力、不移动）。
// 返回这一步是否有任意非冻结节点实际移动。
function stepEdge(coordinates, edge, frozen) {
  const a = edge[0];
  const b = edge[1];
  let moved = false;
  for (let dim = 0; dim < DIMENSIONS; dim += 1) {
    const delta = coordinates[b][dim] - coordinates[a][dim];
    if (delta > 1) {
      if (!frozen[a]) { coordinates[a][dim] += 1; moved = true; }
      if (!frozen[b]) { coordinates[b][dim] -= 1; moved = true; }
    } else if (delta < -1) {
      if (!frozen[a]) { coordinates[a][dim] -= 1; moved = true; }
      if (!frozen[b]) { coordinates[b][dim] += 1; moved = true; }
    }
  }
  return moved;
}

// 跑一轮：严格按边表顺序线性推进，O(边数)，无节点两两互算。
// budget 给出时，每条边消耗一次预算，预算耗尽即停止处理后续边。
export function runRound(coordinates, preparedEdges, frozen, budget) {
  const cap = budget === undefined || budget === null ? preparedEdges.length : Math.max(0, budget);
  const limit = Math.min(cap, preparedEdges.length);
  let used = 0;
  let changed = false;
  for (let index = 0; index < limit; index += 1) {
    if (stepEdge(coordinates, preparedEdges[index], frozen)) { changed = true; }
    used += 1;
  }
  return { used: used, changed: changed };
}

function toPositions(nodes, coordinates) {
  const positions = {};
  nodes.forEach((node, index) => { positions[node.id] = coordinates[index].slice(); });
  return positions;
}

export function iterate(nodes, edges, rounds) {
  const preparedEdges = prepareEdges(nodes, edges);
  const coordinates = nodes.map((node, index) => {
    const coordinate = new Array(DIMENSIONS);
    coordinate[0] = index;
    for (let dim = 1; dim < DIMENSIONS; dim += 1) { coordinate[dim] = 0; }
    return coordinate;
  });
  const frozen = new Array(nodes.length).fill(false);

  let actualRounds = 0;
  let stable = false;
  const maxRounds = Math.max(0, Math.floor(Number(rounds)) || 0);

  for (let round = 0; round < maxRounds; round += 1) {
    const before = coordinates.map((coordinate) => coordinate.join(","));
    runRound(coordinates, preparedEdges, frozen);
    actualRounds += 1;
    const after = coordinates.map((coordinate) => coordinate.join(","));
    if (before.join(";") === after.join(";")) {
      stable = true;
      break;
    }
  }

  return { positions: toPositions(nodes, coordinates), rounds: actualRounds, stable: stable };
}

export { initialPositions };
