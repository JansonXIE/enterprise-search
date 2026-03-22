#!/usr/bin/env pwsh
# Confluence Search Skill - Gemini CLI 全局安装脚本 (Windows)

$GeminiDir = "$HOME\.gemini"
$CommandsDir = "$GeminiDir\commands"
$SkillsDir = "$GeminiDir\skills\confluence-search"
$ScriptSource = "$PSScriptRoot\confluence-search.mjs"

# 1. 创建目录
New-Item -ItemType Directory -Path $CommandsDir -Force | Out-Null
New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null

# 2. 复制搜索脚本
Copy-Item $ScriptSource -Destination $SkillsDir -Force
Write-Host "[OK] 脚本已复制到 $SkillsDir\confluence-search.mjs"

# 3. 创建斜杠命令文件
$CommandContent = @"
当用户提供搜索关键词时，执行以下命令搜索公司 Confluence 知识库：

``````
node $($SkillsDir -replace '\\','/')/confluence-search.mjs "`$PROMPT" --format markdown
``````

搜索完成后：
- 汇总搜索结果中最相关的内容
- 引用原文链接
- 用中文回答用户的问题

如果搜索无结果，建议用户尝试不同的关键词。
"@

$CommandFile = "$CommandsDir\confluence-search.md"
Set-Content -Path $CommandFile -Value $CommandContent -Encoding UTF8
Write-Host "[OK] 斜杠命令已创建: $CommandFile"

Write-Host ""
Write-Host "安装完成！"
Write-Host ""
Write-Host "使用前请确保已配置环境变量:"
Write-Host "  `$env:CONFLUENCE_URL          = 'https://your-company.atlassian.net/wiki'"
Write-Host "  `$env:CONFLUENCE_EMAIL        = 'your@email.com'"
Write-Host "  `$env:CONFLUENCE_API_TOKEN    = 'your-api-token'"
Write-Host "  或"
Write-Host "  `$env:CONFLUENCE_PAT          = 'your-pat-token'"
Write-Host ""
Write-Host "使用方式: 在任意目录启动 gemini 后输入:"
Write-Host "  /confluence-search 搜索关键词"
