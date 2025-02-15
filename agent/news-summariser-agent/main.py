import os
from typing import List, Dict, Optional, Union
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import requests
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser

class NewsArticle(BaseModel):
    title: str = Field(description="Title of the article")
    source: str = Field(description="Source of the article")
    published_date: str = Field(description="Publication date")
    summary: str = Field(description="Summary of the article content")
    url: str = Field(description="URL of the article")

class NewsAPIRequest(BaseModel):
    endpoint: str = Field(description="API endpoint (everything or top-headlines)")
    params: Dict = Field(description="Query parameters")

class NewsSummarizerAgent:
    def __init__(self, news_api_key: str, openai_api_key: str):
        self.news_api_key = news_api_key
        self.base_url = "https://newsapi.org/v2"
        self.llm = ChatOpenAI(
            temperature=0.1,
            model="gpt-3.5-turbo",
            api_key=openai_api_key
        )
        
        self.summary_prompt = PromptTemplate(
            input_variables=["content", "title"],
            template="""
            Please provide a concise summary of the following news article:
            
            Title: {title}
            Content: {content}
            
            Summary (in 2-3 sentences, focusing on key points and maintaining journalistic neutrality):
            """
        )
        
        self.summary_chain = LLMChain(
            llm=self.llm,
            prompt=self.summary_prompt
        )

    def parse_news_api_url(self, url: str) -> NewsAPIRequest:
        """Parse a NewsAPI URL into endpoint and parameters."""
        parsed = urlparse(url)
        path_parts = parsed.path.split('/')
        
        # Extract endpoint (everything or top-headlines)
        endpoint = path_parts[-1]
        
        # Parse query parameters
        params = parse_qs(parsed.query)
        # Convert all param values from lists to single values
        params = {k: v[0] for k, v in params.items()}
        
        # Remove API key if present
        params.pop('apiKey', None)
        
        return NewsAPIRequest(endpoint=endpoint, params=params)

    def fetch_news(self, url_or_params: Union[str, Dict], max_articles: int = 5) -> List[Dict]:
        """Fetch news articles from NewsAPI using either URL or parameters."""
        if isinstance(url_or_params, str):
            # Parse URL
            request_info = self.parse_news_api_url(url_or_params)
            endpoint = request_info.endpoint
            params = request_info.params
        else:
            # Direct parameters
            endpoint = url_or_params.pop('endpoint', 'everything')
            params = url_or_params

        # Add API key and page size
        params['apiKey'] = self.news_api_key
        params['pageSize'] = max_articles

        # Make request
        url = f"{self.base_url}/{endpoint}"
        response = requests.get(url, params=params)
        
        if response.status_code != 200:
            error_msg = f"NewsAPI request failed: {response.json().get('message', 'Unknown error')}"
            raise Exception(error_msg)

        return response.json()["articles"]

    def summarize_article(self, article: Dict) -> NewsArticle:
        """Summarize a single article using LangChain."""
        content = article.get("content", "") or article.get("description", "")
        title = article["title"]
        
        if not content:
            return NewsArticle(
                title=title,
                source=article["source"]["name"],
                published_date=article["publishedAt"],
                summary="No content available for summarization.",
                url=article["url"]
            )
        
        # Generate summary using LLMChain
        summary_result = self.summary_chain.invoke({
            "content": content,
            "title": title
        })
        
        return NewsArticle(
            title=title,
            source=article["source"]["name"],
            published_date=article["publishedAt"],
            summary=summary_result["text"].strip(),
            url=article["url"]
        )

    def process_news(self, query: Union[str, Dict], max_articles: int = 5) -> List[NewsArticle]:
        """Process news articles from either URL or parameter dict."""
        articles = self.fetch_news(query, max_articles)
        
        summaries = []
        for article in articles:
            try:
                summary = self.summarize_article(article)
                summaries.append(summary)
            except Exception as e:
                print(f"Error processing article {article['title']}: {str(e)}")
                continue
                
        return summaries

    def format_results(self, summaries: List[NewsArticle], query_info: Optional[str] = None) -> str:
        """Format the results in a readable way."""
        output = "📰 NEWS SUMMARIES 📰\n\n"
        
        if query_info:
            output += f"Query: {query_info}\n"
            output += "=" * 50 + "\n\n"
        
        for i, summary in enumerate(summaries, 1):
            output += f"Article {i}:\n"
            output += f"Title: {summary.title}\n"
            output += f"Source: {summary.source}\n"
            output += f"Published: {summary.published_date}\n"
            output += f"Summary: {summary.summary}\n"
            output += f"URL: {summary.url}\n"
            output += "-" * 50 + "\n"
            
        return output

def main():
    # Example usage with different formats
    examples = [
        "https://newsapi.org/v2/everything?q=Apple&from=2025-02-09&sortBy=popularity",
        "https://newsapi.org/v2/top-headlines?country=us",
        "https://newsapi.org/v2/top-headlines?sources=bbc-news",
        "https://newsapi.org/v2/everything?domains=techcrunch.com,thenextweb.com",
        "https://newsapi.org/v2/top-headlines?q=trump",
        # Parameter dictionary example
        {
            "endpoint": "everything",
            "q": "cryptocurrency",
            "language": "en",
            "sortBy": "publishedAt"
        }
    ]
    
    # Load API keys
    news_api_key = os.getenv("NEWS_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    if not news_api_key or not openai_api_key:
        raise ValueError("Please set NEWS_API_KEY and OPENAI_API_KEY environment variables")
    
    # Initialize agent
    agent = NewsSummarizerAgent(news_api_key, openai_api_key)
    
    # Process each example
    for query in examples:
        try:
            print(f"\nProcessing query: {query}")
            summaries = agent.process_news(query, max_articles=3)
            formatted_output = agent.format_results(summaries, str(query))
            
            # Save to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"news_summaries_{timestamp}.txt"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(formatted_output)
            
            print(formatted_output)
            print(f"Results saved to {filename}")
            
        except Exception as e:
            print(f"Error processing query {query}: {str(e)}")
            continue

if __name__ == "__main__":
    main()