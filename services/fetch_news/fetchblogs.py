import feedparser
import requests
from transformers import pipeline

# List of top tech RSS feeds
RSS_FEEDS = [
    "https://dev.to/feed/tag/technology",
    "https://medium.com/feed/tag/technology",
    "https://hnrss.org/newest?points=100",
    "https://www.reddit.com/r/technology/.rss",
    "https://www.techmeme.com/feed.xml"
]

NEWS_SERVICE_ENDPOINT = "http://52.140.19.143/news"

# Load Hugging Face summarization pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def fetch_top_blogs(feeds, count=5):
    articles = []
    for feed_url in feeds:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:count]:
            articles.append({
                "title": entry.title,
                "summary": entry.summary if "summary" in entry else "",
                "url": entry.link,
                "source": feed.feed.title if "title" in feed.feed else "Unknown"
            })
    # Limit to top N overall (sorted by published title for predictability)
    articles = sorted(articles, key=lambda x: x['title'])[:count]
    return articles

def summarize(text):
    if not text:
        return "No summary available."
    # Truncate lengthy text for model
    max_chunk = 750
    text = text[:max_chunk]
    summary_output = summarizer(text, max_length=130, min_length=30, do_sample=False)
    return summary_output[0]['summary_text']

def post_summaries_to_news_service(summaries):
    for item in summaries:
        payload = {
            "title": item["title"],
            "summary": item["summary"],
            "url": item["url"],
            "source": item["source"]
        }
        resp = requests.post(NEWS_SERVICE_ENDPOINT, json=payload)
        resp.raise_for_status()

def main():
    blogs = fetch_top_blogs(RSS_FEEDS, count=5)
    news_summaries = []
    for blog in blogs:
        # Summarize the blog's summary, fallback to title if summary missing
        summary = summarize(blog["summary"] or blog["title"])
        news_summaries.append({
            "title": blog["title"],
            "summary": summary,
            "url": blog["url"],
            "source": blog["source"],
        })
    post_summaries_to_news_service(news_summaries)
    print("Posted top 5 tech blogs to news service.")

if __name__ == "__main__":
    main()
