import type { Actor, Cast} from '@serenity-js/core';
import { TakeNotes } from '@serenity-js/core';
import type { Path } from '@serenity-js/core/lib/io';
import { CallAnApi } from '@serenity-js/rest';
import type { AxiosInstance } from 'axios';

import { UseFileSystem } from '../screenplay';

/**
 * @package
 */
export class UpdateCommandActors implements Cast {
    constructor(
        private readonly cwd: Path,
        private readonly createAxios: () => AxiosInstance,
    ){
    }

    prepare(actor: Actor): Actor {
        return actor.whoCan(
            CallAnApi.using(this.createAxios()),
            UseFileSystem.at(this.cwd),
            TakeNotes.usingAnEmptyNotepad(),
        );
    }
}
