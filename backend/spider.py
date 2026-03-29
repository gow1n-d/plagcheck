import scrapy
import sys

class WebSpider(scrapy.Spider):
    name = "web"
    
    def start_requests(self):
        query = getattr(self, "query", "")
        # Scrape the main search result string using Wikipedia for easy text access
        # In a real large app this could iterate over DuckDuckGo or other engines
        url = f"https://en.wikipedia.org/w/index.php?search={query.replace(' ', '+')}"
        yield scrapy.Request(url, self.parse)

    def parse(self, response):
        paragraphs = response.css('p::text, p b::text, p a::text').getall()
        text = " ".join([p.strip() for p in paragraphs if p.strip()]).replace("\n", " ")
        yield {
            "url": response.url,
            "content": text[:5000] # limiting to top 5000 chars for prompt space
        }
