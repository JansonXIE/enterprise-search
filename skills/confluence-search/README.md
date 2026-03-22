# Confluence Search Skill

通过 CQL (Confluence Query Language) 搜索公司 Confluence 知识库内容并提取摘要。

## 功能

- 使用关键词搜索 Confluence 页面内容
- 自动去除 HTML 标签，提取纯文本摘要
- 支持云版 (Basic Auth) 和私有化部署 (Bearer Token) 两种认证方式
- 输出 JSON 或 Markdown 格式的搜索结果

## 前置需求

- Node.js >= 18 (需要内置 `fetch`)
- 配置以下环境变量

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `CONFLUENCE_URL` | Confluence 基础 URL，例如 `https://your-company.atlassian.net/wiki` | ✅ |
| `CONFLUENCE_EMAIL` | 用户邮箱（云版 Basic Auth） | 云版必填 |
| `CONFLUENCE_API_TOKEN` | API Token（云版 Basic Auth） | 云版必填 |
| `CONFLUENCE_PAT` | Personal Access Token（私有化部署 Bearer Auth） | 私有化必填 |

> 云版需要同时配置 `CONFLUENCE_EMAIL` + `CONFLUENCE_API_TOKEN`；私有化部署只需配置 `CONFLUENCE_PAT`。

## 用法

```bash
# 基本搜索
node confluence-search.mjs "登录问题"

# 限制返回数量
node confluence-search.mjs "API 文档" --limit 5

# Markdown 格式输出
node confluence-search.mjs "部署流程" --format markdown
```

## 输出格式

### JSON (默认)

```json
[
  {
    "id": "12345",
    "title": "部署流程说明",
    "url": "https://your-company.atlassian.net/wiki/...",
    "content": "本文档描述了项目的部署流程...",
    "source": "confluence"
  }
]
```

### Markdown

```
## Confluence 搜索结果 (共 1 条)

**搜索关键词**: 部署流程

### 1. 部署流程说明
- **ID**: 12345
- **链接**: https://your-company.atlassian.net/wiki/...
- **摘要**: 本文档描述了项目的部署流程...
```
