"""Render the Chrome Web Store icon and images.

Run from the repo root: uv run --with playwright python store/render.py
"""

import asyncio
from base64 import b64encode
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
BROWSER = "/usr/bin/brave-browser"


async def main() -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=BROWSER)
        # The store icon is icons/icon128.png shrunk to 96px with the guideline's
        # 16px of clear space around it.
        page = await browser.new_page(viewport={"width": 128, "height": 128})
        await page.set_content(
            "<style>html,body{margin:0;background:transparent}img{display:block;width:96px;height:96px;margin:16px}</style>"
            f'<img src="data:image/png;base64,{b64encode((ROOT / "icons/icon128.png").read_bytes()).decode()}">'
        )
        await page.wait_for_timeout(300)
        await page.screenshot(path=ROOT / "store/icon-store-128.png", omit_background=True)
        await page.close()
        for name, width, height in (("shot", 1280, 800), ("promo", 440, 280)):
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.goto(f"{(ROOT / 'store/store.html').as_uri()}#{name}")
            await page.wait_for_timeout(1500)
            await page.screenshot(path=ROOT / f"store/{name}-{width}x{height}.png")
            await page.close()
        await browser.close()


asyncio.run(main())
