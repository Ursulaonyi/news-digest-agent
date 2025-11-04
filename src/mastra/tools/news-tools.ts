import { z } from 'zod';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsResponse {
  totalArticles: number;
  articles: NewsArticle[];
}

export const newsToolSchema = z.object({
  topic: z.string().default('world').describe('Topic: world, tech, sports, business, or country name like Nigeria'),
  maxArticles: z.number().default(5).describe('Number of headlines (3-10)'),
});

export async function fetchNews(params: z.infer<typeof newsToolSchema>) {
  const { topic = 'world', maxArticles = 5 } = params;
  
  try {
    const isCountry = topic.length > 10 || ['nigeria', 'usa', 'uk', 'canada'].includes(topic.toLowerCase());
    const queryParam = isCountry ? `country=${topic.toLowerCase()}` : `category=${topic.toLowerCase()}`;
    
    const url = `${GNEWS_BASE_URL}/top-headlines?${queryParam}&lang=en&max=${maxArticles}&apikey=${GNEWS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GNews API error: ${response.statusText}`);
    }
    
    const data = await response.json() as NewsResponse;
    
    if (data.articles.length === 0) {
      return {
        success: false,
        message: `No headlines found for: ${topic}`
      };
    }
    
    const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
    let digest = `🗞️ **Top Headlines for Today (${topicLabel})**\n\n`;
    
    data.articles.forEach((article, index) => {
      const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index];
      digest += `${emoji} **${article.title}**\n`;
      digest += `   _${article.description.substring(0, 120)}${article.description.length > 120 ? '...' : ''}_\n`;
      digest += `   📰 ${article.source.name} | [Read more](${article.url})\n\n`;
    });
    
    digest += `\n💡 **Summary:** ${data.articles.length} major updates across ${topicLabel.toLowerCase()}.`;
    
    return {
      success: true,
      digest,
      articles: data.articles
    };
    
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      success: false,
      message: `Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
