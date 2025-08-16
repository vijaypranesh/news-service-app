import os
import requests
from transformers import pipeline


# Set your keys and endpoints
NEWSAPI_KEY = "43ce8d93232e4c129d6a34eed381f1dd"
NEWS_SERVICE_ENDPOINT = "http://20.44.60.109/news"


# Load summarization pipeline (this downloads the model the first time)
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")


def fetch_top_tech_news(api_key, count=5, keyword="technology"):
    url = (
        f"https://newsapi.org/v2/top-headlines?"
        f"category=technology&q={keyword}&language=en&pageSize={count}&apiKey={api_key}"
    )
    resp = requests.get(url)
    resp.raise_for_status()
    return resp.json().get("articles", [])


def summarize(text):
    if not text:
        return "No summary available."
    # Hugging Face expects text length <= 1024 tokens (~750 words), truncate if needed
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
    # Change keyword to customize tech topic, e.g., "artificial intelligence" / "programming"
    articles = fetch_top_tech_news(NEWSAPI_KEY, count=5, keyword="programming")
    news_summaries = []
    for art in articles:
        content = art.get("description") or art.get("content") or ""
        summary = summarize(content)
        news_summaries.append({
            "title": art.get("title"),
            "summary": summary,
            "url": art.get("url"),
            "source": art.get("source", {}).get("name"),
        })
    post_summaries_to_news_service(news_summaries)


if __name__ == "__main__":
    main()
