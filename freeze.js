// freeze.js：冻结与预算
// 被冻结的节点参与受力（仍然拉近对端），但自身坐标在整轮迭代里保持不变；
// 预算按边表线性推进，每处理一条边消耗一次，预算耗尽立即停止；O(边数)。
import { prepareEdges, runRound, initialPositions } from "./sim.js";

function resolveFrozen(nodes, frozen) {
  const idToIndex = new Map();
  nodes.forEach((node, index) => { idToIndex.set(node.id, index); });

  const flags = new Array(nodes.length).fill(false);
  const kept = [];
  (frozen || []).forEach((entry) => {
    let index;
    if (typeof entry === "number") {
      index = entry;
      if (!Number.isInteger(index) || index < 0 || index >= nodes.length) {
        throw new Error("E_BAD_FROZEN: frozen node index out of range: " + entry);
      }
    } else {
      if (!idToIndex.has(entry)) {
        throw new Error("E_UNKNOWN_NODE: unknown frozen node: " + entry);
      }
      index = idToIndex.get(entry);
    }
    if (!flags[index]) {
      flags[index] = true;
      kept.push(nodes[index].id);
    }
  });
  return { flags: flags, kept: kept };
}

function startingCoordinates(nodes) {
  const positions = initialPositions(nodes);
  return nodes.map((node) => positions[node.id].slice());
}

function planOnce(start, preparedEdges, frozenFlags, budget) {
  const coordinates = start.map((coordinate) => coordinate.slice());
  const result = runRound(coordinates, preparedEdges, frozenFlags, budget);
  return { coordinates: coordinates, used: result.used };
}

export function run(nodes, edges, frozen, budget) {
  const preparedEdges = prepareEdges(nodes, edges);
  const resolved = resolveFrozen(nodes, frozen);

  const start = startingCoordinates(nodes);

  // 同一输入跑两次，逐坐标比对，固定遍历顺序下结果必须完全一致。
  const first = planOnce(start, preparedEdges, resolved.flags, budget);
  const second = planOnce(start, preparedEdges, resolved.flags, budget);
  const deterministic = JSON.stringify(first.coordinates) === JSON.stringify(second.coordinates);

  const moved = [];
  nodes.forEach((node, index) => {
    if (JSON.stringify(start[index]) !== JSON.stringify(first.coordinates[index])) {
      moved.push(node.id);
    }
  });

  const positions = {};
  nodes.forEach((node, index) => { positions[node.id] = first.coordinates[index].slice(); });

  return {
    positions: positions,
    frozen_kept: resolved.kept,
    moved: moved,
    used: first.used,
    deterministic: deterministic
  };
}
