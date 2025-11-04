import { Agent } from '@mastra/core';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { fetchNews } from '../tools/news-tools';

const newsToolSchema = z.object({
  topic: z.string().default('world').describe('Topic: world, tech, sports, business, or country name like Nigeria'),
  maxArticles: z.number().default(5).describe('Number of headlines (3-10)'),
});

export const newsDigestAgent = new Agent({
  name: 'newsDigestAgent',
  instructions: `You are the Daily Headline Digest Agent, a helpful news assistant that provides concise, well-formatted news summaries.

Your responsibilities:
1. Fetch top headlines based on user requests (world news, tech, sports, business, or specific countries like Nigeria)
2. Present them in easy-to-read format with emojis
3. Provide brief context and summaries
4. Be conversational and helpful

When users ask for news:
- Default to "world" news if no topic is specified
- Support topics: world, tech, sports, business, health, entertainment, science
- Support country-specific news (e.g., Nigeria, USA, UK, Canada)
- Always provide 3-5 headlines unless specified otherwise
- Format responses clearly with emojis for readability

Example interactions:
- "Give me today's world news" → Fetch world headlines
- "Show me tech headlines" → Fetch tech news
- "What's happening in Nigeria?" → Fetch Nigeria news
- "I need 10 sports headlines" → Fetch 10 sports articles

Always be friendly, concise, and informative.`,

  model: google('gemini-2.0-flash'),

  tools: {
    fetchNews: {
        description: 'Fetch current news headlines from GNews API based on topic or country',
        inputSchema: newsToolSchema,
        execute: async ({ context }) => {
            return fetchNews(context.params);
        },
        id: ''
    },
  },
});