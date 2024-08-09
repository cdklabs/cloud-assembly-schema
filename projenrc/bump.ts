import * as semver from 'semver';
import { schemasChanged } from './update-schema';
import { exec, log } from './util';

const PLACEHOLDER = '_NEXT';
export class Version {
  public static bump() {
    try {
      const versionInfo = new Version();
      if (versionInfo.changed) {
        log(`Updating schema version: ${versionInfo.current} -> ${versionInfo.next}`);
        return versionInfo.asInt();
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

  public static goVersion() {
    return Version.bump() ?? PLACEHOLDER;
  }

  public readonly current: string;
  public readonly next: string;
  public readonly changed: boolean;

  constructor() {
    const tags = exec([
      'git',
      'ls-remote',
      '--tags',
      'git@github.com:cdklabs/cloud-assembly-schema.git',
    ]);

    this.current = tags.split('/v').pop()!.slice(0, -3);
    this.changed = schemasChanged();
    this.next = this.changed ? semver.inc(this.current, 'major')! : this.current;
  }

  public asInt() {
    return parseInt(this.next);
  }
}
