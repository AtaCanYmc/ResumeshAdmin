import ipaddress
import logging
import socket
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


def is_safe_url(url: str) -> bool:
    """SSRF prevention mechanism: Rejects URL if IP range is loopback or private."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        if not parsed.hostname:
            return False
        # Resolve hostname (IP or domain)
        ip = socket.gethostbyname(parsed.hostname)
        parsed_ip = ipaddress.ip_address(ip)
        return not (parsed_ip.is_private or parsed_ip.is_loopback)
    except Exception:
        return False


class ScraperService:
    @staticmethod
    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def scrape_job_description(url: str) -> str:
        """
        Fetches the HTML content of a given URL and extracts the visible text.
        Uses Playwright to render JavaScript and bypass simple bot protections.
        """
        if not is_safe_url(url):
            raise ValueError("Unsafe or restricted URL provided (SSRF protection).")

        logger.info(f"Attempting to scrape {url} using Playwright...")
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page(
                    user_agent=(
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/114.0.0.0 Safari/537.36"
                    )
                )

                async def route_handler(route):
                    req_url = route.request.url
                    if not is_safe_url(req_url):
                        logger.warning(
                            f"Blocking potentially unsafe SSRF request: {req_url}"
                        )
                        await route.abort("blockedbyclient")
                    else:
                        await route.continue_()

                await page.route("**/*", route_handler)
                await page.goto(url, wait_until="networkidle", timeout=30000)

                html_content = await page.content()
                await browser.close()

            soup = BeautifulSoup(html_content, "html.parser")

            # Remove scripts and styles
            for script in soup(
                ["script", "style", "noscript", "header", "footer", "nav"]
            ):
                script.extract()

            text = soup.get_text(separator="\n", strip=True)

            # Basic cleanup of multiple empty lines
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            cleaned_text = "\n".join(lines)

            if not cleaned_text:
                raise ValueError("No text content could be extracted from the page.")

            return cleaned_text
        except Exception as e:
            logger.error(f"Failed to scrape {url}: {str(e)}")
            raise
