import { Mastra } from '@mastra/core';
import { newsDigestAgent } from './agents/news-agent';
import { a2aAgentRoute } from '../routes/a2a-agent-route';

export const mastra = new Mastra({
  agents: {
    newsDigestAgent: newsDigestAgent,
  },
  server: {
    apiRoutes: [a2aAgentRoute],
  },
});
