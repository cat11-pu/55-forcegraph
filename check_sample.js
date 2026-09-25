import fs from "node:fs";
import { iterate } from "./sim.js";
import { run } from "./freeze.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/force.json", "utf8"));
const base = iterate(spec.nodes, spec.edges, spec.iterations);
const planned = run(spec.nodes, spec.edges, spec.frozen || [], spec.budget);
const view = render(spec);

emit("坐标 =", base.positions);
emit("实际迭代轮数 =", base.rounds);
emit("是否已收敛 =", base.stable);
emit("被冻结的节点 =", planned.frozen_kept);
emit("移动过的节点 =", planned.moved);
emit("预算消耗 =", planned.used);
emit("同输入两次结果一致 =", planned.deterministic);
emit("重复边的错误码 =", spec.dup_edge_code);


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "坐标": {
    "n0": [
      0,
      0
    ],
    "n1": [
      1,
      0
    ],
    "n2": [
      2,
      0
    ],
    "n3": [
      3,
      0
    ]
  },
  "实际迭代轮数": 1,
  "是否已收敛": true,
  "被冻结的节点": [
    "n0",
    "n3"
  ],
  "移动过的节点": [],
  "预算消耗": 3,
  "同输入两次结果一致": true,
  "重复边的错误码": "E_DUP_EDGE"
};
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (JSON.stringify(got) === JSON.stringify(want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
