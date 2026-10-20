"""Render the extension icons and the Chrome Web Store images.

Run from the repo root: uv run --with playwright python store/render.py
"""

import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
BROWSER = "/usr/bin/brave-browser"


async def main() -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=BROWSER)
        icon = (ROOT / "store/icon.svg").read_text()
        for size in (16, 48, 128):
            page = await browser.new_page(viewport={"width": size, "height": size})
            await page.set_content(
                f"<style>html,body{{margin:0;background:transparent}}svg{{display:block;width:{size}px;height:{size}px}}</style>{icon}"
            )
            await page.screenshot(path=ROOT / f"icons/icon{size}.png", omit_background=True)
            await page.close()
        for name, width, height in (("shot", 1280, 800), ("promo", 440, 280)):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.goto(f"{(ROOT / 'store/store.html').as_uri()}#{name}")
            await page.wait_for_timeout(1500)
            await page.screenshot(path=ROOT / f"store/{name}-{width}x{height}.png")
            await page.close()
        await browser.close()


asyncio.run(main())
