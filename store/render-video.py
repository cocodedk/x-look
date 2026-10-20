"""Render store/video.html to store/video.mp4: 9 seconds, 1920x1080, 30 fps.

Run from the repo root: uv run --with playwright python store/render-video.py
"""

import asyncio
import subprocess
import tempfile
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
BROWSER = "/usr/bin/brave-browser"
FPS, SECONDS = 30, 9


async def capture(frames: str) -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=BROWSER)
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})
        await page.goto((ROOT / "store/video.html").as_uri())
        await page.wait_for_timeout(1500)
        for frame in range(FPS * SECONDS):
            await page.evaluate("t => window.render(t)", frame / FPS)
            await page.screenshot(path=f"{frames}/{frame:04d}.png")
        await browser.close()


with tempfile.TemporaryDirectory() as frames:
    asyncio.run(capture(frames))
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{frames}/%04d.png",
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", str(ROOT / "store/video.mp4")],
        check=True,
    )
