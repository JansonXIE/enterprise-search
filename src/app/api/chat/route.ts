import { createOpenAI } from '@ai-sdk/openai';
import { streamText, UIMessage } from 'ai';
import { searchJira } from '@/services/jira';
import { searchConfluence } from '@/services/confluence';

// 使用 DeepSeek (兼容 OpenAI 接口)
const deepseek = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  compatibility: 'compatible', // 强制使用 Chat Completions API，而非 OpenAI Responses API
});

// Adjust this depending on your hosting provider
export const maxDuration = 30;

// 从 UIMessage 中提取纯文本内容
function extractText(message: any): string {
  if (typeof message.content === 'string') return message.content;
  if (message.parts) {
    return message.parts
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join('');
  }
  return String(message.content || '');
}

// 将 UIMessage[] 转换为 streamText 可用的 ModelMessage[]
function toModelMessages(uiMessages: any[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return uiMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: extractText(m),
  }));
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    const query = extractText(lastMessage);

    console.log('[API] Received query:', query);
    
    // 1. Fetch data from internal systems concurrently
    const [jiraResults, confluenceResults] = await Promise.all([
      searchJira(query),
      searchConfluence(query)
    ]);
    
    const allResults = [...jiraResults, ...confluenceResults];
    
    // 2. Build the context text
    let contextText = "No relevant documents found.";
    if (allResults.length > 0) {
      contextText = allResults.map((r, i) => `[Document ${i + 1}] Source: ${r.source.toUpperCase()}\nTitle: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`).join('\n\n');
    }
    
    const systemPrompt = `You are a helpful, intelligent enterprise knowledge assistant. 
Your primary task is to answer the user's question based strictly on the provided context retrieved from internal Jira and Confluence systems.

Context:
${contextText}

Guidelines:
1. If the answer is not contained in the Context, directly state that you cannot find the information in the internal systems.
2. Structure your answer using markdown for readability.
3. VERY IMPORTANT: You MUST cite your sources. When you use information from a Document, append a citation like [Document X] inline. At the very end of your response, list the references with their URLs formatted as markdown links.`;

    // 3. Stream the response from the LLM
    const modelMessages = toModelMessages(messages);
    
    const result = streamText({
      model: deepseek.chat('deepseek-chat'),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
