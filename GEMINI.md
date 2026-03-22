# Confluence Search Skill

本项目包含 Confluence 搜索技能，可通过 CQL 搜索公司 Confluence 知识库。

## 使用方式

当需要搜索 Confluence 内容时，运行以下命令：

```bash
node skills/confluence-search/confluence-search.mjs "<搜索关键词>" --format markdown
```

### 参数说明

- 第一个参数：搜索关键词（必填）
- `--limit N`：限制返回结果数量（默认 25）
- `--format json|markdown`：输出格式（默认 json）

### 环境变量要求

运行前需确保以下环境变量已配置：

- `CONFLUENCE_URL`：Confluence 基础 URL
- 云版认证：`CONFLUENCE_EMAIL` + `CONFLUENCE_API_TOKEN`
- 私有化部署认证：`CONFLUENCE_PAT`

### 使用场景

当用户要求搜索公司知识库、查找 Confluence 文档、或询问公司内部信息时，使用此脚本搜索 Confluence 并基于搜索结果回答用户问题。
