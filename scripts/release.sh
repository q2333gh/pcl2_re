#!/bin/bash

# PCL2 Reforged 发布脚本
# 使用方法: ./scripts/release.sh [patch|minor|major]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查参数
if [ $# -eq 0 ]; then
    print_error "请指定版本类型: patch, minor, 或 major"
    echo "使用方法: $0 [patch|minor|major]"
    exit 1
fi

VERSION_TYPE=$1

# 验证版本类型
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    print_error "无效的版本类型: $VERSION_TYPE"
    echo "支持的版本类型: patch, minor, major"
    exit 1
fi

print_info "开始发布流程..."

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    print_error "工作目录不干净，请先提交或暂存更改"
    git status --short
    exit 1
fi

# 检查是否在main分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "当前不在main分支 ($CURRENT_BRANCH)"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 拉取最新更改
print_info "拉取最新更改..."
git pull origin main

# 运行测试
print_info "运行测试..."
pnpm run type-check
pnpm run lint
pnpm run build

# 更新版本
print_info "更新版本 ($VERSION_TYPE)..."
NEW_VERSION=$(pnpm version $VERSION_TYPE --no-git-tag-version)
print_success "版本已更新为: $NEW_VERSION"

# 更新package.json中的版本
print_info "更新package.json..."
sed -i "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json

# 构建应用
print_info "构建应用..."
pnpm run build

# 提交更改
print_info "提交更改..."
git add .
git commit -m "chore: release $NEW_VERSION"

# 创建标签
print_info "创建标签..."
git tag -a "v$NEW_VERSION" -m "Release $NEW_VERSION"

# 推送到远程仓库
print_info "推送到远程仓库..."
git push origin main
git push origin "v$NEW_VERSION"

print_success "发布流程完成!"
print_info "版本 $NEW_VERSION 已发布到GitHub"
print_info "GitHub Actions将自动构建并发布到Releases页面"

# 显示下一步操作
echo
print_info "下一步操作:"
echo "1. 等待GitHub Actions完成构建 (约10-15分钟)"
echo "2. 检查Releases页面: https://github.com/your-repo/pcl2_re/releases"
echo "3. 下载并测试发布的应用"
echo "4. 更新项目文档和README"

print_success "发布脚本执行完成!" 