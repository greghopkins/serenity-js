import { PlaywrightTestArgs, PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, test as base, TestType } from '@playwright/test';
import { Actor, Cast, Duration, Serenity, serenity as serenityInstance, SerenityConfig, StageCrewMember } from '@serenity-js/core';
import { SceneFinishes, SceneTagged } from '@serenity-js/core/lib/events';
import { BrowserTag, PlatformTag } from '@serenity-js/core/lib/model';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import * as os from 'os';

import { PlaywrightWorkerReporter } from './reporter';

export interface SerenityFixtures extends SerenityConfig {
    actors:     Cast;
    crew:       StageCrewMember[];
    cueTimeout: Duration;
    serenity:   Serenity;
    platform:   { name: string, version: string };
    actorCalled: (name: string) => Actor;
}

export type SerenityTestType = TestType<PlaywrightTestArgs & PlaywrightTestOptions & SerenityFixtures, PlaywrightWorkerArgs & PlaywrightWorkerOptions>;

export const it: SerenityTestType = base.extend<SerenityFixtures>({
    cueTimeout: Duration.ofSeconds(5),

    crew: [],

    // eslint-disable-next-line no-empty-pattern
    platform: ({}, use) => {
        const platform = os.platform()

        // https://nodejs.org/api/process.html#process_process_platform
        const name = platform === 'win32' 
            ? 'Windows' 
            : (platform === 'darwin' ? 'macOS' : 'Linux');

        use({ name, version: os.release() });
    },

    serenity: async ({ crew, cueTimeout, platform }, use) => {

        serenityInstance.configure({
            cueTimeout: cueTimeout,
            crew: [
                ...crew,
                new PlaywrightWorkerReporter(
                    base.info.bind(base)
                ),
            ],
        });

        serenityInstance.announce(new SceneTagged(
            serenityInstance.currentSceneId(),
            new PlatformTag(platform.name, platform.version),
            serenityInstance.currentTime(),
        ));

        await use(serenityInstance);
    },

    actors: async ({ browser }, use) => {
        await use(Cast.whereEveryoneCan(BrowseTheWebWithPlaywright.using(browser)));
    },

    actorCalled: async ({ serenity, actors, browser, browserName }, use) => {

        serenity.engage(actors);

        const sceneId = serenity.currentSceneId();

        const actorCalled = serenity.theActorCalled.bind(serenity);

        serenity.announce(new SceneTagged(
            sceneId,
            new BrowserTag(browserName, browser.version()),
            serenity.currentTime(),
        ));

        await use(actorCalled);

        serenity.announce(
            new SceneFinishes(sceneId, serenity.currentTime()),
        );

        await serenityInstance.waitForNextCue();
    },
});

export const test: SerenityTestType                     = it;
export const describe: SerenityTestType['describe']     = it.describe;
export const beforeAll: SerenityTestType['beforeAll']   = it.beforeAll;
export const beforeEach: SerenityTestType['beforeEach'] = it.beforeEach;
export const afterEach: SerenityTestType['afterEach']   = it.afterEach;
export const afterAll: SerenityTestType['afterAll']     = it.afterAll;
export const expect: SerenityTestType['expect']         = it.expect;
