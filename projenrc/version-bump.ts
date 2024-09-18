import * as semver from 'semver';
import { schemasChanged } from './update-schema';
import { exec } from './util';

export class MajorVersion {
  public readonly current: number;
  public readonly next: number;

  public constructor() {
    // ensure all tags are available locally
    exec(['git', 'fetch', '--tags']);
    const tags = exec(['git', 'tag', '--sort=-creatordate']);

    const latestTag = tags.split('\n')[0];
    if (!latestTag.startsWith('v')) {
      throw new Error(`Unexpected tag name: ${latestTag}`);
    }

    const fullVersion = semver.parse(latestTag.substring(1));
    if (!fullVersion) {
      throw new Error(`Unexpected tag name: ${latestTag}`);
    }

    this.current = fullVersion.major;
    const changed = schemasChanged(latestTag);
    this.next = changed ? fullVersion.inc('major').major : this.current;
  }
}
