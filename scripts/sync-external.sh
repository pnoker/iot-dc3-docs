#!/usr/bin/env bash
#
# 手动同步上游 iot-dc3 仓库的 CHANGE.md / USAGE.md 到本仓库的独立快照。
#
# 背景:iot-dc3 每次发版由 `make changelog` 重新生成 dc3/doc/CHANGE.md，
# USAGE.md 也在 iot-dc3 维护。本仓库为完全独立的文档仓库（build 不依赖网络），
# 因此这两份文件以快照形式存在于 dc3/doc/ 下。iot-dc3 发版后手动运行本脚本刷新。
#
# 用法:
#   ./scripts/sync-external.sh                 # 默认从 iot-dc3 main 拉取
#   DC3_RAW=https://raw.githubusercontent.com/pnoker/iot-dc3/develop ./scripts/sync-external.sh
#
set -euo pipefail

SRC_RAW="${DC3_RAW:-https://raw.githubusercontent.com/pnoker/iot-dc3/main}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "→ 从 $SRC_RAW 同步 dc3/doc/CHANGE.md 与 dc3/doc/USAGE.md"
curl -fsSL "$SRC_RAW/dc3/doc/CHANGE.md" -o "$ROOT/dc3/doc/CHANGE.md"
curl -fsSL "$SRC_RAW/dc3/doc/USAGE.md" -o "$ROOT/dc3/doc/USAGE.md"
echo "✅ 同步完成。请检查 diff 后提交。"
