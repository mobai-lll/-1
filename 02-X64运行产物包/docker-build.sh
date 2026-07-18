#!/usr/bin/env bash
# ==========================================
#  X64 运行产物包构建脚本
#  用法: bash docker-build.sh [export|save]
#
#  无参数   = 仅构建 linux/amd64 镜像
#  export   = 构建并导出为 .tar 文件
#  save     = 构建并推送至镜像仓库（需先配置）
# ==========================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:-build}"

echo "========================================"
echo "  赛事信息服务平台 - X64 镜像构建"
echo "  目标平台: linux/amd64"
echo "========================================"

# 检查 Docker
if ! command -v docker &>/dev/null; then
  echo "[错误] 未检测到 Docker，请先安装 Docker Desktop。"
  echo "  下载: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

# 检查 buildx（用于跨平台构建）
if ! docker buildx version &>/dev/null 2>&1; then
  echo "[提示] 未检测到 docker buildx，尝试创建默认 builder..."
  docker buildx create --use --name course-builder 2>/dev/null || true
fi

echo ""
echo "[1/3] 构建 backend 镜像 (linux/amd64)..."
docker buildx build \
  --platform linux/amd64 \
  --load \
  -t course-backend:latest \
  -f "${SCRIPT_DIR}/infra/backend.Dockerfile" \
  "${SCRIPT_DIR}"

echo ""
echo "[2/3] 构建 frontend 镜像 (linux/amd64)..."
docker buildx build \
  --platform linux/amd64 \
  --load \
  -t course-frontend:latest \
  -f "${SCRIPT_DIR}/infra/frontend.Dockerfile" \
  "${SCRIPT_DIR}"

echo ""
echo "[3/3] 镜像构建完成！"

# 验证镜像
echo ""
echo "镜像列表:"
docker images | grep course-

case "$MODE" in
  export|save)
    echo ""
    echo "导出镜像为 .tar 文件..."
    mkdir -p "${SCRIPT_DIR}/images"
    docker save -o "${SCRIPT_DIR}/images/course-backend.tar" course-backend:latest
    docker save -o "${SCRIPT_DIR}/images/course-frontend.tar" course-frontend:latest
    echo "已导出到 ${SCRIPT_DIR}/images/"
    ls -lh "${SCRIPT_DIR}/images/"
    ;;
  push)
    echo ""
    echo "推送镜像至仓库..."
    echo "[提示] 如需推送到远程仓库，请先执行:"
    echo "  docker tag course-backend:latest <registry>/course-backend:latest"
    echo "  docker tag course-frontend:latest <registry>/course-frontend:latest"
    echo "  docker push <registry>/course-backend:latest"
    echo "  docker push <registry>/course-frontend:latest"
    ;;
esac

echo ""
echo "========================================"
echo "  构建完成！"
echo "========================================"
echo ""
echo "使用以下命令启动服务:"
echo "  bash start.sh"
echo ""
echo "或手动运行:"
echo "  docker compose -f infra/compose.yaml up -d"
echo ""
echo "访问:"
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:7001/api/health"
echo "========================================"
