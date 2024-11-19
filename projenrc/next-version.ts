import { schemasChanged } from './update-schema';

/**
 * If any of the schema files changed, we need to bump the major version
 */
async function main() {
  const latestTag = process.env.LATEST_TAG;
  if (latestTag && schemasChanged(latestTag)) {
    console.log('major');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
