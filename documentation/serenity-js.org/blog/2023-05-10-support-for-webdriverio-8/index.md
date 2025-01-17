---
slug: support-for-webdriverio-8
title: Support for WebdriverIO 8
authors: [jan-molak]
tags:
  - web
  - webdriverio
  - open-source
---

![WebdriverIO Roboter](./webdriverio-roboter.png)

Serenity/JS started to support WebdriverIO in version 2.30.0. 

In version 3.0.0, Serenity/JS brought you [`@serenity-js/web`](/handbook/web-testing/) - a portable abstraction
layer that lets you run the exact same web scenario with [WebdriverIO](/api/webdriverio), [Playwright](/api/playwright), and even [Protractor](/api/protractor)!

Now, we're taking things further with [**Serenity/JS 3.2.0**](/changelog/3.2.0) introducing support for the latest and greatest **WebdriverIO 8**! 🥳 

In this article, and in **less than 5 minutes**, you'll learn how to **integrate Serenity/JS** with your WebdriverIO test suite, **enable Serenity BDD reports**, and start using the **Screenplay Pattern**!

<!--truncate-->

## About Serenity/JS

[Serenity/JS](https://serenity-js.org) is an open-source framework designed to make acceptance and regression testing of complex software systems faster, more collaborative, and easier to scale.
  
For WebdriverIO test suites, Serenity/JS offers:
- [Enhanced Reporting](/handbook/reporting/) - You can use Serenity/JS
  as a drop-in replacement of any built-in WebdriverIO framework to produce in-depth test execution reports and living documentation of your project.
- [Screenplay Pattern APIs](/handbook/design/screenplay-pattern/) - To make your test code portable and reusable across projects and teams,
  Serenity/JS gives you an optional [abstraction layer](/api/webdriverio) on top of native WebdriverIO APIs.
- [Integration Libraries](/api/core/) - For test suites that follow the Screenplay Pattern,
  Serenity/JS also provides optional integration libraries to help you write [API tests](/api/rest/),
  [manage local servers](/api/local-server/), [perform assertions](/api/assertions/), and more!

![Serenity BDD Report Example](/images/reporting/serenity-bdd-reporter.png)

## Installing Serenity/JS

To add Serenity/JS to an [existing WebdriverIO project](https://webdriver.io/docs/gettingstarted), install the following Serenity/JS modules from NPM:

```sh npm2yarn
npm install @serenity-js/{core,web,webdriverio,assertions,console-reporter,serenity-bdd} --save-dev
```

Learn more about Serenity/JS modules:
- [`@serenity-js/core`](/api/core/)
- [`@serenity-js/web`](/api/web/)
- [`@serenity-js/webdriverio`](/api/webdriverio/)
- [`@serenity-js/assertions`](/api/assertions/)
- [`@serenity-js/console-reporter`](/api/console-reporter/)
- [`@serenity-js/serenity-bdd`](/api/serenity-bdd/)

## Configuring Serenity/JS and WebdriverIO

To enable integration with Serenity/JS, configure WebdriverIO as follows:

<Tabs>
<TabItem value="wdio-conf-typescript" label="TypeScript" default>

```typescript title="wdio.conf.ts"
import { WebdriverIOConfig } from '@serenity-js/webdriverio';

export const config: WebdriverIOConfig = {

    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio',

    // Serenity/JS configuration
    serenity: {
        // Configure Serenity/JS to use the appropriate adapter
        // for your test runner
        runner: 'cucumber', // or 'mocha', or 'jasmine'

        // Register Serenity/JS reporting services, a.k.a. the "stage crew"
        crew: [
            // Optional, print test execution results to standard output
            '@serenity-js/console-reporter',

            // Optional, produce Serenity BDD reports
            // and living documentation (HTML)
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', {
                outputDirectory: 'target/site/serenity' 
            } ],

            // Optional, automatically capture screenshots
            // upon interaction failure
            [ '@serenity-js/web:Photographer', {
                strategy: 'TakePhotosOfFailures'
            } ],
        ]
    },

    // Configure your Cucumber runner
    cucumberOpts: {
        // see Cucumber configuration options below
    },


    // ... or Jasmine runner
    jasmineOpts: {
        // see Jasmine configuration options below
    },

    // ... or Mocha runner
    mochaOpts: {
        // see Mocha configuration options below
    },

    runner: 'local',

    // Any other WebdriverIO configuration
};
```

</TabItem>
<TabItem value="wdio-conf-javascript" label="JavaScript">

```typescript title="wdio.conf.js"
export const config = {

    // Tell WebdriverIO to use Serenity/JS framework
    framework: '@serenity-js/webdriverio',

    // Serenity/JS configuration
    serenity: {
        // Configure Serenity/JS to use the appropriate adapter for your test runner
        runner: 'cucumber',
        // runner: 'mocha',
        // runner: 'jasmine',

        // Register Serenity/JS reporting services, a.k.a. the "stage crew"
        crew: [
            '@serenity-js/console-reporter',
            '@serenity-js/serenity-bdd',
            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],
            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],
        ]
    },

    // Configure your Cucumber runner
    cucumberOpts: {
        // see Cucumber configuration options below
    },


    // ... or Jasmine runner
    jasmineOpts: {
        // see Jasmine configuration options below
    },

    // ... or Mocha runner
    mochaOpts: {
        // see Mocha configuration options below
    },

    runner: 'local',

    // Any other WebdriverIO configuration
};
```

</TabItem>
</Tabs>

Learn more about:
- [Serenity/JS Cucumber configuration options](/api/cucumber-adapter/interface/CucumberConfig/)
- [Serenity/JS Jasmine configuration options](/api/jasmine-adapter/interface/JasmineConfig/)
- [Serenity/JS Mocha configuration options](/api/mocha-adapter/interface/MochaConfig/)
- [WebdriverIO configuration file](https://webdriver.io/docs/configurationfile/)

## Producing Serenity BDD reports and living documentation

[Serenity BDD reports and living documentation](https://serenity-bdd.github.io/docs/reporting/the_serenity_reports) are generated by [Serenity BDD CLI](https://github.com/serenity-bdd/serenity-core/tree/main/serenity-cli),
a Java program downloaded and managed by the [`@serenity-js/serenity-bdd`](/api/serenity-bdd/) module.

To produce Serenity BDD reports, your test suite must:
- download the Serenity BDD CLI, by calling `serenity-bdd update` which caches the CLI `jar` locally
- produce intermediate Serenity BDD `.json` reports, by registering [`SerenityBDDReporter`](/api/serenity-bdd/class/SerenityBDDReporter/) as per the [configuration instructions](#configuring-serenityjs)
- invoke the Serenity BDD CLI when you want to produce the report, by calling `serenity-bdd run`

The pattern used by all the [Serenity/JS Project Templates](/handbook/getting-started#serenityjs-project-templates) relies
on using:
- a [`postinstall`](https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-operation-order) NPM script to download the Serenity BDD CLI
- [`npm-failsafe`](https://www.npmjs.com/package/npm-failsafe) to run the reporting process even if the test suite itself has failed (which is precisely when you need test reports the most...).
- [`rimraf`](https://www.npmjs.com/package/rimraf) as a convenience method to remove any test reports left over from the previous run

```json title="package.json"
{
  "scripts": {
    "postinstall": "serenity-bdd update",
    "clean": "rimraf target",
    "test": "failsafe clean test:execute test:report",
    "test:execute": "wdio wdio.conf.ts",
    "test:report": "serenity-bdd run"
  }
}
```

To learn more about the `SerenityBDDReporter`, please consult:
- installation instructions in [`@serenity-js/serenity-bdd` documentation](/api/serenity-bdd/),
- configuration examples in [`SerenityBDDReporter` API docs](/api/serenity-bdd/class/SerenityBDDReporter/),
- [Serenity/JS examples on GitHub](https://github.com/serenity-js/serenity-js/tree/main/examples).

## Using Serenity/JS Screenplay Pattern APIs

The [Screenplay Pattern](/handbook/design/screenplay-pattern/) is an innovative, user-centred approach to writing high-quality automated acceptance tests. It steers you towards an effective use of layers of abstraction,
helps your test scenarios capture the business vernacular of your domain, and encourages good testing and software engineering habits on your team.

By default, when you register `@serenity-js/webdriverio` as your WebdriverIO `framework`,
Serenity/JS configures a default [cast](/api/core/class/Cast/) of [actors](/api/core/class/Actor/),
where every actor can:
- [`BrowseTheWebWithWebdriverIO`](/api/webdriverio/class/BrowseTheWebWithWebdriverIO/)
- [`TakeNotes.usingAnEmptyNotepad()`](/api/core/class/TakeNotes/)

This should be enough to help you get started with introducing test scenarios that follow the Screenplay Pattern even to an existing test suite, for example:

```typescript title="specs/example.spec.ts"
import { actorCalled } from '@serenity-js/core'
import { Navigate, Page } from '@serenity-js/web'
import { Ensure, equals } from '@serenity-js/assertions'

describe('My awesome website', () => {
    it('can have test scenarios that follow the Screenplay Pattern', async () => {
        await actorCalled('Alice').attemptsTo(
            Navigate.to(`https://webdriver.io`),
            Ensure.that(
                Page.current().title(),
                equals(`WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO`)
            ),
        )
    })

    it('can have non-Screenplay scenarios too', async () => {
        await browser.url('https://webdriver.io')
        await expect(browser)
            .toHaveTitle('WebdriverIO · Next-gen browser and mobile automation test framework for Node.js | WebdriverIO')
    })
})
```

To learn more about the Screenplay Pattern, check out:
- [The Screenplay Pattern](/handbook/design/screenplay-pattern/)
- [Web testing with Serenity/JS](/handbook/web-testing/)
- ["BDD in Action, Second Edition"](https://www.manning.com/books/bdd-in-action-second-edition)

## Next steps

Well done, your WebdriverIO test suite is now integrated with Serenity/JS! 🎉🎉🎉

To take things further, check out:
- [Web testing with Serenity/JS](/handbook/web-testing/)
- [Serenity/JS examples on GitHub](https://github.com/serenity-js/serenity-js/tree/main/examples/)
- [Serenity/JS WebdriverIO project templates](https://github.com/serenity-js?q=webdriverio-template&type=all&language=&sort=)
- [Serenity/JS API docs](/api/web/)

Remember, new features, tutorials, and demos are coming soon!
Follow [Serenity/JS on LinkedIn](https://www.linkedin.com/company/serenity-js),
subscribe to [Serenity/JS channel on YouTube](https://www.youtube.com/@serenity-js) and join the [Serenity/JS Community Chat](https://matrix.to/#/#serenity-js:gitter.im) to stay up to date!
Please also make sure to star ⭐️ [Serenity/JS on GitHub](https://github.com/serenity-js/serenity-js) to help others discover the framework!

[![Follow Serenity/JS on LinkedIn](https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin)](https://www.linkedin.com/company/serenity-js)
[![Watch Serenity/JS on YouTube](https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube)](https://www.youtube.com/@serenity-js)
[![Join Serenity/JS Community Chat](https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix)](https://matrix.to/#/#serenity-js:gitter.im)
[![GitHub stars](https://img.shields.io/github/stars/serenity-js/serenity-js?label=Serenity%2FJS&logo=github&style=badge)](https://github.com/serenity-js/serenity-js)
