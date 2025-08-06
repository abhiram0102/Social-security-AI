# backend/services/web_scraping.py

import requests
from bs4 import BeautifulSoup

def scrape_info(url):
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.content, 'html.parser')

        return {
            "title": soup.title.string if soup.title else "N/A",
            "links": [a['href'] for a in soup.find_all('a', href=True)],
            "emails": list(set([
                word for word in soup.get_text().split() 
                if '@' in word and '.' in word
            ]))
        }
    except Exception as e:
        return {"error": str(e)}
