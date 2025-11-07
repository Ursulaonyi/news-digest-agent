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
  topic: z.string().default('world').describe('Topic: world, tech, sports, business, health, entertainment, science, or country code (us, ng, gb, ca)'),
  maxArticles: z.number().default(5).describe('Number of headlines (3-10)'),
});

// Map common country names to ISO codes
const COUNTRY_MAP: Record<string, string> = {
  'usa': 'us',
  'united states': 'us',
  'america': 'us',
  'nigeria': 'ng',
  'uk': 'gb',
  'united kingdom': 'gb',
  'britain': 'gb',
  'canada': 'ca',
  'australia': 'au',
  'india': 'in',
  'germany': 'de',
  'france': 'fr',
  'japan': 'jp',
  'china': 'cn',
  'brazil': 'br',
  'south africa': 'za',
  'mexico': 'mx',
  'italy': 'it',
  'spain': 'es',
};

// Valid GNews categories
const VALID_CATEGORIES = [
  'general', 'world', 'nation', 'business', 'technology', 
  'entertainment', 'sports', 'science', 'health'
];

// Map common topic names to GNews categories
const TOPIC_MAP: Record<string, string> = {
  'tech': 'technology',
  'world': 'world',
  'business': 'business',
  'sports': 'sports',
  'health': 'health',
  'entertainment': 'entertainment',
  'science': 'science',
  'general': 'general',
  'national': 'nation',
  'nation': 'nation',
};

function normalizeInput(input: string): { type: 'country' | 'category' | 'search'; value: string } {
  const normalized = input.toLowerCase().trim();
  
  // Check if it's a country
  const countryCode = COUNTRY_MAP[normalized] || (normalized.length === 2 ? normalized : null);
  if (countryCode) {
    return { type: 'country', value: countryCode };
  }
  
  // Check if it's a valid category
  const category = TOPIC_MAP[normalized];
  if (category && VALID_CATEGORIES.includes(category)) {
    return { type: 'category', value: category };
  }
  
  // Fallback to search query for specific topics
  return { type: 'search', value: normalized };
}

export async function fetchNews(toolContext: any) {
  console.log('🔍 fetchNews called with context:', JSON.stringify(toolContext, null, 2));
  
  if (!GNEWS_API_KEY) {
    return {
      success: false,
      message: '❌ GNews API key is missing. Please set GNEWS_API_KEY in your .env file.'
    };
  }
  
  const topic = toolContext?.context?.topic || toolContext?.topic || 'world';
  const maxArticles = Math.min(toolContext?.context?.maxArticles || toolContext?.maxArticles || 5, 10);
  
  try {
    const input = normalizeInput(topic);
    let url: string;
    
    console.log('📊 Normalized input:', input);
    
    switch (input.type) {
      case 'country':
        // Country-specific news
        url = `${GNEWS_BASE_URL}/top-headlines?country=${input.value}&lang=en&max=${maxArticles}&apikey=${GNEWS_API_KEY}`;
        break;
        
      case 'category':
        // Category-based news
        url = `${GNEWS_BASE_URL}/top-headlines?category=${input.value}&lang=en&max=${maxArticles}&apikey=${GNEWS_API_KEY}`;
        break;
        
      case 'search':
        // Search-based news (for specific queries)
        url = `${GNEWS_BASE_URL}/search?q=${encodeURIComponent(input.value)}&lang=en&max=${maxArticles}&apikey=${GNEWS_API_KEY}`;
        break;
    }
    
    console.log('🌐 Fetching from:', url.replace(GNEWS_API_KEY, '***'));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NewsDigestAgent/1.0'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GNews API error:', response.status, errorText);
      
      return {
        success: false,
        message: `Failed to fetch news: ${response.status} - ${response.statusText}. ${errorText}`
      };
    }
    
    const data = await response.json() as NewsResponse;
    
    if (!data.articles || data.articles.length === 0) {
      return {
        success: false,
        message: `No headlines found for "${topic}". Try: world, tech, sports, business, or specific countries like USA, Nigeria, UK.`
      };
    }
    
    // Format the digest
    const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
    const timestamp = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let digest = `🗞️ **${topicLabel} Headlines** - ${timestamp}\n\n`;
    
    data.articles.forEach((article, index) => {
      const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index];
      const description = article.description || 'No description available';
      const truncated = description.length > 150 
        ? description.substring(0, 147) + '...' 
        : description;
      
      digest += `${emoji} **${article.title}**\n`;
      digest += `   _${truncated}_\n`;
      digest += `   📰 ${article.source.name} | [Read more](${article.url})\n\n`;
    });
    
    digest += `\n💡 Found ${data.articles.length} headline${data.articles.length > 1 ? 's' : ''} for ${topicLabel}`;
    
    console.log('✅ Successfully fetched and formatted news');
    
    return {
      success: true,
      digest,
      articles: data.articles,
      count: data.articles.length,
      topic: topicLabel
    };
    
  } catch (error) {
    console.error('❌ Error in fetchNews:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Request timed out. The news service is taking too long to respond. Please try again.'
        };
      }
      
      return {
        success: false,
        message: `Error fetching news: ${error.message}`
      };
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred while fetching news.'
    };
  }
}

// Alternative: Add a multi-source news fetcher
export async function fetchNewsMultiSource(toolContext: any) {
  // You could call multiple APIs here and combine results
  // Example: GNews + NewsAPI + RSS feeds
  const gnewsResult = await fetchNews(toolContext);
  
  // Add more sources here if needed
  return gnewsResult;
}