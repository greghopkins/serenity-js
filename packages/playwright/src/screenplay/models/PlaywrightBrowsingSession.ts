import { CorrelationId } from '@serenity-js/core/lib/model';
import type { BrowserCapabilities } from '@serenity-js/web';
import { BrowsingSession, type Cookie, type CookieData } from '@serenity-js/web';
import type * as playwright from 'playwright-core';

import { type PlaywrightOptions } from '../../PlaywrightOptions';
import { PlaywrightCookie, PlaywrightPage } from '../models';

/**
 * Playwright-specific implementation of {@apilink BrowsingSession}.
 *
 * @group Models
 */
export abstract class PlaywrightBrowsingSession extends BrowsingSession<PlaywrightPage> {

    private currentPlaywrightBrowserContext: playwright.BrowserContext;

    protected constructor(protected readonly browserContextOptions: PlaywrightOptions) {
        super();
    }

    /**
     * Returns {@apilink BrowserCapabilities|basic meta-data} about the browser associated with this ability.
     *
     * **Please note** that since Playwright does not expose information about the operating system
     * the tests are running on, **Serenity/JS assumes that the tests are running locally**
     * and therefore returns the value of Node.js `process.platform` for `platformName`.
     */
    public abstract browserCapabilities(): Promise<BrowserCapabilities>;

    async cookie(name: string): Promise<Cookie> {
        const context = await this.browserContext();
        return new PlaywrightCookie(context, name);
    }

    async setCookie(cookie: CookieData): Promise<void> {
        const context = await this.browserContext();

        await context.addCookies([ cookie ]);
    }

    async deleteAllCookies(): Promise<void> {
        const context = await this.browserContext()
        await context.clearCookies();
    }

    protected override async registerCurrentPage(): Promise<PlaywrightPage> {
        const context = await this.browserContext();

        await context.newPage();

        // calling context.newPage() triggers a callback registered via browserContext(),
        // which wraps playwright.Page in PlaywrightPage and adds it to the list of pages
        // returned by this.allPages()

        const allPages = await this.allPages()

        return allPages.at(-1);
    }

    protected async browserContext(): Promise<playwright.BrowserContext> {
        if (! this.currentPlaywrightBrowserContext) {
            this.currentPlaywrightBrowserContext = await this.createBrowserContext(this.browserContextOptions);

            this.currentPlaywrightBrowserContext.on('page', async page => {
                this.register(
                    new PlaywrightPage(this, page, this.browserContextOptions, CorrelationId.create())
                );
            });

            if (this.browserContextOptions?.defaultNavigationTimeout) {
                this.currentPlaywrightBrowserContext.setDefaultNavigationTimeout(this.browserContextOptions?.defaultNavigationTimeout);
            }

            if (this.browserContextOptions?.defaultTimeout) {
                this.currentPlaywrightBrowserContext.setDefaultTimeout(this.browserContextOptions?.defaultTimeout);
            }
        }

        return this.currentPlaywrightBrowserContext;
    }

    protected abstract createBrowserContext(options: PlaywrightOptions): Promise<playwright.BrowserContext>;
}
