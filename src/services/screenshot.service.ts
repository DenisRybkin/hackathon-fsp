import { randomUUID } from 'crypto';
import { rm } from 'fs/promises';
import { join } from 'path';
import * as puppeteer from 'puppeteer';

export class ScreenshotService {
  public async save(url: string): Promise<{ buffer: Buffer; path: string }> {
    return puppeteer
      .launch({
        headless: 'new',
        defaultViewport: { width: 1920, height: 1080 },
      })
      .then(async browser => {
        const page = await browser.newPage();
        await page.goto(url);
        const path = `${randomUUID()}.png`;
        const buffer = await page.screenshot({ path });
        await rm(join(process.cwd(), path), { force: true });
        return { buffer, path };
      });
  }
}

export const screenshoter = new ScreenshotService();

