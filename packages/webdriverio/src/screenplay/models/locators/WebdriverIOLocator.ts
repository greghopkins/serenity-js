import { f, LogicError } from '@serenity-js/core';
import type { PageElement, RootLocator, Selector } from '@serenity-js/web';
import { ByCss, ByCssContainingText, ByDeepCss, ById, ByTagName, ByXPath, Locator } from '@serenity-js/web';
import type { Element } from 'webdriverio';

import type { WebdriverIOErrorHandler } from '../WebdriverIOErrorHandler.js';
import { WebdriverIOPageElement } from '../WebdriverIOPageElement.js';
import type { WebdriverIORootLocator } from './WebdriverIORootLocator.js';

/**
 * WebdriverIO-specific implementation of {@apilink Locator}.
 *
 * @group Models
 */
export class WebdriverIOLocator extends Locator<Element, string> {

    constructor(
        parent: RootLocator<Element>,
        selector: Selector,
        private readonly errorHandler: WebdriverIOErrorHandler,
    ) {
        super(parent, selector);
    }

    // todo: refactor; replace with a map and some more generic lookup mechanism
    protected nativeSelector(): string {
        if (this.selector instanceof ByCss) {
            return this.selector.value;
        }

        if (this.selector instanceof ByDeepCss) {
            return `>>> ${ this.selector.value }`;
        }

        if (this.selector instanceof ByCssContainingText) {
            return `${ this.selector.value }*=${ this.selector.text }`;
        }

        if (this.selector instanceof ById) {
            return `#${ this.selector.value }`;
        }

        if (this.selector instanceof ByTagName) {
            return `<${ this.selector.value } />`;
        }

        if (this.selector instanceof ByXPath) {
            return this.selector.value;
        }

        throw new LogicError(f `${ this.selector } is not supported by ${ this.constructor.name }`);
    }

    async isPresent(): Promise<boolean> {
        try {
            const element = await this.resolveNativeElement();
            return Boolean(element);
        }
        catch {
            return false;
        }
    }

    async nativeElement(): Promise<Element> {
        try {
            return await this.resolveNativeElement();
        }
        catch (error) {
            return await this.errorHandler.executeIfHandled(error, () => this.resolveNativeElement());
        }
    }

    protected async resolveNativeElement(): Promise<Element> {
        const parent = await this.parent.nativeElement();

        if (parent.error) {
            throw parent.error;
        }

        const element = await parent.$(this.nativeSelector());

        if (element.error) {
            throw element.error;
        }

        return element;
    }

    async allNativeElements(): Promise<Array<Element>> {
        const parent = await this.parent.nativeElement();
        return parent.$$(this.nativeSelector());
    }

    of(parent: WebdriverIOLocator): Locator<Element, string> {
        return new WebdriverIOLocator(parent, this.selector, this.errorHandler);
    }

    closestTo(child: WebdriverIOLocator): Locator<Element, string> {
        return new WebdriverIOParentElementLocator(this.parent, this.selector, child, this.errorHandler);
    }

    locate(child: WebdriverIOLocator): Locator<Element, string> {
        return new WebdriverIOLocator(this, child.selector, this.errorHandler);
    }

    element(): PageElement<Element> {
        return new WebdriverIOPageElement(this);
    }

    async allElements(): Promise<Array<PageElement<Element>>> {
        const elements = await this.allNativeElements();

        return elements.map(childElement =>
            new WebdriverIOPageElement(
                new WebdriverIOExistingElementLocator(
                    this.parent as WebdriverIORootLocator,
                    this.selector,
                    this.errorHandler,
                    childElement
                )
            )
        );
    }
}

/**
 * @internal
 */
export class WebdriverIOExistingElementLocator extends WebdriverIOLocator {
    constructor(
        parentRoot: RootLocator<Element>,
        selector: Selector,
        errorHandler: WebdriverIOErrorHandler,
        private readonly existingNativeElement: Element,
    ) {
        super(parentRoot, selector, errorHandler);
    }

    async nativeElement(): Promise<Element> {
        return this.existingNativeElement;
    }

    async allNativeElements(): Promise<Array<Element>> {
        return [ this.existingNativeElement ];
    }
}

class WebdriverIOParentElementLocator extends WebdriverIOLocator {
    constructor(
        parentRoot: RootLocator<Element>,
        selector: Selector,
        private readonly child: WebdriverIOLocator,
        errorHandler: WebdriverIOErrorHandler
    ) {
        super(parentRoot, selector, errorHandler);
    }

    protected override async resolveNativeElement(): Promise<Element> {
        const cssSelector = this.asCssSelector(this.selector);
        const child = await this.child.nativeElement();

        if (child.error)  {
            throw child.error;
        }

        return child.$(
            /* c8 ignore next */
            new Function(`return this.closest(\`${ cssSelector.value }\`)`) as () => HTMLElement
        );
    }

    override async allNativeElements(): Promise<Array<Element>> {
        return [ await this.nativeElement() ];
    }
}
