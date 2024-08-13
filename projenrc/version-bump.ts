import * as semver from 'semver';
import { schemasChanged } from './update-schema';
import { exec, log } from './util';

export class Version {
  public static bump() {
    try {
      const versionInfo = new Version();
      if (versionInfo.changed && process.env.RELEASE) {
        log(`✨ Updating schema version: ${versionInfo.current} -> ${versionInfo.next}`);
        return versionInfo.nextAsInt();
      } else if (versionInfo.changed) {
        log(
          `✨ This change will update the schema version: ${versionInfo.current} -> ${versionInfo.next}`
        );
      }
      return undefined;
    } catch (e) {
      /**
       * If git cannot be reached, returning undefined is fine. This will never happen
       * in the release workflow and may very well happen in any given build.
       */
      return undefined;
    }
  }

  public readonly current: string;
  public readonly next: string;
  public readonly changed: boolean;

  constructor() {
    const tags = exec(['git', 'ls-remote', '--tags', 'origin']);
    this.current = tags.split('/v').pop()!;
    this.changed = schemasChanged();
    this.next = this.changed ? semver.inc(this.current, 'major')! : this.current;
  }

  public nextAsInt() {
    return parseInt(this.next);
  }
}
