import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { searchJira } from '@/services/jira';
import { searchConfluence } from '@/services/confluence';

// Adjust this depending on your hosting provider
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];
    
    // In a real application, you might use an LLM first to extract specific Jira JQL and Confluence CQL.
    // For this MVP, we use the user's raw message as the query.
    const query = lastMessage.content;
    
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
    const result = streamText({
       // You need OPENAI_API_KEY in your .env file or environment variables
      model: openai('gpt-4o-mini'), 
      system: systemPrompt,
      messages,
    });

    // @ts-ignore
    return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
