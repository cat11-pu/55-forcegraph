// sim.js：迭代（基线：固定迭代十轮、不看收敛）
export function iterate(nodes, edges, rounds) {
  const positions = {};
  nodes.forEach((node, index) => { positions[node.id] = [index, index]; });
  return { positions: positions, rounds: 10, stable: false };
}
