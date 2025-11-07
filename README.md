# Daily Headline Digest Agent

An AI-powered news aggregation agent built with Mastra and integrated with Telex.im. Fetch trending headlines across multiple categories and countries with intelligent AI summaries.

## 🚀 Features

- **Multi-category News** - World, Tech, Business, Sports, Health, Entertainment, Science
- **Country-specific News** - USA, Nigeria, UK, Canada, Australia, India, Germany, France, Japan, China, Brazil, South Africa, Mexico, Italy, Spain
- **AI-powered Summaries** - Google Gemini 2.0 Flash for intelligent analysis
- **Telex.im Integration** - A2A protocol for workplace collaboration
- **REST API** - Simple endpoints for direct integration
- **Real-time Data** - Fresh headlines from GNews API

## 📋 Prerequisites

- Node.js 20+
- npm or pnpm
- Environment variables:
  - `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI Studio key
  - `GNEWS_API_KEY` - GNews API key

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/Ursulaonyi/news-digest-agent.git
cd news-digest-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Build
npm run build

# Run locally
npm run dev
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
# Response: {"status":"ok"}
```

### Chat API
```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Give me tech news"
}

# Response:
{
  "message": "🗞️ **Tech Headlines** - Friday, November 7, 2025\n\n1️⃣ **OnePlus 15 launching...",
  "agent": "newsDigestAgent"
}
```

### A2A Protocol (Telex)
```bash
POST /a2a/agent/newsDigestAgent
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "message/send",
  "params": {
    "message": {
      "parts": [
        {
          "text": "Give me Nigeria news"
        }
      ]
    }
  }
}
```

## 🎯 Usage Examples

### Get World News
```bash
curl -X POST https://daily-headline-digest-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Give me world news"}'
```

### Get Tech Headlines
```bash
curl -X POST https://daily-headline-digest-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Show me tech headlines"}'
```

### Get Country-specific News
```bash
curl -X POST https://daily-headline-digest-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is happening in Nigeria today?"}'
```

### Request Multiple Headlines
```bash
curl -X POST https://daily-headline-digest-production.up.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Get me 10 sports headlines"}'
```

## 🏗️ Project Structure

```
src/
├── mastra/
│   ├── agents/
│   │   └── news-agent.ts          # Main AI agent definition
│   ├── tools/
│   │   └── news-tools.ts          # GNews API integration
│   └── index.ts                   # Mastra instance export
├── routes/
│   └── a2a-agent-route.ts         # Telex A2A protocol handler
├── types/
│   └── a2a.types.ts              # TypeScript type definitions
└── index.ts                       # Express server setup
```

## 🔧 Agent Configuration

The agent is configured in `src/mastra/agents/news-agent.ts`:

```typescript
export const newsDigestAgent = new Agent({
  name: 'newsDigestAgent',
  instructions: '...',
  model: google('gemini-2.0-flash'),
  tools: { fetchNews },
});
```

### Supported Topics

**Categories:**
- world, tech, sports, business, health, entertainment, science

**Countries:**
- USA, Nigeria, UK, Canada, Australia, India, Germany, France, Japan, China, Brazil, South Africa, Mexico, Italy, Spain

## 🚀 Deployment

### Deploy to Railway

```bash
# Create Railway project
railway init

# Set environment variables
railway variables --set GOOGLE_GENERATIVE_AI_API_KEY=your_key
railway variables --set GNEWS_API_KEY=your_key

# Deploy
railway up
```

### Deploy to Telex.im

1. Get Telex invite:
   ```
   /telex-invite your-email@example.com
   ```

2. Create AI colleague with this workflow JSON:
   ```json
   {
     "active": true,
     "category": "utilities",
     "description": "AI agent that delivers top news headlines on demand",
     "id": "newsDigest001",
     "name": "daily_headline_digest",
     "short_description": "Get daily news headlines from around the world",
     "nodes": [
       {
         "id": "news_digest_agent",
         "name": "news digest agent",
         "type": "a2a/mastra-a2a-node",
         "url": "YOUR_DEPLOYMENT_URL/a2a/agent/newsDigestAgent"
       }
     ]
   }
   ```

3. Replace `YOUR_DEPLOYMENT_URL` with your Railway URL

4. Submit in Telex

## 📊 View Agent Interactions

See all agent logs on Telex:
```
https://api.telex.im/agent-logs/{channel-id}.txt
```

## 🛠️ Development

### Local Testing

```bash
npm run dev
# Server runs on http://localhost:4111

# Test in another terminal
curl -X POST http://localhost:4111/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Give me tech news"}'
```

### Building

```bash
npm run build
# Compiles TypeScript to dist/
```

### Environment Setup

Create `.env` file:
```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
GNEWS_API_KEY=your_gnews_key
PORT=4111
NODE_ENV=development
```

Get your keys:
- **Google AI:** https://aistudio.google.com
- **GNews API:** https://gnews.io

## 🐛 Troubleshooting

### Module Not Found Error
- Ensure Node.js version is 20+
- Check `.node-version` file exists
- Verify all imports have `.js` extensions

### Missing API Keys
- Check environment variables: `railway variables`
- Redeploy after setting variables
- Check logs: `railway logs`

### Agent Not Responding on Telex
- Check A2A route is registered: `GET /health` should respond
- Verify API keys are set
- Check agent logs: `https://api.telex.im/agent-logs/{channel-id}.txt`

## 📝 Technologies

- **Framework:** Mastra
- **Language:** TypeScript
- **AI Model:** Google Gemini 2.0 Flash
- **News API:** GNews
- **Server:** Express.js
- **Deployment:** Railway
- **Integration:** Telex.im A2A Protocol

## 🎓 Learning Resources

- [Mastra Documentation](https://docs.mastra.ai)
- [Google AI Studio](https://aistudio.google.com)
- [GNews API](https://gnews.io)
- [Telex.im](https://telex.im)

## 📄 License

MIT

## 🤝 Contributing

Feel free to open issues and submit PRs!

## 👤 Author

Built by Ursula Okafo as part of HNG Stage 3 Backend Challenge

## 📚 Blog Post

Read the full integration story: [Building an AI News Digest Agent with Mastra and Telex.im](https://blog.example.com)

---

**Live Deployment:** https://daily-headline-digest-production.up.railway.app

**Status:** ✅ Active and responding to Telex.im messages