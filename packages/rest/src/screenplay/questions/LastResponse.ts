import type { QuestionAdapter } from '@serenity-js/core';
import { Question } from '@serenity-js/core';
import type { RawAxiosResponseHeaders } from 'axios';

import { CallAnApi } from '../abilities';

/**
 * Provides access to the properties of the last {@apilink AxiosResponse} object,
 * cached on the {@apilink Ability|ability} to {@apilink CallAnApi}.
 *
 * ## Verify response to a GET request
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * interface Book {
 *     title: string;
 *     author: string;
 * }
 *
 * await actorCalled('Apisit')
 *   .whoCan(CallAnApi.at('https://api.example.org/'))
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/books/0-688-00230-7')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *     Ensure.that(LastResponse.header('Content-Type'), equals('application/json')),
 *     Ensure.that(LastResponse.body<Book>(), equals({
 *         title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
 *         author: 'Robert M. Pirsig',
 *     })),
 *   )
 * ```
 *
 * ## Use Serenity/JS adapters to navigate complex response objects
 *
 * ```ts
 * import { actorCalled } from '@serenity-js/core'
 * import { CallAnApi, GetRequest, LastResponse, Send } from '@serenity-js/rest'
 * import { Ensure, equals } from '@serenity-js/assertions'
 *
 * interface Developer {
 *     name: string;
 *     id: string;
 *     projects: Project[];
 * }
 *
 * interface Project {
 *     name: string;
 *     repoUrl: string;
 * }
 *
 * await actorCalled('Apisitt')
 *   .whoCan(CallAnApi.at('https://api.example.org/'))
 *   .attemptsTo(
 *     Send.a(GetRequest.to('/developers/jan-molak')),
 *     Ensure.that(LastResponse.status(), equals(200)),
 *     Ensure.that(LastResponse.body<Developer>().name, equals('Jan Molak')),
 *     Ensure.that(LastResponse.body<Developer>().projects[0].name, equals('Serenity/JS')),
 * )
 * ```
 *
 * ## Learn more
 * - [AxiosResponse](https://github.com/axios/axios/blob/v0.27.2/index.d.ts#L133-L140)
 *
 * @group Questions
 */
export class LastResponse {

    /**
     * Retrieves the status code of the {@apilink LastResponse|last response}
     *
     * #### Learn more
     * - [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
     */
    static status(): QuestionAdapter<number> {
        return Question.about<number>(`the status of the last response`, async actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.status);
        });
    }

    /**
     * Retrieves the body of the {@apilink LastResponse|last response}
     *
     * #### A type-safe approach using generics
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { CallAnApi, LastResponse } from '@serenity-js/rest'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * interface Book {
     *   title: string;
     *   author: string;
     * }
     *
     * await actorCalled('Apisitt')
     *   .whoCan(CallAnApi.at('https://api.example.org/'))
     *   .attemptsTo(
     *      // ...
     *
     *      // note body<T>() parameterised with type "Book"
     *      Ensure.that(LastResponse.body<Book>(), equals({
     *        title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
     *        author: 'Robert M. Pirsig',
     *      })),
     *   )
     * ```
     *
     * ## A not type-safe approach using `any`
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { CallAnApi, LastResponse } from '@serenity-js/rest'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Apisitt')
     *   .whoCan(CallAnApi.at('https://api.example.org/'))
     *   .attemptsTo(
     *      // ...
     *
     *      // note body<T>() parameterised with "any" or with no parameter is not type-safe!
     *      Ensure.that(LastResponse.body<any>(), equals({
     *        title: 'Zen and the Art of Motorcycle Maintenance: An Inquiry into Values',
     *        author: 'Robert M. Pirsig',
     *      })),
     *   )
     * ```
     *
     * ## Iterating over the items in the response body
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { CallAnApi, LastResponse } from '@serenity-js/rest'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * interface Product {
     *   id: number;
     *   name: string;
     * }
     *
     * await actorCalled('Apisitt')
     *   .whoCan(CallAnApi.at('https://api.example.org/'))
     *   .attemptsTo(
     *     Send.a(GetRequest.to(`/products`)),
     *     List.of<Product>(LastResponse.body<{ products: Product[] }>().products)
     *       .forEach(({ item, actor }) =>
     *         actor.attemptsTo(
     *           Send.a(GetRequest.to(`/products/${ item.id }`)),
     *           Ensure.that(LastResponse.body<Product>().id, equals(item.id)),
     *         )
     *       ),
     *   )
     * ```
     */
    static body<T = any>(): QuestionAdapter<T> {
        return Question.about<T>(`the body of the last response`, async actor => {
            return CallAnApi.as(actor).mapLastResponse<T>(response => response.data as T);
        });
    }

    /**
     * Retrieves a header of the {@apilink LastResponse|last response}, identified by `name`
     *
     * ## Asserting on a header
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { CallAnApi, LastResponse } from '@serenity-js/rest'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Apisitt')
     *   .whoCan(CallAnApi.at('https://api.example.org/'))
     *   .attemptsTo(
     *     Send.a(GetRequest.to(`/products`)),
     *     Ensure.that(LastResponse.header('Content-Type'), equals('application/json')),
     *   )
     * ```
     *
     * @param name
     */
    static header(name: string): QuestionAdapter<string> {
        return Question.about<string>(`the '${ name }' header of the last response`, async actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.headers[name]);
        });
    }

    /**
     * Retrieves all the headers of the {@apilink LastResponse|last response}.
     *
     * ## Asserting on a header
     *
     * ```ts
     * import { actorCalled } from '@serenity-js/core'
     * import { CallAnApi, LastResponse } from '@serenity-js/rest'
     * import { Ensure, equals } from '@serenity-js/assertions'
     *
     * await actorCalled('Apisitt')
     *   .whoCan(CallAnApi.at('https://api.example.org/'))
     *   .attemptsTo(
     *     Send.a(GetRequest.to(`/products`)),
     *     Ensure.that(LastResponse.headers()['Content-Type'], equals('application/json')),
     *   )
     * ```
     */
    static headers(): QuestionAdapter<RawAxiosResponseHeaders> {
        return Question.about<RawAxiosResponseHeaders>(`the headers or the last response`, async actor => {
            return CallAnApi.as(actor).mapLastResponse(response => response.headers as RawAxiosResponseHeaders);
        });
    }
}
