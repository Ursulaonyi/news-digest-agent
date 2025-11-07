import { Mastra } from '@mastra/core';
import { newsDigestAgent } from './agents/news-agent.js';

export const mastra = new Mastra({
  agents: {
    newsDigestAgent: newsDigestAgent,
  },
});