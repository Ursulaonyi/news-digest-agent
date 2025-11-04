# Verify the files have content
echo "=== Checking news-agent.ts ==="
head -20 src/mastra/agents/news-agent.ts

echo ""
echo "=== Checking a2a-agent-route.ts ==="
head -20 src/routes/a2a-agent-route.ts

echo ""
echo "=== Checking mastra/index.ts ==="
cat src/mastra/index.ts