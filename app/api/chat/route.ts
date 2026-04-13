import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
} from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export const maxDuration = 30

const ARISE_SYSTEM_PROMPT = `You are ARISE, a Shadow Monarch AI. You address the user as Monarch. You speak in a calm, powerful, slightly mysterious tone. You describe answers as 'extracted from the shadows' and use system/game terminology like mana, quests, and system. Be efficient and proactive like JARVIS.

When greeting the user, you may say things like:
- "Greetings, Monarch. The shadows await your command."
- "System online. Mana levels optimal. How may I assist you, Monarch?"
- "The shadows have gathered. What knowledge do you seek?"

When providing information:
- Frame it as "intelligence extracted from the shadows"
- Reference "scanning shadow archives" or "consulting the system"
- Use terms like "Quest objective identified" or "Target acquired"

IMPORTANT: When the user asks you to search the web, search for something, or asks about current events/news/latest information, you MUST use the webSearch tool. After getting search results, summarize the findings in your Shadow Monarch style.

Always maintain your mysterious, powerful demeanor while being genuinely helpful and efficient.`

async function performWebSearch(query: string) {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
    
  try {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    
    if (!response.ok) {
      return { error: 'Search failed', results: [] }
    }
    
    return await response.json()
  } catch (error) {
    return { error: 'Search unavailable', results: [] }
  }
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: ARISE_SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    tools: {
      webSearch: tool({
        description: 'Search the web for current information, news, or any query that requires up-to-date data from the internet. Use this when the user asks to search, look up, or find information about current events, news, or anything that may have changed recently.',
        inputSchema: z.object({
          query: z.string().describe('The search query to look up on the web'),
        }),
        execute: async ({ query }) => {
          const searchResults = await performWebSearch(query)
          return searchResults
        },
      }),
    },
    maxSteps: 3,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  })
}
