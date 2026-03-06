export interface SearchResult {
  id: string;
  title: string;
  url: string;
  content: string;
  source: "jira" | "confluence";
}

export async function searchJira(query: string): Promise<SearchResult[]> {
  // 模拟数据 (暂未接入真实 Jira API)
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log(`[Jira] Searching for: ${query}`);

  return [
    {
      id: "PROJ-1234",
      title: "Fix login issue in V2.0",
      url: "https://your-company.atlassian.net/browse/PROJ-1234",
      content:
        "The login issue in V2.0 was caused by an expired token validation check. It has been resolved by updating the auth middleware to properly refresh tokens automatically.",
      source: "jira",
    },
    {
      id: "PROJ-1245",
      title: "Update V2.0 login API documentation",
      url: "https://your-company.atlassian.net/browse/PROJ-1245",
      content:
        "Added new mandatory parameters for the v2 login endpoint, including device_id and captcha_token, which must be passed in the request body.",
      source: "jira",
    },
  ];
}
