#!/usr/bin/env bash
# ==========================================
# 一条命令构建并启动赛事信息服务平台
# 用法: bash start.sh
# ==========================================
set -e

echo "========================================"
echo "  赛事信息服务平台 - Docker 构建与启动"
echo "========================================"

# 检查 Docker 是否安装
if ! command -v docker &>/dev/null; then
  echo "[错误] 未检测到 Docker，请先安装 Docker。"
  exit 1
fi

if ! command -v docker compose &>/dev/null && ! command -v docker-compose &>/dev/null; then
  echo "[错误] 未检测到 Docker Compose，请先安装 Docker Compose。"
  exit 1
fi

# 构建镜像
echo ""
echo "[1/2] 构建 Docker 镜像..."
docker compose -f infra/compose.yaml build --no-cache

# 启动服务
echo ""
echo "[2/2] 启动服务..."
docker compose -f infra/compose.yaml up -d

echo ""
echo "========================================"
echo "  启动完成！"
echo "========================================"
echo "  前端页面:   http://localhost:3000"
echo "  后端健康检查: http://localhost:7001/api/health"
echo "  API 契约:   contracts/openapi.yaml"
echo ""
echo "  停止服务:   docker compose -f infra/compose.yaml down"
echo "  查看日志:   docker compose -f infra/compose.yaml logs -f"
echo "========================================"
