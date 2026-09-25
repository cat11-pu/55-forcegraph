# forcegraph

浏览器单页工作台（原生 ES 模块，零依赖）。

## 起服务看页面

    python3 -m http.server 8000

浏览器打开 http://127.0.0.1:8000/ ，改样例点运行看结果。

## 测试

    node tests/run.js

## 场景自检

    node check_sample.js

## 布局语义

- `sim.iterate(nodes, edges, rounds)`：初始位置按节点顺序排到 x 轴（节点可带 `x`/`y` 覆盖）。
  每轮按边表顺序逐边处理，相连节点在每一维上互相拉近一格（间距不超过一格则不动）；
  相邻两轮坐标完全一致即收敛并提前结束，返回 `{ positions, rounds, stable }`。
- `freeze.run(nodes, edges, frozen, budget)`：跑单轮，`frozen` 中的节点参与受力但自身不动；
  每条边消耗一格预算，预算耗尽即停，返回 `{ positions, frozen_kept, moved, used, deterministic }`。
- 重复边（无向意义下同一对端点）抛出 `E_DUP_EDGE`，不静默去重；遍历顺序固定，同输入两次结果一致。
