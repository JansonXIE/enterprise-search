import { SearchResult } from './jira';

export async function searchConfluence(query: string): Promise<SearchResult[]> {
  const baseUrl = process.env.CONFLUENCE_URL;
  if (!baseUrl) {
    console.warn('Confluence URL not configured');
    return [];
  }

  // 根据环境变量判断使用 Basic Auth (云版) 还是 Bearer Token (私有化版)
  const headers: HeadersInit = {
    'Accept': 'application/json'
  };

  if (process.env.CONFLUENCE_API_TOKEN && process.env.CONFLUENCE_EMAIL) {
    const credentials = Buffer.from(`${process.env.CONFLUENCE_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  } else if (process.env.CONFLUENCE_PAT) {
    headers['Authorization'] = `Bearer ${process.env.CONFLUENCE_PAT}`;
  } else {
    console.warn('Confluence credentials not configured');
    return [];
  }

  try {
    // 使用 CQL 进行搜索
    const res = await fetch(`${baseUrl}/rest/api/search?cql=${encodeURIComponent(`text ~ "${query}"`)}`, {
      method: 'GET',
      headers
    });

    if (!res.ok) {
      console.error(`Confluence API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    
    // 解析并映射 Confluence API 返回的数据结构
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.results.map((item: any) => ({
      id: item.content?.id || item.id,
      title: item.title || item.content?.title,
      // 拼接完整的页面访问 URL
      url: `${baseUrl}${item.url}`,
      // 提取内容摘要
      content: item.excerpt ? item.excerpt.replace(/<[^>]*>?/gm, '') : 'No content available', 
      source: 'confluence'
    }));

  } catch (error) {
    console.error('Failed to search Confluence:', error);
    return [];
  }
}