#!/bin/bash
# Confluence Search Skill - Gemini CLI 全局安装脚本 (macOS/Linux)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GEMINI_DIR="$HOME/.gemini"
COMMANDS_DIR="$GEMINI_DIR/commands"
SKILLS_DIR="$GEMINI_DIR/skills/confluence-search"

# 1. 创建目录
mkdir -p "$COMMANDS_DIR"
mkdir -p "$SKILLS_DIR"

# 2. 复制搜索脚本
cp "$SCRIPT_DIR/confluence-search.mjs" "$SKILLS_DIR/"
echo "[OK] 脚本已复制到 $SKILLS_DIR/confluence-search.mjs"

# 3. 创建斜杠命令文件
cat > "$COMMANDS_DIR/confluence-search.md" << 'COMMAND_EOF'
当用户提供搜索关键词时，执行以下命令搜索公司 Confluence 知识库：

```
node ~/.gemini/skills/confluence-search/confluence-search.mjs "$PROMPT" --format markdown
```

搜索完成后：
- 汇总搜索结果中最相关的内容
- 引用原文链接
- 用中文回答用户的问题

如果搜索无结果，建议用户尝试不同的关键词。
COMMAND_EOF

echo "[OK] 斜杠命令已创建: $COMMANDS_DIR/confluence-search.md"
echo ""
echo "安装完成！"
echo ""
echo "使用前请确保已配置环境变量:"
echo "  export CONFLUENCE_URL='https://your-company.atlassian.net/wiki'"
echo "  export CONFLUENCE_EMAIL='your@email.com'"
echo "  export CONFLUENCE_API_TOKEN='your-api-token'"
echo "  或"
echo "  export CONFLUENCE_PAT='your-pat-token'"
echo ""
echo "使用方式: 在任意目录启动 gemini 后输入:"
echo "  /confluence-search 搜索关键词"
