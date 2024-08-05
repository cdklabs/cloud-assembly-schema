import * as semver from 'semver';
import { schemasChanged } from './update-schema';
import { exec, log } from './util';

export function bump() {
  try {
    const tags = exec([
      'git',
      'ls-remote',
      '--tags',
      'git@github.com:cdklabs/cloud-assembly-schema.git',
    ]);

    const oldVersion = tags.split('/v').pop()!.slice(0, -3);
    const newVersion = schemasChanged() ? semver.inc(oldVersion, 'major')! : oldVersion;

    if (newVersion !== oldVersion) {
      log(`Updating schema version: ${oldVersion} -> ${newVersion}`);
      return parseInt(newVersion);
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
