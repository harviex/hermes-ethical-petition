#!/bin/bash
# Hermès Ethical Petition - 自动化部署脚本
# 用途：启用GitHub Pages + 检查Vercel部署

set -e  # 遇到错误立即退出

echo "🚀 Hermès Ethical Petition - 自动部署"
echo "=" * 60

# 检查是否提供了token
if [ -z "$1" ]; then
    echo "❌ 用法: $0 <github_token>"
    echo "   示例: $0 ghp_YOUR_TOKEN_HERE"
    exit 1
fi

GITHUB_TOKEN="$1"
REPO_OWNER="harviex"
REPO_NAME="hermes-ethical-petition"

# ==================== 1. 启用GitHub Pages ====================
echo ""
echo "📘 步骤1: 启用GitHub Pages..."

curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pages" \
  -d '{"source": {"branch": "main", "path": "/"}}' \
  -o /tmp/gh_pages_response.json

if grep -q "already" /tmp/gh_pages_response.json; then
    echo "✅ GitHub Pages已经启用"
else
    echo "✅ GitHub Pages已启用！"
    echo "   URL: https://${REPO_OWNER}.github.io/${REPO_NAME}/"
fi

# ==================== 2. 检查Vercel部署 ====================
echo ""
echo "🔍 步骤2: 检查Vercel部署状态..."

# 尝试访问API
API_RESPONSE=$(curl -s https://hermes-ethical-petition.vercel.app/api/health || echo "FAILED")
if echo "$API_RESPONSE" | grep -q "ok"; then
    echo "✅ Vercel API正常！"
    echo "   $API_RESPONSE"
else
    echo "⚠️  Vercel API返回异常，可能需要重新部署"
    echo "   响应: $API_RESPONSE"
    echo ""
    echo "📝 请手动在Vercel Dashboard检查部署："
    echo "   https://vercel.com/dashboard"
fi

# ==================== 3. 测试计数器API ====================
echo ""
echo "🧪 步骤3: 测试计数器API..."

COUNT_RESPONSE=$(curl -s https://hermes-ethical-petition.vercel.app/api/count || echo "FAILED")
if echo "$COUNT_RESPONSE" | grep -q "count"; then
    echo "✅ 计数器API正常！"
    echo "   当前计数: $(echo $COUNT_RESPONSE | grep -o '"count":[0-9]*' | cut -d: -f2)"
else
    echo "⚠️  计数器API异常"
fi

# ==================== 4. 输出访问地址 ====================
echo ""
echo "=" * 60
echo "🎉 部署完成！访问地址："
echo ""
echo "📘 GitHub Pages (静态页):"
echo "   https://${REPO_OWNER}.github.io/${REPO_NAME}/"
echo ""
echo "⚡ Vercel (API):"
echo "   https://hermes-ethical-petition.vercel.app"
echo ""
echo "🧡 计数器API:"
echo "   GET  https://hermes-ethical-petition.vercel.app/api/count"
echo "   POST https://hermes-ethical-petition.vercel.app/api/support"
echo "=" * 60
