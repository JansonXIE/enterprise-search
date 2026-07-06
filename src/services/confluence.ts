import { SearchResult } from './types';

export async function searchConfluence(query: string): Promise<SearchResult[]> {
  // 去除末尾斜杠，避免拼接出 //rest/api 导致 401
  const baseUrl = process.env.CONFLUENCE_URL?.replace(/\/+$/, '');
  if (!baseUrl) {
    console.warn('Confluence URL not configured');
    return [];
  }

  // 根据环境变量判断使用 Basic Auth (云版) 还是 Bearer Token (私有化版)
  const headers: HeadersInit = {
    'Accept': 'application/json'
  };

  // 优先使用 Bearer PAT（私有化部署）。放在最前，避免残留的系统环境变量
  // CONFLUENCE_API_TOKEN/EMAIL 抢先走 Basic Auth 分支导致 401。
  if (process.env.CONFLUENCE_PAT) {
    const pat = process.env.CONFLUENCE_PAT.trim();
    headers['Authorization'] = `Bearer ${pat}`;
  } else if (process.env.CONFLUENCE_API_TOKEN && process.env.CONFLUENCE_EMAIL) {
    const credentials = Buffer.from(`${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  } else {
    console.warn('Confluence credentials not configured');
    return [];
  }

  try {
    // 使用 CQL 进行搜索：
    // - text 匹配对中文分词/相关性更好（siteSearch 会偏向标题，漏掉正文命中的页面）
    // - 仅搜索页面和博客（排除 attachment / comment 等噪音）
    // - limit 限制返回数量
    // - excerpt=highlight 让接口返回带高亮的正文摘要
    const cql = `text ~ "${query}" and type in (page, blogpost)`;
    const searchUrl = `${baseUrl}/rest/api/search?cql=${encodeURIComponent(cql)}&limit=8&excerpt=highlight`;
    console.log('[Confluence] Request URL:', searchUrl);

    const res = await fetch(searchUrl, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[Confluence] API error: ${res.status} ${res.statusText}`, body.slice(0, 300));
      return [];
    }

    const data = await res.json();
    console.log(`[Confluence] Found ${data.results?.length ?? 0} results for "${query}"`);

    // 清理 Confluence 返回文本中的 HTML 标签和高亮标记（@@@hl@@@ / @@@endhl@@@）
    const cleanText = (s: string): string =>
      (s || '')
        .replace(/@@@hl@@@/g, '')
        .replace(/@@@endhl@@@/g, '')
        .replace(/<[^>]*>?/gm, '')
        .replace(/&hellip;/g, '…')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // 解析并映射 Confluence API 返回的数据结构
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: SearchResult[] = (data.results || []).map((item: any) => {
      const title = cleanText(item.title || item.content?.title);
      return {
        id: item.content?.id || item.id,
        title,
        // 拼接完整的页面访问 URL（优先使用内容的 webui 链接）
        url: `${baseUrl}${item.content?._links?.webui || item.url}`,
        // 提取内容摘要（去掉 HTML/高亮标记），空则回退到标题
        content: item.excerpt ? cleanText(item.excerpt) || title : title,
        source: 'confluence' as const,
      };
    });

    return results;
  } catch (error) {
    console.error('[Confluence] Failed to search:', error);
    return [];
  }
}