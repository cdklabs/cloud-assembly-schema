// import * as fs from 'fs';
import { JsonPatch, cdk } from 'projen';
import { Stability } from 'projen/lib/cdk';
import { TrailingComma } from 'projen/lib/javascript';
import { MajorVersion } from './projenrc/version-bump';

export const project = new cdk.JsiiProject({
  author: 'Amazon Web Services',
  authorAddress: '',
  authorOrganization: true,
  authorUrl: 'https://aws.amazon.com',
  defaultReleaseBranch: 'main',
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['aws-cdk-automation'],
    secret: 'GITHUB_TOKEN',
  },
  name: '@aws-cdk/cloud-assembly-schema',
  projenrcTs: true,
  docgen: false,
  stability: Stability.STABLE,
  jsiiVersion: '*',
  keywords: ['aws', 'cdk'],
  repositoryUrl: 'https://github.com/cdklabs/cloud-assembly-schema.git',
  homepage: 'https://github.com/cdklabs/cloud-assembly-schema',
  // Don't set minNodeVersion -- this is just a library with some data and a
  // couple of simple JS files. It doesn't care about the Node version of the
  // consuming party at all. It's unlikely you will try to install this on a
  // Node version it doesn't work on.
  // minNodeVersion: '18.18.0',
  workflowNodeVersion: 'lts/*',
  excludeTypescript: ['**/test/**/*.ts'],
  publishToMaven: {
    javaPackage: 'software.amazon.awscdk.cloudassembly.schema',
    mavenArtifactId: 'cdk-cloud-assembly-schema',
    mavenGroupId: 'software.amazon.awscdk',
    mavenEndpoint: 'https://aws.oss.sonatype.org',
  },
  publishToNuget: {
    dotNetNamespace: 'Amazon.CDK.CloudAssembly.Schema',
    packageId: 'Amazon.CDK.CloudAssembly.Schema',
    iconUrl: 'https://raw.githubusercontent.com/aws/aws-cdk/main/logo/default-256-dark.png',
  },
  publishToPypi: {
    distName: 'aws-cdk.cloud-assembly-schema',
    module: 'aws_cdk.cloud_assembly_schema',
  },
  publishToGo: {
    moduleName: `github.com/cdklabs/cloud-assembly-schema-go`,
  },
  prettier: true,
  prettierOptions: {
    settings: {
      singleQuote: true,
      trailingComma: TrailingComma.ES5,
      printWidth: 100,
    },
  },
  eslintOptions: {
    prettier: true,
    dirs: ['lib'],
    devdirs: ['test'],
  },
  jestOptions: {
    jestConfig: {
      verbose: true,
      maxWorkers: '50%',
    },
    configFilePath: 'jest.config.json',
    jestVersion: '29',
  },
  srcdir: 'lib',
  bundledDeps: ['jsonschema', 'semver'],
  description: 'Cloud Assembly Schema',
  devDeps: ['@types/semver', 'mock-fs', 'typescript-json-schema'],
  gitignore: ['.DS_Store', '**/*.d.ts', '**/*.js'],
  minMajorVersion: new MajorVersion().next,
});

const updateSchema = 'ts-node --prefer-ts-exts -e "require(\'./projenrc/update.ts\').update()"';

project.preCompileTask.exec(updateSchema);

// rerun projen because the update schema task may have caused
// the major version to change
project.preCompileTask.exec('npx projen');

const packageJson = project.tryFindObjectFile('package.json');
packageJson?.patch(
  JsonPatch.add('/jsii/targets/python/classifiers', [
    'Framework :: AWS CDK',
    'Framework :: AWS CDK :: 2',
  ])
);

project.addPackageIgnore('*.ts');
project.addPackageIgnore('!*.d.ts');
project.addPackageIgnore('**/scripts');

project.synth();
