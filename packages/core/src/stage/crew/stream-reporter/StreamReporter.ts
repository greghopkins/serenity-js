import type { Writable } from 'stream';
import { ensure, isDefined, isString } from 'tiny-types';

import type { DomainEvent } from '../../../events';
import { FileSystem, Path } from '../../../io';
import type { Stage } from '../../Stage';
import type { StageCrewMember } from '../../StageCrewMember';

/**
 * Serialises all the {@apilink DomainEvent} objects it receives and streams
 * them as [ndjson](http://ndjson.org/) to the output stream or file.
 *
 * Useful when debugging issues related to custom Serenity/JS test runner adapters.
 *
 * ## Registering `StreamReporter` programmatically
 *
 * ```ts
 * import { configure, StreamReporter } from '@serenity-js/core'
 *
 * configure({
 *   crew: [
 *     new StreamReporter(process.stdout)
 *   ],
 * })
 * ```
 *
 * ## Writing `DomainEvents` to a file
 *
 * ```ts
 * import { configure, StreamReporter } from '@serenity-js/core'
 * import fs = require('fs')
 *
 * configure({
 *   crew: [
 *     new StreamReporter(fs.createWriteStream('./events.ndjson'))
 *   ],
 * })
 * ```
 *
 * ## Using `StreamReporter` with Playwright Test
 *
 * ```ts
 * // playwright.config.ts
 * import type { PlaywrightTestConfig } from '@serenity-js/playwright-test'
 *
 * const config: PlaywrightTestConfig = {
 *   testDir: './spec',
 *
 *   reporter: [
 *     [ '@serenity-js/playwright-test', {
 *       crew: [
 *         [ '@serenity-js/core:StreamReporter', { outputFile: './events.ndjson' }]
 *       ]
 *       // other Serenity/JS config
 *     }]
 *   ],
 *   // other Playwright Test config
 * }
 * ```
 *
 * ## Using `StreamReporter` with Protractor
 *
 * ```js
 * // protractor.conf.js
 * exports.config = {
 *   framework:     'custom',
 *   frameworkPath: require.resolve('@serenity-js/protractor/adapter'),
 *
 *   serenity: {
 *     crew: [
 *       [ '@serenity-js/core:StreamReporter', { outputFile: './events.ndjson' }]
 *     ],
 *     // other Serenity/JS config
 *   },
 *   // other Protractor config
 * }
 * ```
 *
 * ## Using `StreamReporter` with WebdriverIO
 *
 * ```ts
 * // wdio.conf.ts
 * import { WebdriverIOConfig } from '@serenity-js/webdriverio'
 *
 * export const config: WebdriverIOConfig = {
 *
 *   framework: '@serenity-js/webdriverio',
 *
 *   serenity: {
 *     crew: [
 *       '@serenity-js/serenity-bdd',
 *       [ '@serenity-js/core:StreamReporter', { outputFile: './events.ndjson' }]
 *     ]
 *     // other Serenity/JS config
 *   },
 *   // other WebdriverIO config
 * }
 * ```
 *
 * @group Stage
 */
export class StreamReporter implements StageCrewMember {

    /**
     * Instantiates a `StreamReporter` outputting a stream of {@apilink DomainEvent|domain events}
     * to an `outputFile` at the given location.
     *
     * @param config
     */
    static fromJSON(config: { outputFile: string, cwd?: string }): StageCrewMember {
        const outputFile = ensure('outputFile', config?.outputFile, isDefined(), isString());
        const cwd = config.cwd || process.cwd();

        const fs = new FileSystem(Path.from(cwd))

        return new StreamReporter(fs.createWriteStreamTo(Path.from(outputFile)));
    }

    /**
     * @param {stream~Writable} output
     *  A Writable stream that should receive the output
     *
     * @param {Stage} [stage]
     *  The stage this {@apilink StageCrewMember} should be assigned to
     */
    constructor(
        private readonly output: Writable = process.stdout,
        private readonly stage?: Stage,
    ) {
    }

    /**
     * Creates a new instance of this {@apilink StageCrewMember} and assigns it to a given {@apilink Stage}.
     *
     * @param stage
     *  An instance of a {@apilink Stage} this {@apilink StageCrewMember} will be assigned to
     *
     * @returns {StageCrewMember}
     *  A new instance of this {@apilink StageCrewMember}
     */
    assignedTo(stage: Stage): StageCrewMember {
        return new StreamReporter(this.output, stage);
    }

    /**
     * Handles {@apilink DomainEvent} objects emitted by the {@apilink StageManager}.
     *
     * @listens {DomainEvent}
     *
     * @param event
     */
    notifyOf(event: DomainEvent): void {
        this.output.write(
            JSON.stringify({ type: event.constructor.name, event: event.toJSON() }) + '\n',
        );
    }
}
